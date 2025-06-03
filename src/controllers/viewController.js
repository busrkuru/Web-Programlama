const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

// Ana sayfa
exports.getOverview = async (req, res, next) => {
  try {
    // 1) Öne çıkan turları getir (puanı yüksek olanlardan 6 adet)
    const tours = await Tour.find()
      .sort('-ratingsAverage -ratingsQuantity')
      .limit(6);
    
    // 2) Modern şablonu oluştur
    res.status(200).render('overview-modern', {
      title: 'Natours | Öne Çıkan Turlar',
      tours
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Tur detay sayfası
exports.getTour = async (req, res, next) => {
  try {
    // 1) Slug'a göre turu al (yorumlarıyla birlikte)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    });

    if (!tour) {
      return next(new AppError('Bu isimle tur bulunamadı.', 404));
    }

    // 2) Şablonu oluştur
    res.status(200).render('tour', {
      title: `${tour.name} Turu`,
      tour
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Giriş sayfası
exports.getLoginForm = (req, res) => {
  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  if (res.locals.user) return res.redirect('/');
  
  // Önceki sayfayı kaydet (giriş sonrası buraya dönmek için)
  if (req.headers.referer && !req.headers.referer.includes('/login') && !req.headers.referer.includes('/signup')) {
    req.session.returnTo = req.headers.referer;
  }
  
  res.status(200).render('login', {
    title: 'Giriş Yap'
  });
};

// Kayıt sayfası
exports.getSignupForm = (req, res) => {
  // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  if (res.locals.user) return res.redirect('/');
  
  // Önceki sayfayı kaydet (kayıt sonrası buraya dönmek için)
  if (req.headers.referer && !req.headers.referer.includes('/login') && !req.headers.referer.includes('/signup')) {
    req.session.returnTo = req.headers.referer;
  }
  
  res.status(200).render('signup', {
    title: 'Hesap Oluştur'
  });
};

// Kullanıcı hesap sayfası
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Hesabım'
  });
};

// Rezervasyon sayfası
exports.getBookingForm = async (req, res, next) => {
  try {
    // Tur ID'sine göre turu getir
    const tour = await Tour.findById(req.params.tourId);
    
    if (!tour) {
      return next(new AppError('Bu ID ile tur bulunamadı.', 404));
    }
    
    res.status(200).render('booking', {
      title: `${tour.name} Rezervasyon Yap`,
      tour
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Kullanıcının rezervasyonlarını getir
exports.getMyBookings = async (req, res, next) => {
  try {
    // 1) Kullanıcının tüm rezervasyonlarını bul
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Rezervasyondaki turların ID'lerini al
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('bookings', {
      title: 'Rezervasyonlarım',
      bookings,
      tours
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Kullanıcının yorumlarını getir
exports.getMyReviews = async (req, res, next) => {
  try {
    // Kullanıcının yorumlarını bul
    const reviews = await Review.find({ user: req.user.id }).populate('tour');
    
    res.status(200).render('reviews', {
      title: 'Yorumlarım',
      reviews
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Admin paneli
exports.getAdminPanel = async (req, res, next) => {
  try {
    // Sadece admin ve lead-guide rolündeki kullanıcılar erişebilir
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'lead-guide')) {
      return next(new AppError('Bu sayfaya erişim izniniz yok.', 403));
    }
    
    // İstatistikleri getir
    const tourCount = await Tour.countDocuments();
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const reviewCount = await Review.countDocuments();
    
    res.status(200).render('admin', {
      title: 'Admin Paneli',
      stats: {
        tourCount,
        userCount,
        bookingCount,
        reviewCount
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Kullanıcı profil güncellemesi
exports.updateUserData = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).render('account', {
      title: 'Hesabım',
      user: updatedUser
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
