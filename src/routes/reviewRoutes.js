const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// mergeParams: true sayesinde parent router'dan (tourRoutes) gelen parametreleri alabiliriz
const router = express.Router({ mergeParams: true });

// Tu00fcm rotalar iu00e7in koruma
router.use(authController.protect);

router
  .route('/')
  .get(
    authController.restrictToResource('reviews', 'read'),
    reviewController.getAllReviews
  )
  .post(
    authController.restrictToResource('reviews', 'create'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(
    reviewController.getReview
  )
  .patch(
    authController.restrictToResource('reviews', 'update'),
    authController.checkOwnership(require('../models/reviewModel')),
    reviewController.updateReview
  )
  .delete(
    authController.restrictToResource('reviews', 'delete'),
    authController.checkOwnership(require('../models/reviewModel')),
    reviewController.deleteReview
  );

module.exports = router;
