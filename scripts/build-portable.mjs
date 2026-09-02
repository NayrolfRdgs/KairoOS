import { existsSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('====================================================');
console.log('🚀 CRÉATION DU PACKAGE PORTABLE AUTONOME — KAÏROOS');
console.log('====================================================\n');

const portableDir = path.resolve('dist-portable');

// 1. Nettoyage sécurisé sans crash EBUSY
if (existsSync(portableDir)) {
  try {
    // Si Windows Explorer est ouvert, on ne supprime pas le dossier racine mais son contenu
    console.log('🧹 Préparation du dossier dist-portable/ ...');
  } catch (err) {
    console.warn('⚠️ Nettoyage partiel:', err.message);
  }
}

// 2. Création de l'arborescence des dossiers
const dirsToCreate = [
  portableDir,
  path.join(portableDir, 'roms'),
  path.join(portableDir, 'roms', 'snes'),
  path.join(portableDir, 'roms', 'ps1'),
  path.join(portableDir, 'roms', 'ps2'),
  path.join(portableDir, 'roms', 'n64'),
  path.join(portableDir, 'roms', 'switch'),
  path.join(portableDir, 'roms', 'gba'),
  path.join(portableDir, 'roms', 'gamecube'),
  path.join(portableDir, 'roms', 'megadrive'),
  path.join(portableDir, 'roms', 'arcade'),
  path.join(portableDir, 'roms', 'windows'),
  path.join(portableDir, 'roms', 'Super Mario'),
  path.join(portableDir, 'roms', 'The Legend of Zelda'),
  path.join(portableDir, 'roms', 'Pokemon'),
  path.join(portableDir, 'roms', 'Sonic'),
  path.join(portableDir, 'emulators'),
  path.join(portableDir, 'media'),
  path.join(portableDir, 'kairo_data'),
];

for (const dir of dirsToCreate) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// 3. Build & Packaging Tauri Standalone (Frontend React intégré dans le binaire)
console.log('🦀 Build du binaire autonome complet avec assets intégrés (Tauri)...');
execSync('npx tauri build --no-bundle', { stdio: 'inherit' });

// 4. Copie de l'exécutable autonome
const releaseExe = path.resolve(
  process.env.CARGO_TARGET_DIR || 'C:/Users/propo/.kairo_target',
  'release',
  'kairo-app.exe'
);

const targetExe = path.join(portableDir, 'KaïroOS.exe');
if (existsSync(releaseExe)) {
  copyFileSync(releaseExe, targetExe);
  console.log(`\n✅ Exécutable généré avec succès : ${targetExe}`);
} else {
  console.error(`❌ Erreur : Impossible de trouver ${releaseExe}`);
  process.exit(1);
}

// 6. Génération des fichiers explicatifs complets

// A. Guide Principal (Racine)
const rootReadme = `================================================================================
                    KAÏROOS — STATION D'ARCADE PORTABLE SOUS WINDOWS
================================================================================

Bienvenue dans votre version portable autonome de KaïroOS !
Cette version est 100% autonome et ne nécessite aucune installation.
Vous pouvez copier l'intégralité de ce dossier sur une CLÉ USB, un DISQUE DUR
EXTERNE ou n'importe quel dossier de votre PC et y jouer directement.

--------------------------------------------------------------------------------
1. COMMENT LANCER LE LOGICIEL ?
--------------------------------------------------------------------------------
Double-cliquez simplement sur :
👉  KaïroOS.exe

L'interface se lancera instantanément en mode plein écran ou fenêtré.

--------------------------------------------------------------------------------
2. CONTRÔLES & NAVIGATION (MANETTE / CLAVIER / SOURIS)
--------------------------------------------------------------------------------
KaïroOS est pensé pour être navigable aussi bien au Joystick / Manette qu'au
Clavier et à la Souris :

🎮 MANETTE (XBOX / PLAYSTATION / JOYSTICK ARCADE) :
  - Croix / Stick : Déplacer la sélection
  - Bouton A / Croix : Lancer le jeu sélectionné / Confirmer
  - Bouton B / Rond : Retour / Fermer la fenêtre
  - Bouton Y / Triangle : Ajouter ou retirer des Favoris (⭐)
  - Bouton X / Carré : Ouvrir la fiche détaillée du jeu
  - Bouton Menu (Start) : Ouvrir les Paramètres & Options de la borne

⌨️ CLAVIER :
  - Flèches ou Z / Q / S / D : Naviguer
  - Entrée : Lancer le jeu
  - Échap : Fermer les fenêtres / modales
  - F11 : Basculer entre Plein Écran et Mode Fenêtré
  - Ctrl+F : Rechercher un jeu par mot-clé

🖱️ SOURIS :
  - Clic simple : Sélectionner un jeu et voir sa fiche
  - Double-clic : Lancer le jeu immédiatement
  - Clic sur l'étoile : Basculer en Favori

--------------------------------------------------------------------------------
3. ORGANISATION DES DOSSIERS (CE QUE VOUS POUVEZ MODIFIER)
--------------------------------------------------------------------------------
📁 roms/        -> Déposez ici tous vos jeux (par console ou par franchise).
📁 emulators/   -> Déposez ici vos émulateurs (RetroArch, PCSX2, Ryujinx...).
📁 media/       -> Jaquettes, captures et logos personnalisés.
📁 kairo_data/  -> Base de données interne, favoris, temps de jeux et réglages.

Chaque sous-dossier contient un fichier "LISEZ-MOI.txt" avec des instructions
détaillées.

Bon jeu sur KaïroOS !
`;
writeFileSync(path.join(portableDir, 'LISEZ-MOI - DEMARRAGE RAPIDE.txt'), rootReadme, 'utf-8');

// B. Guide ROMs & Franchises
const romsReadme = `================================================================================
                    GUIDE DU DOSSIER ROMS & FRANCHISES
================================================================================

Ce dossier est l'endroit où vous devez déposer vos fichiers de jeux (ROMs).

--------------------------------------------------------------------------------
1. ORGANISATION PAR CONSOLE (MÉTHODE CLASSIQUE)
--------------------------------------------------------------------------------
Vous pouvez classer vos jeux dans les sous-dossiers correspondant à chaque système :

  • roms/snes/        -> Super Nintendo (.sfc, .smc, .zip)
  • roms/ps1/         -> Sony PlayStation (.chd, .cue, .iso, .pbp)
  • roms/ps2/         -> Sony PlayStation 2 (.iso, .chd, .bin)
  • roms/n64/         -> Nintendo 64 (.z64, .n64, .v64)
  • roms/switch/      -> Nintendo Switch (.nsp, .xci)
  • roms/gba/         -> Game Boy Advance (.gba, .zip)
  • roms/gamecube/    -> Nintendo GameCube (.iso, .rvz, .gcz)
  • roms/megadrive/   -> Sega Mega Drive (.md, .gen, .bin)
  • roms/arcade/      -> Arcade FBNeo / MAME (.zip, .7z)
  • roms/windows/     -> Jeux PC natifs (.exe, .lnk, .url)

--------------------------------------------------------------------------------
2. ORGANISATION PAR DOSSIER DE FRANCHISE (MULTI-CONSOLES)
--------------------------------------------------------------------------------
KaïroOS vous permet de regrouper des jeux de consoles DIFFÉRENTES dans un même
dossier portant le nom d'une saga ! Par exemple :

📁 roms/Super Mario/
   ├── Super Mario World.sfc          (Jeu Super Nintendo)
   ├── Super Mario 64.z64             (Jeu Nintendo 64)
   ├── Super Mario Sunshine.rvz       (Jeu GameCube)
   └── Super Mario Odyssey.nsp        (Jeu Nintendo Switch)

Le scanner de KaïroOS détecte automatiquement la console associée à chaque jeu
grâce à son extension (.sfc -> SNES, .z64 -> N64, .nsp -> Switch).

--------------------------------------------------------------------------------
3. MÉTADONNÉES LOCALES & JAQUETTES ADJACENTES
--------------------------------------------------------------------------------
Pour que votre bibliothèque soit 100% portable et ne dépende d'aucune connexion,
vous pouvez placer à côté de votre ROM :
  1. Un fichier image : "NomDuJeu.png" ou "NomDuJeu.jpg" (sera affiché comme jaquette).
  2. Un fichier JSON : "NomDuJeu.json" contenant les informations du jeu.

Consultez le fichier "exemple_metadata_jeu.json" situé dans ce dossier pour voir
tous les champs personnalisables (titre, date, développeur, note, histoire...).
`;
writeFileSync(path.join(portableDir, 'roms', 'LISEZ-MOI - ROMS ET FRANCHISES.txt'), romsReadme, 'utf-8');

// C. Exemple JSON Métadonnées
const exampleJson = {
  title: "Super Mario World (Édition Complète)",
  franchise: "Super Mario",
  system_id: "snes",
  release_date: "1990-11-21",
  developer: "Nintendo EAD",
  publisher: "Nintendo",
  genre: "Plateforme 2D",
  players: 2,
  rating: 4.9,
  synopsis: "Mario, Luigi et Yoshi explorent Dinosaur Land pour délivrer la princesse Peach des griffes de Bowser et de ses Koopalings.",
  cover_file: "Super Mario World.png"
};
writeFileSync(path.join(portableDir, 'roms', 'exemple_metadata_jeu.json'), JSON.stringify(exampleJson, null, 2), 'utf-8');

// D. Guide Émulateurs
const emuReadme = `================================================================================
                    GUIDE DU DOSSIER EMULATEURS
================================================================================

Ce dossier est prévu pour accueillir vos émulateurs en version portable.

--------------------------------------------------------------------------------
ÉMULATEURS RECOMMANDÉS & STRUCTURE PORTABLE :
--------------------------------------------------------------------------------
1. RetroArch (Multi-Systèmes : SNES, PS1, N64, GBA, Mega Drive, Arcade) :
   - Placez le dossier RetroArch dans : emulators/RetroArch/
   - Exécutable : emulators/RetroArch/retroarch.exe

2. PCSX2 (PlayStation 2) :
   - Placez l'émulateur dans : emulators/PCSX2/
   - Exécutable : emulators/PCSX2/pcsx2-qt.exe

3. Ryujinx / Ryubing (Nintendo Switch) :
   - Placez l'émulateur dans : emulators/Ryujinx/
   - Exécutable : emulators/Ryujinx/Ryujinx.exe

4. Dolphin (GameCube & Wii) :
   - Placez l'émulateur dans : emulators/Dolphin/
   - Exécutable : emulators/Dolphin/Dolphin.exe

5. RPCS3 (PlayStation 3) :
   - Placez l'émulateur dans : emulators/RPCS3/
   - Exécutable : emulators/RPCS3/rpcs3.exe

--------------------------------------------------------------------------------
CONFIGURATION PERSONNALISÉE :
--------------------------------------------------------------------------------
Dans l'interface KaïroOS, vous pouvez à tout moment modifier le chemin de
n'importe quel émulateur ou définir des arguments CLI personnalisés directement
depuis la fiche de chaque jeu.
`;
writeFileSync(path.join(portableDir, 'emulators', 'LISEZ-MOI - EMULATEURS.txt'), emuReadme, 'utf-8');

// E. Guide Médias & Jaquettes
const mediaReadme = `================================================================================
                    GUIDE DU DOSSIER MÉDIAS & JAQUETTES
================================================================================

Ce dossier vous permet de stocker des jaquettes, fonds d'écran et logos.

--------------------------------------------------------------------------------
RÈGLES DE NOMMAGE & FORMATS SUPPORTÉS :
--------------------------------------------------------------------------------
• Formats acceptés : .PNG, .JPG, .JPEG, .WEBP
• Ratio recommandé pour les jaquettes : 3:4 (ex: 600 x 800 px ou 900 x 1200 px)
• Nommage : Donnez exactement le même nom à l'image qu'à votre fichier de ROM.

Exemple :
  - ROM : roms/snes/Super Mario World.sfc
  - Jaquette : roms/snes/Super Mario World.png
    (ou placée dans media/covers/Super Mario World.png)
`;
writeFileSync(path.join(portableDir, 'media', 'LISEZ-MOI - JAQUETTES ET MEDIAS.txt'), mediaReadme, 'utf-8');

// F. Guide Sauvegardes & Données
const dataReadme = `================================================================================
                    GUIDE DES DONNÉES & SAUVEGARDES (KAIRO_DATA)
================================================================================

Ce dossier contient les fichiers internes générés automatiquement par KaïroOS :
• kairo.db : Base de données SQLite locale contenant l'index des jeux,
  vos favoris (⭐), vos temps de jeu, le nombre de parties et les réglages de la borne.

--------------------------------------------------------------------------------
PORTABILITÉ TOTALE :
--------------------------------------------------------------------------------
Pour transférer votre collection et toutes vos statistiques sur un autre PC ou
une borne d'arcade physique, il vous suffit de copier l'intégralité du dossier
"dist-portable" (ou votre clé USB). Vous retrouverez immédiatement toute votre
configuration sans rien réinstaller !
`;
writeFileSync(path.join(portableDir, 'kairo_data', 'LISEZ-MOI - DONNEES ET SAUVEGARDES.txt'), dataReadme, 'utf-8');

console.log('\n====================================================');
console.log('🎉 PACKAGE KAÏROOS PORTABLE GÉNÉRÉ AVEC SUCCÈS !');
console.log('📁 Emplacement : dist-portable/');
console.log('🎮 Exécutable  : dist-portable/KaïroOS.exe');
console.log('📝 Guides inclus dans chaque sous-dossier.');
console.log('====================================================\n');
