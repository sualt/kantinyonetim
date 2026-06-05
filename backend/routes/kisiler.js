const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', (req, res) => {
  const db = getDb();
  const persons = db.prepare('SELECT id, name, COALESCE(balance, 0) AS balance, created_at FROM persons ORDER BY name').all();
  res.json(persons);
});

router.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'İsim gerekli' });
  }

  const db = getDb();
  try {
    const result = db.prepare('INSERT INTO persons(name, balance, created_at) VALUES(?, 0, ?)').run(name.trim(), new Date().toISOString());
    const person = db.prepare('SELECT id, name, COALESCE(balance, 0) AS balance, created_at FROM persons WHERE id = ?').get(result.lastInsertRowid);
    res.json(person);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Bu isim zaten mevcut' });
    }
    res.status(500).json({ error: 'Kişi eklenemedi' });
  }
});

router.patch('/:id/balance', (req, res) => {
  const { amount } = req.body || {};
  const id = Number(req.params.id);
  if (!id || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Geçerli miktar gerekli' });
  }

  const db = getDb();
  const result = db.prepare('UPDATE persons SET balance = balance + ? WHERE id = ?').run(amount, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Kişi bulunamadı' });
  }

  const person = db.prepare('SELECT id, name, COALESCE(balance, 0) AS balance, created_at FROM persons WHERE id = ?').get(id);
  res.json(person);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Geçerli kişi kimliği giriniz' });
  }

  const db = getDb();
  const person = db.prepare('SELECT id FROM persons WHERE id = ?').get(id);
  if (!person) {
    return res.status(404).json({ error: 'Kişi bulunamadı' });
  }

  const deleteSales = db.prepare('DELETE FROM sales WHERE person_id = ?').run(id);
  const result = db.prepare('DELETE FROM persons WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(500).json({ error: 'Kişi silinemedi' });
  }

  res.json({ message: 'Kişi silindi', deletedSales: deleteSales.changes });
});

module.exports = router;
