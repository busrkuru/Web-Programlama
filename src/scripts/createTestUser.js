const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

// u00c7evre deu011fiu015fkenlerini yu00fckle
dotenv.config({ path: './.env' });

// MongoDB bau011flantu0131su0131
const DB = 'mongodb://127.0.0.1:27017/natours';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('DB connection successful!');
    
    try {
      // Veritabanu0131nu0131 temizle
      await User.deleteMany();
      console.log('Existing users deleted');
      
      // Test kullanu0131cu0131su0131 oluu015ftur
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'user'
      });
      
      console.log('Test user created:', testUser);
      console.log('\nLogin credentials:\nEmail: test@example.com\nPassword: password123');
      
      process.exit(0);
    } catch (err) {
      console.error('Error:', err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
