const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', (req, res) => {
  const db = getDb();
  const type = req.query.type || 'daily';
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  let dateLike;
  if (type === 'monthly') {
    // YYYY-MM format for monthly
    dateLike = `${date.slice(0, 7)}%`;
  } else {
    // YYYY-MM-DD format for daily
    dateLike = `${date.slice(0, 10)}%`;
  }

  const rows = db.prepare(`
    SELECT s.id, s.person_id, p.name AS person_name, s.product, s.price, s.quantity, s.paid, s.created_at
    FROM sales s
    JOIN persons p ON p.id = s.person_id
    WHERE s.created_at LIKE ?
    ORDER BY p.name, s.id DESC
  `).all(dateLike);

  const totals = db.prepare(`
    SELECT
      COUNT(*) AS totalSales,
      COALESCE(SUM(quantity), 0) AS totalQuantity,
      COALESCE(SUM(paid), 0) AS paidCount,
      COALESCE(SUM(CASE WHEN paid = 0 THEN 1 ELSE 0 END), 0) AS unpaidCount
    FROM sales
    WHERE created_at LIKE ?
  `).get(dateLike);

  const byPerson = db.prepare(`
    SELECT
      p.id,
      p.name,
      COALESCE(SUM(s.quantity), 0) AS totalQuantity,
      COALESCE(SUM(s.paid), 0) AS paidCount,
      COALESCE(SUM(CASE WHEN s.paid = 0 THEN 1 ELSE 0 END), 0) AS unpaidCount
    FROM sales s
    JOIN persons p ON p.id = s.person_id
    WHERE s.created_at LIKE ?
    GROUP BY p.id
    ORDER BY p.name
  `).all(dateLike);

  res.json({ type, date: type === 'monthly' ? date.slice(0, 7) : date.slice(0, 10), totals, byPerson, rows });
});

router.get('/export', (req, res) => {
  const db = getDb();
  const type = req.query.type || 'daily';
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const dateLike = type === 'monthly' ? `${date.slice(0,7)}%` : `${date.slice(0,10)}%`;

  const rows = db.prepare(`
    SELECT s.id, s.person_id, p.name AS person_name, s.product, s.price, s.quantity, s.paid, s.created_at
    FROM sales s
    JOIN persons p ON p.id = s.person_id
    WHERE s.created_at LIKE ?
    ORDER BY p.name, s.id DESC
  `).all(dateLike);

  // Build CSV
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('\"') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const header = ['id','person_id','person_name','product','price','quantity','paid','created_at','total'];
  const lines = [header.join(',')];
  for (const r of rows) {
    const total = (Number(r.price) || 0) * Number(r.quantity || 0);
    const vals = [r.id, r.person_id, r.person_name, r.product, r.price, r.quantity, r.paid, r.created_at, total].map(escape);
    lines.push(vals.join(','));
  }

  const filename = `report-${type}-${(type==='monthly'?date.slice(0,7):date.slice(0,10))}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(lines.join('\n'));
});

module.exports = router;
