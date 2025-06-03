// Modern Filtreleme İşlevselliği

// Yıldız simgelerini oluşturan yardımcı fonksiyon
function getStarIcons(rating) {
  let starsHtml = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Dolu yıldızlar
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star"></i>';
  }
  
  // Yarım yıldız (varsa)
  if (hasHalfStar) {
    starsHtml += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Boş yıldızlar
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star"></i>';
  }
  
  return starsHtml;
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('modernFilter.js yüklendi');
  
  // DOM Elementleri
  const filterForm = document.querySelector('.filters__form');
  const filterTabs = document.querySelectorAll('.filters__tab');
  const destinationSelect = document.getElementById('destination');
  const dateInput = document.getElementById('date');
  const guestsInput = document.getElementById('guests');
  const priceRangeInput = document.getElementById('price-range');
  const priceDisplay = document.getElementById('price-display');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const tourContainer = document.querySelector('.tour-grid');
  const tourCountDisplay = document.querySelector('.tour-count');
  
  // Başlangıç değerleri
  let currentFilter = {
    category: 'all',
    destination: '',
    date: '',
    guests: '',
    price: priceRangeInput ? priceRangeInput.value : '5000',
    search: ''
  };
  
  // Fiyat gösterimini güncelle
  if (priceDisplay && priceRangeInput) {
    priceDisplay.textContent = `${parseInt(priceRangeInput.value).toLocaleString('tr-TR')} ₺`;
  }
  
  // Kategori sekmeleri için event listener'lar
  const categoryTabs = document.querySelectorAll('.filters__tab');
  if (categoryTabs.length > 0) {
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Tüm sekmelerden active sınıfını kaldır
        categoryTabs.forEach(t => t.classList.remove('active'));
        
        // Tıklanan sekmeye active sınıfını ekle
        this.classList.add('active');
        
        // Kategori değerini al
        const category = this.dataset.tab || 'all';
        console.log('Kategori değişti:', category);
        
        // Kategori filtresini güncelle
        currentFilter.category = category;
        
        // Filtreleri uygula
        applyFilters();
      });
    });
  }
  
  // Fiyat aralığı değiştiğinde
  if (priceRangeInput) {
    priceRangeInput.addEventListener('input', function() {
      // Fiyat görüntüsünü güncelle
      updatePriceDisplay();
      
      // Filtreleri güncelle
      currentFilter.price = this.value;
      
      // Otomatik filtreleme yapma, kullanıcının filtrele butonuna basmasını bekle
      console.log('Fiyat aralığı değişti:', this.value);
    });
    
    // Sayfa yüklendiğinde fiyat görüntüsünü güncelle
    updatePriceDisplay();
  }
  
  // Destinasyon değişikliği
  if (destinationSelect) {
    destinationSelect.addEventListener('change', () => {
      currentFilter.destination = destinationSelect.value;
    });
  }
  
  // Tarih değişikliği
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      currentFilter.date = dateInput.value;
    });
  }
  
  // Misafir sayısı değişikliği
  if (guestsInput) {
    guestsInput.addEventListener('change', () => {
      currentFilter.guests = guestsInput.value;
    });
  }
  
  // Arama butonu ve input alanı
  if (searchButton && searchInput) {
    // Arama butonuna tıklandığında
    searchButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Arama terimini al ve başındaki/sonundaki boşlukları temizle
      const searchTerm = searchInput.value.trim();
      console.log('Arama yapılıyor:', searchTerm);
      
      // Eğer arama terimi boşsa tüm turları getir
      currentFilter.search = searchTerm;
      
      // Filtreleri uygula
      applyFilters();
    });
    
    // Enter tuşu ile arama yapma
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchButton.click();
      }
    });
  }
  
  // Filtre formu gönderildiğinde
  if (filterForm) {
    filterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Form verilerini al
      const formData = new FormData(filterForm);
      
      // Aktif kategoriyi al (eğer yoksa varsayılan 'all')
      const activeTab = document.querySelector('.filters__tab.active');
      const activeCategory = activeTab ? activeTab.dataset.tab || 'all' : 'all';
      
      // Filtreleri güncelle
      currentFilter = {
        destination: formData.get('destination') || '',
        date: formData.get('date') || '',
        guests: formData.get('guests') || '',
        price: formData.get('price-range') || '',
        search: formData.get('search-input') || '',
        category: activeCategory
      };
      
      console.log('Filtreler güncellendi:', currentFilter);
      
      // Filtreleri uygula
      applyFilters();
    });
  }
  
  // Filtreleme seçeneklerini güncelle
  function updateFilters(filters) {
    if (!filters) return;
    
    // Fiyat aralığı güncellemeleri
    if (filters.priceRange) {
      if (priceRangeInput) {
        // Fiyat aralığı input'unun min ve max değerlerini güncelle
        priceRangeInput.min = filters.priceRange.min || 0;
        priceRangeInput.max = filters.priceRange.max || 10000;
        
        // Eğer mevcut değer yeni aralığın dışındaysa, maksimum değere ayarla
        if (priceRangeInput.value > priceRangeInput.max) {
          priceRangeInput.value = priceRangeInput.max;
        }
        
        // Fiyat görüntüsünü güncelle
        updatePriceDisplay();
      }
    }
    
    console.log('Filtre seçenekleri güncellendi:', filters);
  }
  
  // Filtreleri uygula ve API'den veri al
  async function applyFilters() {
    try {
      // Yükleme durumunu göster
      if (tourContainer) {
        tourContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
            <div class="spinner" style="width: 50px; height: 50px; margin: 0 auto 1rem; border: 5px solid #f3f3f3; border-top: 5px solid #ff7e36; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #777;">Turlar yükleniyor...</p>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>`;
      }
      
      // URL parametreleri oluştur
      const params = new URLSearchParams();
      
      // Kategori filtreleme
      if (currentFilter.category && currentFilter.category !== 'all' && currentFilter.category !== 'tüm turlar') {
        // Kategori eşleştirmeleri
        const categoryMappings = {
          'yurt içi': 'domestic',
          'yurt dışı': 'international',
          'kültür turları': 'culture',
          'doğa & macera': 'adventure'
        };
        
        const categoryValue = categoryMappings[currentFilter.category] || currentFilter.category;
        if (categoryValue) {
          params.append('category', categoryValue);
        }
      }
      
      // Diğer filtreler
      if (currentFilter.destination) params.append('destination', currentFilter.destination);
      if (currentFilter.date) params.append('date', currentFilter.date);
      if (currentFilter.guests) params.append('maxGroupSize[gte]', currentFilter.guests);
      if (currentFilter.price) params.append('price[lte]', currentFilter.price);
      if (currentFilter.search) params.append('search', currentFilter.search);
      
      // Sıralama parametresi ekle (varsayılan: popülerliğe göre)
      params.append('sort', '-ratingsAverage');
      
      // Limit parametresi ekle (sayfa başına gösterilecek tur sayısı)
      params.append('limit', '12');
      
      const apiUrl = `/api/v1/tours/modern-filter?${params.toString()}`;
      console.log('API çağrısı yapılıyor:', apiUrl);
      
      // API isteği gönder
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API yanıtı alındı:', data);
      
      // API yanıt formatına göre uyarlama yap
      if (data.status === 'success' && data.data) {
        renderTours(Array.isArray(data.data) ? data.data : (data.data.tours || []));
        
        // Filtre seçeneklerini güncelle (eğer yanıtta varsa)
        if (data.data.filters) {
          updateFilters(data.data.filters);
        }
      } else {
        console.error('Beklenmeyen API yanıt formatı:', data);
        renderTours([]); // Hata durumunda turları temizle
      }
    } catch (err) {
      console.error('Filtreleme hatası:', err);
      
      // Hata mesajını kullanıcıya göster
      if (tourContainer) {
        tourContainer.innerHTML = `
          <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #d32f2f;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Bir hata oluştu</h3>
            <p>${err.message || 'Turlar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.'}</p>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #ff7e36; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Sayfayı Yenile
            </button>
          </div>`;
      }
    } finally {
      // Yükleme durumunu temizle
      console.log('Filtreleme işlemi tamamlandı');
    }
  }
  
  // Turları render et
  function renderTours(tours) {
    console.log('Turlar render ediliyor:', tours);
    
    if (!tourContainer) {
      console.error('Tur konteynerı bulunamadı!');
      return;
    }
    
    // Turlar yoksa veya boşsa
    if (!tours || !Array.isArray(tours) || tours.length === 0) {
      tourContainer.innerHTML = `
        <div class="no-tours" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <i class="fas fa-search" style="font-size: 4rem; color: #e0e0e0; margin-bottom: 1.5rem; display: block;"></i>
          <h3 style="color: #555; font-size: 1.5rem; margin-bottom: 0.75rem;">Uygun tur bulunamadı</h3>
          <p style="color: #777; max-width: 500px; margin: 0 auto 1.5rem; line-height: 1.6;">
            Aradığınız kriterlere uygun tur bulunamadı. Lütfen farklı filtreler deneyin veya arama teriminizi değiştirin.
          </p>
          <button onclick="window.history.back()" style="background: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
            <i class="fas fa-arrow-left" style="margin-right: 0.5rem;"></i>Geri Dön
          </button>
        </div>`;
      
      if (tourCountDisplay) {
        tourCountDisplay.textContent = 'Sonuç bulunamadı';
      }
      
      return;
    }
    
    let html = '';
    
    // Tüm turları işle
    tours.forEach(tour => {
      try {
        // Tur verilerini kontrol et ve varsayılan değerleri ayarla
        const tourData = {
          name: tour.name || 'İsimsiz Tur',
          imageCover: tour.imageCover || 'default-tour.jpg',
          duration: tour.duration || 1,
          ratingsAverage: tour.ratingsAverage || 0,
          ratingsQuantity: tour.ratingsQuantity || 0,
          startLocation: tour.startLocation || { description: 'Belirtilmemiş' },
          maxGroupSize: tour.maxGroupSize || 10,
          price: tour.price || 0,
          slug: tour.slug || 'tur',
          summary: tour.summary || 'Açıklama bulunmuyor.'
        };
        
        // Turun popüler veya indirimli olup olmadığını kontrol et
        const isPopular = tourData.ratingsAverage >= 4.5;
        const isDiscounted = tourData.price < 3000; // Örnek bir indirim kontrolü
        
        // Resim URL'sini oluştur
        const imageUrl = `/img/tours/${tourData.imageCover}`;
        
        // Fiyatı formatla
        const formattedPrice = tourData.price.toLocaleString('tr-TR');
        
        // Tur kartı HTML'i oluştur
        html += `
          <div class="tour-card">
            ${isPopular || isDiscounted ? `
              <div class="tour-card__ribbon">
                <span>${isPopular ? 'Popüler' : 'İndirimli'}</span>
              </div>` : ''}
            <div class="tour-card__image">
              <img src="${imageUrl}" alt="${tourData.name}" onerror="this.onerror=null; this.src='/img/tours/default-tour.jpg';">
              <div class="tour-card__duration">
                <i class="fas fa-clock"></i>
                <span>${tourData.duration} Gün</span>
              </div>
            </div>
            <div class="tour-card__content">
              <div class="tour-card__rating">
                <div class="tour-card__stars">
                  ${getStarIcons(tourData.ratingsAverage)}
                </div>
                <span class="tour-card__reviews">${tourData.ratingsQuantity} değerlendirme</span>
              </div>
              <h3 class="tour-card__title">${tourData.name}</h3>
              <p class="tour-card__summary" style="color: #666; font-size: 0.9rem; margin: 0.5rem 0 1rem; line-height: 1.5; min-height: 2.7rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${tourData.summary}
              </p>
              <div class="tour-card__info">
                <div class="tour-card__location" title="${tourData.startLocation.description}">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${tourData.startLocation.description.length > 20 ? 
                    tourData.startLocation.description.substring(0, 20) + '...' : 
                    tourData.startLocation.description}</span>
                </div>
                <div class="tour-card__group">
                  <i class="fas fa-users"></i>
                  <span>Maks ${tourData.maxGroupSize} kişi</span>
                </div>
              </div>
              <div class="tour-card__footer">
                <div class="tour-card__price">
                  <span class="tour-card__price-value">${formattedPrice}₺</span>
                  <span class="tour-card__price-text">kişi başı</span>
                </div>
                <a href="/tours/${tourData.slug}" class="btn btn--small btn--orange">İncele</a>
              </div>
            </div>
          </div>
        `;
      } catch (error) {
        console.error('Tur render hatası:', error, tour);
      }
    });
    
    // Turları ekrana bas
    tourContainer.innerHTML = html;
    
    // Tur sayısını güncelle
    if (tourCountDisplay) {
      const totalText = tours.length === 1 ? '1 tur bulundu' : `${tours.length} tur bulundu`;
      tourCountDisplay.textContent = totalText;
    }
    
    console.log('Turlar başarıyla render edildi');
  }
  
  // Filtreleme seçeneklerini güncelle
  function updateFilters(filters) {
    if (!filters) return;
    
    // Destinasyon seçeneklerini güncelle
    if (destinationSelect && filters.locations) {
      // Mevcut seçeneği koru
      const currentValue = destinationSelect.value;
      
      // Seçenekleri temizle (ilk seçenek hariç)
      while (destinationSelect.options.length > 1) {
        destinationSelect.remove(1);
      }
      
      // Yeni seçenekleri ekle
      filters.locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.name;
        option.textContent = `${loc.name} (${loc.count})`;
        destinationSelect.appendChild(option);
      });
      
      // Seçimi geri yükle
      if (currentValue) {
        destinationSelect.value = currentValue;
      }
    }
    
    // Fiyat aralığını güncelle
    if (priceRangeInput && filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceRangeInput.min = filters.minPrice;
      priceRangeInput.max = filters.maxPrice;
      priceRangeInput.step = Math.ceil((filters.maxPrice - filters.minPrice) / 20);
    }
  }
  
  // Sayfa yüklendiğinde ilk turları getir
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Sayfa yüklendi, ilk turlar getiriliyor...');
    
    // Varsayılan filtrelerle başla
    currentFilter = {
      category: 'all',
      destination: '',
      date: '',
      guests: '',
      price: priceRangeInput ? priceRangeInput.value : '5000',
      search: ''
    };
    
    // URL'den gelen arama parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery) {
      // Eğer URL'de arama parametresi varsa, arama yap
      currentFilter.search = searchQuery;
      if (searchInput) {
        searchInput.value = searchQuery;
      }
    }
    
    // Turları getir
    applyFilters();
  });
  
  // Fiyat görüntüsünü güncelleme fonksiyonu
  function updatePriceDisplay() {
    if (priceDisplay && priceRangeInput) {
      priceDisplay.textContent = `${parseInt(priceRangeInput.value).toLocaleString('tr-TR')} ₺`;
    }
  }
  
  // Sayfa yüklendiğinde fiyat görüntüsünü güncelle
  if (priceRangeInput) {
    updatePriceDisplay();
  }
});
