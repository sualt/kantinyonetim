const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { findProduct } = require('../data/products');

function formatDateForLike(date) {
  if (!date) {
    return `${new Date().toISOString().slice(0, 10)}%`;
  }
  return `${date.slice(0, 10)}%`;
}

router.get('/', (req, res) => {
  const db = getDb();
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const paid = req.query.paid;
  const personId = req.query.personId;

  const conditions = ['s.created_at LIKE ?'];
  const values = [formatDateForLike(date)];

  if (paid === '1' || paid === '0') {
    conditions.push('s.paid = ?');
    values.push(Number(paid));
  }

  if (personId) {
    conditions.push('s.person_id = ?');
    values.push(Number(personId));
  }

  const whereClause = conditions.join(' AND ');
  const query = `SELECT s.id, s.person_id, p.name AS person_name, s.product, s.quantity, s.paid, s.created_at
    FROM sales s
    JOIN persons p ON p.id = s.person_id
    WHERE ${whereClause}
    ORDER BY s.id DESC`;

  const sales = db.prepare(query).all(...values);
  res.json(sales);
});

router.post('/', (req, res) => {
  const { personId, product, quantity, paid } = req.body || {};
  if (!personId || !product || !quantity) {
    return res.status(400).json({ error: 'Kişi, ürün ve adet gerekli' });
  }

  const db = getDb();
  const person = db.prepare('SELECT id, COALESCE(balance, 0) AS balance FROM persons WHERE id = ?').get(personId);
  if (!person) {
    return res.status(404).json({ error: 'Kişi bulunamadı' });
  }

  const productInfo = findProduct(product);
  const price = productInfo ? productInfo.price : 0;
  const totalCost = price * Number(quantity);

  let actualPaid = paid ? 1 : 0;
  if (person.balance >= totalCost && !paid) {
    db.prepare('UPDATE persons SET balance = balance - ? WHERE id = ?').run(totalCost, personId);
    actualPaid = 1;
  }

  const result = db.prepare('INSERT INTO sales(person_id, product, quantity, paid, created_at) VALUES(?, ?, ?, ?, ?)').run(personId, product.trim(), Number(quantity), actualPaid, new Date().toISOString());

  const sale = db.prepare('SELECT s.id, s.person_id, p.name AS person_name, s.product, s.quantity, s.paid, s.created_at FROM sales s JOIN persons p ON p.id = s.person_id WHERE s.id = ?').get(result.lastInsertRowid);
  res.json(sale);
});

router.patch('/:id/payment', (req, res) => {
  const { paid } = req.body || {};
  const id = Number(req.params.id);
  if (!id || typeof paid !== 'boolean') {
    return res.status(400).json({ error: 'Geçerli ödeme durumu bekleniyor' });
  }

  const db = getDb();
  const result = db.prepare('UPDATE sales SET paid = ? WHERE id = ?').run(paid ? 1 : 0, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'İşlem bulunamadı' });
  }

  const sale = db.prepare('SELECT s.id, s.person_id, p.name AS person_name, s.product, s.quantity, s.paid, s.created_at FROM sales s JOIN persons p ON p.id = s.person_id WHERE s.id = ?').get(id);
  res.json(sale);
});

module.exports = router;
