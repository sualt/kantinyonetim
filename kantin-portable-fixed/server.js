const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');
const authRoute = require('./routes/auth');
const kisilerRoute = require('./routes/kisiler');
const islemlerRoute = require('./routes/islemler');
const raporRoute = require('./routes/rapor');
const urunlerRoute = require('./routes/urunler');
const authMiddleware = require('./middleware/auth');

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
initDatabase();

app.use('/api/auth', authRoute);
app.use('/api/kisiler', authMiddleware, kisilerRoute);
app.use('/api/islemler', authMiddleware, islemlerRoute);
app.use('/api/rapor', authMiddleware, raporRoute);
app.use('/api/urunler', authMiddleware, urunlerRoute);

const fs = require('fs');
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
let frontendBuildPath = null;

const candidatePaths = [
  path.join(basePath, 'frontend', 'dist'),
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, 'dist', 'frontend', 'dist'),
  path.join(__dirname, '../dist', 'frontend', 'dist'),
  path.join(__dirname, '../../dist', 'frontend', 'dist'),
  path.join(process.cwd(), 'frontend', 'dist'),
  path.join(process.cwd(), 'dist', 'frontend', 'dist'),
];

function checkPath(p) {
  if (fs.existsSync(p)) {
    return p;
  }
  return null;
}

for (const candidate of candidatePaths) {
  const found = checkPath(candidate);
  if (found) {
    frontendBuildPath = found;
    break;
  }
}

if (!frontendBuildPath) {
  const searchBases = [__dirname, path.join(__dirname, '..'), path.join(__dirname, '..', '..')];
  for (const base of searchBases) {
    const pathsToCheck = [
      path.join(base, 'frontend', 'dist'),
      path.join(base, 'dist', 'frontend', 'dist'),
    ];
    for (const candidate of pathsToCheck) {
      const found = checkPath(candidate);
      if (found) {
        frontendBuildPath = found;
        break;
      }
    }
    if (frontendBuildPath) break;

    try {
      const entries = fs.readdirSync(base, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const candidate = path.join(base, entry.name, 'frontend', 'dist');
        const found = checkPath(candidate);
        if (found) {
          frontendBuildPath = found;
          break;
        }
      }
    } catch (e) {
      // ignore unreadable directories
    }
    if (frontendBuildPath) break;
  }
}

if (!frontendBuildPath) {
  frontendBuildPath = process.env.FRONTEND_DIST ||
    (process.pkg ? path.join(basePath, 'frontend', 'dist') : path.join(__dirname, '../frontend/dist'));
}

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

const frontendExists = frontendBuildPath && fs.existsSync(frontendBuildPath);
console.log('frontendBuildPath:', frontendBuildPath, 'exists:', frontendExists);

if (frontendExists) {
  app.use(express.static(frontendBuildPath));

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint bulunamadı' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

app.get('/', (req, res) => {
  if (frontendExists) {
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Kantin backend ${port} portunda çalışıyor`);
  openBrowser(url);
});
