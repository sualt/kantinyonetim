const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const secret = process.env.JWT_SECRET || 'kantin-local-secret';

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve parola gerekli' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Giriş başarısız' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '8h' });
  res.json({ token, username: user.username });
});

module.exports = router;
