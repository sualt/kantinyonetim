const fs = require('fs');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(backendDir, '..');
const distDir = path.join(repoDir, 'dist');
const frontendDist = path.join(repoDir, 'frontend', 'dist');
const dbFile = path.join(backendDir, 'kantin.db');
const targetFrontendDist = path.join(distDir, 'frontend', 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Kaynak klasör bulunamadı: ${src}`);
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

try {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  copyRecursive(frontendDist, targetFrontendDist);
  console.log(`Frontend dosyaları kopyalandı: ${targetFrontendDist}`);

  if (fs.existsSync(dbFile)) {
    fs.copyFileSync(dbFile, path.join(distDir, 'kantin.db'));
    console.log('Veritabanı dosyası kopyalandı: dist/kantin.db');
  } else {
    console.warn('Database dosyası bulunamadı, dist/kantin.db oluşturulamadı. Backend çalıştırmadan önce backend/kantin.db dosyasını dist klasörüne kopylayın.');
  }
} catch (error) {
  console.error('Exe için dosya kopyalanırken hata oluştu:', error.message);
  process.exit(1);
}
