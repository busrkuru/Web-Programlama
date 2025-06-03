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
    
    // Turları say
    db.collection('tours').countDocuments({}, (err, count) => {
      if (err) {
        console.error('Hata:', err);
        process.exit(1);
      }
      console.log('\nToplam tur sayısı:', count);
      
      // İlk 10 turu göster
      if (count > 0) {
        db.collection('tours')
          .find({}, { name: 1, price: 1, _id: 0 })
          .limit(10)
          .toArray((err, tours) => {
            if (err) {
              console.error('Hata:', err);
              process.exit(1);
            }
            console.log('\nİlk 10 tur:');
            console.log('-----------');
            tours.forEach((tour, index) => {
              console.log(`${index + 1}. ${tour.name} - ${tour.price}₺`);
            });
            process.exit(0);
          });
      } else {
        console.log('Veritabanında hiç tur bulunamadı.');
        process.exit(0);
      }
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(1);
  });
