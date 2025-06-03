const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config({ path: './.env' });

// MongoDB bağlantısı
const DB = 'mongodb://127.0.0.1:27017/natours';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful!');

    // Tüm koleksiyonları temizle
    mongoose.connection.db.collection('users').deleteMany({}, (err, result) => {
      if (err) {
        console.error('Error deleting users:', err);
      } else {
        console.log('Users deleted:', result ? result.deletedCount : 0);
      }

      // Bookings koleksiyonunu temizle
      mongoose.connection.db.collection('bookings').deleteMany({}, (err, result) => {
        if (err) {
          console.error('Error deleting bookings:', err);
        } else {
          console.log('Bookings deleted:', result ? result.deletedCount : 0);
        }

        console.log('Database reset complete!');
        process.exit(0);
      });
    });
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
