console.log('contact.js loaded');

(function () {
  // pré-remplissage via query params (subject, message)
  const params = new URLSearchParams(location.search);
  if (params.get('subject')) document.querySelector('[name="subject"]').value = params.get('subject');
  if (params.get('message')) document.querySelector('[name="message"]').value = params.get('message');

  const form = document.getElementById('contact-form');
  const result = document.getElementById('contact-result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await API.post('/contact', data, false);
      result.textContent = 'Message envoyé. Nous vous recontacterons très vite.';
      result.style.display = 'block';
      form.reset();
    } catch (err) {
      console.error(err);
      result.textContent = "Erreur lors de l'envoi. Réessaie plus tard.";
      result.style.display = 'block';
    }
  });
})();
