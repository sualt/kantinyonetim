const fs = require('fs');
const path = require('path');

const portableDir = path.resolve(__dirname, '..', '..', 'dist', 'portable');
const outExe = path.resolve(__dirname, '..', '..', 'dist', 'kantin-single.exe');
const sedPath = path.resolve(__dirname, 'iexpress.sed');

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = walk(full);
      for (const s of sub) files.push(path.relative(portableDir, s));
    } else {
      files.push(path.relative(portableDir, full));
    }
  }
  return files;
}

const files = walk(portableDir);

const sedLines = [];
sedLines.push('[Version]');
sedLines.push('Class=IEXPRESS');
sedLines.push('SEDVersion=3');
sedLines.push('');
sedLines.push('[Options]');
sedLines.push('PackagePurpose=InstallApp');
sedLines.push('ShowInstallProgramWindow=0');
sedLines.push('HideExtractAnimation=1');
sedLines.push('UseLongFileName=1');
sedLines.push('InsideCompressed=0');
sedLines.push('CAB_FixedSize=0');
sedLines.push('RebootMode=NoRestart');
sedLines.push('InstallPrompt=');
sedLines.push('DisplayLicense=');
sedLines.push('FinishMessage=');
sedLines.push(`TargetName=${outExe}`);
sedLines.push('FriendlyName=Kantin Portable');
sedLines.push('AppLaunched=start.bat');
sedLines.push('PostInstallCmd=');
sedLines.push('');
sedLines.push('[Strings]');
sedLines.push('Title=Kantin Portable');
sedLines.push('');
sedLines.push('[SourceFiles]');
sedLines.push(`SourceFiles0=${portableDir}`);
sedLines.push('[SourceFiles0]');

// enumerate files
for (let i = 0; i < files.length; i++) {
  const f = files[i].replace(/\\/g, '\\');
  sedLines.push(`File${i}=${f}`);
}

fs.writeFileSync(sedPath, sedLines.join('\r\n'), 'utf8');
console.log('SED oluşturuldu:', sedPath);
console.log('Çıkış exe:', outExe);
console.log('Dosya sayısı:', files.length);
