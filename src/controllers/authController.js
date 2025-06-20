const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// JWT_SECRET değerini doğrudan tanımla
const JWT_SECRET = process.env.JWT_SECRET || 'ultra-secure-and-ultra-long-secret-key-for-jwt';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';

// Token oluşturma fonksiyonu
const signToken = id => {
  console.log('[authController.js] JWT_SECRET:', JWT_SECRET ? 'Tanımlı' : 'Tanımlı değil');
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Oluşturulan token'ı cookie olarak gönderme
const createSendToken = (user, statusCode, req, res) => {
  console.log('[authController.js] createSendToken çağrıldı, statusCode:', statusCode);
  console.log('[authController.js] Kullanıcı rolü:', user.role);
  console.log('[authController.js] İstek URL:', req.originalUrl);
  
  const token = signToken(user._id);
  console.log('[authController.js] JWT token oluşturuldu');
  
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
  console.log('[authController.js] Eski JWT cookie temizlendi');
  
  // Yeni token'ı cookie olarak ekle
  res.cookie('jwt', token, cookieOptions);
  console.log('[authController.js] Yeni JWT cookie ayarlandı');

  // Session'a kullanıcıyı ekle
  if (res.req && res.req.session) {
    res.req.session.user = user;
    console.log('[authController.js] Kullanıcı session\'a eklendi');
  }

  // Remove password from output
  user.password = undefined;

  // API isteği ise JSON yanıtı gönder
  if (req.originalUrl.startsWith('/api')) {
    console.log('[authController.js] API isteği, JSON yanıtı gönderiliyor');
    return res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  }
  
  // Kullanıcı rolüne göre farklı sayfalara yönlendir
  let redirectUrl = '/';
  
  // Admin ve lead-guide rolündeki kullanıcıları admin paneline yönlendir
  if (user.role === 'admin' || user.role === 'lead-guide') {
    redirectUrl = '/admin';
  }
  
  console.log('[authController.js] Tarayıcı isteği, yönlendirme yapılıyor:', redirectUrl);
  
  // Tarayıcı isteğini yönlendir
  res.redirect(redirectUrl);
  
  // Giriş sonrası returnTo bilgisini temizle
  if (req.session) req.session.returnTo = undefined;
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

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Kullanıcı girişi
exports.login = async (req, res, next) => {
  console.log('[authController.js] Login işlemi başlatıldı');
  console.log('[authController.js] İstek gövdesi:', req.body);
  
  try {
    const { email, password } = req.body;

    // 1) Email ve şifre var mı kontrol et
    if (!email || !password) {
      console.log('[authController.js] Email veya şifre eksik');
      return next(new AppError('Lütfen email ve şifre girin', 400));
    }

    // 2) Kullanıcı var mı ve şifre doğru mu kontrol et
    console.log('[authController.js] Kullanıcı aranıyor:', email);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('[authController.js] Kullanıcı bulunamadı:', email);
      return next(new AppError('Hatalı email veya şifre', 401));
    }
    
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    console.log('[authController.js] Şifre kontrolü:', isPasswordCorrect ? 'Başarılı' : 'Başarısız');
    
    if (!isPasswordCorrect) {
      return next(new AppError('Hatalı email veya şifre', 401));
    }

    // 3) Her şey doğruysa, token oluştur ve giriş yap
    console.log('[authController.js] Giriş başarılı, token oluşturuluyor...');
    createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('[authController.js] Login hatası:', err);
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
        new AppError('Giriş yapmadınız! Lütfen giriş yapın', 401)
      );
    }

    // 2) Token doğrulama
    console.log('[authController.js] Token doğrulanıyor...');
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    console.log('[authController.js] Token doğrulandı, kullanıcı ID:', decoded.id);

    // 3) Kullanıcı hala var mı kontrol et
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      console.log('[authController.js] Kullanıcı bulunamadı:', decoded.id);
      return next(
        new AppError('Bu token\'a ait kullanıcı artık mevcut değil', 401)
      );
    }
    console.log('[authController.js] Kullanıcı bulundu:', currentUser.email);

    // 4) Kullanıcı şifresini token verildikten sonra değiştirdi mi kontrol et
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      console.log('[authController.js] Şifre değiştirilmiş');
      return next(
        new AppError('Kullanıcı yakın zamanda şifresini değiştirdi, lütfen tekrar giriş yapın', 401)
      );
    }

    // Erişim izni ver
    req.user = currentUser;
    res.locals.user = currentUser;
    console.log('[authController.js] Erişim izni verildi');
    next();
  } catch (err) {
    console.error('[authController.js] Yetkilendirme hatası:', err);
    next(new AppError('Yetkilendirme hatası', 401));
  }
};

