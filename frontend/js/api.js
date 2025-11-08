const API_BASE = 'http://localhost:5001/api';

const API = {
  async get(path, auth = false) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (auth && localStorage.getItem('token')) {
      headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
    }
    const r = await fetch(API_BASE + path, { headers });
    const text = await r.text();
    if (!r.ok) {
      throw new Error(`GET ${path} failed: ${text || r.status}`);
    }
    try { return JSON.parse(text); } catch { return {}; }
  },

  async post(path, body = {}, auth = false) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (auth && localStorage.getItem('token')) {
      headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
    }
    const r = await fetch(API_BASE + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const text = await r.text();
    if (!r.ok) {
      // essaye d'extraire un message JSON {error: "..."} sinon renvoie la raw response
      let msg = text;
      try { msg = JSON.parse(text).error || msg; } catch {}
      throw new Error(`POST ${path} failed: ${msg || r.status}`);
    }
    try { return JSON.parse(text); } catch { return {}; }
  }
};
