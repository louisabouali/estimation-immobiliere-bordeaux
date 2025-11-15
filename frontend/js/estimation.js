// frontend/js/estimation.js
console.log('estimation.js loaded');

(function () {

  // Pré-sélection du quartier via ?neighborhood_id=...
  function getQueryInt(name) {
    const v = new URLSearchParams(location.search).get(name);
    if (!v) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }

  async function loadNeighborhoods() {
    const select = document.getElementById('neighborhood');
    const quartiers = await API.get('/neighborhoods');
    select.innerHTML = quartiers
      .map(q => `<option value="${q.id}">${q.name} (~${Math.round(q.avg_price_sqm || 0).toLocaleString()} €/m²)</option>`)
      .join('');
    const pre = getQueryInt('neighborhood_id');
    if (pre) select.value = String(pre);
  }

  async function onSubmit(e) {
    e.preventDefault();

    // Bypass auth : on pose juste un user_id local si absent
    if (!localStorage.getItem('user_id')) {
      localStorage.setItem('user_id', '1');
    }

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    // numériques
    data.surface = Number(data.surface);
    data.rooms = Number(data.rooms || 0);
    data.floor = Number(data.floor || 0);
    data.transport_score = Number(data.transport_score || 5);
    data.amenities_score = Number(data.amenities_score || 5);
    // booléens
    data.balcony = form.querySelector('[name="balcony"]').checked;
    data.parking = form.querySelector('[name="parking"]').checked;
    data.pool    = form.querySelector('[name="pool"]').checked;
    // autres
    data.user_id = Number(localStorage.getItem('user_id') || 1);

    try {
      const res = await API.post('/estimate', data, false);
      console.log('ESTIMATE RESPONSE', res);

      // Affichage résultat
      document.getElementById('resultat').style.display = 'block';
      document.getElementById('estimation').textContent = Math.round(res.estimated_price).toLocaleString();

      // Détails (coefficients)
      const d = res.details || {};
      document.getElementById('details').innerHTML = `
        <ul>
          <li>Base m²: <strong>${Math.round(d.base_sqm || 0).toLocaleString()} €/m²</strong></li>
          <li>Facteur DPE: <strong>${d.dpe_factor ?? '-'}</strong></li>
          <li>Prix m² ajusté: <strong>${Math.round(d.price_sqm || 0).toLocaleString()} €/m²</strong></li>
          <li>Coefficients:
            <ul>
              <li>Taille: ${fmt(d.size_factor)}</li>
              <li>État: ${fmt(d.condition_factor)}</li>
              <li>Étage: ${fmt(d.floor_factor)}</li>
              <li>Orientation: ${fmt(d.orientation_factor)}</li>
              <li>Bruit: ${fmt(d.noise_factor)}</li>
              <li>Transports: ${fmt(d.transport_factor)}</li>
              <li>Commodités: ${fmt(d.amenities_factor)}</li>
              <li>Balcon: ${fmt(d.balcony_factor)}</li>
              <li>Parking: ${fmt(d.parking_factor)}</li>
              <li>Piscine: ${fmt(d.pool_factor)}</li>
            </ul>
          </li>
        </ul>`;

      // Explication lisible + bouton Contact pré-rempli
      const exp = `
        <p>L’estimation part d’un <strong>prix/m² de quartier</strong>, ajusté par des <strong>coefficients</strong> :</p>
        <ul>
          <li><strong>DPE</strong> : meilleur DPE → prix ↑.</li>
          <li><strong>Taille</strong> : petites surfaces ↑, grandes surfaces ↓.</li>
          <li><strong>État</strong> : neuf/rénové ↑, à rénover ↓.</li>
          <li><strong>Étage</strong> : RDC ↓, étages élevés ↑.</li>
          <li><strong>Orientation</strong> & <strong>Bruit</strong> : lumineux et calme ↑.</li>
          <li><strong>Transports</strong> & <strong>Commodités</strong> (0–10) : meilleure accessibilité ↑.</li>
          <li><strong>Balcon / Parking / Piscine</strong> : bonus si présents.</li>
        </ul>
        <p>Le total = <strong>prix/m² ajusté × surface</strong>, après bonus/malus (balcon, parking, piscine).</p>
      `;
      document.getElementById('explication-texte').innerHTML = exp;
      document.getElementById('explication').style.display = 'block';

      // Lien "Plus d’informations" → page contact avec contexte pré-rempli
      const btn = document.getElementById('btn-contact');
      const subject = encodeURIComponent("Demande d'informations sur mon estimation");
      const msg = encodeURIComponent(
        `Quartier #${data.neighborhood_id} | Type ${data.property_type || 'appartement'} | ` +
        `Surface ${data.surface} m² | Pièces ${data.rooms || '-'} | ` +
        `DPE ${data.dpe_grade || 'D'} | État ${data.condition || 'bon'} | ` +
        `Balcon ${data.balcony ? 'oui' : 'non'} | Parking ${data.parking ? 'oui' : 'non'} | Piscine ${data.pool ? 'oui' : 'non'} | ` +
        `Estimation ~ ${Math.round(res.estimated_price).toLocaleString()} €`
      );
      btn.href = `contact.html?subject=${subject}&message=${msg}`;

    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    }
  }

  function fmt(v) {
    if (v == null) return '-';
    return (typeof v === 'number' && v.toFixed) ? v.toFixed(3) : v;
    }

  // init
  (async () => {
    await loadNeighborhoods();
    const form = document.getElementById('form-estimation');
    form.addEventListener('submit', onSubmit);
  })();

})();
