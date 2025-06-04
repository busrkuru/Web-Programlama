const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log('Hata Adı:', err.name);
  console.log('Hata Mesajı:', err.message);
  console.log('Hata Yığını:', err.stack);
  
  // Hatanın kaynağını bulmak için özel kontroller
  if (err.message && err.message.includes('imageCover')) {
    console.log('imageCover ile ilgili bir hata tespit edildi!');
    console.log('Hata muhtemelen bir tur verisi işlenirken oluştu.');
  }
  
  // Sunucuyu hemen kapatmak yerine 1 saniye bekle
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Config environment variables
dotenv.config({ path: './.env' });

// Import app
const app = require('./app');

// Connect to MongoDB
const DB = process.env.DATABASE || 'mongodb://127.0.0.1:27017/natours';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log('DB connection error:', err));

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log('Hata Adı:', err.name);
  console.log('Hata Mesajı:', err.message);
  console.log('Hata Yığını:', err.stack);
  
  // Hatanın kaynağını bulmak için özel kontroller
  if (err.message && err.message.includes('imageCover')) {
    console.log('imageCover ile ilgili bir hata tespit edildi!');
    console.log('Hata muhtemelen bir tur verisi işlenirken oluştu.');
  }
  
  // Sunucuyu nazikçe kapat
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM signal handler
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
