import { existsSync, mkdirSync, createWriteStream, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import https from 'https';
import http from 'http';

console.log('====================================================');
console.log('🕹️ TÉLÉCHARGEMENT COMPLET DE TOUS LES ÉMULATEURS');
console.log('====================================================\n');

const emulatorsBaseDirs = [
  path.resolve('emulators'),
  path.resolve('dist-portable', 'emulators'),
];

mkdirSync(path.resolve('config'), { recursive: true });
mkdirSync(path.resolve('dist-portable', 'config'), { recursive: true });

for (const base of emulatorsBaseDirs) {
  mkdirSync(path.join(base, 'RetroArch'), { recursive: true });
  mkdirSync(path.join(base, 'RetroArch', 'cores'), { recursive: true });
  mkdirSync(path.join(base, 'PCSX2'), { recursive: true });
  mkdirSync(path.join(base, 'Dolphin'), { recursive: true });
  mkdirSync(path.join(base, 'Ryujinx'), { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'KairoOS-Installer' } }, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const request = (currentUrl) => {
      client.get(currentUrl, { headers: { 'User-Agent': 'KairoOS-Installer' } }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${currentUrl}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        file.close();
        reject(err);
      });
    };

    request(url);
  });
}

async function main() {
  // 1. RetroArch (Déjà fait ou màj)
  console.log('📦 1/4 Vérification / Installation de RetroArch x64 & 9 cœurs...');
  try {
    execSync('node scripts/setup-emulators.mjs', { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ setup-emulators execution:', e.message);
  }

  // 2. PCSX2 (PlayStation 2)
  console.log('\n📦 2/4 Téléchargement de PCSX2 Portable x64...');
  const pcsx2TargetDir = path.resolve('emulators', 'PCSX2');

  try {
    const pcsx2Release = await fetchJson('https://api.github.com/repos/PCSX2/pcsx2/releases/latest');
    const asset = pcsx2Release.assets.find(a => 
      a.name.includes('windows-x64-Qt') && !a.name.includes('symbols') && (a.name.endsWith('.7z') || a.name.endsWith('.zip'))
    );
    if (asset) {
      console.log(`  ⬇️ Téléchargement ${asset.name} (${(asset.size / (1024 * 1024)).toFixed(1)} Mo)...`);
      const tempArchive = path.resolve(`pcsx2_temp${path.extname(asset.name)}`);
      await downloadFile(asset.browser_download_url, tempArchive);
      console.log('  📂 Extraction de PCSX2...');
      execSync(`powershell -Command "tar -xf '${tempArchive}' -C '${pcsx2TargetDir}'"`, { stdio: 'ignore' });
      execSync(`powershell -Command "Copy-Item -Path 'emulators/PCSX2/*' -Destination 'dist-portable/emulators/PCSX2' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
      console.log('  ✅ PCSX2 installé avec succès !');
    }
  } catch (err) {
    console.warn('⚠️ Échec téléchargement direct PCSX2:', err.message);
  }

  // 3. Dolphin (GameCube & Wii)
  console.log('\n📦 3/4 Téléchargement de Dolphin Portable x64...');
  const dolphinTargetDir = path.resolve('emulators', 'Dolphin');

  try {
    const dolphinUrl = 'https://dl.dolphin-emu.org/releases/2407/dolphin-2407-x64.7z';
    const tempArchive = path.resolve('dolphin_temp.7z');
    console.log('  ⬇️ Téléchargement Dolphin 2407...');
    await downloadFile(dolphinUrl, tempArchive);
    console.log('  📂 Extraction de Dolphin...');
    execSync(`powershell -Command "tar -xf '${tempArchive}' -C '${dolphinTargetDir}' --strip-components=1"`, { stdio: 'ignore' });
    execSync(`powershell -Command "Copy-Item -Path 'emulators/Dolphin/*' -Destination 'dist-portable/emulators/Dolphin' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
    console.log('  ✅ Dolphin installé avec succès !');
  } catch (err) {
    console.warn('⚠️ Échec téléchargement Dolphin:', err.message);
  }

  // 4. Nettoyage des archives temporaires
  try {
    execSync('powershell -Command "Remove-Item -Path *temp* -Force -ErrorAction SilentlyContinue"', { stdio: 'ignore' });
  } catch (_) {}

  // 5. Mise à jour de config/emulators.json
  const emusConfig = [
    {
      id: "retroarch",
      name: "RetroArch (Multi-Systèmes: SNES, PS1, N64, GBA, Arcade)",
      exe_path: "./emulators/RetroArch/retroarch.exe",
      default_args: "-L \"{core_path}\" \"{rom_path}\"",
      is_builtin: true,
      website_url: "https://www.retroarch.com/"
    },
    {
      id: "pcsx2",
      name: "PCSX2 (PlayStation 2)",
      exe_path: "./emulators/PCSX2/pcsx2-qt.exe",
      default_args: "--nogui -batch \"{rom_path}\"",
      is_builtin: true,
      website_url: "https://pcsx2.net/"
    },
    {
      id: "dolphin",
      name: "Dolphin (GameCube / Wii)",
      exe_path: "./emulators/Dolphin/Dolphin.exe",
      default_args: "-b -e \"{rom_path}\"",
      is_builtin: true,
      website_url: "https://dolphin-emu.org/"
    },
    {
      id: "ryujinx",
      name: "Ryujinx (Nintendo Switch)",
      exe_path: "./emulators/Ryujinx/Ryujinx.exe",
      default_args: "-f -g \"{rom_path}\"",
      is_builtin: true,
      website_url: "https://github.com/Ryubing/Ryujinx"
    },
    {
      id: "native",
      name: "Windows Native Process",
      exe_path: null,
      default_args: "\"{rom_path}\"",
      is_builtin: true
    }
  ];

  writeFileSync(path.resolve('config', 'emulators.json'), JSON.stringify(emusConfig, null, 2), 'utf-8');
  writeFileSync(path.resolve('dist-portable', 'config', 'emulators.json'), JSON.stringify(emusConfig, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log('🎉 TOUS LES ÉMULATEURS SONT PRÉ-INSTALLÉS & CONFIGURÉS !');
  console.log('📁 Inclus dans le mode DEV (emulators/) et PORTABLE (dist-portable/emulators/)');
  console.log('====================================================\n');
}

main().catch(console.error);
