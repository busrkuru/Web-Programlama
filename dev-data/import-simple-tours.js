const mongoose = require('mongoose');
const Tour = require('../src/models/tourModel');

// Veritabanı bağlantı URL'si - doğrudan yerel MongoDB bağlantısı
const DB = 'mongodb://localhost:27017/natours';

// Veritabanı bağlantısı
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Veritabanına başarıyla bağlanıldı!'))
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(1);
  });

// Yeni eklenecek basit tur verileri
const simpleTours = [
  {
    name: 'Kapadokya Balon Turu',
    duration: 1,
    maxGroupSize: 20,
    difficulty: 'easy',
    ratingsAverage: 4.8,
    ratingsQuantity: 0,
    price: 2500,
    priceDiscount: 2200,
    summary: 'Kapadokya\'nın eşsiz manzarasını balonla keşfedin',
    description: 'Kapadokya\'nın büyüleyici manzaraları eşliğinde unutulmaz bir balon turu deneyimi.',
    imageCover: 'kapadokya-balon.jpg',
    startDates: [new Date('2025-07-15')],
    startLocation: {
      type: 'Point',
      coordinates: [34.8340, 38.6429],
      address: 'Göreme, Nevşehir',
      description: 'Göreme Balon Kalkış Noktası'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [34.8340, 38.6429],
        address: 'Göreme',
        description: 'Balon Kalkış Noktası',
        day: 1
      }
 ]
  },
  {
    name: 'Kaş-Kekova Tekne Turu',
    duration: 1,
    maxGroupSize: 25,
    difficulty: 'easy',
    ratingsAverage: 4.7,
    ratingsQuantity: 0,
    price: 1200,
    summary: 'Eşsiz mavi yolculuk deneyimi',
    description: 'Kekova\'nın berrak sularında unutulmaz bir tekne turu.',
    imageCover: 'kekova-tekne.jpg',
    startDates: [new Date('2025-06-20')],
    startLocation: {
      type: 'Point',
      coordinates: [29.6379, 36.2023],
      address: 'Kaş Marina, Antalya',
      description: 'Tekne Turu Kalkış Noktası'
    }
  },
  {
    name: 'Uludağ Kış Sporları',
    duration: 2,
    maxGroupSize: 15,
    difficulty: 'medium',
    ratingsAverage: 4.6,
    ratingsQuantity: 0,
    price: 3500,
    priceDiscount: 3200,
    summary: 'Kış tatili için mükemmel bir kaçamak',
    description: 'Uludağ\'da kayak ve snowboard keyfi.',
    imageCover: 'uludag-kayak.jpg',
    startDates: [new Date('2025-01-10')],
    startLocation: {
      type: 'Point',
      coordinates: [29.1540, 40.0689],
      address: 'Uludağ Kayak Merkezi, Bursa',
      description: 'Otel Karşılaştırma Noktası'
    }
  }
];

// Yeni turları ekle
const addSimpleTours = async () => {
  try {
    console.log('Yeni turlar ekleniyor...');
    
    // Sadece daha önce eklenmemiş turları kontrol et ve ekle
    for (const tour of simpleTours) {
      const existingTour = await Tour.findOne({ name: tour.name });
      
      if (!existingTour) {
        // Gerekli alanları kontrol et
        const newTour = {
          ...tour,
          ratingsAverage: 4.5, // Varsayılan değer
          ratingsQuantity: 0,
          images: [], // Boş dizi olarak ayarla
          startDates: tour.startDates || [new Date()], // Varsayılan tarih ekle
          secretTour: false
        };
        
        await Tour.create(newTour);
        console.log(`✅ "${tour.name}" adlı tur eklendi.`);
      } else {
        console.log(`ℹ️ "${tour.name}" adlı tur zaten mevcut, atlandı.`);
      }
    }
    
    console.log('✅ Tüm işlemler tamamlandı!');
    process.exit();
  } catch (err) {
    console.error('❌ Hata oluştu:', err);
    process.exit(1);
  }
};

// Doğrudan fonksiyonu çağır
addSimpleTours();
