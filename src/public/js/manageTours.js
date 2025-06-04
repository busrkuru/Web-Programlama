/* eslint-disable */
// Uyarı mesajlarını göstermek için
const showAlert = (type, msg, time = 5) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};

// Uyarı mesajını gizlemek için
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// Sayfa yenileme fonksiyonu
const reloadPage = (delay = 1500) => {
  setTimeout(() => {
    location.reload();
  }, delay);
};

// Tur düzenleme formunu oluştur
const createTourForm = (data) => {
  console.log('Tur formu oluşturuluyor, veriler:', data);
  
  // Veri güvenliği için null/undefined kontrolü
  const safeData = data || {};
  
  // Tüm özellikleri güvenli bir şekilde al
  const tourId = safeData._id || '';
  const name = safeData.name || '';
  const duration = safeData.duration || '';
  const maxGroupSize = safeData.maxGroupSize || '';
  const difficulty = safeData.difficulty || '';
  const price = safeData.price || '';
  const summary = safeData.summary || '';
  const description = safeData.description || '';
  
  return `
    <div class="admin-form-container">
      <div class="admin-form-overlay"></div>
      <div class="admin-form-content">
        <h3 class="heading-tertiary">Tur Düzenle</h3>
        <form class="admin-form" id="tour-edit-form">
          <input type="hidden" name="tourId" value="${tourId}">
          
          <div class="form__group">
            <label class="form__label" for="name">Tur Adı</label>
            <input class="form__input" id="name" name="name" value="${name}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="duration">Süre (gün)</label>
            <input class="form__input" id="duration" name="duration" type="number" min="1" step="1" value="${duration}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="maxGroupSize">Maksimum Grup Boyutu</label>
            <input class="form__input" id="maxGroupSize" name="maxGroupSize" type="number" min="1" step="1" value="${maxGroupSize}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="difficulty">Zorluk</label>
            <select class="form__input" id="difficulty" name="difficulty" required>
              <option value="">Seçiniz</option>
              <option value="easy" ${difficulty === 'easy' ? 'selected' : ''}>Kolay</option>
              <option value="medium" ${difficulty === 'medium' ? 'selected' : ''}>Orta</option>
              <option value="difficult" ${difficulty === 'difficult' ? 'selected' : ''}>Zor</option>
            </select>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="price">Fiyat (₺)</label>
            <input class="form__input" id="price" name="price" type="number" min="0" step="1" value="${price}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="summary">Özet</label>
            <input class="form__input" id="summary" name="summary" value="${summary}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="description">Açıklama</label>
            <textarea class="form__input" id="description" name="description" rows="4" required>${description}</textarea>
          </div>
          
          <div class="form__group form__group--buttons">
            <button type="button" class="btn btn--small btn--cancel">İptal</button>
            <button type="submit" class="btn btn--small btn--green">Güncelle</button>
          </div>
        </form>
      </div>
    </div>
  `;
};

// Tur bilgilerini getir
const getTourData = async (tourId) => {
  try {
    console.log('Tur bilgileri getiriliyor, ID:', tourId);
    
    const res = await axios({
      method: 'GET',
      url: `/api/v1/tours/${tourId}`
    });
    
    if (res.data.status === 'success') {
      // Gelen tur verisini güvenli hale getir
      const tour = res.data.data.tour || {};
      
      // Eksik alanlar için varsayılan değerler ekle
      const safeTour = {
        _id: tour._id || '',
        name: tour.name || '',
        duration: tour.duration || '',
        maxGroupSize: tour.maxGroupSize || '',
        difficulty: tour.difficulty || '',
        price: tour.price || '',
        summary: tour.summary || '',
        description: tour.description || '',
        imageCover: tour.imageCover || 'default.jpg',
        images: tour.images || []
      };
      
      console.log('Tur bilgileri başarıyla alındı');
      return safeTour;
    }
    
    console.log('Tur bilgileri alınamadı: Başarısız yanıt');
    return {};
  } catch (err) {
    console.error('Tur bilgileri alınırken hata:', err);
    showAlert('error', err.response?.data?.message || 'Tur bilgileri alınamadı');
    return {};
  }
};

