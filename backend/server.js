require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDatabase } = require('./db');

const authRoute = require('./routes/auth');
const kisilerRoute = require('./routes/kisiler');
const islemlerRoute = require('./routes/islemler');
const raporRoute = require('./routes/rapor');
const urunlerRoute = require('./routes/urunler');
const authMiddleware = require('./middleware/auth');

const app = express();

/* =======================
   CORS AYARI
======================= */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173' ,'https://kantinyonetimak.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

/* =======================
   DATABASE
======================= */
initDatabase();

/* =======================
   API ROUTES
======================= */
app.use('/api/auth', authRoute);
app.use('/api/kisiler', authMiddleware, kisilerRoute);
app.use('/api/islemler', authMiddleware, islemlerRoute);
app.use('/api/rapor', authMiddleware, raporRoute);
app.use('/api/urunler', urunlerRoute);

/* =======================
   FRONTEND SERVE (opsiyonel)
======================= */
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
const frontendPath = process.pkg
  ? path.join(basePath, 'frontend', 'dist')
  : path.join(basePath, '..', 'frontend', 'dist');
console.log('process.pkg=', !!process.pkg);
console.log('basePath=', basePath);
console.log('frontendPath=', frontendPath);
console.log('frontend exists=', fs.existsSync(frontendPath));

const openBrowser = (url) => {
  if (process.env.OPEN_BROWSER === 'false') return;
  const { exec } = require('child_process');
  const startCmd = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} "${url}"`, (error) => {
    if (error) {
      console.warn('Tarayıcı açılamadı:', error.message);
    }
  });
};

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API bulunamadı' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Kantin backend çalışıyor: ${PORT}`);
  if (fs.existsSync(frontendPath)) {
    openBrowser(url);
  }
});