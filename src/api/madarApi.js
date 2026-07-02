const BASE_URL = "https://api.aimadar.com/api";

export class MadarError extends Error {
  constructor(message, status, type = "error", data = null) {
    super(message);
    this.name = "MadarError";
    this.status = status;
    this.type = type;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 403) {
    let data = {};
    try { data = await res.json(); } catch {}
    throw new MadarError(
      data.message || data.detail || "This feature requires a higher subscription tier.",
      403, "tier", data
    );
  }

  if (res.status >= 500) {
    throw new MadarError("A server error occurred. Please try again in a moment.", res.status, "server");
  }

  if (!res.ok) {
    let data = {};
    try { data = await res.json(); } catch {}
    throw new MadarError(
      data.message || data.detail || data.error || "Request failed.",
      res.status, "error", data
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

export const madarApi = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body, customHeaders) =>
    request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, headers: customHeaders }),
  put: (path, body) =>
    request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: "DELETE" }),

  // Properties
  getProperties: () => request("/properties"),
  getProperty: (id) => request(`/properties/${id}`),
  previewProperty: (url) => request("/properties/preview", { method: "POST", body: JSON.stringify({ url }) }),
  createProperty: (data) => request("/properties", { method: "POST", body: JSON.stringify(data) }),
  addPlatformUrl: (propertyId, url) =>
    request(`/properties/${propertyId}/platforms`, { method: "POST", body: JSON.stringify({ url }) }),

  // Briefs
  getLatestBriefs: () => request("/briefs/latest"),
  getPropertyBriefs: (propertyId) => request(`/briefs/${propertyId}`),

  // Opportunities
  getOpportunities: () => request("/opportunities/"),

  // Competitors
  getCompetitors: (propertyId) => request(`/competitors/${propertyId}`),

  // Market
  getMarket: (city) => request(`/market/${encodeURIComponent(city)}`),

  // AI Assistant
  askAI: (message) => request("/ai/ask", { method: "POST", body: JSON.stringify({ message }) }),
};

export default madarApi;