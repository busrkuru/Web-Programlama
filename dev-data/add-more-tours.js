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
        name: 'Pamukkale Traverten Turu',
        duration: 1,
        maxGroupSize: 25,
        difficulty: 'easy',
        ratingsAverage: 4.8,
        ratingsQuantity: 0,
        price: 1800,
        priceDiscount: 1600,
        summary: 'Bembeyaz travertenlerde büyüleyici bir gün',
        description: 'Pamukkale\'nin eşsiz travertenlerini ve antik Hierapolis kentini keşfedin. Termal suların şifalı etkilerini deneyimleyin.',
        imageCover: 'tour-4-cover.jpg',
        images: ['tour-4-1.jpg', 'tour-4-2.jpg', 'tour-4-3.jpg'],
        startDates: [new Date('2025-07-20'), new Date('2025-08-15')],
        startLocation: {
          type: 'Point',
          coordinates: [29.1258, 37.9167],
          address: 'Pamukkale Girişi, Denizli',
          description: 'Pamukkale Ana Giriş'
        },
        locations: [
          {
            type: 'Point',
            coordinates: [29.1258, 37.9167],
            address: 'Pamukkale Travertenleri',
            description: 'Tur Başlangıç Noktası',
            day: 1
          }
        ],
        slug: 'pamukkale-traverten-turu',
        secretTour: false,
        createdAt: new Date()
      },
      {
        name: 'Nemrut Dağı Gün Doğumu Turu',
        duration: 2,
        maxGroupSize: 20,
        difficulty: 'medium',
        ratingsAverage: 4.9,
        ratingsQuantity: 0,
        price: 3200,
        priceDiscount: 2900,
        summary: 'Güneşin doğuşunu dev heykeller arasında izleyin',
        description: 'Nemrut Dağı\'nın zirvesinde, UNESCO Dünya Mirası listesindeki dev heykeller arasında unutulmaz bir gün doğumu deneyimi yaşayın.',
        imageCover: 'tour-5-cover.jpg',
        images: ['tour-5-1.jpg', 'tour-5-2.jpg', 'tour-5-3.jpg'],
        startDates: [new Date('2025-07-25'), new Date('2025-08-20')],
        startLocation: {
          type: 'Point',
          coordinates: [38.7406, 37.9818],
          address: 'Nemrut Dağı Milli Parkı, Adıyaman',
          description: 'Tur Başlangıç Noktası'
        },
        locations: [
          {
            type: 'Point',
            coordinates: [38.7406, 37.9818],
            address: 'Nemrut Dağı Zirvesi',
            description: 'Gün Doğumu İzleme Noktası',
            day: 1
          }
        ],
        slug: 'nemrut-dagi-gun-dogumu',
        secretTour: false,
        createdAt: new Date()
      },
      {
        name: 'Mardin Taş Evler ve Tarih Turu',
        duration: 3,
        maxGroupSize: 15,
        difficulty: 'easy',
        ratingsAverage: 4.7,
        ratingsQuantity: 0,
        price: 4200,
        priceDiscount: 3900,
        summary: 'Tarihin ve kültürün iç içe geçtiği bir Mardin deneyimi',
        description: 'Mardin\'in dar sokaklarında tarihi taş evler arasında gezerken binlerce yıllık kültürel mirası keşfedin. Midyat\'ın gümüş işçiliğini ve lezzetli yemeklerini deneyimleyin.',
        imageCover: 'tour-6-cover.jpg',
        images: ['tour-6-1.jpg', 'tour-6-2.jpg', 'tour-6-3.jpg'],
        startDates: [new Date('2025-08-01'), new Date('2025-09-01')],
        startLocation: {
          type: 'Point',
          coordinates: [40.7379, 37.3124],
          address: 'Mardin Eski Şehir, Mardin',
          description: 'Tur Başlangıç Noktası'
        },
        locations: [
          {
            type: 'Point',
            coordinates: [40.7379, 37.3124],
            address: 'Mardin Eski Şehir',
            description: 'Tur Başlangıç Noktası',
            day: 1
          }
        ],
        slug: 'mardin-tas-evler-tarih',
        secretTour: false,
        createdAt: new Date()
      }
    ];
    
        // Önce tüm mevcut turların isimlerini al
    db.collection('tours').find({}, { name: 1 }).toArray((err, existingTours) => {
      if (err) {
        console.error('Turlar alınırken hata:', err);
        process.exit(1);
      }
      
      const existingTourNames = existingTours.map(t => t.name);
      const toursToAdd = newTours.filter(tour => !existingTourNames.includes(tour.name));
      
      if (toursToAdd.length === 0) {
        console.log('Tüm turlar zaten mevcut. Yeni tur eklenmedi.');
        process.exit(0);
      }
      
      console.log(`Toplam ${toursToAdd.length} yeni tur eklenecek.`);
      
      // Turları toplu olarak ekle
      db.collection('tours').insertMany(toursToAdd, (err, result) => {
        if (err) {
          console.error('Turlar eklenirken hata:', err);
          process.exit(1);
        }
        
        console.log('\nBaşarıyla eklendi:');
        toursToAdd.forEach(tour => {
          console.log(`✅ ${tour.name}`);
        });
        console.log(`\nToplam ${result.insertedCount} yeni tur eklendi.`);
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(1);
  });
