const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Tüm ürünleri kategoriye göre gruplayarak döndür
router.get('/', (req, res) => {
  console.log('GET /api/urunler called');
  const db = getDb();
  const products = db.prepare('SELECT id, category, name, price FROM products ORDER BY category, name').all();
  console.log('Products from DB:', products.length);

  const grouped = {};
  for (const product of products) {
    if (!grouped[product.category]) {
      grouped[product.category] = [];
    }
    grouped[product.category].push({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  }

  console.log('Grouped response keys:', Object.keys(grouped));
  console.log('First category items:', grouped[Object.keys(grouped)[0]]);
  res.json(grouped);
});

// Ürün güncelle
router.patch('/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId) {
    return res.status(400).json({ error: 'Geçerli ürün kimliği giriniz' });
  }

  const { price, name, category } = req.body || {};
  const updates = [];
  const values = [];

  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Geçerli bir fiyat giriniz' });
    }
    updates.push('price = ?');
    values.push(price);
  }

  if (typeof name === 'string' && name.trim()) {
    updates.push('name = ?');
    values.push(name.trim());
  }

  if (typeof category === 'string' && category.trim()) {
    updates.push('category = ?');
    values.push(category.trim());
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Güncellenecek alan yok' });
  }

  values.push(productId);

  try {
    const db = getDb();
    const result = db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const updated = db.prepare('SELECT id, category, name, price FROM products WHERE id = ?').get(productId);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Bu ürün adı zaten kullanılıyor' });
    }
    res.status(500).json({ error: 'Ürün güncellenirken hata oluştu' });
  }
});

// Ürün ekle
router.post('/', (req, res) => {
  const { category, name, price } = req.body || {};
  
  if (!category || !name || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Kategori, ürün adı ve geçerli bir fiyat giriniz' });
  }

  const db = getDb();
  try {
    const now = new Date().toISOString();
    const result = db.prepare('INSERT INTO products(category, name, price, created_at) VALUES(?, ?, ?, ?)')
      .run(category, name, price, now);
    
    res.status(201).json({
      id: result.lastInsertRowid,
      category,
      name,
      price
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Bu ürün zaten var' });
    }
    res.status(500).json({ error: 'Ürün eklenirken hata oluştu' });
  }
});

// Ürün sil
router.delete('/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId) {
    return res.status(400).json({ error: 'Geçerli ürün kimliği giriniz' });
  }

  const db = getDb();
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Ürün bulunamadı' });
  }

  res.json({ message: 'Ürün silindi' });
});

module.exports = router;