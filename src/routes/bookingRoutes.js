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

// Admin rotaları
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
