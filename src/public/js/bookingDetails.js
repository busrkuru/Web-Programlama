/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateBookingPaymentStatus = async (bookingId, paid) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/bookings/${bookingId}`,
      data: { paid }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Rezervasyon ödeme durumu güncellendi!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`
    });

    showAlert('success', 'Rezervasyon başarıyla iptal edildi!');
    window.setTimeout(() => {
      location.assign('/manage-bookings');
    }, 1500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const bookingPaidBtn = document.querySelector('.btn--booking-paid');
const bookingCancelBtn = document.querySelector('.btn--booking-cancel');

if (bookingPaidBtn) {
  bookingPaidBtn.addEventListener('click', e => {
    const bookingId = e.target.dataset.bookingId;
    if (!bookingPaidBtn.classList.contains('disabled')) {
      updateBookingPaymentStatus(bookingId, true);
    }
  });
}

if (bookingCancelBtn) {
  bookingCancelBtn.addEventListener('click', e => {
    const bookingId = e.target.dataset.bookingId;
    if (confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      cancelBooking(bookingId);
    }
  });
}
