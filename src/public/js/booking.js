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
      
      // Rezervasyonlar sayfasına yönlendir
      window.setTimeout(() => {
        location.assign('/my-bookings');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Rezervasyon sayfasında artık sadece kişi başı fiyat gösteriliyor
// Bu fonksiyon artık sadece form kontrolü için kullanılıyor
export const updateBookingTotal = () => {
  // Artık toplam fiyat hesaplamaya gerek yok
  // Sadece katılımcı sayısının maksimum değeri aşmamasını kontrol ediyoruz
  const participantsInput = document.getElementById('participants');
  
  if (participantsInput) {
    // Katılımcı sayısı değiştiğinde kontrol et
    participantsInput.addEventListener('change', () => {
      const newParticipants = parseInt(participantsInput.value);
      const maxParticipants = parseInt(participantsInput.getAttribute('max'));
      
      // Maksimum değeri aşarsa, maksimum değere ayarla
      if (newParticipants > maxParticipants) {
        participantsInput.value = maxParticipants;
      }
      
      // Minimum değerin altına düşerse, minimum değere ayarla
      if (newParticipants < 1) {
        participantsInput.value = 1;
      }
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
