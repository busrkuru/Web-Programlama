const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// Her istekte oturum durumunu kontrol et
router.use(authController.isLoggedIn);

// Ana sayfa
router.get('/', viewController.getOverview);

// Modern görünüm (alternatif rota)
router.get('/modern', viewController.getModernOverview);

// Hakkımızda sayfası - Türkçe ve İngilizce rotalar
router.get('/hakkimizda', viewController.getAboutUs);
router.get('/about', viewController.getAboutUs);

// İletişim sayfası - Türkçe ve İngilizce rotalar
router.get('/iletisim', viewController.getContact);
router.get('/contact', viewController.getContact);
router.get('/tours/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);
router.get('/logout', authController.logout);

// Korumalı rotalar - sadece giriş yapmış kullanıcılar
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-bookings', authController.protect, viewController.getMyBookings);
router.get('/my-reviews', authController.protect, viewController.getMyReviews);
router.get('/book/:tourId', authController.protect, viewController.getBookingForm);

// Admin paneli - sadece admin ve lead-guide
router.get(
  '/admin',
  authController.protect,
  authController.restrictToResource('all', 'manage'),
  viewController.getAdminPanel
);

// Tur yu00f6netimi paneli - sadece admin ve lead-guide
router.get(
  '/manage-tours',
  authController.protect,
  authController.restrictToResource('tours', 'manage'),
  viewController.getManageTours
);

// Yeni tur ekleme formu - sadece admin ve lead-guide
router.get(
  '/add-tour',
  authController.protect,
  authController.restrictToResource('tours', 'manage'),
  viewController.getAddTourForm
);

// Tur düzenleme formu - sadece admin ve lead-guide
router.get(
  '/edit-tour/:id',
  authController.protect,
  authController.restrictToResource('tours', 'manage'),
  viewController.getEditTourForm
);

// Rezervasyon yu00f6netimi paneli - sadece admin ve lead-guide
router.get(
  '/manage-bookings',
  authController.protect,
  authController.restrictToResource('bookings', 'manage'),
  viewController.getManageBookings
);

// Rezervasyon detayları - sadece admin ve lead-guide
router.get(
  '/booking/:id',
  authController.protect,
  authController.restrictToResource('bookings', 'manage'),
  viewController.getBookingDetails
);

// Kullanıcı yu00f6netimi paneli - sadece admin
router.get(
  '/manage-users',
  authController.protect,
  authController.restrictToResource('users', 'manage'),
  viewController.getManageUsers
);

// Yeni kullanıcı ekleme formu - sadece admin
router.get(
  '/signup-admin',
  authController.protect,
  authController.restrictToResource('users', 'manage'),
  viewController.getAdminSignupForm
);

// Kullanıcı düzenleme formu - sadece admin
router.get(
  '/edit-user/:id',
  authController.protect,
  authController.restrictToResource('users', 'manage'),
  viewController.getEditUserForm
);

module.exports = router;
