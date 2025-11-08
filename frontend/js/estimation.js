// frontend/js/estimation.js
console.log('estimation.js loaded');

(async () => {
  // 1) Charger la liste des quartiers
  const select = document.getElementById('neighborhood');
  const quartiers = await API.get('/neighborhoods');
  select.innerHTML = quartiers
    .map(q => `<option value="${q.id}">${q.name} (~${q.avg_price_sqm.toLocaleString()} €/m²)</option>`)
    .join('');

  // 2) Soumission du formulaire
  const form = document.getElementById('form-estimation');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Bypass auth : on pose juste un user_id local si absent
    if (!localStorage.getItem('user_id')) {
      localStorage.setItem('user_id', '1');
    }

    // Préparation des données
    const data = Object.fromEntries(new FormData(form).entries());
    data.surface = Number(data.surface);
    data.rooms = Number(data.rooms || 0);
    data.floor = Number(data.floor || 0);
    data.transport_score = Number(data.transport_score || 5);
    data.amenities_score = Number(data.amenities_score || 5);
    data.balcony = form.querySelector('[name="balcony"]').checked;
    data.parking = form.querySelector('[name="parking"]').checked;
    data.user_id = Number(localStorage.getItem('user_id') || 1);

    try {
      // Appel estimation
      const res = await API.post('/estimate', data, false);
      console.log('ESTIMATE RESPONSE', res);

      // Affichage résultat
      document.getElementById('resultat').style.display = 'block';
      document.getElementById('estimation').textContent = res.estimated_price.toLocaleString();

      // Affichage détails (coefficients)
      const d = res.details;
      document.getElementById('details').innerHTML = `
        <ul>
          <li>Base m²: <strong>${Math.round(d.base_sqm).toLocaleString()} €/m²</strong></li>
          <li>Facteur DPE: <strong>${d.dpe_factor}</strong></li>
          <li>Prix m² ajusté: <strong>${Math.round(d.price_sqm).toLocaleString()} €/m²</strong></li>
          <li>Coefficients:
            <ul>
              <li>Taille: ${d.size_factor?.toFixed ? d.size_factor.toFixed(3) : d.size_factor}</li>
              <li>État: ${d.condition_factor?.toFixed ? d.condition_factor.toFixed(3) : d.condition_factor}</li>
              <li>Étage: ${d.floor_factor?.toFixed ? d.floor_factor.toFixed(3) : d.floor_factor}</li>
              <li>Orientation: ${d.orientation_factor?.toFixed ? d.orientation_factor.toFixed(3) : d.orientation_factor}</li>
              <li>Bruit: ${d.noise_factor?.toFixed ? d.noise_factor.toFixed(3) : d.noise_factor}</li>
              <li>Transports: ${d.transport_factor?.toFixed ? d.transport_factor.toFixed(3) : d.transport_factor}</li>
              <li>Commodités: ${d.amenities_factor?.toFixed ? d.amenities_factor.toFixed(3) : d.amenities_factor}</li>
              <li>Balcon: ${d.balcony_factor?.toFixed ? d.balcony_factor.toFixed(3) : d.balcony_factor}</li>
              <li>Parking: ${d.parking_factor?.toFixed ? d.parking_factor.toFixed(3) : d.parking_factor}</li>
            </ul>
          </li>
        </ul>`;
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    }
  });
})();
