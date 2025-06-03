const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// Token oluşturma fonksiyonu
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Oluşturulan token'ı cookie olarak gönderme
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Önce eski cookie'yi temizle
  res.clearCookie('jwt');
  
  // Yeni token'ı cookie olarak ekle
  res.cookie('jwt', token, cookieOptions);

  // Session'a kullanıcıyı ekle
  if (res.req && res.req.session) {
    res.req.session.user = user;
  }

  // Remove password from output
  user.password = undefined;

  // Başarılı giriş sonrası yönlendirme URL'si
  const redirectUrl = req.session.returnTo || '/modern';
  
  // Eğer API isteği değilse yönlendir
  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  }
  
  // Tarayıcı isteği ise yönlendir
  res.redirect(redirectUrl);
};

// Kullanıcı kaydı
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || 'user'
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Kullanıcı girişi
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Email ve şifre var mı kontrol et
    if (!email || !password) {
      return next(new AppError('Lütfen email ve şifre girin', 400));
    }

    // 2) Kullanıcı var mı ve şifre doğru mu kontrol et
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Hatalı email veya şifre', 401));
    }

    // 3) Her şey doğruysa token gönder
    createSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Çıkış yap
exports.logout = (req, res) => {
  // Eğer API isteği değilse, çıkış yap ve ana sayfaya yönlendir
  if (!req.originalUrl.startsWith('/api')) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      path: '/'
    });
    
    // Session'ı da temizle
    req.session.destroy();
    
    return res.redirect('/modern');
  }
  
  // API isteği ise JSON yanıtı gönder
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/'
  });
  
  // Session'ı da temizle
  req.session.destroy();
  
  res.status(200).json({ status: 'success' });
};

// Korumalı rotalara erişim için middleware
exports.protect = async (req, res, next) => {
  console.log(`[authController.js] 'protect' middleware called for path: ${req.originalUrl}`);
  try {
    // 1) Token var mı kontrol et
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('Giriş yapmadınız! Lütfen giriş yaparak tekrar deneyin.', 401)
      );
    }

    // 2) Token doğrulama
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Kullanıcı hala mevcut mu kontrol et
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('Bu token ile ilişkili kullanıcı artık mevcut değil.', 401)
      );
    }

    // 4) Kullanıcı şifreyi token verildikten sonra değiştirdi mi kontrol et
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Kullanıcı yakın zamanda şifresini değiştirdi. Lütfen tekrar giriş yapın.', 401)
      );
    }

    // ERIŞIME IZIN VER
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next(new AppError('Doğrulama hatası: ' + err.message, 401));
  }
};

// Sadece giriş yapmış kullanıcıların görüntülemesi için
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    try {
      // 1) Token doğrulama
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Kullanıcı hala mevcut mu kontrol et
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Kullanıcı şifreyi token verildikten sonra değiştirdi mi kontrol et
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // KULLANICI GİRİŞ YAPMIŞ
      res.locals.user = currentUser;
      req.user = currentUser;
      
      // Session'a kullanıcıyı ekle
      req.session.user = currentUser;
      
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Rol tabanlı erişim kontrolü
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Bu işlemi gerçekleştirmek için yetkiniz yok', 403)
      );
    }

    next();
  };
};

// Şifre sıfırlama token oluşturma
exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Email adresine göre kullanıcıyı bul
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('Bu email adresine sahip bir kullanıcı bulunamadı', 404));
    }

    // 2) Rastgele reset token oluştur
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Token'ı kullanıcıya email ile gönder
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      
      // Email gönderme işlemi burada yapılacak
      // Gerçek uygulamada email göndermek için bir servis kullanılır

      res.status(200).json({
        status: 'success',
        message: 'Token email adresinize gönderildi',
        resetURL // Gerçek uygulamada bu gönderilmez, sadece test amaçlı
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('Email gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 500)
      );
    }
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Şifre sıfırlama
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Token'a göre kullanıcıyı bul
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) Token süresi dolmamışsa ve kullanıcı varsa, yeni şifreyi ayarla
    if (!user) {
      return next(new AppError('Token geçersiz veya süresi dolmuş', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Kullanıcının şifresini güncelle
    createSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Şifre güncelleme
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Kullanıcıyı veritabanından al
    const user = await User.findById(req.user.id).select('+password');

    // 2) Mevcut şifrenin doğru olup olmadığını kontrol et
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Mevcut şifreniz yanlış', 401));
    }

    // 3) Şifreyi güncelle
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Kullanıcıya JWT gönder
    createSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
