/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createTour = async (formData) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/tours',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tur başarıyla oluşturuldu!');
      window.setTimeout(() => {
        location.assign('/manage-tours');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const tourForm = document.querySelector('.form--add-tour');

if (tourForm) {
  tourForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Temel bilgileri ekle
    formData.append('name', document.getElementById('name').value);
    formData.append('duration', document.getElementById('duration').value);
    formData.append('maxGroupSize', document.getElementById('maxGroupSize').value);
    formData.append('difficulty', document.getElementById('difficulty').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('summary', document.getElementById('summary').value);
    formData.append('description', document.getElementById('description').value);
    
    // Kapak resmi
    if (document.getElementById('imageCover').files.length > 0) {
      formData.append('imageCover', document.getElementById('imageCover').files[0]);
    }
    
    // Diğer resimler
    if (document.getElementById('images').files.length > 0) {
      for (let i = 0; i < document.getElementById('images').files.length; i++) {
        formData.append('images', document.getElementById('images').files[i]);
      }
    }
    
    // Başlangıç konumu
    if (document.getElementById('startLocation').value) {
      formData.append('startLocation[description]', document.getElementById('startLocation').value);
    }
    
    createTour(formData);
  });
}
