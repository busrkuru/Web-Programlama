const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

// u00c7evre deu011fiu015fkenlerini yu00fckle
dotenv.config({ path: './.env' });

// MongoDB bau011flantu0131su0131
const DB = 'mongodb://127.0.0.1:27017/natours';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.log('DB connection error:', err));

// u00d6rnek tur verileri
const tours = [
  {
    name: 'Kapadokya Balon Turu',
    duration: 3,
    maxGroupSize: 12,
    difficulty: 'easy',
    ratingsAverage: 4.7,
    ratingsQuantity: 37,
    price: 3997,
    summary: 'Kapadokya\'nu0131n eu015fsiz peri bacalaru0131 arasu0131nda unutulmaz bir balon deneyimi',
    description: 'Kapadokya\'nu0131n masalsu0131 manzarasu0131nu0131 kuu015fbaku0131u015fu0131 izleme fu0131rsatu0131 yakalayacau011fu0131nu0131z bu turda, gu00fcndou011fumunun ilk u0131u015fu0131klaru0131yla havalanacak ve peri bacalaru0131, vadiler ve tarihi yerleu015fimlerin u00fczerinde su00fczu00fclerek eu015fsiz manzaranu0131n keyfini u00e7u0131karacaksu0131nu0131z. Tur sonunda verilen bau015faru0131 sertifikasu0131 ve u015fampanya ile anu0131laru0131nu0131zu0131 tazeleyin.',
    imageCover: 'tour-1-1.jpg',
    images: ['tour-1-2.jpg', 'tour-1-3.jpg'],
    startDates: [
      '2025-07-15T09:00:00.000Z',
      '2025-08-20T09:00:00.000Z',
      '2025-09-05T09:00:00.000Z'
    ],
    secretTour: false,
    startLocation: {
      type: 'Point',
      coordinates: [34.8672, 38.6431],
      address: 'Nevu015fehir, Tu00fcrkiye',
      description: 'Kapadokya Bu00f6lgesi'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [34.8672, 38.6431],
        address: 'Gu00f6reme, Nevu015fehir',
        description: 'Balon kalku0131u015f noktasu0131',
        day: 1
      },
      {
        type: 'Point',
        coordinates: [34.8428, 38.6559],
        address: 'u00c7avusin, Nevu015fehir',
        description: 'Ku0131rmu0131zu0131 Vadi u00fczerinde uu00e7uu015f',
        day: 1
      },
      {
        type: 'Point',
        coordinates: [34.8125, 38.6371],
        address: 'Geru00e7in Ku00f6yu00fc, Nevu015fehir',
        description: 'Balon iniu015f noktasu0131',
        day: 1
      }
    ],
    guides: ['5c8a22c62f8fb814b56fa18b', '5c8a1f4e2f8fb814b56fa185']
  },
  {
    name: 'Efes ve u015eirince Turu',
    duration: 5,
    maxGroupSize: 15,
    difficulty: 'medium',
    ratingsAverage: 4.9,
    ratingsQuantity: 28,
    price: 4997,
    summary: 'Antik du00fcnyanu0131n en bu00fcyu00fck kentlerinden Efes\'i ve u015firince\'nin otantik atmosferini keu015ffedin',
    description: 'Roma du00f6neminin en bu00fcyu00fck u015fehirlerinden biri olan Efes Antik Kenti\'nde, Celsus Ku00fctu00fcphanesi, Bu00fcyu00fck Tiyatro, Hadrian Tapu0131nau011fu0131 gibi etkileyici yapu0131laru0131 gu00f6recek ve 2000 yu0131llu0131k tarihte bir yolculuu011fa u00e7u0131kacaksu0131nu0131z. Ardu0131ndan, u00fczüm bau011flaru0131yla u00e7evrili u015eirince Ku00f6yu00fc\'nde yerel lezzetleri tadacak, el yapu0131mu0131 u00fcru00fcnleri inceleyecek ve otantik Tu00fcrk ku00f6y yau015famu0131nu0131 deneyimleyeceksiniz.',
    imageCover: 'tour-2-1.jpg',
    images: ['tour-2-2.jpg', 'tour-2-3.jpg'],
    startDates: [
      '2025-06-19T09:00:00.000Z',
      '2025-07-17T09:00:00.000Z',
      '2025-08-12T09:00:00.000Z'
    ],
    secretTour: false,
    startLocation: {
      type: 'Point',
      coordinates: [27.3412, 37.9401],
      address: 'Selu00e7uk, u0130zmir',
      description: 'Efes Antik Kenti Giriu015fi'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [27.3412, 37.9401],
        address: 'Efes Antik Kenti, Selu00e7uk',
        description: 'Efes Antik Kenti Giriu015fi',
        day: 1
      },
      {
        type: 'Point',
        coordinates: [27.3395, 37.9450],
        address: 'Celsus Ku00fctu00fcphanesi, Efes',
        description: 'Roma du00f6neminin en etkileyici yapu0131laru0131ndan biri',
        day: 1
      },
      {
        type: 'Point',
        coordinates: [27.5671, 37.9437],
        address: 'u015eirince Ku00f6yu00fc, Selu00e7uk',
        description: 'Tarihi Rum ku00f6yu00fc',
        day: 2
      }
    ],
    guides: ['5c8a22c62f8fb814b56fa18b', '5c8a201e2f8fb814b56fa186']
  },
  {
    name: 'Safranbolu Ku00fcltu00fcr Turu',
    duration: 4,
    maxGroupSize: 10,
    difficulty: 'easy',
    ratingsAverage: 4.6,
    ratingsQuantity: 19,
    price: 3497,
    summary: 'UNESCO Du00fcnya Mirasu0131 Listesi\'ndeki Safranbolu\'nun tarihi sokaklaru0131nda yolculuk',
    description: 'Osmanlu0131 mimarisinin en gu00fczel u00f6rneklerini baru0131ndu0131ran Safranbolu\'da, yu00fczlerce yu0131llu0131k tarihi konaklaru0131, u00e7aru015fu0131laru0131 ve geleneksel zanaat atölyelerini keu015ffedeceksiniz. 18. ve 19. yu00fczyu0131ldan kalma ahşap evlerin aralaru0131ndan geu00e7en dar sokaklaru0131nda yu00fcru00fcyecek, yerel lezzetleri tadacak ve geleneksel Tu00fcrk yau015fam tarzu0131nu0131 deneyimleyeceksiniz.',
    imageCover: 'tour-3-1.jpg',
    images: ['tour-3-2.jpg', 'tour-3-1.jpg'],
    startDates: [
      '2025-07-01T09:00:00.000Z',
      '2025-08-10T09:00:00.000Z',
      '2025-09-15T09:00:00.000Z'
    ],
    secretTour: false,
    startLocation: {
      type: 'Point',
      coordinates: [32.6946, 41.2453],
      address: 'Safranbolu, Karabu00fck',
      description: 'Safranbolu u00c7aru015fu0131'
    },
    locations: [
      {
        type: 'Point',
        coordinates: [32.6946, 41.2453],
        address: 'Safranbolu u00c7aru015fu0131, Karabu00fck',
        description: 'Tarihi u00e7aru015fu0131 bu00f6lgesi',
        day: 1
      },
      {
        type: 'Point',
        coordinates: [32.6908, 41.2481],
        address: 'Kaymakamlar Evi, Safranbolu',
        description: 'Tarihi Osmanlu0131 konau011fu0131',
        day: 2
      },
      {
        type: 'Point',
        coordinates: [32.7085, 41.2550],
        address: 'Yu00f6ru00fck Ku00f6yu00fc, Safranbolu',
        description: 'Geleneksel Tu00fcrk ku00f6yu00fc',
        day: 3
      }
    ],
    guides: ['5c8a1f4e2f8fb814b56fa185', '5c8a201e2f8fb814b56fa186']
  }
];

