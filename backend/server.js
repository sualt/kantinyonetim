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
app.use(cors());
app.use(express.json());
initDatabase();

app.use('/api/auth', authRoute);
app.use('/api/kisiler', authMiddleware, kisilerRoute);
app.use('/api/islemler', authMiddleware, islemlerRoute);
app.use('/api/rapor', authMiddleware, raporRoute);
app.use('/api/urunler', authMiddleware, urunlerRoute);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Frontend static files'ı serve et
const frontendBuildPath = path.join(__dirname, '../frontend/dist');

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Kantin backend ${port} portunda çalışıyor`);
});
