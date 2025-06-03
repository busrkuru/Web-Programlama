const mongoose = require('mongoose');

// Veritabanı bağlantı URL'si
const DB = 'mongodb://localhost:27017/natours';

// Veritabanı bağlantısı
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Veritabanına başarıyla bağlanıldı!');
    
    // Doğrudan MongoDB koleksiyonuna erişim
    const db = mongoose.connection.db;
    
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
        description: 'Efes Antik Kenti\'nin büyüleyici kalıntıları arasında tarihe yolculuk yapın.',
        imageCover: 'efes-cover.jpg',
        startDates: [new Date('2025-07-10')],
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
        ],
        slug: 'efes-antik-kenti-turu',
        secretTour: false,
        createdAt: new Date()
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
        description: 'Sabahın erken saatlerinde başlayan bu büyüleyici balon turu ile Kapadokya\'nın peri bacaları ve vadileri üzerinde unutulmaz bir deneyim yaşayın.',
        imageCover: 'kapadokya-balon-cover.jpg',
        startDates: [new Date('2025-07-15')],
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
        ],
        slug: 'kapadokya-balon-turu',
        secretTour: false,
        createdAt: new Date()
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
        description: 'UNESCO Dünya Mirası Listesi\'nde yer alan Safranbolu\'nun otantik dokusunu keşfedin.',
        imageCover: 'safranbolu-cover.jpg',
        startDates: [new Date('2025-08-05')],
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
        ],
        slug: 'safranbolu-kultur-turu',
        secretTour: false,
        createdAt: new Date()
      }
    ];
    
    // Turları ekle
    db.collection('tours').insertMany(newTours, (err, result) => {
      if (err) {
        console.error('Hata:', err);
        process.exit(1);
      }
      console.log(`${result.insertedCount} yeni tur eklendi!`);
      console.log('Eklenen turların ID\'leri:', result.insertedIds);
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(1);
  });
