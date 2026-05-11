const Database = require('better-sqlite3');
const db = new Database('./kantin.db');
console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
console.log('Products:', db.prepare('SELECT COUNT(*) as count FROM products').get());
db.close();