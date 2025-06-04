# Natours Tur Rezervasyon Sistemi

Natours, doğa tutkunları için eşsiz seyahat deneyimleri sunan, Node.js, Express, MongoDB, ve modern frontend teknolojileri kullanılarak geliştirilmiş kapsamlı bir tur rezervasyon sistemidir.

![Natours Logo](./src/public/img/logo-green.png)

## Özellikler

- Kullanıcı yönetimi ve kimlik doğrulama (JWT ve çerezler)
- Rol tabanlı erişim kontrolü (admin, rehber, kullanıcı)
- Tur listeleme, filtreleme ve detay görüntüleme
- Rezervasyon sistemi
- Kullanıcı profili yönetimi ve yorumlar
- Admin paneli ve tur yönetimi
- Hakkımızda ve İletişim sayfaları
- Sosyal medya entegrasyonu
- Responsive ve modern UI tasarımı
- Çift dil desteği (URL rotaları için Türkçe ve İngilizce)

## Teknolojiler

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Kimlik Doğrulama
- Pug şablonları
- RESTful API

### Frontend
- HTML/CSS
- JavaScript (ES6+)
- Mapbox entegrasyonu
- Font Awesome ikonlar
- Responsive Grid Layout

### Güvenlik
- Şifre şifreleme (bcryptjs)
- XSS koruması
- Rate limiting
- Veri sanitizasyonu
- CSRF koruması
- Cookie güvenliği

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
  │── app.js           # Express uygulaması
  │── server.js        # HTTP sunucusu ve DB bağlantısı
  │── controllers/     # Rota işleyicileri
  |     │── authController.js    # Kimlik doğrulama kontrolleri
  |     │── errorController.js   # Hata yönetimi
  |     │── handlerFactory.js    # İşleyici fabrikaları
  |     │── tourController.js    # Tur işlemleri
  |     │── userController.js    # Kullanıcı işlemleri
  |     └── viewController.js    # Görünüm işlemleri
  │── models/          # Veritabanı modelleri
  |     │── tourModel.js        # Tur modeli
  |     │── userModel.js        # Kullanıcı modeli
  |     └── reviewModel.js      # Yorum modeli
  │── routes/          # API ve web rotaları
  |     │── tourRoutes.js       # Tur rotaları
  |     │── userRoutes.js       # Kullanıcı rotaları
  |     └── viewRoutes.js       # Görünüm rotaları
  │── utils/           # Yardımcı fonksiyonlar
  │── views/           # Pug şablonları
  |     │── base.pug            # Ana şablon
  |     │── hakkimizda.pug       # Hakkımızda sayfası
  |     │── iletisim.pug        # İletişim sayfası
  |     │── overview-modern.pug  # Modern ana sayfa
  |     └── tour.pug            # Tur detay sayfası
  └── public/          # Statik dosyalar (CSS, JS, resimler)
      │── css/               # Stil dosyaları
      |     │── modern-style.css   # Ana stil
      |     └── about-contact.css  # Hakkımızda/İletişim stilleri
      │── js/                # JavaScript dosyaları
      └── img/               # Görseller
```

## Önemli Sayfalar

- Ana Sayfa: `/` veya `/modern`
- Hakkımızda: `/hakkimizda` veya `/about`
- İletişim: `/iletisim` veya `/contact`
- Tur Detayı: `/tours/:slug`
- Kullanıcı Girişi: `/login`
- Kayıt: `/signup`

## API Dokümantasyonu

API endpoint'leri ve kullanımları hakkında bilgi için `/api-docs` adresini ziyaret edin (Swagger UI).

## Tarayıcı Uyumluluğu

Uygulama aşağıdaki modern tarayıcılarda test edilmiştir:
- Chrome (son versiyon)
- Firefox (son versiyon)
- Safari (son versiyon)
- Edge (son versiyon)

## Kurulum Gereksinimleri

- Node.js (>= 12.x)
- MongoDB (>= 4.x)
- NPM (>= 6.x)

## Geliştirici

Büşra Kuru
- GitHub: [github.com/busrkuru](https://github.com/busrkuru)
- LinkedIn: [linkedin.com/in/büşra-kuru-070b40268](https://www.linkedin.com/in/büşra-kuru-070b40268/)
- E-posta: busrakuru60@gmail.com

## Lisans

[MIT](LICENSE)
