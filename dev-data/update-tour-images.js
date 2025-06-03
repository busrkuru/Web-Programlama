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
    
    // Güncellenecek turlar ve görselleri
    const toursToUpdate = [
      {
        name: 'Pamukkale Traverten Turu',
        imageCover: 'tour-4-cover.jpg',
        images: ['tour-4-1.jpg', 'tour-4-2.jpg', 'tour-4-3.jpg']
      },
      {
        name: 'Nemrut Dağı Gün Doğumu Turu',
        imageCover: 'tour-5-cover.jpg',
        images: ['tour-5-1.jpg', 'tour-5-2.jpg', 'tour-5-3.jpg']
      },
      {
        name: 'Mardin Taş Evler ve Tarih Turu',
        imageCover: 'tour-6-cover.jpg',
        images: ['tour-6-1.jpg', 'tour-6-2.jpg', 'tour-6-3.jpg']
      }
    ];
    
    // Görselleri güncelle
    const updatePromises = toursToUpdate.map(tour => {
      return db.collection('tours').updateOne(
        { name: tour.name },
        { 
          $set: { 
            imageCover: tour.imageCover,
            images: tour.images
          } 
        }
      );
    });
    
    Promise.all(updatePromises)
      .then(results => {
        const updatedCount = results.filter(r => r.modifiedCount > 0).length;
        console.log(`\n✅ ${updatedCount} turun görselleri güncellendi.`);
        
        // Güncellenen turları göster
        toursToUpdate.forEach(tour => {
          console.log(`- ${tour.name}: ${tour.imageCover} ve ${tour.images.length} detay görsel`);
        });
        
        process.exit(0);
      })
      .catch(err => {
        console.error('Güncelleme sırasında hata:', err);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err);
    process.exit(1);
  });
