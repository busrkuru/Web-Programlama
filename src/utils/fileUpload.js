const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./appError');

// Configure multer storage
const multerStorage = multer.memoryStorage();

// Filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Lütfen sadece resim yükleyin!', 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// Middleware for uploading a single user photo
exports.uploadUserPhoto = upload.single('photo');

// Middleware for uploading multiple tour images (cover image and up to 3 images)
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// Middleware to resize user photo
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  // Generate unique filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Process image with sharp
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/img/users/${req.file.filename}`);

  next();
};

// Middleware to resize tour images
exports.resizeTourImages = async (req, res, next) => {
  console.log('resizeTourImages middleware çağrıldı');
  console.log('req.files:', req.files);
  
  // req.files mevcut değilse veya boşsa, işlemi atla
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('Yüklenecek dosya yok, işlemi atlama');
    return next();
  }

  // 1) Cover image - eğer varsa
  if (req.files.imageCover && req.files.imageCover.length > 0) {
    console.log('Kapak resmi işleniyor...');
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    req.body.imageCover = imageCoverFilename;
    
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`src/public/img/tours/${imageCoverFilename}`);
    
    console.log('Kapak resmi işlendi:', imageCoverFilename);
  }

  // 2) Images - eğer varsa
  if (req.files.images && req.files.images.length > 0) {
    console.log('Tur resimleri işleniyor...');
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`src/public/img/tours/${filename}`);

        req.body.images.push(filename);
      })
    );
    
    console.log('Tur resimleri işlendi:', req.body.images.length);
  }

  console.log('resizeTourImages middleware tamamlandı');
  next();
};
