const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

// Çevre değişkenlerini yükle
dotenv.config({ path: './.env' });

// MongoDB bağlantısı
const DB = process.env.DATABASE || 'mongodb://127.0.0.1:27017/natours';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
  })
  .then(() => console.log('DB connection successful!'));

// Admin kullanıcısı oluştur
const createAdminUser = async () => {
  try {
    // Önce mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ email: 'admin@natours.io' });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut!');
      process.exit();
    }
    
    // Admin kullanıcısı oluştur
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@natours.io',
      password: 'admin1234',
      passwordConfirm: 'admin1234',
      role: 'admin'
    });
    
    console.log('Admin kullanıcısı başarıyla oluşturuldu:', adminUser);
    
    // Lead Guide kullanıcısı oluştur
    const leadGuideUser = await User.create({
      name: 'Lead Guide',
      email: 'leadguide@natours.io',
      password: 'leadguide1234',
      passwordConfirm: 'leadguide1234',
      role: 'lead-guide'
    });
    
    console.log('Lead Guide kullanıcısı başarıyla oluşturuldu:', leadGuideUser);
    
  } catch (err) {
    console.log('HATA:', err);
  }
  process.exit();
};

createAdminUser();
