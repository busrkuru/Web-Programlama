/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Gerçek projeye geçildiğinde bir çevre değişkeni olarak ayarlanmalı
  
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // İşaretleyici oluştur
    const el = document.createElement('div');
    el.className = 'marker';

    // Haritaya işaretleyici ekle
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Popup ekle
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Gün ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Sınırlara lokasyonu ekle
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
