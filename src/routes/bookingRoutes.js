const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Tüm rotalar için koruma
router.use(authController.protect);

// Kullanıcının kendi rezervasyonları
router.get('/my-bookings', bookingController.getMyBookings);

// Tur için müsait tarihler
router.get('/available-dates/:tourId', bookingController.getAvailableDates);

// Yeni rezervasyon oluştur
router.post('/', bookingController.createBooking);

// Tüm rezervasyonları görme - sadece admin ve lead-guide
router
  .route('/')
  .get(
    authController.restrictToResource('bookings', 'read'),
    bookingController.getAllBookings
  );

// Belirli bir rezervasyonu görme/düzenleme/silme
router
  .route('/:id')
  .get(
    authController.checkOwnership(require('../models/bookingModel')),
    bookingController.getBooking
  )
  .patch(
    authController.restrictToResource('bookings', 'update'),
    authController.checkOwnership(require('../models/bookingModel')),
    bookingController.updateBooking
  )
  .delete(
    authController.restrictToResource('bookings', 'delete'),
    authController.checkOwnership(require('../models/bookingModel')),
    bookingController.deleteBooking
  );

module.exports = router;
