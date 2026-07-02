// Legacy REST helper for the one remaining non-Base44 endpoint
// (property import in src/pages/Properties.jsx). This is NOT an auth system:
// all token/session/login logic has been removed. Authentication is owned
// solely by Base44 (src/lib/AuthContext.jsx + base44.auth.*).
//
// TODO(migration): move `/properties/import` to a Base44 backend function and
// delete this file. It talks to a separate legacy backend that this app no
// longer authenticates against directly.
import { appParams } from '@/lib/app-params';

const API_BASE = 'https://aimadar.com/api';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  // Best-effort: forward the single Base44 session token if present. There is
  // no separate legacy token store any more.
  if (appParams.token) headers['Authorization'] = `Bearer ${appParams.token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
