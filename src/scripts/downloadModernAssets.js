const fs = require('fs');
const path = require('path');
const axios = require('axios');

const downloadFile = async (url, filePath) => {
  try {
    // Klasörün var olduğundan emin olalım
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Dosya zaten varsa, tekrar indirme
    if (fs.existsSync(filePath)) {
      console.log(`Dosya zaten mevcut: ${filePath}`);
      return;
    }

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`İndirildi: ${filePath}`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (err) {
    console.error(`İndirilemedi: ${url}`, err.message);
  }
};

const downloadModernAssets = async () => {
  const baseDir = path.join(__dirname, '../public');

  try {
    // Hero görselini indirme - Tour 7'yi kullanabiliriz
    await downloadFile(
      'https://raw.githubusercontent.com/jonasschmedtmann/complete-node-bootcamp/master/4-natours/dev-data/img/tours/tour-7-cover.jpg',
      path.join(baseDir, 'img/hero.jpg')
    );

    // Promosyon klasörünü oluştur
    const promotionsDir = path.join(baseDir, 'img/promotions');
    if (!fs.existsSync(promotionsDir)) {
      fs.mkdirSync(promotionsDir, { recursive: true });
    }

    // Promosyon görselleri için mevcut tour görselleri kullan
    await downloadFile(
      'https://raw.githubusercontent.com/jonasschmedtmann/complete-node-bootcamp/master/4-natours/dev-data/img/tours/tour-5-cover.jpg',
      path.join(baseDir, 'img/promotions/early-booking.jpg')
    );

    await downloadFile(
      'https://raw.githubusercontent.com/jonasschmedtmann/complete-node-bootcamp/master/4-natours/dev-data/img/tours/tour-6-cover.jpg',
      path.join(baseDir, 'img/promotions/holiday-special.jpg')
    );

    // Kullanıcı avatarlarını indirme
    await downloadFile(
      'https://raw.githubusercontent.com/jonasschmedtmann/complete-node-bootcamp/master/4-natours/dev-data/img/users/default.jpg',
      path.join(baseDir, 'img/users/default.jpg')
    );

    console.log('Tüm modern arayüz görselleri başarıyla indirildi!');
  } catch (err) {
    console.error('Görselleri indirirken hata:', err);
  }
};

downloadModernAssets();
