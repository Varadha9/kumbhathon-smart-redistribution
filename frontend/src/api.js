// api.js — Shared HTTP utility for all backend calls.
const BASE = "/api";

export const api = {
  get: (path) =>
    fetch(`${BASE}${path}`)
      .then(r => r.json())
      .catch(() => null),

  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(r => r.json())
      .catch(() => ({ error: "Cannot connect to server. Is the backend running?" })),
};
