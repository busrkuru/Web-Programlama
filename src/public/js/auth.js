/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      },
      withCredentials: true
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Başarıyla giriş yaptınız!');
      window.setTimeout(() => {
        location.assign('/modern');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    showAlert('error', 'Çıkış yapılırken hata oluştu! Lütfen tekrar deneyin.');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      },
      withCredentials: true
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Hesabınız başarıyla oluşturuldu!');
      window.setTimeout(() => {
        location.assign('/modern');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
