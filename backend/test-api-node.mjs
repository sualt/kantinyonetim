const base = 'http://localhost:10000/api';

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body));
  return body;
}

async function main() {
  const login = await jsonFetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'kantin123' }),
  });
  const token = login.token;
  console.log('TOKEN:', token);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const products = await jsonFetch(`${base}/urunler`, { headers });
  const allProducts = Object.values(products).flat();
  const existingProduct = allProducts.find((p) => p.stock > 0);
  if (!existingProduct) throw new Error('Stoklu ürün bulunamadı');
  console.log('EXISTING PRODUCT:', existingProduct.id, existingProduct.name, existingProduct.price, existingProduct.stock);

  const personName = `TestNode${Date.now()}`;
  const newPerson = await jsonFetch(`${base}/kisiler`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: personName }),
  });
  console.log('NEW PERSON:', newPerson);

  const updatedPerson = await jsonFetch(`${base}/kisiler/${newPerson.id}/balance`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ amount: 50 }),
  });
  console.log('UPDATED BALANCE:', updatedPerson.balance);

  const sale = await jsonFetch(`${base}/islemler`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ personId: newPerson.id, paid: false, items: [{ productId: existingProduct.id, quantity: 1 }] }),
  });
  console.log('SALE RESPONSE:', sale);

  const personsAfterSale = await jsonFetch(`${base}/kisiler`, { headers });
  const buyer = personsAfterSale.find((p) => p.id === newPerson.id);
  console.log('BALANCE AFTER SALE:', buyer.balance);

  const productsAfterSale = await jsonFetch(`${base}/urunler`, { headers });
  const updatedStockProduct = Object.values(productsAfterSale).flat().find((p) => p.id === existingProduct.id);
  console.log('STOCK AFTER SALE:', updatedStockProduct.stock);

  const saleId = Array.isArray(sale) ? sale[0].id : sale.id;
  const toggled = await jsonFetch(`${base}/islemler/${saleId}/payment`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ paid: false }),
  });
  console.log('PAYMENT TOGGLED:', toggled);

  const personsAfterCancel = await jsonFetch(`${base}/kisiler`, { headers });
  const buyerAfterCancel = personsAfterCancel.find((p) => p.id === newPerson.id);
  console.log('BALANCE AFTER CANCEL:', buyerAfterCancel.balance);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});