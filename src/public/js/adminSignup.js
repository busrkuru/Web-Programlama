/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm, role) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
        role
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Kullanıcı başarıyla oluşturuldu!');
      window.setTimeout(() => {
        location.assign('/manage-users');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const signupForm = document.querySelector('.form--signup');

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const role = document.getElementById('role').value;
    signup(name, email, password, passwordConfirm, role);
  });
}
