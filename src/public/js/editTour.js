document.addEventListener('DOMContentLoaded', function () {
  console.log('editTour.js yüklendi');
  const tourForm = document.querySelector('.form--edit-tour');
  
  if (!tourForm) {
    console.error('Form bulunamadı!');
    return;
  }
  
  console.log('Form bulundu:', tourForm);
  console.log('Form data-tour-id:', tourForm.dataset.tourId);

  tourForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form gönderildi');
    
    const tourId = tourForm.dataset.tourId;
    console.log('Tur ID:', tourId);
    
    if (!tourId) {
      console.error('Tur ID bulunamadı!');
      alert('Tur ID bulunamadı!');
      return;
    }
    
    const formData = new FormData();
    
    // Form verilerini ekle
    const name = document.getElementById('name').value;
    const duration = document.getElementById('duration').value;
    const maxGroupSize = document.getElementById('maxGroupSize').value;
    const difficulty = document.getElementById('difficulty').value;
    const price = document.getElementById('price').value;
    const summary = document.getElementById('summary').value;
    const description = document.getElementById('description').value;
    
    console.log('Form verileri:', { name, duration, maxGroupSize, difficulty, price });
    
    formData.append('name', name);
    formData.append('duration', duration);
    formData.append('maxGroupSize', maxGroupSize);
    formData.append('difficulty', difficulty);
    formData.append('price', price);
    formData.append('summary', summary);
    formData.append('description', description);

    if (document.getElementById('imageCover').files.length > 0) {
      formData.append('imageCover', document.getElementById('imageCover').files[0]);
      console.log('Kapak resmi eklendi');
    }

    const url = `/api/v1/tours/${tourId}`;
    console.log('İstek URL:', url);

    try {
      console.log('PATCH isteği gönderiliyor...');
      
      const res = await axios.patch(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('PATCH yanıtı:', res);
      
      if (res.data.status === 'success') {
        console.log('Tur başarıyla güncellendi');
        alert('Tur başarıyla güncellendi!');
        window.location.assign('/manage-tours');
      } else {
        console.error('Yanıt başarılı değil:', res.data);
        alert('Güncelleme başarısız: ' + JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('PATCH hatası:', err);
      console.error('Hata detayları:', err.response?.data);
      alert('Bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  });
});

// Sayfa yüklenirken kontrol et
console.log('editTour.js dosyası yüklendi');
