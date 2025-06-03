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

// Tüm turları listele
const listTours = async () => {
  try {
    const tours = await Tour.find().select('name price -_id');
    console.log('\nMevcut Turlar:');
    console.log('--------------');
    tours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name} - ${tour.price}₺`);
    });
    console.log('\nToplam tur sayısı:', tours.length);
    process.exit();
  } catch (err) {
    console.error('Hata oluştu:', err);
    process.exit(1);
  }
};

// Doğrudan fonksiyonu çağır
listTours();
