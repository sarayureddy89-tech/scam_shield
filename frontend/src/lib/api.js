const BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("scamshield_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  signup: (email, password, name) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  scanMessage: (text, sender) =>
    request("/scan/message", { method: "POST", body: JSON.stringify({ text, sender }) }),
  scanUrl: (url) => request("/scan/url", { method: "POST", body: JSON.stringify({ url }) }),
  scanQr: (payload) => request("/scan/qr", { method: "POST", body: JSON.stringify({ payload }) }),
  scanPayment: (upi_id, amount, note) =>
    request("/scan/payment", { method: "POST", body: JSON.stringify({ upi_id, amount, note }) }),

  history: () => request("/scan/history"),
  getScan: (id) => request(`/scan/${id}`),

  report: (payload) => request("/community/report", { method: "POST", body: JSON.stringify(payload) }),
  reports: () => request("/community/reports"),
};
