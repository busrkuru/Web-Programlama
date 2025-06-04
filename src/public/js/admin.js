/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Tablo yönetimi
const setupTabs = () => {
  const navItems = [
    document.getElementById('tours-nav-item'),
    document.getElementById('users-nav-item'),
    document.getElementById('reviews-nav-item'),
    document.getElementById('bookings-nav-item')
  ];
  
  const sections = [
    document.getElementById('tours-section'),
    document.getElementById('users-section'),
    document.getElementById('reviews-section'),
    document.getElementById('bookings-section')
  ];
  
  navItems.forEach((item, index) => {
    item.addEventListener('click', e => {
      e.preventDefault();
      
      // Aktif nav öğesini güncelle
      navItems.forEach(i => i.classList.remove('side-nav--active'));
      item.classList.add('side-nav--active');
      
      // Aktif bölümü güncelle
      sections.forEach(s => s.classList.add('hidden'));
      sections[index].classList.remove('hidden');
      
      // İlgili verileri yükle
      loadSectionData(index);
    });
  });
};

// Her bölüm için veri yükleme
const loadSectionData = async (sectionIndex) => {
  try {
    let url;
    let processFunction;
    
    switch (sectionIndex) {
      case 0: // Turlar
        url = '/api/v1/tours';
        processFunction = processTours;
        break;
      case 1: // Kullanıcılar
        url = '/api/v1/users';
        processFunction = processUsers;
        break;
      case 2: // Yorumlar
        url = '/api/v1/reviews';
        processFunction = processReviews;
        break;
      case 3: // Rezervasyonlar
        url = '/api/v1/bookings';
        processFunction = processBookings;
        break;
    }
    
    const res = await axios.get(url);
    
    if (res.data.status === 'success') {
      processFunction(res.data.data);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Turları işle
const processTours = (data) => {
  const tableBody = document.getElementById('tours-table-body');
  tableBody.innerHTML = '';
  
  data.tours.forEach(tour => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${tour._id}</td>
      <td>${tour.name}</td>
      <td>${tour.price} ₺</td>
      <td>${tour.difficulty}</td>
      <td>${tour.ratingsAverage}</td>
      <td>
        <button class="btn btn--small btn--edit" data-id="${tour._id}">Düzenle</button>
        <button class="btn btn--small btn--delete" data-id="${tour._id}">Sil</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Düzenle ve sil butonları için event listener'lar
  setupActionButtons('tours');
};

// Kullanıcıları işle
const processUsers = (data) => {
  const tableBody = document.getElementById('users-table-body');
  tableBody.innerHTML = '';
  
  data.users.forEach(user => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${user._id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button class="btn btn--small btn--edit" data-id="${user._id}">Düzenle</button>
        <button class="btn btn--small btn--delete" data-id="${user._id}">Sil</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Düzenle ve sil butonları için event listener'lar
  setupActionButtons('users');
};

// Yorumları işle
const processReviews = (data) => {
  const tableBody = document.getElementById('reviews-table-body');
  tableBody.innerHTML = '';
  
  data.reviews.forEach(review => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${review._id}</td>
      <td>${review.tour.name}</td>
      <td>${review.user.name}</td>
      <td>${review.rating}</td>
      <td>${review.review.substring(0, 50)}${review.review.length > 50 ? '...' : ''}</td>
      <td>
        <button class="btn btn--small btn--edit" data-id="${review._id}">Düzenle</button>
        <button class="btn btn--small btn--delete" data-id="${review._id}">Sil</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Düzenle ve sil butonları için event listener'lar
  setupActionButtons('reviews');
};

// Rezervasyonları işle
const processBookings = (data) => {
  const tableBody = document.getElementById('bookings-table-body');
  tableBody.innerHTML = '';
  
  data.bookings.forEach(booking => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${booking._id}</td>
      <td>${booking.tour.name}</td>
      <td>${booking.user.name}</td>
      <td>${booking.participants}</td>
      <td>${new Date(booking.startDate).toLocaleDateString('tr-TR')}</td>
      <td>${booking.price} ₺</td>
      <td>
        <button class="btn btn--small btn--edit" data-id="${booking._id}">Düzenle</button>
        <button class="btn btn--small btn--delete" data-id="${booking._id}">Sil</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Düzenle ve sil butonları için event listener'lar
  setupActionButtons('bookings');
};

// Düzenle ve sil butonları için işlevleri ayarla
const setupActionButtons = (type) => {
  // Düzenle butonları
  document.querySelectorAll(`.btn--edit[data-id]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      editItem(type, id);
    });
  });
  
  // Sil butonları
  document.querySelectorAll(`.btn--delete[data-id]`).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      deleteItem(type, id);
    });
  });
  
  // Yeni öğe ekleme butonları
  const addTourBtn = document.getElementById('add-tour-btn');
  const addUserBtn = document.getElementById('add-user-btn');
  
  if (addTourBtn) {
    addTourBtn.addEventListener('click', () => showForm('tour'));
  }
  
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => showForm('user'));
  }
};

// Düzenleme işlevi
const editItem = async (type, id) => {
  try {
    // İlgili öğeyi getir
    const res = await axios.get(`/api/v1/${type}/${id}`);
    
    if (res.data.status === 'success') {
      // Form göster ve verilerle doldur
      showForm(type.slice(0, -1), res.data.data);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Silme işlevi
const deleteItem = async (type, id) => {
  if (confirm(`Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
    try {
      await axios.delete(`/api/v1/${type}/${id}`);
      
      // Başarılı mesajı göster ve tabloyu yenile
      showAlert('success', 'Öğe başarıyla silindi');
      
      // Aktif sekmeyi yeniden yükle
      const activeIndex = Array.from(document.querySelectorAll('.side-nav li')).findIndex(el => el.classList.contains('side-nav--active'));
      loadSectionData(activeIndex);
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
};

// Form göster
const showForm = (type, data = null) => {
  // Mevcut form varsa kaldır
  const existingForm = document.querySelector('.admin-form-container');
  if (existingForm) {
    existingForm.remove();
  }
  
  // Form için HTML oluştur
  let formHTML = '';
  
  switch (type) {
    case 'tour':
      formHTML = createTourForm(data);
      break;
    case 'user':
      formHTML = createUserForm(data);
      break;
    // Diğer formlar buraya eklenebilir
  }
  
  // Form container'ı oluştur
  const formContainer = document.createElement('div');
  formContainer.className = 'admin-form-container';
  formContainer.innerHTML = formHTML;
  
  // Sayfaya ekle
  document.querySelector('.admin-view__content').appendChild(formContainer);
  
  // Form gönderimi için event listener
  const form = document.querySelector('.admin-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitForm(type, data?._id);
  });
  
  // İptal butonu için event listener
  const cancelBtn = document.querySelector('.btn--cancel');
  cancelBtn.addEventListener('click', () => {
    formContainer.remove();
  });
};

// Tur formu oluştur
const createTourForm = (data) => {
  return `
    <div class="admin-form-overlay"></div>
    <div class="admin-form-content">
      <h3 class="heading-tertiary">${data ? 'Tur Düzenle' : 'Yeni Tur Ekle'}</h3>
      <form class="admin-form">
        <div class="form__group">
          <label class="form__label" for="name">Tur Adı</label>
          <input class="form__input" id="name" name="name" value="${data?.name || ''}" required>
        </div>
        <div class="form__group">
          <label class="form__label" for="duration">Süre (gün)</label>
          <input class="form__input" id="duration" name="duration" type="number" value="${data?.duration || ''}" required>
        </div>
        <div class="form__group">
          <label class="form__label" for="maxGroupSize">Maksimum Grup</label>
          <input class="form__input" id="maxGroupSize" name="maxGroupSize" type="number" value="${data?.maxGroupSize || ''}" required>
        </div>
        <div class="form__group">
          <label class="form__label" for="difficulty">Zorluk</label>
          <select class="form__input" id="difficulty" name="difficulty" required>
            <option value="">Seçiniz</option>
            <option value="easy" ${data?.difficulty === 'easy' ? 'selected' : ''}>Kolay</option>
            <option value="medium" ${data?.difficulty === 'medium' ? 'selected' : ''}>Orta</option>
            <option value="difficult" ${data?.difficulty === 'difficult' ? 'selected' : ''}>Zor</option>
          </select>
        </div>
        <div class="form__group">
          <label class="form__label" for="price">Fiyat</label>
          <input class="form__input" id="price" name="price" type="number" value="${data?.price || ''}" required>
        </div>
        <div class="form__group">
          <label class="form__label" for="summary">Özet</label>
          <textarea class="form__input" id="summary" name="summary" required>${data?.summary || ''}</textarea>
        </div>
        <div class="form__group">
          <label class="form__label" for="description">Açıklama</label>
          <textarea class="form__input" id="description" name="description" rows="5" required>${data?.description || ''}</textarea>
        </div>
        <div class="form__group form__group--buttons">
          <button type="button" class="btn btn--small btn--cancel">İptal</button>
          <button type="submit" class="btn btn--small btn--green">${data ? 'Güncelle' : 'Ekle'}</button>
        </div>
      </form>
    </div>
  `;
};

// Kullanıcı formu oluştur
const createUserForm = (data) => {
  console.log('Kullanıcı formu oluşturuluyor, veriler:', data);
  
  return `
    <div class="admin-form-overlay"></div>
    <div class="admin-form-content">
      <h3 class="heading-tertiary">${data ? 'Kullan\u0131c\u0131 D\u00fczenle' : 'Yeni Kullan\u0131c\u0131 Ekle'}</h3>
      <form class="admin-form">
        ${data ? `<input type="hidden" name="id" value="${data._id}">` : ''}
        
        <div class="form__group">
          <label class="form__label" for="name">Ad Soyad</label>
          <input class="form__input" id="name" name="name" value="${data?.name || ''}" required>
        </div>
        
        <div class="form__group">
          <label class="form__label" for="email">Email</label>
          <input class="form__input" id="email" name="email" type="email" value="${data?.email || ''}" required>
        </div>
        
        <div class="form__group">
          <label class="form__label" for="role">Rol</label>
          <select class="form__input" id="role" name="role" required>
            <option value="">Se\u00e7iniz</option>
            <option value="user" ${data?.role === 'user' ? 'selected' : ''}>Kullan\u0131c\u0131</option>
            <option value="guide" ${data?.role === 'guide' ? 'selected' : ''}>Rehber</option>
            <option value="lead-guide" ${data?.role === 'lead-guide' ? 'selected' : ''}>Ba\u015f Rehber</option>
            <option value="admin" ${data?.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>
        
        ${!data ? `
        <div class="form__group">
          <label class="form__label" for="password">\u015eifre</label>
          <input class="form__input" id="password" name="password" type="password" required>
        </div>
        
        <div class="form__group">
          <label class="form__label" for="passwordConfirm">\u015eifre Tekrar\u0131</label>
          <input class="form__input" id="passwordConfirm" name="passwordConfirm" type="password" required>
        </div>
        ` : `
        <div class="form__group">
          <label class="form__label" for="password">\u015eifre (Bo\u015f b\u0131rak\u0131rsan\u0131z de\u011fi\u015fmez)</label>
          <input class="form__input" id="password" name="password" type="password">
        </div>
        
        <div class="form__group">
          <label class="form__label" for="passwordConfirm">\u015eifre Tekrar\u0131</label>
          <input class="form__input" id="passwordConfirm" name="passwordConfirm" type="password">
        </div>
        `}
        
        <div class="form__group form__group--buttons">
          <button type="button" class="btn btn--small btn--cancel">\u0130ptal</button>
          <button type="submit" class="btn btn--small btn--green">${data ? 'G\u00fcncelle' : 'Ekle'}</button>
        </div>
      </form>
    </div>
  `;
};

// Form gönderimi
const submitForm = async (type, id) => {
  try {
    const form = document.querySelector('.admin-form');
    const formData = {};
    let actualId = id;
    
    // Form verilerini topla
    new FormData(form).forEach((value, key) => {
      // Gizli id alanı varsa, onu kullan
      if (key === 'id' && value) {
        actualId = value;
        return; // id'yi formData'ya ekleme
      }
      
      // Boş şifre alanlarını formData'ya ekleme
      if ((key === 'password' || key === 'passwordConfirm') && value === '') {
        return;
      }
      
      formData[key] = value;
    });
    
    console.log('Form verileri:', formData);
    console.log('Kullanılacak ID:', actualId);
    
    let url = `/api/v1/${type}s`;
    let method = 'POST';
    
    if (actualId) {
      url = `${url}/${actualId}`;
      method = 'PATCH';
      console.log('Düzenleme modu - URL:', url);
    } else {
      console.log('Yeni ekleme modu - URL:', url);
    }
    
    // Kullanıcı düzenleme işlemi için özel kontrol
    if (type === 'user' && formData.password) {
      // Şifre alanları eşleşmiyorsa hata göster
      if (formData.password !== formData.passwordConfirm) {
        showAlert('error', 'Şifreler eşleşmiyor!');
        return;
      }
    }
    
    // İstek gönder
    console.log(`${method} isteği gönderiliyor:`, url);
    console.log('Gönderilecek veriler:', formData);
    
    const res = await axios({
      method,
      url,
      data: formData
    });
    
    console.log('Sunucu yanıtı:', res.data);
    
    if (res.data.status === 'success') {
      const message = actualId 
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} başarıyla güncellendi!` 
        : `${type.charAt(0).toUpperCase() + type.slice(1)} başarıyla oluşturuldu!`;
      
      showAlert('success', message);
      
      // Formu kapat
      document.querySelector('.admin-form-container').remove();
      
      // Tabloyu yenile
      const activeIndex = Array.from(document.querySelectorAll('.side-nav li')).findIndex(el => el.classList.contains('side-nav--active'));
      loadSectionData(activeIndex);
    }
  } catch (err) {
    console.error('Form gönderimi hatası:', err);
    showAlert('error', err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Sekme işlevselliğini kur
  setupTabs();
  
  // İlk sekmeyi yükle (Turlar)
  loadSectionData(0);
  
  // Toplam kullanıcı bağlantısına tıklandığında kullanıcılar sekmesine geç
  const totalUsersLink = document.getElementById('total-users-link');
  if (totalUsersLink) {
    totalUsersLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Sekmeleri güncelle
      const navItems = [
        document.getElementById('tours-nav-item'),
        document.getElementById('users-nav-item'),
        document.getElementById('reviews-nav-item'),
        document.getElementById('bookings-nav-item')
      ];
      
      const sections = [
        document.getElementById('tours-section'),
        document.getElementById('users-section'),
        document.getElementById('reviews-section'),
        document.getElementById('bookings-section')
      ];
      
      // Aktif nav öğesini güncelle
      navItems.forEach(i => i.classList.remove('side-nav--active'));
      navItems[1].classList.add('side-nav--active'); // Kullanıcılar sekmesi
      
      // Aktif bölümü güncelle
      sections.forEach(s => s.classList.add('hidden'));
      sections[1].classList.remove('hidden'); // Kullanıcılar bölümü
      
      // Kullanıcı verilerini yükle
      loadSectionData(1);
    });
  }
});
