/**
 * Madar API Client
 * Single shared client for all calls to https://aimadar.com/api/v1
 * - Attaches Bearer JWT from localStorage to every request
 * - On 401: attempts token refresh via POST /auth/refresh, then retries the original request
 *   If refresh fails, clears tokens and redirects to /login
 * - On 403: throws a MadarError with type 'tier' (caller shows upgrade prompt)
 * - On 500+: throws a MadarError with type 'server' (caller shows retry message)
 */

const BASE_URL = "https://aimadar.com/api/v1";
const TOKEN_KEY = "madar_access_token";
const REFRESH_KEY = "madar_refresh_token";

let isRefreshing = false;
let refreshPromise = null;

export class MadarError extends Error {
  constructor(message, status, type = "error", data = null) {
    super(message);
    this.name = "MadarError";
    this.status = status;
    this.type = type; // 'auth' | 'tier' | 'server' | 'error'
    this.data = data;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_KEY, token);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * Attempt to refresh the access token.
 * Deduplicates concurrent refresh attempts.
 * Returns the new access token or throws.
 */
async function refreshToken() {
  if (isRefreshing) return refreshPromise;
  isRefreshing = true;

  refreshPromise = (async () => {
    const rt = getRefreshToken();
    if (!rt) throw new Error("No refresh token");

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${rt}`,
      },
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    const newToken = data.access_token || data.token || data.jwt;
    if (!newToken) throw new Error("No token in refresh response");

    setToken(newToken);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
    return newToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * Core request function.
 * All other methods delegate to this.
 */
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 401: try refresh then retry once
  if (res.status === 401 && !options._retried) {
    try {
      const newToken = await refreshToken();
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        _retried: true,
      });
    } catch {
      clearTokens();
      // Redirect to login (preserve intended URL)
      const currentPath = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      }
      throw new MadarError("Session expired. Please log in again.", 401, "auth");
    }
  }

  // 401 even after retry — redirect to login
  if (res.status === 401) {
    clearTokens();
    const currentPath = window.location.pathname + window.location.search;
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
    }
    throw new MadarError("Authentication required.", 401, "auth");
  }

  // 403: tier-gated feature
  if (res.status === 403) {
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* ignore parse errors */
    }
    throw new MadarError(
      data.message || data.detail || "This feature requires a higher subscription tier.",
      403,
      "tier",
      data
    );
  }

  // 500+: server error
  if (res.status >= 500) {
    throw new MadarError(
      "A server error occurred. Please try again in a moment.",
      res.status,
      "server"
    );
  }

  // Other client errors (400, 404, 409, etc.)
  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* ignore parse errors */
    }
    throw new MadarError(
      data.message || data.detail || data.error || "Request failed.",
      res.status,
      "error",
      data
    );
  }

  // Handle 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

export const madarApi = {
  // ── HTTP primitives ──
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) =>
    request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) =>
    request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: "DELETE" }),

  // ── Auth ──
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => {
    // If the API has a logout endpoint, call it; otherwise just clear locally
    try {
      request("/auth/logout", { method: "POST" }).catch(() => {});
    } catch {
      /* ignore */
    }
    clearTokens();
  },

  // ── Properties ──
  getProperties: () => request("/properties"),
  getProperty: (id) => request(`/properties/${id}`),
  previewProperty: (url) =>
    request("/properties/preview", { method: "POST", body: JSON.stringify({ url }) }),
  createProperty: (data) =>
    request("/properties", { method: "POST", body: JSON.stringify(data) }),
  addPlatformUrl: (propertyId, url) =>
    request(`/properties/${propertyId}/platforms`, {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  // ── Briefs (AI pricing recommendations) ──
  getLatestBriefs: () => request("/briefs/latest"),
  getPropertyBriefs: (propertyId) => request(`/briefs/${propertyId}`),

  // ── Competitors ──
  getCompetitors: (propertyId) => request(`/competitors/${propertyId}`),

  // ── Market ──
  getMarket: (city) => request(`/market/${encodeURIComponent(city)}`),

  // ── Subscription ──
  getSubscription: () => request("/subscription"),
  upgradeSubscription: () =>
    request("/subscription/upgrade", { method: "POST" }),

  // ── AI Assistant ──
  askAI: (message) =>
    request("/ai/ask", { method: "POST", body: JSON.stringify({ message }) }),

  // ── Token helpers ──
  getToken,
  setToken,
  setRefreshToken,
  clearTokens,
};

export default madarApi;