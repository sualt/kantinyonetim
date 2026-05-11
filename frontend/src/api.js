const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

async function fetchJson(path, options = {}) {
  const { token, ...rest } = options;
  const headers = { ...(rest.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (rest.body && !(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body || { error: 'Sunucu hatası' };
    error.status = response.status;
    throw error;
  }
  return body;
}

export function login(username, password) {
  return fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function fetchPersons(token) {
  return fetchJson('/kisiler', { token });
}

export function createPerson(name, token) {
  return fetchJson('/kisiler', {
    method: 'POST',
    token,
    body: JSON.stringify({ name }),
  });
}

export function fetchSales(token, query = {}) {
  const params = new URLSearchParams(query).toString();
  return fetchJson(`/islemler?${params}`, { token });
}

export function createSale(data, token) {
  return fetchJson('/islemler', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updatePayment(saleId, paid, token) {
  return fetchJson(`/islemler/${saleId}/payment`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ paid }),
  });
}

export function fetchReport(date, type, token) {
  const params = new URLSearchParams({ date, type }).toString();
  return fetchJson(`/rapor?${params}`, { token });
}

export function fetchProducts(token) {
  const result = fetchJson('/urunler', { token });
  console.log('fetchProducts result:', result);
  return result;
}

export function createProduct(category, name, price, token) {
  return fetchJson('/urunler', {
    method: 'POST',
    token,
    body: JSON.stringify({ category, name, price }),
  });
}

export function updateProduct(productId, data, token) {
  return fetchJson(`/urunler/${productId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function deleteProduct(productId, token) {
  return fetchJson(`/urunler/${productId}`, {
    method: 'DELETE',
    token,
  });
}

export function updateProductPrice(productId, price, token) {
  return updateProduct(productId, { price }, token);
}

export function updateBalance(personId, amount, token) {
  return fetchJson(`/kisiler/${personId}/balance`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ amount }),
  });
}
