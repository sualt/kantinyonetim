(async ()=>{
  const base = 'http://localhost:4000/api';
  const loginRes = await fetch(`${base}/auth/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: 'admin', password: 'kantin123' }) });
  const login = await loginRes.json();
  if (!login.token) throw new Error('Login failed');
  const token = login.token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const personRes = await fetch(`${base}/kisiler`, { method: 'POST', headers, body: JSON.stringify({ name: 'TestNode_'+Date.now() }) });
  const person = await personRes.json();
  console.log('Created person:', person.id, person.name);

  await fetch(`${base}/kisiler/${person.id}/balance`, { method: 'PATCH', headers, body: JSON.stringify({ amount: 100 }) });
  console.log('Balance set to 100');

  const prodsRes = await fetch(`${base}/urunler`, { headers });
  const products = await prodsRes.json();
  const flat = Object.values(products).flat();
  const prod = flat.find(p=>p.stock>0);
  if (!prod) throw new Error('No product with stock>0');
  console.log('Using product:', prod.id, prod.name, 'stock:', prod.stock, 'price:', prod.price);

  const saleRes = await fetch(`${base}/islemler`, { method: 'POST', headers, body: JSON.stringify({ personId: person.id, paid: true, items: [{ productId: prod.id, quantity: 1 }] }) });
  const sale = await saleRes.json();
  console.log('Sale response:', sale);

  const personsAfter = await (await fetch(`${base}/kisiler`, { headers })).json();
  const buyer = personsAfter.find(p=>p.id===person.id);
  console.log('Balance after paid sale:', buyer.balance);

  const saleId = Array.isArray(sale) ? sale[0].id : sale.id;
  const toggleRes = await fetch(`${base}/islemler/${saleId}/payment`, { method: 'PATCH', headers, body: JSON.stringify({ paid: false }) });
  const toggled = await toggleRes.json();
  console.log('Toggled payment:', toggled);

  const personsFinal = await (await fetch(`${base}/kisiler`, { headers })).json();
  const buyerFinal = personsFinal.find(p=>p.id===person.id);
  console.log('Balance after cancel:', buyerFinal.balance);

})().catch(err=>{ console.error('ERROR:', err); process.exit(1); });
