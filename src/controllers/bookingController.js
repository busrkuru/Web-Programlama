const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

// Yeni rezervasyon oluu015ftur
exports.createBooking = async (req, res, next) => {
  try {
    const { tourId, startDate, participants } = req.body;
    
    // Turu bul
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return next(new AppError('Bu ID ile tur bulunamadu0131', 404));
    }
    
    // Maksimum grup bu00fcyu00fcklu00fcu011fu00fcnu00fc kontrol et
    if (participants > tour.maxGroupSize) {
      return next(new AppError(`Bu tur iu00e7in maksimum katu0131lu0131mcu0131 sayu0131su0131 ${tour.maxGroupSize}`, 400));
    }
    
    // Rezervasyon oluu015ftur
    const booking = await Booking.create({
      tour: tourId,
      user: req.user.id,
      price: tour.price,
      participants,
      startDate,
      paid: true
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// Kullanu0131cu0131nu0131n tu00fcm rezervasyonlaru0131nu0131 getir
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Tu00fcm rezervasyonlaru0131 getir (admin iu00e7in)
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// ID'ye gu00f6re rezervasyon getir
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return next(new AppError('Bu ID ile rezervasyon bulunamadu0131', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Rezervasyon gu00fcncelle
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!booking) {
      return next(new AppError('Bu ID ile rezervasyon bulunamadu0131', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Rezervasyon sil
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return next(new AppError('Bu ID ile rezervasyon bulunamadu0131', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Tur iu00e7in mu00fcsait tarihler
exports.getAvailableDates = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);
    
    if (!tour) {
      return next(new AppError('Bu ID ile tur bulunamadu0131', 404));
    }
    
    // Mevcut rezervasyonlaru0131 kontrol et
    const bookings = await Booking.find({ tour: req.params.tourId });
    
    // Tu00fcm tur bau015flangu0131u00e7 tarihlerini al
    const availableDates = tour.startDates.filter(date => {
      return date > new Date(); // Geu00e7miu015f tarihleri filtreleme
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        availableDates
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};
