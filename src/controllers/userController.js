const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Kullanıcıdan alınan verileri filtrele
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Tüm kullanıcıları getir
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Kullanıcı bilgilerini güncelle
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Kullanıcı POST ile şifre verisi gönderirse hata döndür
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Bu rota şifre güncellemek için değildir. Lütfen /updateMyPassword rotasını kullanın.',
        400
      )
    );
  }

  // 2) Güncelleme için izin verilen alanları filtrele
  const filteredBody = filterObj(req.body, 'name', 'email');
  
  // 3) Eğer dosya yüklendiyse, fotoğraf ismini ekle
  if (req.file) filteredBody.photo = req.file.filename;

  // 4) Kullanıcı dokümanını güncelle
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Kullanıcı kendini sil (aktif değil olarak işaretle)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Mevcut kullanıcı bilgilerini getir
exports.getMe = catchAsync((req, res, next) => {
  req.params.id = req.user.id;
  next();
});

// ID'ye göre kullanıcı getir
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Bu ID ile kullanıcı bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Yeni kullanıcı oluştur (admin için)
exports.createUser = catchAsync((req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Bu rota tanımlanmadı! Lütfen /signup kullanın.'
  });
});

// Kullanıcı güncelle (admin için)
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError('Bu ID ile kullanıcı bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Kullanıcı sil (admin için)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Bu ID ile kullanıcı bulunamadı', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
