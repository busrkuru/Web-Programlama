# Natours Tur Rezervasyon Sistemi

Natours, Node.js, Express, MongoDB, ve modern frontend teknolojileri kullanılarak geliştirilmiş kapsamlı bir tur rezervasyon sistemidir.

## Özellikler

- Kullanıcı yönetimi ve kimlik doğrulama (JWT ve çerezler)
- Rol tabanlı erişim kontrolü (admin, rehber, kullanıcı)
- Tur listeleme, filtreleme ve detay görüntüleme
- Rezervasyon sistemi
- Kullanıcı profili ve yorumlar
- Admin paneli
- Responsive ve modern UI

## Teknolojiler

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Kimlik Doğrulama
- Pug şablonları

### Frontend
- HTML/CSS
- JavaScript
- Mapbox entegrasyonu

### Güvenlik
- Şifre şifreleme (bcryptjs)
- XSS koruması
- Rate limiting
- Veri sanitizasyonu

## Kurulum

1. Depoyu klonlayın:
```
git clone <repo-url>
cd tour-reservation-system
```

2. Bağımlılıkları yükleyin:
```
npm install
```

3. `.env` dosyasını yapılandırın (örnek olarak `.env.example` dosyasını kullanabilirsiniz)

4. Uygulamayı başlatın:
```
npm start
```

## Geliştirme

Geliştirme modunda çalıştırmak için:
```
npm run dev
```

## Proje Yapısı

```
src/
  ├── app.js           # Express uygulaması
  ├── server.js        # HTTP sunucusu ve DB bağlantısı
  ├── controllers/     # Rota işleyicileri
  ├── models/          # Veritabanı modelleri
  ├── routes/          # API ve web rotaları
  ├── utils/           # Yardımcı fonksiyonlar
  ├── views/           # Pug şablonları
  └── public/          # Statik dosyalar (CSS, JS, resimler)
```

## API Dokümantasyonu

API endpoint'leri ve kullanımları hakkında bilgi için `/api-docs` adresini ziyaret edin (Swagger UI).

## Lisans

[MIT](LICENSE)
