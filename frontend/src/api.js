import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');

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

  try {
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
  } catch (err) {
    throw {
      error: `Sunucuya bağlanılamadı. ${err?.message || 'Lütfen backend çalışıyor mu kontrol edin.'}`,
      status: 0,
    };
  }
}

// =====================
// PERSONS
// =====================
export const fetchPersons = (token) =>
  fetchJson("/api/kisiler", { token });

export const createPerson = (name, token) =>
  fetchJson("/api/kisiler", {
    method: "POST",
    token,
    body: JSON.stringify({ name }),
  });

// =====================
// SALES
// =====================
export const fetchSales = (token, query = {}) => {
  const params = new URLSearchParams(query).toString();
  return fetchJson(`/api/islemler?${params}`, { token });
};

export const createSale = (data, token) =>
  fetchJson("/api/islemler", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updatePayment = (saleId, paid, token) =>
  fetchJson(`/api/islemler/${saleId}/payment`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ paid }),
  });

export const cancelSale = (saleId, token) =>
  fetchJson(`/api/islemler/${saleId}/cancel`, {
    method: "PATCH",
    token,
  });

// =====================
// REPORT
// =====================
export const fetchReport = (date, type, token) => {
  const params = new URLSearchParams({ date, type }).toString();
  return fetchJson(`/api/rapor?${params}`, { token });
};

export async function exportReport(date, type, token) {
  const params = new URLSearchParams({ date, type }).toString();
  const res = await fetch(`${baseUrl}/api/rapor/export?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = body || { error: 'Sunucu hatası' };
    err.status = res.status;
    throw err;
  }
  const blob = await res.blob();
  return blob;
}

// =====================
// PRODUCTS
// =====================
export const fetchProducts = (token) =>
  fetchJson("/api/urunler", { token });

export const createProduct = (category, name, price, stock, token) =>
  fetchJson("/api/urunler", {
    method: "POST",
    token,
    body: JSON.stringify({ category, name, price, stock }),
  });

export const updateProduct = (productId, data, token) =>
  fetchJson(`/api/urunler/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const deleteProduct = (productId, token) =>
  fetchJson(`/api/urunler/${productId}`, {
    method: "DELETE",
    token,
  });

export const deletePerson = (personId, token) =>
  fetchJson(`/api/kisiler/${personId}`, {
    method: "DELETE",
    token,
  });

export const updateProductPrice = (productId, price, token) =>
  updateProduct(productId, { price }, token);

// =====================
// BALANCE
// =====================
export const updateBalance = (personId, amount, token) =>
  fetchJson(`/api/kisiler/${personId}/balance`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ amount }),
  });