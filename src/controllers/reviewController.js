const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

// Tu00fcm yorumlaru0131 getir
exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Yeni yorum oluu015ftur
exports.createReview = async (req, res, next) => {
  try {
    // Rota parametresinden tourId gelirse onu kullan
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// ID'ye gu00f6re yorum getir
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError('Bu ID ile yorum bulunamadu0131', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Yorum gu00fcncelle
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!review) {
      return next(new AppError('Bu ID ile yorum bulunamadu0131', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};

// Yorum sil
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return next(new AppError('Bu ID ile yorum bulunamadu0131', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
};
