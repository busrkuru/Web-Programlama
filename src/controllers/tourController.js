const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Pagination ve filtreleme iu00e7in yardu0131mcu0131 fonksiyon
const getFilteredTours = catchAsync(async (req, res, next) => {
  // Filtreleme
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Geliu015fmiu015f filtreleme
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  let query = Tour.find(JSON.parse(queryStr));
  
  // Arama sorgusu varsa
  if (req.query.search) {
    const searchQuery = req.query.search;
    query = query.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { summary: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    });
  }

  // Su0131ralama
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Alan su0131nu0131rlama
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Sayfalama
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numTours = await Tour.countDocuments();
    if (skip >= numTours) throw new Error('Bu sayfa mevcut deu011fil');
  }

  // Sorguyu u00e7alu0131u015ftu0131r
  const tours = await query;

  return tours;
});

// Modern arayüz için filtreleme API'si
exports.filterTours = catchAsync(async (req, res, next) => {
  // 1) Filtreleme
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  // 2) Gelişmiş filtreleme (gte, gt, lte, lt)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = Tour.find(JSON.parse(queryStr));

  // 3) Arama
  if (req.query.search) {
    const searchQuery = req.query.search;
    query = query.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { summary: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    });
  }

  // 4) Sıralama
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-ratingsAverage');
  }

  // 5) Sayfalama
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  // 6) Sorguyu çalıştır
  const tours = await query;

  // 7) Toplam tur sayısını al (sayfalama için)
  const totalTours = await Tour.countDocuments(query.getQuery());

  // 8) Destinasyon bilgilerini topla (filtreleme seçenekleri için)
  const allLocations = await Tour.aggregate([
    {
      $group: {
        _id: "$startLocation.description",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const locations = allLocations.map(loc => ({
    name: loc._id,
    count: loc.count
  }));

  // 9) Fiyat aralıklarını hesapla
  const priceStats = await Tour.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" }
      }
    }
  ]);

  const minPrice = priceStats.length > 0 ? priceStats[0].minPrice : 0;
  const maxPrice = priceStats.length > 0 ? priceStats[0].maxPrice : 10000;

  // 10) Yanıtı gönder
  res.status(200).json({
    status: 'success',
    results: tours.length,
    total: totalTours,
    data: {
      tours,
      filters: {
        locations,
        minPrice,
        maxPrice
      }
    }
  });
});

// Tüm turları getir
exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await getFilteredTours(req, res, next);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

// ID'ye gu00f6re tur getir
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  if (!tour) {
    return next(new AppError('Bu ID ile tur bulunamadu0131', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

// Slug ile tur getir
exports.getTourBySlug = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews');

  if (!tour) {
    return next(new AppError('Bu isimle tur bulunamadu0131', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

// Yeni tur oluu015ftur
exports.createTour = catchAsync(async (req, res, next) => {
  if (req.files) {
    // Cover resmi işle
    if (req.files.imageCover) {
      req.body.imageCover = req.body.imageCover;
    }
    
    // Tur resimleri işle
    if (req.files.images && req.files.images.length > 0) {
      req.body.images = req.body.images;
    }
  }
  
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

// Tur gu00fcncelle
exports.updateTour = catchAsync(async (req, res, next) => {
  if (req.files) {
    // Cover resmi işle
    if (req.files.imageCover) {
      req.body.imageCover = req.body.imageCover;
    }
    
    // Tur resimleri işle
    if (req.files.images && req.files.images.length > 0) {
      req.body.images = req.body.images;
    }
  }
  
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('Bu ID ile tur bulunamadu0131', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

// Tur sil
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('Bu ID ile tur bulunamadu0131', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Tur istatistikleri
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
