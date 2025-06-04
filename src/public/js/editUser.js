/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (userId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Kullanıcı bilgileri başarıyla güncellendi!');
      window.setTimeout(() => {
        location.assign('/manage-users');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const userForm = document.querySelector('.form--edit-user');

if (userForm) {
  userForm.addEventListener('submit', e => {
    e.preventDefault();
    const userId = userForm.dataset.userId;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    
    updateUser(userId, { name, email, role });
  });
}
