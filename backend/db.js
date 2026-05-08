const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'kantin.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    initSchema();
  }
  return db;
}

function initSchema() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL,
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      paid INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(person_id) REFERENCES persons(id)
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `;
  db.exec(sql);

  const personColumns = db.prepare("PRAGMA table_info('persons')").all().map((col) => col.name);
  if (!personColumns.includes('balance')) {
    db.prepare('ALTER TABLE persons ADD COLUMN balance REAL NOT NULL DEFAULT 0').run();
  }

  // Admin user
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) {
    const hashed = bcrypt.hashSync('kantin123', 10);
    db.prepare('INSERT INTO users(username, password) VALUES(?, ?)').run('admin', hashed);
  }

  // Default products - sadece ilk kez
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const defaultProducts = [
      { category: 'Sıcak İçecekler', name: 'Çay', price: 2 },
      { category: 'Sıcak İçecekler', name: 'Kahve', price: 3 },
      { category: 'Sıcak İçecekler', name: 'Sıcak Çikolata', price: 4 },
      { category: 'Sıcak İçecekler', name: 'Bitki Çayı', price: 3 },
      { category: 'Soğuk İçecekler', name: 'Su', price: 1 },
      { category: 'Soğuk İçecekler', name: 'Gazoz', price: 2 },
      { category: 'Soğuk İçecekler', name: 'Meyve Suyu', price: 3 },
      { category: 'Soğuk İçecekler', name: 'Soğuk Çay', price: 2 },
      { category: 'Soğuk İçecekler', name: 'Kola', price: 3 },
      { category: 'Soğuk İçecekler', name: 'Fanta', price: 3 },
      { category: 'Çikolata Türevleri', name: 'Çikolata', price: 2 },
      { category: 'Çikolata Türevleri', name: 'Gofret', price: 2 },
      { category: 'Çikolata Türevleri', name: 'Bisküvi', price: 1 },
      { category: 'Çikolata Türevleri', name: 'Kraker', price: 1 },
      { category: 'Tost Çeşitleri', name: 'Kaşarlı Tost', price: 5 },
      { category: 'Tost Çeşitleri', name: 'Sucuklu Tost', price: 6 },
      { category: 'Tost Çeşitleri', name: 'Karışık Tost', price: 7 },
      { category: 'Tost Çeşitleri', name: 'Vegan Tost', price: 6 },
      { category: 'Sandviç', name: 'Tavuklu Sandviç', price: 8 },
      { category: 'Sandviç', name: 'Köfte Sandviç', price: 9 },
      { category: 'Sandviç', name: 'Ton Balıklı Sandviç', price: 7 },
      { category: 'Sandviç', name: 'Peynirli Sandviç', price: 6 },
      { category: 'Kızartma', name: 'Patates Kızartması', price: 4 },
      { category: 'Kızartma', name: 'Köfte', price: 5 },
      { category: 'Kızartma', name: 'Tavuk Nugget', price: 6 },
      { category: 'Kızartma', name: 'Cips', price: 3 }
    ];
    
    const insertStmt = db.prepare('INSERT INTO products(category, name, price, created_at) VALUES(?, ?, ?, ?)');
    const now = new Date().toISOString();
    for (const product of defaultProducts) {
      insertStmt.run(product.category, product.name, product.price, now);
    }
  }
}

module.exports = { getDb, initDatabase: getDb };
