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
  return `
    <div class="admin-form-overlay"></div>
    <div class="admin-form-content">
      <h3 class="heading-tertiary">${data ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
      <form class="admin-form">
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
            <option value="">Seçiniz</option>
            <option value="user" ${data?.role === 'user' ? 'selected' : ''}>Kullanıcı</option>
            <option value="guide" ${data?.role === 'guide' ? 'selected' : ''}>Rehber</option>
            <option value="lead-guide" ${data?.role === 'lead-guide' ? 'selected' : ''}>Baş Rehber</option>
            <option value="admin" ${data?.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>
        ${!data ? `
        <div class="form__group">
          <label class="form__label" for="password">Şifre</label>
          <input class="form__input" id="password" name="password" type="password" required>
        </div>
        <div class="form__group">
          <label class="form__label" for="passwordConfirm">Şifre Tekrarı</label>
          <input class="form__input" id="passwordConfirm" name="passwordConfirm" type="password" required>
        </div>
        ` : ''}
        <div class="form__group form__group--buttons">
          <button type="button" class="btn btn--small btn--cancel">İptal</button>
          <button type="submit" class="btn btn--small btn--green">${data ? 'Güncelle' : 'Ekle'}</button>
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
    
    // Form verilerini topla
    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });
    
    let url = `/api/v1/${type}s`;
    let method = 'POST';
    
    if (id) {
      url = `${url}/${id}`;
      method = 'PATCH';
    }
    
    const res = await axios({
      method,
      url,
      data: formData
    });
    
    if (res.data.status === 'success') {
      showAlert('success', `${type.charAt(0).toUpperCase() + type.slice(1)} ${id ? 'güncellendi' : 'oluşturuldu'}!`);
      
      // Formu kapat
      document.querySelector('.admin-form-container').remove();
      
      // Tabloyu yenile
      const activeIndex = Array.from(document.querySelectorAll('.side-nav li')).findIndex(el => el.classList.contains('side-nav--active'));
      loadSectionData(activeIndex);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Sekme işlevselliğini kur
  setupTabs();
  
  // İlk sekmeyi yükle (Turlar)
  loadSectionData(0);
});
