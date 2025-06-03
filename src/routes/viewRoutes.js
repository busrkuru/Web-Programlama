const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// Her istekte oturum durumunu kontrol et
router.use(authController.isLoggedIn);

// Herkesin erişebileceği rotalar
router.get('/', viewController.getModernOverview);
router.get('/modern', (req, res) => res.redirect('/'));
router.get('/tours/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);

// Korumalı rotalar - sadece giriş yapmış kullanıcılar
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-bookings', authController.protect, viewController.getMyBookings);
router.get('/my-reviews', authController.protect, viewController.getMyReviews);
router.get('/book/:tourId', authController.protect, viewController.getBookingForm);

// Admin paneli - sadece admin ve lead-guide
router.get(
  '/admin',
  authController.restrictTo('admin', 'lead-guide'),
  viewController.getAdminPanel
);

module.exports = router;
