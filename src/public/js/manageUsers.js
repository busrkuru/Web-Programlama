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

// Kullanıcı düzenleme formunu oluştur
const createUserForm = (data) => {
  console.log('Kullanıcı formu oluşturuluyor, veriler:', data);
  
  return `
    <div class="admin-form-container">
      <div class="admin-form-overlay"></div>
      <div class="admin-form-content">
        <h3 class="heading-tertiary">Kullanıcı Düzenle</h3>
        <form class="admin-form">
          <input type="hidden" name="id" value="${data._id}">
          
          <div class="form__group">
            <label class="form__label" for="name">Ad Soyad</label>
            <input class="form__input" id="name" name="name" value="${data.name || ''}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="email">Email</label>
            <input class="form__input" id="email" name="email" type="email" value="${data.email || ''}" required>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="role">Rol</label>
            <select class="form__input" id="role" name="role" required>
              <option value="">Seçiniz</option>
              <option value="user" ${data.role === 'user' ? 'selected' : ''}>Kullanıcı</option>
              <option value="guide" ${data.role === 'guide' ? 'selected' : ''}>Rehber</option>
              <option value="lead-guide" ${data.role === 'lead-guide' ? 'selected' : ''}>Baş Rehber</option>
              <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          
          <div class="form__group">
            <label class="form__label" for="password">Şifre (Boş bırakırsanız değişmez)</label>
            <input class="form__input" id="password" name="password" type="password">
          </div>
          
          <div class="form__group">
            <label class="form__label" for="passwordConfirm">Şifre Tekrarı</label>
            <input class="form__input" id="passwordConfirm" name="passwordConfirm" type="password">
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

// Kullanıcı bilgilerini getir
const getUserData = async (userId) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/${userId}`
    });
    
    if (res.data.status === 'success') {
      return res.data.data.user;
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Kullanıcı bilgileri alınamadı');
    return null;
  }
};

// Form gönderimi
const submitForm = async (userId) => {
  try {
    const form = document.querySelector('.admin-form');
    const formData = {};
    
    // Form verilerini topla
    new FormData(form).forEach((value, key) => {
      // Boş şifre alanlarını formData'ya ekleme
      if ((key === 'password' || key === 'passwordConfirm') && value === '') {
        return;
      }
      formData[key] = value;
    });
    
    console.log('Form verileri:', formData);
    
    // Şifre kontrolü
    if (formData.password && formData.password !== formData.passwordConfirm) {
      showAlert('error', 'Şifreler eşleşmiyor!');
      return;
    }
    
    // İstek gönder
    console.log(`PATCH isteği gönderiliyor: /api/v1/users/${userId}`);
    console.log('Gönderilecek veriler:', formData);
    
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      data: formData
    });
    
    console.log('Sunucu yanıtı:', res.data);
    
    if (res.data.status === 'success') {
      showAlert('success', 'Kullanıcı başarıyla güncellendi!');
      
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

// Kullanıcı sil
const deleteUser = async (userId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${userId}`
    });
    
    showAlert('success', 'Kullanıcı başarıyla silindi!');
    
    // Kullanıcı satırını tablodan kaldır
    document.querySelector(`[data-user-id="${userId}"]`).closest('tr').remove();
    
    // Sayfayı yenile
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Kullanıcı silinemedi');
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  const userFormContainer = document.getElementById('user-form-container');
  
  // Düzenle butonlarına tıklama olayı ekle
  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const userId = this.dataset.userId;
      console.log('Düzenle butonuna tıklandı, userId:', userId);
      
      // Kullanıcı bilgilerini getir
      const userData = await getUserData(userId);
      
      if (userData) {
        // Kullanıcı düzenleme formunu oluştur
        userFormContainer.innerHTML = createUserForm(userData);
        
        // İptal butonuna tıklama olayı ekle
        document.querySelector('.btn--cancel').addEventListener('click', () => {
          document.querySelector('.admin-form-container').remove();
        });
        
        // Form gönderimi
        document.querySelector('.admin-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          await submitForm(userId);
        });
      }
    });
  });
  
  // Sil butonlarına tıklama olayı ekle
  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const userId = this.dataset.userId;
      console.log('Sil butonuna tıklandı, userId:', userId);
      
      if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        deleteUser(userId);
      }
    });
  });
});
