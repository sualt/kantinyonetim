const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

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

  conditions.push('s.cancelled = 0');
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
  const { personId, product, quantity, paid, items } = req.body || {};
  const db = getDb();
  if (!personId || ((!product || !quantity) && (!Array.isArray(items) || items.length === 0))) {
    return res.status(400).json({ error: 'Kişi, ürün ve adet gerekli' });
  }

  const person = db.prepare('SELECT id, COALESCE(balance, 0) AS balance FROM persons WHERE id = ?').get(personId);
  if (!person) {
    return res.status(404).json({ error: 'Kişi bulunamadı' });
  }

  const saleItems = [];

  const resolveItem = (rawItem) => {
    const productId = Number(rawItem.productId || 0);
    const productName = typeof rawItem.product === 'string' ? rawItem.product.trim() : '';
    const quantityValue = Number(rawItem.quantity);
    if ((!productId && !productName) || Number.isNaN(quantityValue) || quantityValue < 1) {
      return null;
    }

    const productRow = productId
      ? db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?').get(productId)
      : db.prepare('SELECT id, name, price, stock FROM products WHERE name = ?').get(productName);

    if (!productRow) {
      return { missing: true, label: productName || productId };
    }

    if (productRow.stock < quantityValue) {
      return { insufficientStock: true, label: productRow.name, available: Number(productRow.stock) };
    }

    return {
      id: productRow.id,
      name: productRow.name,
      price: Number(productRow.price),
      quantity: quantityValue,
    };
  };

  if (Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      const resolved = resolveItem(item);
      if (!resolved) {
        return res.status(400).json({ error: 'Her ürün için geçerli ad ve adet giriniz' });
      }
      if (resolved.missing) {
        return res.status(404).json({ error: `Ürün bulunamadı: ${resolved.label}` });
      }
      if (resolved.insufficientStock) {
        return res.status(400).json({ error: `"${resolved.label}" için yeterli stok yok. Mevcut: ${resolved.available}` });
      }
      saleItems.push(resolved);
    }
  } else {
    const productName = typeof product === 'string' ? product.trim() : '';
    const quantityValue = Number(quantity);
    if (!productName || Number.isNaN(quantityValue) || quantityValue < 1) {
      return res.status(400).json({ error: 'Kişi, ürün ve adet gerekli' });
    }

    const productRow = db.prepare('SELECT id, name, price, stock FROM products WHERE name = ?').get(productName);
    if (!productRow) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    if (productRow.stock < quantityValue) {
      return res.status(400).json({ error: `"${productRow.name}" için yeterli stok yok. Mevcut: ${productRow.stock}` });
    }

    saleItems.push({
      id: productRow.id,
      name: productRow.name,
      price: Number(productRow.price),
      quantity: quantityValue,
    });
  }

  const totalCost = saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paidFlag = Boolean(paid);
  const shouldAutoPay = !paidFlag && person.balance >= totalCost;
  const actualPaid = paidFlag || shouldAutoPay ? 1 : 0;

  // If sale will be marked as paid (either explicitly or auto-pay), ensure sufficient balance
  if (actualPaid && person.balance < totalCost) {
    return res.status(400).json({ error: 'Yeterli bakiye yok' });
  }

  const insertSale = db.prepare('INSERT INTO sales(person_id, product, quantity, paid, created_at, price) VALUES(?, ?, ?, ?, ?, ?)');
  const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
  const updateBalance = db.prepare('UPDATE persons SET balance = balance - ? WHERE id = ?');

  const insertedIds = [];
  const now = new Date().toISOString();

  const createSales = db.transaction((itemsToCreate, deductBalance) => {
    if (deductBalance > 0) {
      updateBalance.run(deductBalance, personId);
    }

    for (const item of itemsToCreate) {
      updateStock.run(item.quantity, item.id);
      const insertResult = insertSale.run(personId, item.name, item.quantity, actualPaid, now, item.price);
      insertedIds.push(insertResult.lastInsertRowid);
    }
  });

  try {
    // Deduct balance when sale is actually paid (either explicit paid or auto-pay)
    createSales(saleItems, actualPaid ? totalCost : 0);
  } catch (err) {
    return res.status(500).json({ error: 'Satış kaydı oluşturulurken hata oluştu' });
  }

  const sales = insertedIds.map((id) => db.prepare('SELECT s.id, s.person_id, p.name AS person_name, s.product, s.price, s.quantity, s.paid, s.created_at FROM sales s JOIN persons p ON p.id = s.person_id WHERE s.id = ?').get(id));

  res.json(sales.length === 1 ? sales[0] : sales);
});

