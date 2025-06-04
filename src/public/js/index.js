/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './auth';
import { updateSettings } from './updateSettings';
import { bookTour, updateBookingTotal } from './booking';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const bookingForm = document.querySelector('.form--booking');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    if (document.getElementById('photo').files[0]) {
      form.append('photo', document.getElementById('photo').files[0]);
    }
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    document.querySelector('.btn--save-password').textContent = 'Güncelleniyor...';
    
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    
    document.querySelector('.btn--save-password').textContent = 'Şifreyi Kaydet';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookingForm) {
  // Sayfa yu00fcklendiu011finde toplam fiyatu0131 gu00fcncelle
  updateBookingTotal();
  
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const tourId = bookingForm.dataset.tourId;
    const participants = document.getElementById('participants').value;
    const startDate = document.getElementById('date').value;
    
    bookTour(tourId, participants, startDate);
  });
}

// Sayfa yüklendiğinde URL'den alert parametrelerini kontrol et
const alertMessage = new URLSearchParams(window.location.search).get('alert');
if (alertMessage) {
  const alertType = new URLSearchParams(window.location.search).get('type') || 'success';
  showAlert(alertType, decodeURIComponent(alertMessage));
  
  // URL'i temizle
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
}
