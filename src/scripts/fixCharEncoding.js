const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');

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
      // Turlaru0131 al ve karakterleri du00fczelt
      const tours = await Tour.find();
      
      for (const tour of tours) {
        // Tu00fcrku00e7e karakterleri du00fczeltme iu015flemi
        tour.name = decodeURIComponent(escape(tour.name));
        tour.summary = decodeURIComponent(escape(tour.summary));
        tour.description = decodeURIComponent(escape(tour.description));
        
        if (tour.startLocation && tour.startLocation.description) {
          tour.startLocation.description = decodeURIComponent(escape(tour.startLocation.description));
        }
        
        if (tour.startLocation && tour.startLocation.address) {
          tour.startLocation.address = decodeURIComponent(escape(tour.startLocation.address));
        }
        
        if (tour.locations) {
          for (const location of tour.locations) {
            if (location.description) {
              location.description = decodeURIComponent(escape(location.description));
            }
            if (location.address) {
              location.address = decodeURIComponent(escape(location.address));
            }
          }
        }
        
        await tour.save({ validateBeforeSave: false });
        console.log(`Tur du00fczeltildi: ${tour.name}`);
      }
      
      console.log('Tu00fcm turlaru0131n karakter kodlamasu0131 du00fczeltildi!');
      process.exit(0);
    } catch (err) {
      console.error('Hata:', err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });
