import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE || "https://kantin-backend-2.onrender.com";

// =====================
// AUTH
// =====================
export function login(username, password) {
  return axios
    .post(`${baseUrl}/api/auth/login`, { username, password })
    .then(res => res.data);
}

// =====================
// GENERIC FETCH WRAPPER
// =====================
async function fetchJson(path, options = {}) {
  const { token, ...rest } = options;
  const headers = { ...(rest.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (rest.body && !(rest.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = body || { error: "Sunucu hatası" };
    error.status = response.status;
    throw error;
  }

  return body;
}

// =====================
// PERSONS
// =====================
export const fetchPersons = (token) =>
  fetchJson("/kisiler", { token });

export const createPerson = (name, token) =>
  fetchJson("/kisiler", {
    method: "POST",
    token,
    body: JSON.stringify({ name }),
  });

// =====================
// SALES
// =====================
export const fetchSales = (token, query = {}) => {
  const params = new URLSearchParams(query).toString();
  return fetchJson(`/islemler?${params}`, { token });
};

export const createSale = (data, token) =>
  fetchJson("/islemler", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updatePayment = (saleId, paid, token) =>
  fetchJson(`/islemler/${saleId}/payment`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ paid }),
  });

// =====================
// REPORT
// =====================
export const fetchReport = (date, type, token) => {
  const params = new URLSearchParams({ date, type }).toString();
  return fetchJson(`/rapor?${params}`, { token });
};

// =====================
// PRODUCTS
// =====================
export const fetchProducts = (token) =>
  fetchJson("/urunler", { token });

export const createProduct = (category, name, price, token) =>
  fetchJson("/urunler", {
    method: "POST",
    token,
    body: JSON.stringify({ category, name, price }),
  });

export const updateProduct = (productId, data, token) =>
  fetchJson(`/urunler/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const deleteProduct = (productId, token) =>
  fetchJson(`/urunler/${productId}`, {
    method: "DELETE",
    token,
  });

export const updateProductPrice = (productId, price, token) =>
  updateProduct(productId, { price }, token);

// =====================
// BALANCE
// =====================
export const updateBalance = (personId, amount, token) =>
  fetchJson(`/kisiler/${personId}/balance`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ amount }),
  });