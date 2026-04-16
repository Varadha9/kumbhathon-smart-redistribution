// api.js
// Shared utility for all HTTP calls from the frontend to the Flask backend.
// Instead of writing fetch() in every component, all components import this.
// This way if the backend URL changes, we only update it in ONE place.

const BASE = "http://localhost:5001/api";  // Flask backend base URL

export const api = {
  // GET request — used to fetch data (NGOs, alerts, stats, history)
  get: (path) =>
    fetch(`${BASE}${path}`)
      .then(r => r.json())
      .catch(() => null),  // return null on network error (backend offline)

  // POST request — used to send data (register, donate, confirm transfer, etc.)
  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },  // tell server we're sending JSON
      body: JSON.stringify(body)                         // convert JS object to JSON string
    })
      .then(r => r.json())
      .catch(() => ({ error: "Cannot connect to server. Is the backend running?" }))
};
