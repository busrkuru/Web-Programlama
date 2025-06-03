/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, participants, startDate) => {
  try {
    // 1) Rezervasyon için istek gönder
    const res = await axios({
      method: 'POST',
      url: '/api/v1/bookings',
      data: {
        tourId,
        participants,
        startDate
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Rezervasyonunuz başarıyla oluşturuldu!');
      window.setTimeout(() => {
        location.assign('/my-bookings');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Rezervasyon sayfasında toplam fiyatı hesapla
export const updateBookingTotal = () => {
  const participantsInput = document.getElementById('participants');
  const totalElement = document.querySelector('.booking-form__total-value');
  const priceElement = document.querySelector('.booking-form__price-value');
  
  if (participantsInput && totalElement && priceElement) {
    const price = parseInt(priceElement.textContent);
    const participants = parseInt(participantsInput.value);
    
    totalElement.textContent = `${price * participants} ₺`;
    
    participantsInput.addEventListener('change', () => {
      const participants = parseInt(participantsInput.value);
      totalElement.textContent = `${price * participants} ₺`;
    });
  }
};

// Rezervasyon iptal etme
export const cancelBooking = async (bookingId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`
    });

    if (res.status === 204) {
      showAlert('success', 'Rezervasyonunuz iptal edildi!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
