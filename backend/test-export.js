(async ()=>{
  const base='http://localhost:4000/api';
  const loginRes = await fetch(`${base}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username:'admin', password:'kantin123' }) });
  const login = await loginRes.json();
  const token = login.token;
  const headers = { Authorization: `Bearer ${token}` };
  const date = new Date().toISOString().slice(0,10);
  const res = await fetch(`${base}/rapor/export?date=${date}&type=daily`, { headers });
  if (!res.ok) { console.error('Export failed', res.status); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = 'D:/kantin/backend/report-test.csv';
  require('fs').writeFileSync(out, buf);
  console.log('Saved to', out);
})();
