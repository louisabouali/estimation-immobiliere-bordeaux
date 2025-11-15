console.log('map.js loaded');

(async function () {
  const map = L.map('map').setView([44.84, -0.58], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // coords approx par quartier (à ajuster si besoin)
  const COORDS = {
    "Chartrons": [44.860, -0.572],
    "Saint-Michel": [44.832, -0.566],
    "Caudéran": [44.848, -0.609],
    "Bastide": [44.842, -0.555],
    "Saint-Seurin": [44.846, -0.586],
    "Saint-Pierre": [44.841, -0.572],
    "Nansouty": [44.826, -0.576],
    "Capucins - Victoire": [44.831, -0.574],
    "Grand Parc": [44.862, -0.585],
    "Mériadeck": [44.838, -0.586],
    "Bordeaux-Lac": [44.887, -0.571],
    "Bacalan": [44.877, -0.551],
    "Belcier (Euratlantique)": [44.825, -0.558],
    "Saint-Augustin": [44.838, -0.621],
    "Pey Berland / Hôtel de Ville": [44.838, -0.579]
  };

  let quartiers = [];
  try {
    quartiers = await API.get('/neighborhoods');
  } catch (e) {
    console.error(e);
    return;
  }

  quartiers.forEach(q => {
    const coord = COORDS[q.name];
    if (!coord) return;
    const prix = Math.round(q.avg_price_sqm || 0).toLocaleString();
    const popup = `
      <strong>${q.name}</strong><br/>
      ~ ${prix} €/m²<br/>
      <a href="estimation.html?neighborhood_id=${q.id}">Estimer ici</a>
    `;
    L.marker(coord).addTo(map).bindPopup(popup);
  });
})();
