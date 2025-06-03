const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Tüm ödeme rotalarında oturum kontrolü
router.use(authController.protect);

// Checkout session oluşturma
router.post('/checkout-session/:tourId', paymentController.getCheckoutSession);

// Admin rotaları
router.use(authController.restrictTo('admin'));

// Tüm ödemeleri listele (sadece admin)
router.get('/', paymentController.getAllPayments);

module.exports = router;