// Sadece giriş yapmış kullanıcıların görüntülemesi için
exports.isLoggedIn = async (req, res, next) => {
  console.log('[authController.js] isLoggedIn middleware çağrıldı, path:', req.originalUrl);
  
  if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    console.log('[authController.js] JWT cookie bulundu');
    
    try {
      // JWT_SECRET kullan
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, JWT_SECRET);
      console.log('[authController.js] JWT doğrulandı, kullanıcı ID:', decoded.id);
      
      const currentUser = await User.findById(decoded.id);
      
      if (!currentUser) {
        console.log('[authController.js] Kullanıcı bulunamadı');
        return next();
      }
      
      console.log('[authController.js] Kullanıcı bulundu:', currentUser.email);
      
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        console.log('[authController.js] Şifre değiştirilmiş');
        return next();
      }
      
      // Kullanıcıyı locals ve session'a ekle
      res.locals.user = currentUser;
      req.user = currentUser;
      if (req.session) {
        req.session.user = currentUser;
      }
      
      console.log('[authController.js] Kullanıcı oturum açmış olarak işaretlendi');
      
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

// Belirli bir kaynaga erişim için rol kontrolü
exports.restrictToResource = (resource, action) => {
  return (req, res, next) => {
    // Rol izinleri matrisi
    const permissions = {
      admin: {
        all: ['read', 'create', 'update', 'delete', 'manage']
      },
      'lead-guide': {
        tours: ['read', 'create', 'update'],
        users: ['read'],
        reviews: ['read', 'delete'],
        bookings: ['read', 'create', 'update']
      },
      guide: {
        tours: ['read'],
        reviews: ['read'],
        bookings: ['read']
      },
      user: {
        tours: ['read'],
        reviews: ['read', 'create', 'update', 'delete'],  // Kendi yorumlarını düzenleyebilir/silebilir
        bookings: ['read', 'create']  // Kendi rezervasyonlarını yapabilir ve görebilir
      }
    };

    const userRole = req.user.role;
    
    // Admin tüm kaynaklara tam erişimine sahip
    if (userRole === 'admin') {
      return next();
    }
    
    // Diğer roller için izin kontrolü
    const rolePermissions = permissions[userRole];
    
    // Rol için izinler tanımlı değilse erişim engellenir
    if (!rolePermissions) {
      return next(new AppError('Bu işlemi gerçekleştirmek için yetkiniz yok', 403));
    }
    
    // Kaynak için izinler tanımlı değilse erişim engellenir
    const resourcePermissions = rolePermissions[resource] || [];
    
    // İstenen eylem için izin yoksa erişim engellenir
    if (!resourcePermissions.includes(action)) {
      return next(new AppError(`${resource} kaynağı üzerinde ${action} işlemi için yetkiniz yok`, 403));
    }
    
    next();
  };
};

// Kullanıcı sahipliği kontrolü
exports.checkOwnership = (Model, paramIdField = 'id') => {
  return async (req, res, next) => {
    try {
      // Admin ve lead-guide her kaynağa erişebilir
      if (['admin', 'lead-guide'].includes(req.user.role)) {
        return next();
      }
      
      // Parametre ID'sini al
      const resourceId = req.params[paramIdField];
      if (!resourceId) {
        return next(new AppError('Kaynak ID bulunamadı', 400));
      }
      
      // Kaynağı bul
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return next(new AppError('Bu ID ile kaynak bulunamadı', 404));
      }
      
      // Kullanıcı sahipliğini kontrol et
      let isOwner = false;
      
      // Booking modeli için
      if (Model.modelName === 'Booking' && resource.user) {
        isOwner = resource.user.toString() === req.user.id;
      }
      
      // Review modeli için
      else if (Model.modelName === 'Review' && resource.user) {
        isOwner = resource.user.toString() === req.user.id;
      }
      
      // Diğer modeller için
      else if (resource.user) {
        isOwner = resource.user.toString() === req.user.id;
      }
      
      if (!isOwner) {
        return next(new AppError('Bu kaynağa erişim yetkiniz yok', 403));
      }
      
      // Kaynağı request nesnesine ekle
      req.resource = resource;
      next();
    } catch (err) {
      next(new AppError(err.message, 500));
    }
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
