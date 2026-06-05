(async ()=>{
  const base = 'http://localhost:4000/api';
  const loginRes = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'kantin123' }) });
  const login = await loginRes.json();
  const token = login.token;
  if (!token) {
    console.error('Login failed', login);
    process.exit(1);
  }
  const res = await fetch(`${base}/urunler`, { headers: { Authorization: `Bearer ${token}` } });
  const products = await res.json();
  const flat = Object.values(products).flat();
  const zero = flat.filter(p => p.stock === 0 || p.stock === null || p.stock === undefined);
  console.log('total products:', flat.length);
  console.log('zero-stock products:', zero.length);
  if (zero.length) console.log(zero.map(p => ({ id: p.id, name: p.name, stock: p.stock })));
})();
