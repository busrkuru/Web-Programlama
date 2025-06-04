const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const fileUpload = require('../utils/fileUpload');

const router = express.Router();

// Her turla ilgili yorumlar için nested route
router.use('/:tourId/reviews', reviewRouter);

// Popüler turlar ve istatistikler için özel rotalar
router
  .route('/top-5-cheap')
  .get(tourController.getAllTours);

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

// Eski filtre rotası kaldırıldı

// Modern arayüz için filtreleme API'si - ÖNEMLİ: Parametre rotalarından önce gelmesi gerekiyor
router
  .route('/modern-filter')
  .get(tourController.filterTours);

// Temel CRUD işlemleri
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictToResource('tours', 'create'),
    fileUpload.uploadTourImages,
    fileUpload.resizeTourImages,
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictToResource('tours', 'update'),
    fileUpload.uploadTourImages,
    fileUpload.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictToResource('tours', 'delete'),
    tourController.deleteTour
  );

module.exports = router;
