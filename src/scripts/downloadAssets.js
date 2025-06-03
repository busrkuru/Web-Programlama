const fs = require('fs');
const path = require('path');
const https = require('https');

// Klasörleri oluştur
const imgDir = path.join(__dirname, '../public/img');
const usersDir = path.join(imgDir, 'users');
const toursDir = path.join(imgDir, 'tours');

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });
if (!fs.existsSync(toursDir)) fs.mkdirSync(toursDir, { recursive: true });

// İndirilecek görseller
const assets = [
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/logo-green.png',
    dest: path.join(imgDir, 'logo-green.png')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/logo-white.png',
    dest: path.join(imgDir, 'logo-white.png')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/favicon.png',
    dest: path.join(imgDir, 'favicon.png')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/users/default.jpg',
    dest: path.join(usersDir, 'default.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-1-1.jpg',
    dest: path.join(toursDir, 'tour-1-1.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-1-2.jpg',
    dest: path.join(toursDir, 'tour-1-2.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-1-3.jpg',
    dest: path.join(toursDir, 'tour-1-3.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-2-1.jpg',
    dest: path.join(toursDir, 'tour-2-1.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-2-2.jpg',
    dest: path.join(toursDir, 'tour-2-2.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-2-3.jpg',
    dest: path.join(toursDir, 'tour-2-3.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-3-1.jpg',
    dest: path.join(toursDir, 'tour-3-1.jpg')
  },
  {
    url: 'https://raw.githubusercontent.com/jonasschmedtmann/natours/master/public/img/tours/tour-3-2.jpg',
    dest: path.join(toursDir, 'tour-3-2.jpg')
  }
];

// Görselleri indir
const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`İndirildi: ${dest}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      console.error(`İndirme hatası: ${url} - ${err.message}`);
      reject(err);
    });
  });
};

// Tüm görselleri indir
const downloadAllAssets = async () => {
  console.log('Görsel indirme işlemi başladı...');
  
  for (const asset of assets) {
    try {
      await downloadImage(asset.url, asset.dest);
    } catch (error) {
      console.error(`Hata: ${asset.url} - ${error.message}`);
    }
  }
  
  console.log('Görsel indirme işlemi tamamlandı!');
};

downloadAllAssets();