router.patch('/:id/payment', (req, res) => {
  const { paid } = req.body || {};
  const id = Number(req.params.id);
  if (!id || typeof paid !== 'boolean') {
    return res.status(400).json({ error: 'Geçerli ödeme durumu bekleniyor' });
  }

  const db = getDb();
  const sale = db.prepare('SELECT s.id, s.person_id, s.product, s.price, s.quantity, s.paid, s.cancelled FROM sales s WHERE s.id = ?').get(id);
  
  // Check if sale exists and is not cancelled
  if (!sale) {
    return res.status(404).json({ error: 'İşlem bulunamadı' });
  }
  
  if (sale.cancelled) {
    return res.status(400).json({ error: 'İptal edilen bir işlemin ödeme durumu değiştirilemez' });
  }

  // If payment status is not changing, just return the sale
  if ((paid && sale.paid) || (!paid && !sale.paid)) {
    const currentSale = db.prepare('SELECT s.id, s.person_id, p.name AS person_name, s.product, s.quantity, s.paid, s.cancelled, s.created_at FROM sales s JOIN persons p ON p.id = s.person_id WHERE s.id = ?').get(id);
    return res.json(currentSale);
  }

  const person = db.prepare('SELECT id, COALESCE(balance, 0) AS balance FROM persons WHERE id = ?').get(sale.person_id);
  if (!person) {
    return res.status(404).json({ error: 'Kişi bulunamadı' });
  }

  // Use stored sale price if available; otherwise fallback to current product price
  const price = typeof sale.price === 'number' && !Number.isNaN(Number(sale.price)) && sale.price > 0
    ? Number(sale.price)
    : (db.prepare('SELECT price FROM products WHERE name = ?').get(sale.product) || {}).price || 0;
  const totalCost = Number(price) * Number(sale.quantity);

  try {
    // Bakiye güncelle
    if (paid && !sale.paid) {
      // Ödeme işaretleniyor: balance'den çıkar
      if (person.balance < totalCost) {
        return res.status(400).json({ error: `Yeterli bakiye yok. Gerekli: ${totalCost.toFixed(2)} TL, Mevcut: ${person.balance.toFixed(2)} TL` });
      }
      db.prepare('UPDATE persons SET balance = balance - ? WHERE id = ?').run(totalCost, sale.person_id);
    } else if (!paid && sale.paid) {
      // Ödeme iptal ediliyor: balance'ye ekle
      db.prepare('UPDATE persons SET balance = balance + ? WHERE id = ?').run(totalCost, sale.person_id);
      // İade durumunda ürün stoğunu geri ekle
      db.prepare('UPDATE products SET stock = stock + ? WHERE name = ?').run(Number(sale.quantity), sale.product);
    }

    db.prepare('UPDATE sales SET paid = ? WHERE id = ?').run(paid ? 1 : 0, id);

    const updatedSale = db.prepare('SELECT s.id, s.person_id, p.name AS person_name, s.product, s.quantity, s.paid, s.cancelled, s.created_at FROM sales s JOIN persons p ON p.id = s.person_id WHERE s.id = ?').get(id);
    res.json(updatedSale);
  } catch (err) {
    return res.status(500).json({ error: 'Ödeme durumu güncellenirken hata oluştu' });
  }
});

router.patch('/:id/cancel', (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Geçerli sipariş ID bekleniyor' });
  }

  const db = getDb();
  const sale = db.prepare('SELECT s.id, s.person_id, s.product, s.price, s.quantity, s.paid, s.cancelled FROM sales s WHERE s.id = ?').get(id);
  if (!sale) {
    return res.status(404).json({ error: 'İşlem bulunamadı' });
  }
  
  if (sale.cancelled) {
    return res.status(400).json({ error: 'Bu işlem zaten iptal edilmiş' });
  }

  // Verify product exists for stock restoration
  const product = db.prepare('SELECT id, name, stock FROM products WHERE name = ?').get(sale.product);
  if (!product) {
    return res.status(400).json({ error: `Ürün bulunamadı: ${sale.product}. Stok geri alınamaz.` });
  }

  const price = typeof sale.price === 'number' && !Number.isNaN(Number(sale.price)) && sale.price > 0
    ? Number(sale.price)
    : product.price || 0;
  const totalCost = Number(price) * Number(sale.quantity);

  const restoreStock = db.prepare('UPDATE products SET stock = stock + ? WHERE name = ?');
  const restoreBalance = db.prepare('UPDATE persons SET balance = balance + ? WHERE id = ?');
  const markCancelled = db.prepare('UPDATE sales SET cancelled = 1, paid = 0 WHERE id = ?');

  const cancelTransaction = db.transaction(() => {
    restoreStock.run(Number(sale.quantity), sale.product);
    if (sale.paid) {
      restoreBalance.run(totalCost, sale.person_id);
    }
    markCancelled.run(id);
  });

  try {
    cancelTransaction();
  } catch (err) {
    console.error('Cancel transaction error:', err);
    return res.status(500).json({ error: 'Sipariş iptal edilirken hata oluştu' });
  }

  const cancelledSale = db.prepare('SELECT s.id, s.person_id, p.name AS person_name, s.product, s.quantity, s.paid, s.cancelled, s.created_at FROM sales s JOIN persons p ON p.id = s.person_id WHERE s.id = ?').get(id);
  res.json(cancelledSale);
});

module.exports = router;
