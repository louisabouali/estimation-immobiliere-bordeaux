// frontend/js/home.js
console.log('home.js loaded');

(function () {
  // mapping manuel pour gérer accents / noms composés
  const SLUG_MAP = {
    "Chartrons": "chartrons",
    "Saint-Michel": "saint-michel",
    "Caudéran": "cauderan",
    "Bastide": "bastide",
    "Saint-Seurin": "saint-seurin",
    "Saint-Pierre": "saint-pierre",
    "Nansouty": "nansouty",
    "Capucins - Victoire": "capucins-victoire",
    "Grand Parc": "grand-parc",
    "Mériadeck": "meriadek",
    "Bordeaux-Lac": "bordeaux-lac",
    "Bacalan": "bacalan",
    "Belcier (Euratlantique)": "belcier-euratlantique",
    "Saint-Augustin": "saint-augustin",
    "Pey Berland / Hôtel de Ville": "pey-berland-hotel-de-ville"
  };

  function slugifyName(name) {
    if (SLUG_MAP[name]) return SLUG_MAP[name];
    // fallback générique si nouveaux quartiers arrivent
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
      .replace(/[^a-z0-9]+/g, '-')                      // espaces/ponctuation -> tirets
      .replace(/(^-|-$)/g, '');
  }

  function cardHTML(q) {
    const slug = slugifyName(q.name);
    const imgPath = `images/quartiers/${slug}.jpg`;
    const price = (q.avg_price_sqm || 0);
    return `
      <article class="card card-quarter">
        <div class="thumb">
          <img src="${imgPath}" alt="${q.name}" onerror="this.onerror=null;this.src='images/quartiers/placeholder.jpg';">
          <div class="badge">${Math.round(price).toLocaleString()} €/m²</div>
        </div>
        <div class="body">
          <h3>${q.name}</h3>
          <div class="actions">
            <a class="btn" href="estimation.html?neighborhood_id=${q.id}">Estimer ici</a>
          </div>
        </div>
      </article>
    `;
  }

  async function init() {
    const grid = document.getElementById('grid-quartiers');
    try {
      const quartiers = await API.get('/neighborhoods');
      if (!Array.isArray(quartiers) || !quartiers.length) {
        grid.innerHTML = `<p class="notice">Aucun quartier trouvé.</p>`;
        return;
      }
      // tri alpha
      quartiers.sort((a,b) => a.name.localeCompare(b.name, 'fr'));
      grid.innerHTML = quartiers.map(cardHTML).join('');
    } catch (e) {
      console.error(e);
      grid.innerHTML = `<p class="error">Impossible de charger les quartiers.</p>`;
    }
  }

  init();
})();
