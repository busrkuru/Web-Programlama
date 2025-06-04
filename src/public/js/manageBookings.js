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

// Rezervasyon detay formunu oluştur
const createBookingForm = (data) => {
  console.log('Rezervasyon formu oluşturuluyor, veriler:', data);
  
  return `
    <div class="admin-form-container">
      <div class="admin-form-overlay"></div>
      <div class="admin-form-content">
        <h3 class="heading-tertiary">Rezervasyon Detayları</h3>
        <div class="booking-details">
          <div class="booking-details__item">
            <span class="booking-details__label">Tur:</span>
            <span class="booking-details__value">${data.tour ? data.tour.name : 'Tur silinmiş'}</span>
          </div>
          <div class="booking-details__item">
            <span class="booking-details__label">Kullanıcı:</span>
            <span class="booking-details__value">${data.user ? data.user.name : 'Kullanıcı silinmiş'}</span>
          </div>
          <div class="booking-details__item">
            <span class="booking-details__label">Fiyat:</span>
            <span class="booking-details__value">${data.price} ₺</span>
          </div>
          <div class="booking-details__item">
            <span class="booking-details__label">Tarih:</span>
            <span class="booking-details__value">${new Date(data.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div class="booking-details__item">
            <span class="booking-details__label">Durum:</span>
            <span class="booking-details__value ${data.paid ? 'text-success' : 'text-warning'}">${data.paid ? 'Tamamlandı' : 'Bekliyor'}</span>
          </div>
          
          <form class="admin-form">
            <input type="hidden" name="id" value="${data._id}">
            
            <div class="form__group">
              <label class="form__label" for="paid">Ödeme Durumu</label>
              <select class="form__input" id="paid" name="paid">
                <option value="true" ${data.paid ? 'selected' : ''}>Tamamlandı</option>
                <option value="false" ${!data.paid ? 'selected' : ''}>Bekliyor</option>
              </select>
            </div>
            
            <div class="form__group form__group--buttons">
              <button type="button" class="btn btn--small btn--cancel">Kapat</button>
              <button type="submit" class="btn btn--small btn--green">Güncelle</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
};

// Rezervasyon bilgilerini getir
const getBookingData = async (bookingId) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/bookings/${bookingId}`
    });
    
    if (res.data.status === 'success') {
      return res.data.data.booking;
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Rezervasyon bilgileri alınamadı');
    return null;
  }
};

// Form gönderimi
const submitForm = async (bookingId) => {
  try {
    const form = document.querySelector('.admin-form');
    const formData = {};
    
    // Form verilerini topla
    new FormData(form).forEach((value, key) => {
      // Boolean değerleri doğru formata çevir
      if (value === 'true') formData[key] = true;
      else if (value === 'false') formData[key] = false;
      else formData[key] = value;
    });
    
    console.log('Form verileri:', formData);
    
    // İstek gönder
    console.log(`PATCH isteği gönderiliyor: /api/v1/bookings/${bookingId}`);
    console.log('Gönderilecek veriler:', formData);
    
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/bookings/${bookingId}`,
      data: formData
    });
    
    console.log('Sunucu yanıtı:', res.data);
    
    if (res.data.status === 'success') {
      showAlert('success', 'Rezervasyon başarıyla güncellendi!');
      
      // Formu kapat
      document.querySelector('.admin-form-container').remove();
      
      // Sayfayı yenile
      setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    console.error('Form gönderimi hatası:', err);
    showAlert('error', err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

// Rezervasyon iptal et
const deleteBooking = async (bookingId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`
    });
    
    showAlert('success', 'Rezervasyon başarıyla iptal edildi!');
    
    // Rezervasyon satırını tablodan kaldır
    document.querySelector(`[data-booking-id="${bookingId}"]`).closest('tr').remove();
    
    // Sayfayı yenile
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Rezervasyon iptal edilemedi');
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  const bookingFormContainer = document.getElementById('booking-form-container');
  
  // Detaylar butonlarına tıklama olayı ekle
  document.querySelectorAll('.edit-booking-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const bookingId = this.dataset.bookingId;
      console.log('Detaylar butonuna tıklandı, bookingId:', bookingId);
      
      // Rezervasyon bilgilerini getir
      const bookingData = await getBookingData(bookingId);
      
      if (bookingData) {
        // Rezervasyon detay formunu oluştur
        bookingFormContainer.innerHTML = createBookingForm(bookingData);
        
        // İptal butonuna tıklama olayı ekle
        document.querySelector('.btn--cancel').addEventListener('click', () => {
          document.querySelector('.admin-form-container').remove();
        });
        
        // Form gönderimi
        document.querySelector('.admin-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          await submitForm(bookingId);
        });
      }
    });
  });
  
  // İptal Et butonlarına tıklama olayı ekle
  document.querySelectorAll('.delete-booking-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = this.dataset.bookingId;
      console.log('İptal Et butonuna tıklandı, bookingId:', bookingId);
      
      if (confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
        deleteBooking(bookingId);
      }
    });
  });
});
