const API_BASE = 'https://aimadar.com/api/v1';

let authToken = localStorage.getItem('madar_token') || null;

export function setToken(token) {
  authToken = token;
  if (token) localStorage.setItem('madar_token', token);
  else localStorage.removeItem('madar_token');
}

export function getToken() {
  return authToken;
}

export function isLoggedIn() {
  return !!authToken;
}

export function logoutUser() {
  setToken(null);
  localStorage.removeItem('madar_user');
  window.location.href = '/login';
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('madar_user') || 'null');
  } catch { return null; }
}

export function setUser(user) {
  localStorage.setItem('madar_user', JSON.stringify(user));
}

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    logoutUser();
    throw new Error('Unauthorized');
  }
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