const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

// Ana sayfa
exports.getOverview = async (req, res, next) => {
  try {
    console.log('getOverview fonksiyonu çağrıldı');
    // 1) Tüm turları getir ve çeşitli kriterlere göre sırala
    // Önce en son eklenenleri göster, sonra da en çok puan ve değerlendirme alanları
    const tours = await Tour.find()
      .sort('-createdAt -ratingsAverage -ratingsQuantity')
      .limit(8); // Daha fazla tur göster
    
    console.log(`${tours.length} adet tur bulundu`);
    tours.forEach(tour => {
      console.log(`Tur: ${tour.name}, Oluşturulma: ${tour.createdAt}, Puan: ${tour.ratingsAverage}`);
    });
    
    // 2) Modern şablonu kullan
    res.status(200).render('overview-modern', {
      title: 'Natours | Öne Çıkan Turlar',
      tours,
      modern: true // Modern görünüm için flag
    });
  } catch (err) {
    console.error('getOverview hatası:', err);
    next(new AppError(err.message, 404));
  }
};

// Modern görünümlü ana sayfa
exports.getModernOverview = async (req, res, next) => {
  try {
    console.log('getModernOverview fonksiyonu çağrıldı');
    // 1) Tüm turları getir ve çeşitli kriterlere göre sırala
    // Önce en son eklenenleri göster, sonra da en çok puan ve değerlendirme alanları
    const tours = await Tour.find()
      .sort('-createdAt -ratingsAverage -ratingsQuantity')
      .limit(8); // Daha fazla tur göster
    
    console.log(`${tours.length} adet tur bulundu`);
    tours.forEach(tour => {
      console.log(`Tur: ${tour.name}, Oluşturulma: ${tour.createdAt}, Puan: ${tour.ratingsAverage}`);
    });
    
    // 2) Modern şablonu oluştur
    res.status(200).render('overview-modern', {
      title: 'Natours | Öne Çıkan Turlar',
      tours
    });
  } catch (err) {
    console.error('getModernOverview hatası:', err);
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
    return next(new AppError(err.message, 400));
  }
};

// Admin Paneli
exports.getAdminPanel = async (req, res, next) => {
  try {
    // İstatistikleri getir
    const stats = {
      totalTours: await Tour.countDocuments(),
      totalUsers: await User.countDocuments(),
      totalBookings: await Booking.countDocuments(),
      totalReviews: await Review.countDocuments()
    };
    
    // Son 5 rezervasyonu getir
    const recentBookings = await Booking.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user')
      .populate('tour');
    
    // Son 5 yorumu getir
    const recentReviews = await Review.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user')
      .populate('tour');
    
    res.status(200).render('admin', {
      title: 'Admin Paneli',
      stats,
      recentBookings,
      recentReviews
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Tur Yönetimi Paneli
exports.getManageTours = async (req, res, next) => {
  try {
    // Tüm turları getir
    const tours = await Tour.find();
    
    res.status(200).render('manageTours', {
      title: 'Tur Yönetimi',
      tours
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Rezervasyon Yönetimi Paneli
exports.getManageBookings = async (req, res, next) => {
  try {
    // Tüm rezervasyonları getir
    const bookings = await Booking.find()
      .populate('user')
      .populate('tour');
    
    res.status(200).render('manageBookings', {
      title: 'Rezervasyon Yönetimi',
      bookings
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Kullanıcı Yönetimi Paneli
exports.getManageUsers = async (req, res, next) => {
  try {
    // Tüm kullanıcıları getir
    const users = await User.find();
    
    res.status(200).render('manageUsers', {
      title: 'Kullanıcı Yönetimi',
      users
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Admin için kullanıcı ekleme formu
exports.getAdminSignupForm = async (req, res, next) => {
  try {
    res.status(200).render('adminSignup', {
      title: 'Yeni Kullanıcı Ekle'
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Kullanıcı düzenleme formu
exports.getEditUserForm = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('Bu ID ile kullanıcı bulunamadı', 404));
    }
    
    res.status(200).render('editUser', {
      title: 'Kullanıcı Düzenle',
      user
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Tur ekleme formu
exports.getAddTourForm = async (req, res, next) => {
  try {
    res.status(200).render('addTour', {
      title: 'Yeni Tur Ekle'
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Tur düzenleme formu
exports.getEditTourForm = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return next(new AppError('Bu ID ile tur bulunamadı', 404));
    }
    
    res.status(200).render('editTour', {
      title: 'Tur Düzenle',
      tour
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Rezervasyon detayları
exports.getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('tour');
    
    if (!booking) {
      return next(new AppError('Bu ID ile rezervasyon bulunamadı', 404));
    }
    
    res.status(200).render('bookingDetails', {
      title: 'Rezervasyon Detayları',
      booking
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// Hakkımızda sayfası
exports.getAboutUs = (req, res) => {
  try {
    res.status(200).render('hakkimizda', {
      title: 'Natours | Hakkımızda',
      modern: true
    });
  } catch (err) {
    console.error('Hakkımızda sayfası render hatası:', err);
    res.status(404).render('error', {
      title: 'Hata oluştu',
      msg: 'Sayfa görüntülenirken bir hata oluştu.'
    });
  }
};

// İletişim sayfası
exports.getContact = (req, res) => {
  try {
    res.status(200).render('iletisim', {
      title: 'Natours | İletişim',
      modern: true
    });
  } catch (err) {
    console.error('İletişim sayfası render hatası:', err);
    res.status(404).render('error', {
      title: 'Hata oluştu',
      msg: 'Sayfa görüntülenirken bir hata oluştu.'
    });
  }
};
