const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Pagination ve filtreleme için yardımcı fonksiyon
const getFilteredTours = catchAsync(async (req, res, next) => {
  try {
    console.log('getFilteredTours fonksiyonu çağrıldı');
    
    // Filtreleme
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Gelişmiş filtreleme
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

    // Sıralama
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Alan sınırlama
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
    
    // Sayfa kontrolü
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('Bu sayfa mevcut değil');
    }

    // Sorguyu çalıştır
    const tours = await query;
    
    console.log(`Filtreleme sonucu ${tours.length} tur bulundu`);
    return tours;
  } catch (err) {
    console.error('Filtreleme hatası:', err);
    throw err; // Hata yönetimi için hatayı tekrar fırlat
  }
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
  console.log('getAllTours fonksiyonu çağrıldı');
  
  try {
    const tours = await Tour.find();
    
    // Tur verilerini güvenli hale getir
    const safeTours = tours.map(tour => {
      if (!tour) return null;
      
      const tourObj = tour.toObject ? tour.toObject() : tour;
      
      return {
        ...tourObj,
        imageCover: tourObj.imageCover || null,
        images: tourObj.images || []
      };
    }).filter(tour => tour !== null); // null turları filtrele
    
    console.log(`${safeTours.length} tur başarıyla getirildi`);
    
    res.status(200).json({
      status: 'success',
      results: safeTours.length,
      data: {
        tours: safeTours
      }
    });
  } catch (err) {
    console.error('Turları getirme hatası:', err);
    return next(new AppError(`Turlar alınırken hata oluştu: ${err.message}`, 400));
  }
});

// ID'ye göre tur getir
exports.getTour = catchAsync(async (req, res, next) => {
  console.log('getTour fonksiyonu çağrıldı, ID:', req.params.id);
  
  try {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
      console.log('Tur bulunamadı:', req.params.id);
      return next(new AppError('Bu ID ile tur bulunamadı', 404));
    }
    
    // Tur verilerini güvenli hale getir
    const safeTour = {
      ...tour.toObject(),
      imageCover: tour.imageCover || null,
      images: tour.images || []
    };
    
    console.log('Tur başarıyla bulundu:', tour.name);
    
    res.status(200).json({
      status: 'success',
      data: {
        tour: safeTour
      }
    });
  } catch (err) {
    console.error('Tur getirme hatası:', err);
    return next(new AppError(`Tur bilgisi alınırken hata oluştu: ${err.message}`, 400));
  }
});

// Slug ile tur getir
exports.getTourBySlug = catchAsync(async (req, res, next) => {
  console.log('getTourBySlug fonksiyonu çağrıldı, slug:', req.params.slug);
  
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews');

    if (!tour) {
      console.log('Tur bulunamadı:', req.params.slug);
      return next(new AppError('Bu isimle tur bulunamadı', 404));
    }
    
    // Tur verilerini güvenli hale getir
    const safeTour = {
      ...tour.toObject(),
      imageCover: tour.imageCover || null,
      images: tour.images || []
    };
    
    console.log('Tur başarıyla bulundu:', tour.name);
    
    res.status(200).json({
      status: 'success',
      data: {
        tour: safeTour
      }
    });
  } catch (err) {
    console.error('Tur getirme hatası:', err);
    return next(new AppError(`Tur bilgisi alınırken hata oluştu: ${err.message}`, 400));
  }
});

// Yeni tur oluu015ftur
exports.createTour = catchAsync(async (req, res, next) => {
  console.log('createTour fonksiyonu çağrıldı');
  console.log('Tur verileri:', req.body);
  
  try {
    // Dosya yükleme işlemleri
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
    
    // GeoJSON verilerini kontrol et ve düzelt
    if (req.body.startLocation) {
      // startLocation zaten bir string olarak gelmiş olabilir, JSON'a çevirmeyi dene
      let startLocation = req.body.startLocation;
      if (typeof startLocation === 'string') {
        try {
          startLocation = JSON.parse(startLocation);
        } catch (e) {
          console.log('startLocation JSON parse hatası:', e);
        }
      }
      
      // startLocation bir obje ise ve coordinates yoksa, varsayılan ekleyelim
      if (typeof startLocation === 'object' && !startLocation.coordinates) {
        startLocation.coordinates = [0, 0]; // Varsayılan koordinatlar (Ekvatorda Sıfır Meridyeni)
        console.log('startLocation için varsayılan koordinatlar eklendi');
      }
      
      req.body.startLocation = startLocation;
    } else {
      // startLocation yoksa, basit bir varsayılan değer ekleyelim
      req.body.startLocation = {
        type: 'Point',
        coordinates: [0, 0],
        description: 'Belirtilmemiş konum'
      };
      console.log('Varsayılan startLocation eklendi');
    }
    
    console.log('Düzeltilmiş tur verileri:', req.body);
    
    const newTour = await Tour.create(req.body);
    console.log('Yeni tur oluşturuldu:', newTour.name);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    console.error('Tur oluşturma hatası:', err);
    return next(new AppError(`Tur oluşturulurken hata oluştu: ${err.message}`, 400));
  }
});

// Tur güncelle
exports.updateTour = catchAsync(async (req, res, next) => {
  console.log('updateTour fonksiyonu çağrıldı');
  console.log('Tur ID:', req.params.id);
  console.log('Güncelleme verileri:', req.body);
  
  // req.files kontrolü - sadece dosya yükleme işlemi varsa çalışır
  if (req.files && Object.keys(req.files).length > 0) {
    console.log('Dosya yükleme işlemi tespit edildi');
    // Cover resmi işle
    if (req.files.imageCover && req.files.imageCover.length > 0) {
      req.body.imageCover = req.files.imageCover[0].filename;
      console.log('Kapak resmi güncellendi:', req.body.imageCover);
    }
    
    // Tur resimleri işle
    if (req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(img => img.filename);
      console.log('Tur resimleri güncellendi:', req.body.images);
    }
  }
  
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tour) {
      console.log('Tur bulunamadı:', req.params.id);
      return next(new AppError('Bu ID ile tur bulunamadı', 404));
    }

    console.log('Tur başarıyla güncellendi:', tour.name);
    
    // Güvenli tur objesi oluştur
    const safeTour = {
      ...tour.toObject(),
      imageCover: tour.imageCover || 'default.jpg',
      images: tour.images || []
    };
    
    console.log('Güvenli tur verisi oluşturuldu');
    
    res.status(200).json({
      status: 'success',
      data: {
        tour: safeTour
      }
    });
  } catch (err) {
    console.error('Tur güncelleme hatası:', err);
    return next(new AppError(`Tur güncellenirken hata oluştu: ${err.message}`, 400));
  }
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
