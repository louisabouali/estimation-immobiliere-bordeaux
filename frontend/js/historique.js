// frontend/js/historique.js
console.log('historique.js loaded');

(async () => {
  // user_id stocké par l’estimation (bypass auth)
  const userId = Number(localStorage.getItem('user_id') || 1);

  // récupère l’historique
  let rows = [];
  try {
    rows = await API.get(`/history/${userId}`, false);
  } catch (e) {
    console.error(e);
    document.getElementById('hist').innerHTML = `<p class="notice">Impossible de charger l'historique.</p>`;
    return;
  }

  if (!rows.length) {
    document.getElementById('hist').innerHTML = `<p>Aucune estimation pour l’instant.</p>`;
    return;
  }

  // rendu simple
  const html = `
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Quartier (id)</th>
          <th>Surface</th>
          <th>DPE</th>
          <th>Estimation (€)</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${new Date(r.created_at).toLocaleString()}</td>
            <td>${r.neighborhood_id}</td>
            <td>${r.surface}</td>
            <td>${r.dpe_grade || '-'}</td>
            <td>${Math.round(r.estimated_price).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('hist').innerHTML = html;
})();
