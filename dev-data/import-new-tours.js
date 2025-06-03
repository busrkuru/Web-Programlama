const mongoose = require('mongoose');
const Tour = require('../src/models/tourModel');

// Veritabanı bağlantı URL'si
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

// Yeni eklenecek turlar
const newTours = [
  {
    name: 'Efes Antik Kenti Turu',
    duration: 1,
    maxGroupSize: 30,
    difficulty: 'easy',
    ratingsAverage: 4.7,
    ratingsQuantity: 0,
    price: 1500,
    priceDiscount: 1300,
    summary: 'Tarihin izlerini süren unutulmaz bir yolculuk',
    description: 'Efes Antik Kenti\'nin büyüleyici kalıntıları arasında tarihe yolculuk yapın. Artemis Tapınağı, Celsus Kütüphanesi ve antik tiyatro gibi önemli noktaları rehber eşliğinde keşfedin.',
    imageCover: 'efes-cover.jpg',
    images: ['efes-1.jpg', 'efes-2.jpg', 'efes-3.jpg'],
    startDates: [new Date('2025-07-10'), new Date('2025-08-15')],
    startLocation: {
      type: 'Point',
      coordinates: [27.3399, 37.9397],
      address: 'Efes Antik Kenti Girişi, Selçuk/İzmir',
      description: 'Efes Antik Kenti Ana Giriş'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [27.3399, 37.9397],
        address: 'Efes Antik Kenti',
        description: 'Tur Başlangıç Noktası',
        day: 1
      }
    ]
  },
  {
    name: 'Kapadokya Balon Turu',
    duration: 1,
    maxGroupSize: 20,
    difficulty: 'easy',
    ratingsAverage: 4.9,
    ratingsQuantity: 0,
    price: 3500,
    priceDiscount: 3200,
    summary: 'Gökyüzünde büyüleyici bir Kapadokya deneyimi',
    description: 'Sabahın erken saatlerinde başlayan bu büyüleyici balon turu ile Kapadokya\'nın peri bacaları ve vadileri üzerinde unutulmaz bir deneyim yaşayın. Profesyonel pilotlar eşliğinde güvenli bir uçuşun keyfini çıkarın.',
    imageCover: 'kapadokya-balon-cover.jpg',
    images: ['kapadokya-balon-1.jpg', 'kapadokya-balon-2.jpg', 'kapadokya-balon-3.jpg'],
    startDates: [new Date('2025-07-15'), new Date('2025-07-22'), new Date('2025-07-29')],
    startLocation: {
      type: 'Point',
      coordinates: [34.8340, 38.6429],
      address: 'Göreme, Nevşehir',
      description: 'Balon Kalkış Noktası'
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
    name: 'Safranbolu Kültür Turu',
    duration: 2,
    maxGroupSize: 25,
    difficulty: 'easy',
    ratingsAverage: 4.6,
    ratingsQuantity: 0,
    price: 2800,
    priceDiscount: 2500,
    summary: 'Tarihi Safranbolu evlerinde nostaljik bir yolculuk',
    description: 'UNESCO Dünya Mirası Listesi\'nde yer alan Safranbolu\'nun otantik dokusunu keşfedin. Tarihi çarşısı, kanyonları ve geleneksel konaklarıyla unutulmaz bir hafta sonu kaçamağı sizi bekliyor.',
    imageCover: 'safranbolu-cover.jpg',
    images: ['safranbolu-1.jpg', 'safranbolu-2.jpg', 'safranbolu-3.jpg'],
    startDates: [new Date('2025-08-05'), new Date('2025-09-10')],
    startLocation: {
      type: 'Point',
      coordinates: [32.6906, 41.2508],
      address: 'Safranbolu Çarşısı, Karabük',
      description: 'Tur Başlangıç Noktası'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [32.6906, 41.2508],
        address: 'Safranbolu Çarşısı',
        description: 'Tur Başlangıç Noktası',
        day: 1
      }
    ]
  }
];

// Yeni turları ekle
const addNewTours = async () => {
  try {
    console.log('Yeni turlar ekleniyor...');
    
    // Sadece daha önce eklenmemiş turları kontrol et ve ekle
    for (const tour of newTours) {
      const existingTour = await Tour.findOne({ name: tour.name });
      
      if (!existingTour) {
        // Gerekli alanları kontrol et
        const newTour = {
          ...tour,
          secretTour: false,
          startLocation: {
            type: 'Point',
            coordinates: tour.startLocation.coordinates,
            address: tour.startLocation.address,
            description: tour.startLocation.description
          },
          locations: tour.locations.map(loc => ({
            type: 'Point',
            coordinates: loc.coordinates,
            address: loc.address,
            description: loc.description,
            day: loc.day
          })),
          startDates: Array.isArray(tour.startDates) ? tour.startDates : [new Date()],
          ratingsAverage: tour.ratingsAverage || 4.5,
          ratingsQuantity: tour.ratingsQuantity || 0,
          images: Array.isArray(tour.images) ? tour.images : [],
          createdAt: new Date(),
          slug: tour.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
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
addNewTours();