// Form gönderimi
const submitForm = async (form) => {
  try {
    // Form verilerini al
    const formData = {};
    const tourId = form.querySelector('input[name="tourId"]').value;
    
    // Form verilerini topla
    new FormData(form).forEach((value, key) => {
      // tourId alanını formData'ya ekleme
      if (key === 'tourId') return;
      
      // Sayısal değerleri number tipine dönüştür
      if (key === 'duration' || key === 'maxGroupSize' || key === 'price') {
        formData[key] = Number(value);
      } else {
        formData[key] = value;
      }
    });
    
    console.log('Form verileri:', formData);
    console.log(`PATCH isteği gönderiliyor: /api/v1/tours/${tourId}`);
    
    // Form gönderim butonunu devre dışı bırak ve yükleniyor göster
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Güncelleniyor...';
    
    // Axios isteğini gönder
    console.log('Gönderilecek veriler:', JSON.stringify(formData));
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}`,
      data: formData,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 saniye zaman aşımı
    });
    
    console.log('Sunucu yanıtı:', res.data);
    
    if (res.data.status === 'success') {
      showAlert('success', 'Tur başarıyla güncellendi!');
      
      // Formu kapat
      document.querySelector('.admin-form-container').remove();
      
      // Sayfayı yenile
      reloadPage(1500);
    }
  } catch (err) {
    console.error('Form gönderimi hatası:', err);
    
    // Hata durumuna göre mesaj göster
    if (err.response) {
      // Sunucu yanıtı ile dönen hata
      console.error('Hata detayları:', err.response.data);
      console.error('Hata durumu:', err.response.status);
      showAlert('error', `Hata: ${err.response.status} - ${err.response.data.message || 'Bilinmeyen hata'}`);
    } else if (err.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Yanıt alınamadı:', err.request);
      showAlert('error', 'Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.');
    } else {
      // İstek yapılırken hata oluştu
      console.error('İstek hatası:', err.message);
      showAlert('error', `İstek hatası: ${err.message}`);
    }
    
    // Butonu tekrar aktif hale getir
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Güncelle';
  }
};

// Tur sil
const deleteTour = async (tourId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`
    });
    
    showAlert('success', 'Tur başarıyla silindi!');
    
    // Tur satırını tablodan kaldır
    document.querySelector(`[data-tour-id="${tourId}"]`).closest('tr').remove();
    
    // Sayfayı yenile
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Tur silinemedi');
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  const tourFormContainer = document.getElementById('tour-form-container');
  
  // Düzenle butonlarına tıklama olayı ekle
  document.querySelectorAll('.edit-tour-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const tourId = this.dataset.tourId;
      console.log('Düzenle butonuna tıklandı, tourId:', tourId);
      
      try {
        // Varsa önceki formu kaldır
        const existingForm = document.querySelector('.admin-form-container');
        if (existingForm) existingForm.remove();
        
        // Tur bilgilerini getir
        const tourData = await getTourData(tourId);
        
        if (tourData) {
          // Tur düzenleme formunu oluştur
          tourFormContainer.innerHTML = createTourForm(tourData);
          
          // Form elementini al
          const form = document.getElementById('tour-edit-form');
          
          // İptal butonuna tıklama olayı ekle
          document.querySelector('.btn--cancel').addEventListener('click', () => {
            document.querySelector('.admin-form-container').remove();
          });
          
          // Form gönderimi
          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitForm(form);
          });
        }
      } catch (err) {
        console.error('Form oluşturma hatası:', err);
        showAlert('error', 'Form oluşturulurken bir hata oluştu');
      }
    });
  });
  
  // Sil butonlarına tıklama olayı ekle
  document.querySelectorAll('.delete-tour-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tourId = this.dataset.tourId;
      console.log('Sil butonuna tıklandı, tourId:', tourId);
      
      if (confirm('Bu turu silmek istediğinize emin misiniz?')) {
        deleteTour(tourId);
      }
    });
  });
});
