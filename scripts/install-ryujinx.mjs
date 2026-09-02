import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream/promises';

console.log('====================================================');
console.log('🚀 TÉLÉCHARGEMENT & INSTALLATION DE RYUJINX');
console.log('====================================================\n');

const downloadUrl = 'https://git.ryujinx.app/projects/Ryubing/releases/download/1.3.3/ryujinx-1.3.3-win_x64.zip';
const tempZip = path.resolve('ryujinx_133.zip');
const targetDir = path.resolve('emulators', 'Ryujinx');
const distTargetDir = path.resolve('dist-portable', 'emulators', 'Ryujinx');

mkdirSync(targetDir, { recursive: true });
mkdirSync(distTargetDir, { recursive: true });

async function downloadDirect(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, async (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      try {
        await pipeline(res, createWriteStream(dest));
        resolve();
      } catch (err) {
        reject(err);
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log(`⬇️ Téléchargement de Ryujinx 1.3.3...`);
  await downloadDirect(downloadUrl, tempZip);
  console.log('📂 Extraction de Ryujinx dans emulators/Ryujinx/ ...');
  execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${targetDir}' -Force"`, { stdio: 'inherit' });
  console.log('📋 Synchronisation dans dist-portable/emulators/Ryujinx/ ...');
  execSync(`powershell -Command "Copy-Item -Path 'emulators/Ryujinx/*' -Destination '${distTargetDir}' -Recurse -Force"`, { stdio: 'ignore' });
  execSync(`powershell -Command "Remove-Item -Path '${tempZip}' -Force"`, { stdio: 'ignore' });
  console.log('\n====================================================');
  console.log('🎉 RYUJINX 1.3.3 INSTALLÉ AVEC SUCCÈS !');
  console.log('====================================================\n');
}

main().catch(console.error);
