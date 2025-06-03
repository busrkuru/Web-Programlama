const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config({ path: './.env' });

// Model dosyalarını yükle
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

// MongoDB bağlantısı
const DB = 'mongodb://127.0.0.1:27017/natours';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.error('DB connection error:', err));

// Örnek tur verileri
const tours = [
  {
    name: "Kapadokya Balon Turu",
    duration: 3,
    maxGroupSize: 12,
    difficulty: "easy",
    ratingsAverage: 4.7,
    ratingsQuantity: 37,
    price: 3997,
    summary: "Kapadokya'nın eşsiz peri bacaları arasında unutulmaz bir balon deneyimi",
    description: "Kapadokya'nın masalsı manzarasını kuşbakışı izleme fırsatı yakalayacağınız bu turda, gündoğumunun ilk ışıklarıyla havalanacak ve peri bacaları, vadiler ve tarihi yerleşimlerin üzerinde süzülerek eşsiz manzaranın keyfini çıkaracaksınız. Tur sonunda verilen başarı sertifikası ve şampanya ile anılarınızı tazeleyin.",
    imageCover: "tour-1-1.jpg",
    images: ["tour-1-2.jpg", "tour-1-3.jpg"],
    startDates: [
      "2025-07-15T09:00:00.000Z",
      "2025-08-20T09:00:00.000Z",
      "2025-09-05T09:00:00.000Z"
    ],
    secretTour: false,
    startLocation: {
      type: "Point",
      coordinates: [34.8672, 38.6431],
      address: "Nevşehir, Türkiye",
      description: "Kapadokya Bölgesi"
    },
    locations: [
      {
        type: "Point",
        coordinates: [34.8672, 38.6431],
        address: "Göreme, Nevşehir",
        description: "Balon kalkış noktası",
        day: 1
      },
      {
        type: "Point",
        coordinates: [34.8428, 38.6559],
        address: "Çavusin, Nevşehir",
        description: "Kırmızı Vadi üzerinde uçuş",
        day: 1
      },
      {
        type: "Point",
        coordinates: [34.8125, 38.6371],
        address: "Gerçin Köyü, Nevşehir",
        description: "Balon iniş noktası",
        day: 1
      }
    ]
  },
  {
    name: "Efes Antik Kenti Turu",
    duration: 5,
    maxGroupSize: 15,
    difficulty: "medium",
    ratingsAverage: 4.9,
    ratingsQuantity: 28,
    price: 4997,
    summary: "Antik dünyanın en büyük kentlerinden Efes'i ve Şirince'nin otantik atmosferini keşfedin",
    description: "Roma döneminin en büyük şehirlerinden biri olan Efes Antik Kenti'nde, Celsus Kütüphanesi, Büyük Tiyatro, Hadrian Tapınağı gibi etkileyici yapıları görecek ve 2000 yıllık tarihte bir yolculuğa çıkacaksınız. Ardından, üzüm bağlarıyla çevrili Şirince Köyü'nde yerel lezzetleri tadacak, el yapımı ürünleri inceleyecek ve otantik Türk köy yaşamını deneyimleyeceksiniz.",
    imageCover: "tour-2-1.jpg",
    images: ["tour-2-2.jpg", "tour-2-3.jpg"],
    startDates: [
      "2025-06-19T09:00:00.000Z",
      "2025-07-17T09:00:00.000Z",
      "2025-08-12T09:00:00.000Z"
    ],
    secretTour: false,
    startLocation: {
      type: "Point",
      coordinates: [27.3412, 37.9401],
      address: "Selçuk, İzmir",
      description: "Efes Antik Kenti Girişi"
    },
    locations: [
      {
        type: "Point",
        coordinates: [27.3412, 37.9401],
        address: "Efes Antik Kenti, Selçuk",
        description: "Efes Antik Kenti Girişi",
        day: 1
      },
      {
        type: "Point",
        coordinates: [27.3395, 37.9450],
        address: "Celsus Kütüphanesi, Efes",
        description: "Roma döneminin en etkileyici yapılarından biri",
        day: 1
      },
      {
        type: "Point",
        coordinates: [27.5671, 37.9437],
        address: "Şirince Köyü, Selçuk",
        description: "Tarihi Rum köyü",
        day: 2
      }
    ]
  },
  {
    name: "Safranbolu Kültür Turu",
    duration: 4,
    maxGroupSize: 10,
    difficulty: "easy",
    ratingsAverage: 4.6,
    ratingsQuantity: 19,
    price: 3497,
    summary: "UNESCO Dünya Mirası Listesi'ndeki Safranbolu'nun tarihi sokaklarında yolculuk",
    description: "Osmanlı mimarisinin en güzel örneklerini barındıran Safranbolu'da, yüzlerce yıllık tarihi konakları, çarşıları ve geleneksel zanaat atölyelerini keşfedeceksiniz. 18. ve 19. yüzyıldan kalma ahşap evlerin aralarından geçen dar sokaklarında yürüyecek, yerel lezzetleri tadacak ve geleneksel Türk yaşam tarzını deneyimleyeceksiniz.",
    imageCover: "tour-3-1.jpg",
    images: ["tour-3-2.jpg", "tour-3-1.jpg"],
    startDates: [
      "2025-07-01T09:00:00.000Z",
      "2025-08-10T09:00:00.000Z",
      "2025-09-15T09:00:00.000Z"
    ],
    secretTour: false,
    startLocation: {
      type: "Point",
      coordinates: [32.6946, 41.2453],
      address: "Safranbolu, Karabük",
      description: "Safranbolu Çarşısı"
    },
    locations: [
      {
        type: "Point",
        coordinates: [32.6946, 41.2453],
        address: "Safranbolu Çarşısı, Karabük",
        description: "Tarihi çarşı bölgesi",
        day: 1
      },
      {
        type: "Point",
        coordinates: [32.6908, 41.2481],
        address: "Kaymakamlar Evi, Safranbolu",
        description: "Tarihi Osmanlı konağı",
        day: 2
      },
      {
        type: "Point",
        coordinates: [32.7085, 41.2550],
        address: "Yörük Köyü, Safranbolu",
        description: "Geleneksel Türk köyü",
        day: 3
      }
    ]
  }
];

// Veritabanını temizle ve örnek verileri yükle
const resetAndCreateTours = async () => {
  try {
    // Tur verilerini temizle
    await Tour.deleteMany();
    console.log('Mevcut turlar temizlendi');
    
    // Yeni turlar oluştur
    await Tour.create(tours);
    console.log(`${tours.length} yeni tur oluşturuldu`);
    
    console.log('Yükleme tamamlandı!');
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
};

resetAndCreateTours();
