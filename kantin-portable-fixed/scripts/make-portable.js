const fs = require('fs');
const path = require('path');
const child = require('child_process');

const repoDir = path.resolve(__dirname, '..', '..');
const backendDir = path.resolve(__dirname, '..');
const distDir = path.join(repoDir, 'dist');
const portableDir = path.join(distDir, 'portable');
const nodeSrc = process.argv[2] || 'C:\\Program Files\\nodejs\\node.exe';

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) throw new Error('Kaynak bulunamadı: ' + src);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

try {
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  if (fs.existsSync(portableDir)) fs.rmSync(portableDir, { recursive: true, force: true });
  fs.mkdirSync(portableDir, { recursive: true });

  // copy node.exe
  const nodeDst = path.join(portableDir, 'node.exe');
  fs.copyFileSync(nodeSrc, nodeDst);
  console.log('node.exe kopyalandı:', nodeDst);

  // copy minimal backend files
  const filesToCopy = ['server.js','db.js','package.json'];
  filesToCopy.forEach(f => fs.copyFileSync(path.join(backendDir, f), path.join(portableDir, f)));
  console.log('Temel backend dosyaları kopyalandı');

  // copy routes, middleware, data, node_modules
  const dirsToCopy = ['routes','middleware','data','node_modules'];
  dirsToCopy.forEach(d => copyRecursive(path.join(backendDir,d), path.join(portableDir,d)));
  console.log('Gerekli klasörler kopyalandı');

  // copy frontend dist and db
  copyRecursive(path.join(distDir,'frontend','dist'), path.join(portableDir,'frontend','dist'));
  if (fs.existsSync(path.join(backendDir,'kantin.db'))) {
    fs.copyFileSync(path.join(backendDir,'kantin.db'), path.join(portableDir,'kantin.db'));
    console.log('Veritabanı kopyalandı');
  }

  // create start script
  const startBat = `@echo off\r\nset NODE_ENV=production\r\nstart "" cmd /c node server.js\r\n`;
  fs.writeFileSync(path.join(portableDir,'start.bat'), startBat);
  console.log('start.bat oluşturuldu');

  console.log('Portable paket hazır:', portableDir);
} catch (e){
  console.error('Hata:', e.message);
  process.exit(1);
}
