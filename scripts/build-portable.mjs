import { existsSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Démarrage de la création du package KaïroOS Portable...');

const portableDir = path.resolve('dist-portable');
if (existsSync(portableDir)) {
  rmSync(portableDir, { recursive: true, force: true });
}

mkdirSync(portableDir, { recursive: true });
mkdirSync(path.join(portableDir, 'roms'), { recursive: true });
mkdirSync(path.join(portableDir, 'roms', 'Super Mario'), { recursive: true });
mkdirSync(path.join(portableDir, 'roms', 'The Legend of Zelda'), { recursive: true });
mkdirSync(path.join(portableDir, 'emulators'), { recursive: true });
mkdirSync(path.join(portableDir, 'media'), { recursive: true });
mkdirSync(path.join(portableDir, 'kairo_data'), { recursive: true });

// 1. Build Frontend
console.log('📦 1/3 Build du frontend React...');
execSync('npx vite build', { stdio: 'inherit' });

// 2. Build Tauri Host
console.log('🦀 2/3 Compilation du binaire Rust Tauri...');
execSync('cargo build --manifest-path src-tauri/Cargo.toml --release', { stdio: 'inherit' });

// 3. Copier l'exécutable
const releaseExe = path.resolve(
  process.env.CARGO_TARGET_DIR || 'C:/Users/propo/.kairo_target',
  'release',
  'kairo-app.exe'
);

const targetExe = path.join(portableDir, 'KaïroOS.exe');
if (existsSync(releaseExe)) {
  copyFileSync(releaseExe, targetExe);
  console.log(`✅ Exécutable copié: ${targetExe}`);
} else {
  console.warn(`⚠️ Binaire release non trouvé à: ${releaseExe}`);
}

// 4. Créer le README du dossier ROMs
const readmeContent = `# Dossier ROMs & Franchises — KaïroOS Portable

Bienvenue dans votre station d'arcade portable KaïroOS !

## Structure des Dossiers :

1. **Par Console / Système :**
   - \`roms/snes/\` (.sfc, .smc, .zip)
   - \`roms/ps1/\` (.chd, .cue, .iso)
   - \`roms/n64/\` (.z64, .n64)
   - \`roms/switch/\` (.nsp, .xci)
   - \`roms/arcade/\` (.zip)
   - \`roms/windows/\` (.exe, .lnk)

2. **Par Dossier de Franchise Multi-Consoles :**
   Vous pouvez placer des jeux de consoles différentes dans un même dossier de franchise :
   - \`roms/Super Mario/Super Mario World.sfc\` (SNES)
   - \`roms/Super Mario/Super Mario 64.z64\` (N64)
   - \`roms/Super Mario/Super Mario Odyssey.nsp\` (Switch)

3. **Fichiers de Métadonnées et Jaquettes Locales :**
   Pour chaque jeu, vous pouvez placer à côté de la ROM :
   - \`<nom_du_jeu>.json\` (titre, franchise, date, développeur, synopsis, rating)
   - \`<nom_du_jeu>.png\` ou \`<nom_du_jeu>.jpg\` (jaquette frontale)
`;

writeFileSync(path.join(portableDir, 'roms', 'LISEZ-MOI.txt'), readmeContent, 'utf-8');

console.log('\n🎉 Package KaïroOS Portable créé avec succès dans le dossier : dist-portable/\n');
