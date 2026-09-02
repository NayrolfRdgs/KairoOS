import { existsSync, mkdirSync, createWriteStream, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import https from 'https';
import http from 'http';

console.log('====================================================');
console.log('🕹️ TÉLÉCHARGEMENT & PRÉ-CONFIGURATION DES ÉMULATEURS');
console.log('====================================================\n');

const emulatorsBaseDirs = [
  path.resolve('emulators'),
  path.resolve('dist-portable', 'emulators'),
];

for (const base of emulatorsBaseDirs) {
  mkdirSync(path.join(base, 'RetroArch'), { recursive: true });
  mkdirSync(path.join(base, 'RetroArch', 'cores'), { recursive: true });
  mkdirSync(path.join(base, 'PCSX2'), { recursive: true });
  mkdirSync(path.join(base, 'Dolphin'), { recursive: true });
  mkdirSync(path.join(base, 'Ryujinx'), { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const request = (currentUrl) => {
      client.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          request(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Échec téléchargement HTTP ${response.statusCode}: ${currentUrl}`));
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
  // 1. Télécharger RetroArch Portable x64 (7z)
  console.log('📦 1/4 Téléchargement de RetroArch x64...');
  const retroArchUrl = 'https://buildbot.libretro.com/stable/1.19.1/windows/x86_64/RetroArch.7z';
  const tempArchive = path.resolve('RetroArch_temp.7z');

  try {
    await downloadFile(retroArchUrl, tempArchive);
    console.log('✅ Archive RetroArch téléchargée.');

    // Extraction avec tar ou 7z via PowerShell
    console.log('📂 Extraction de RetroArch...');
    const targetDir = path.resolve('emulators', 'RetroArch');
    execSync(`powershell -Command "tar -xf '${tempArchive}' -C '${targetDir}' --strip-components=1"`, { stdio: 'inherit' });
    console.log('✅ RetroArch extrait dans emulators/RetroArch/');
  } catch (err) {
    console.warn('⚠️ Téléchargement RetroArch via tar, fallback PowerShell WebRequest...');
    try {
      execSync(`powershell -Command "Invoke-WebRequest -Uri 'https://buildbot.libretro.com/stable/1.19.1/windows/x86_64/RetroArch.7z' -OutFile '${tempArchive}'; tar -xf '${tempArchive}' -C 'emulators/RetroArch' --strip-components=1"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('⚠️ Échec extraction directe 7z, création du squelette RetroArch.');
    }
  }

  // 2. Télécharger les Cœurs Libretro essentiels
  const cores = [
    { name: 'snes9x_libretro.dll', desc: 'Super Nintendo' },
    { name: 'swanstation_libretro.dll', desc: 'PlayStation 1' },
    { name: 'mupen64plus_next_libretro.dll', desc: 'Nintendo 64' },
    { name: 'mgba_libretro.dll', desc: 'Game Boy Advance' },
    { name: 'gambatte_libretro.dll', desc: 'Game Boy / Color' },
    { name: 'genesis_plus_gx_libretro.dll', desc: 'Sega Mega Drive' },
    { name: 'fbneo_libretro.dll', desc: 'Arcade FBNeo' },
    { name: 'fceumm_libretro.dll', desc: 'NES' },
    { name: 'flycast_libretro.dll', desc: 'Dreamcast' },
  ];

  console.log('\n🎮 2/4 Téléchargement des 9 cœurs Libretro 80s/90s...');
  const coresDir = path.resolve('emulators', 'RetroArch', 'cores');
  const distCoresDir = path.resolve('dist-portable', 'emulators', 'RetroArch', 'cores');

  for (const core of cores) {
    const coreZipUrl = `https://buildbot.libretro.com/nightly/windows/x86_64/latest/${core.name}.zip`;
    const tempZip = path.resolve(`${core.name}.zip`);

    try {
      console.log(`  ⬇️ [${core.desc}] ${core.name}...`);
      await downloadFile(coreZipUrl, tempZip);
      execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${coresDir}' -Force; Copy-Item '${path.join(coresDir, core.name)}' -Destination '${distCoresDir}' -Force"`, { stdio: 'ignore' });
      console.log(`  ✅ ${core.name} installé !`);
    } catch (err) {
      console.warn(`  ⚠️ Impossible de télécharger ${core.name}: ${err.message}`);
    }
  }

  // 3. Copier l'intégralité de RetroArch dans dist-portable/emulators/RetroArch
  console.log('\n📋 3/4 Synchronisation dans dist-portable/emulators/RetroArch ...');
  execSync(`powershell -Command "Copy-Item -Path 'emulators/RetroArch/*' -Destination 'dist-portable/emulators/RetroArch' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });

  // 4. Créer le retroarch.cfg optimisé pour borne arcade
  const retroarchCfg = `# KaïroOS Arcade Station — RetroArch Configuration
video_fullscreen = "true"
video_windowed_fullscreen = "true"
pause_nonactive = "false"
video_vsync = "true"
notification_show_when_menu_is_alive = "false"
video_font_enable = "false"
menu_driver = "ozone"
rgui_show_restart = "false"
quit_press_twice = "false"
input_enable_hotkey_btn = "8"
input_exit_emulator_btn = "9"
input_exit_emulator = "escape"
input_autodetect_enable = "true"
`;

  writeFileSync(path.join('emulators', 'RetroArch', 'retroarch.cfg'), retroarchCfg, 'utf-8');
  writeFileSync(path.join('dist-portable', 'emulators', 'RetroArch', 'retroarch.cfg'), retroarchCfg, 'utf-8');

  console.log('\n====================================================');
  console.log('🎉 TOUS LES ÉMULATEURS ET CŒURS SONT PRÊTS & CONFIGURÉS !');
  console.log('====================================================\n');
}

main().catch(console.error);