// u00d6rnek rehber kullanu0131cu0131laru0131 oluu015ftur
const guides = [
  {
    _id: new mongoose.Types.ObjectId('5c8a1f4e2f8fb814b56fa185'),
    name: 'Ahmet Yu0131lmaz',
    email: 'ahmet@example.com',
    role: 'guide',
    password: 'guide12345',
    passwordConfirm: 'guide12345',
    photo: 'default.jpg'
  },
  {
    _id: new mongoose.Types.ObjectId('5c8a201e2f8fb814b56fa186'),
    name: 'Aslu0131 Demir',
    email: 'asli@example.com',
    role: 'guide',
    password: 'guide12345',
    passwordConfirm: 'guide12345',
    photo: 'default.jpg'
  },
  {
    _id: new mongoose.Types.ObjectId('5c8a22c62f8fb814b56fa18b'),
    name: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    role: 'lead-guide',
    password: 'guide12345',
    passwordConfirm: 'guide12345',
    photo: 'default.jpg'
  }
];

// u00d6rnek yorumlar
const reviews = [
  {
    review: 'Hayatu0131mda yau015fadu0131u011fu0131m en gu00fczel deneyimlerden biriydi. Kapadokya\'nu0131n u00fczerinde balon ile uu00e7mak inanu0131lmaz!',
    rating: 5,
    user: new mongoose.Types.ObjectId('683d74e9ca57870c96064815'), // Test kullanu0131cu0131su0131
    tour: null // daha sonra doldurulacak
  },
  {
    review: 'Efes Antik Kenti gezisi mu00fckemmeldi. Rehberimiz u00e7ok bilgiliydi ve tarihi detaylaru0131 anlau015fu0131lu0131r u015fekilde anlattu0131.',
    rating: 4,
    user: new mongoose.Types.ObjectId('683d74e9ca57870c96064815'), // Test kullanu0131cu0131su0131
    tour: null // daha sonra doldurulacak
  },
  {
    review: 'Safranbolu\'nun tarihi atmosferi insana geu00e7miu015fe yolculuk yaptu0131ru0131yor. Konaklama ve yemekler harikaydu0131.',
    rating: 5,
    user: new mongoose.Types.ObjectId('683d74e9ca57870c96064815'), // Test kullanu0131cu0131su0131
    tour: null // daha sonra doldurulacak
  }
];

// Veritabanu0131nu0131 temizle ve u00f6rnek verileri yu00fckle
const importData = async () => {
  try {
    // Mevcut verileri temizle
    await Tour.deleteMany();
    await User.deleteMany({ role: { $in: ['guide', 'lead-guide'] } }); // Sadece rehberleri sil
    await Review.deleteMany();
    
    console.log('Mevcut veriler temizlendi');
    
    // u00d6nce rehberleri oluu015ftur
    const createdGuides = await User.create(guides);
    console.log(`${createdGuides.length} rehber kullanu0131cu0131 oluu015fturuldu`);
    
    // Turlaru0131 oluu015ftur
    const createdTours = await Tour.create(tours);
    console.log(`${createdTours.length} tur oluu015fturuldu`);
    
    // Yorumlaru0131 oluu015ftur (her tura bir yorum)
    for (let i = 0; i < reviews.length; i++) {
      reviews[i].tour = createdTours[i]._id;
    }
    
    const createdReviews = await Review.create(reviews);
    console.log(`${createdReviews.length} yorum oluu015fturuldu`);
    
    console.log('Veri yu00fckleme iu015flemi bau015faru0131yla tamamlandu0131!');
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
};

importData();
