const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../src/models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Veritabanı bağlantısı
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Veritabanına başarıyla bağlanıldı!'))
  .catch((err) => console.error('Veritabanı bağlantı hatası:', err));

// Yeni eklenecek tur verileri
const newTours = [
  {
    name: 'Kapadokya Balon Turu',
    duration: 1,
    maxGroupSize: 20,
    difficulty: 'easy',
    ratingsAverage: 4.8,
    ratingsQuantity: 128,
    price: 2500,
    priceDiscount: 2200,
    summary: 'Kapadokya\'nın eşsiz manzarasını balonla keşfedin',
    description: 'Sabahın erken saatlerinde başlayan bu büyüleyici balon turu ile Kapadokya\'nın peri bacaları ve vadileri üzerinde unutulmaz bir deneyim yaşayın. Profesyonel pilotlar eşliğinde güvenli bir uçuşun keyfini çıkarın.',
    imageCover: 'kapadokya-balon.jpg',
    images: ['kapadokya-balon-1.jpg', 'kapadokya-balon-2.jpg', 'kapadokya-balon-3.jpg'],
    startDates: [
      new Date('2025-07-15'),
      new Date('2025-07-22'),
      new Date('2025-07-29'),
    ],
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
    ratingsQuantity: 95,
    price: 1200,
    summary: 'Eşsiz mavi yolculuk deneyimi',
    description: 'Antalya\'nın Kaş ilçesinden başlayan bu tekne turu ile Kekova\'nın berrak sularında yüzme molaları vererek batık şehir ve koyları keşfedin. Öğle yemeği ve içecekler dahildir.',
    imageCover: 'kekova-tekne.jpg',
    images: ['kekova-1.jpg', 'kekova-2.jpg', 'kekova-3.jpg'],
    startDates: [
      new Date('2025-06-20'),
      new Date('2025-06-27'),
      new Date('2025-07-04'),
    ],
    startLocation: {
      type: 'Point',
      coordinates: [29.6379, 36.2023],
      address: 'Kaş Marina, Antalya',
      description: 'Tekne Turu Kalkış Noktası'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [29.6379, 36.2023],
        address: 'Kaş',
        description: 'Tekne Turu Başlangıç Noktası',
        day: 1
      }
    ]
  },
  {
    name: 'Uludağ Kış Sporları',
    duration: 2,
    maxGroupSize: 15,
    difficulty: 'medium',
    ratingsAverage: 4.6,
    ratingsQuantity: 78,
    price: 3500,
    priceDiscount: 3200,
    summary: 'Kış tatili için mükemmel bir kaçamak',
    description: 'Uludağ\'ın eşsiz karlı manzaraları eşliğinde kayak ve snowboard yapma fırsatı. Tüm ekipmanlar ve ulaşım dahildir. Konaklama otelimizde yarım pansiyon olarak yapılmaktadır.',
    imageCover: 'uludag-kayak.jpg',
    images: ['uludag-1.jpg', 'uludag-2.jpg', 'uludag-3.jpg'],
    startDates: [
      new Date('2025-01-10'),
      new Date('2025-01-17'),
      new Date('2025-02-07'),
    ],
    startLocation: {
      type: 'Point',
      coordinates: [29.1540, 40.0689],
      address: 'Uludağ Kayak Merkezi, Bursa',
      description: 'Otel Karşılaştırma Noktası'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [29.1540, 40.0689],
        address: 'Uludağ',
        description: 'Kayak Merkezi',
        day: 1
      }
    ]
  }
];

// Yeni turları ekle
const addNewTours = async () => {
  try {
    // Sadece daha önce eklenmemiş turları kontrol et ve ekle
    for (const tour of newTours) {
      const existingTour = await Tour.findOne({ name: tour.name });
      
      if (!existingTour) {
        await Tour.create(tour);
        console.log(`"${tour.name}" adlı tur eklendi.`);
      } else {
        console.log(`"${tour.name}" adlı tur zaten mevcut, atlandı.`);
      }
    }
    
    console.log('Tüm yeni turlar başarıyla eklendi!');
    process.exit();
  } catch (err) {
    console.error('Hata oluştu:', err);
    process.exit(1);
  }
};

// Komut satırı argümanlarını kontrol et
if (process.argv[2] === '--import') {
  addNewTours();
} else {
  console.log('Lütfen --import parametresini kullanın');
  process.exit(1);
}
