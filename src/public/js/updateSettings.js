/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type: 'password' veya 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type.toUpperCase() === 'PASSWORD' ? 'u015eifreniz' : 'Bilgileriniz'} bau015faru0131yla gu00fcncellendi!`
      );
      
      // Veri gu00fcncellendiyse sayfayu0131 yenile
      if (type !== 'password') {
        window.setTimeout(() => {
          location.reload();
        }, 1500);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
