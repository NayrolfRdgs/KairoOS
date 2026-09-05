# 🐛 Guide de Débogage & Dépannage — KaïroOS

Ce guide détaille les outils, emplacements de fichiers et méthodes pour diagnostiquer et corriger rapidement toute anomalie dans **KaïroOS**.

---

## 📂 Emplacements des Fichiers & Journaux (Logs)

KaïroOS sépare rigoureusement les environnements. Vos fichiers de diagnostic se trouvent aux emplacements suivants :

| Environnement | Emplacement Base de Données | Emplacement Configurations | Emplacement Journaux (`logs/`) |
| :--- | :--- | :--- | :--- |
| **Mode Portable** | `builds/portable/kairo_data/kairo.db` | `builds/portable/config/*.json` | `builds/portable/logs/` |
| **Mode Dev & Installé** | `%APPDATA%\kairo-os\kairo.db` | `%APPDATA%\kairo-os\config/*.json` | `%APPDATA%\kairo-os\logs/` |

> [!TIP]
> Dans l'application, vous pouvez ouvrir directement le dossier des journaux en allant dans **Paramètres** → **Avancé & Système** → **Ouvrir le dossier des journaux**.

---

## 🎮 1. Dépannage du Lancement des Émulateurs

Si un jeu refuse de démarrer ou si l'émulateur se ferme immédiatement :

### 1. Activer les journaux d'erreurs (Debug Logs)
- Ouvrez **Paramètres** → **Avancé & Système**.
- Cochez **Journaux d'erreurs (Debug Logs)**.
- Lorsqu'un jeu échoue, un fichier d'horodatage est créé dans `logs/emulator_launch_<date>.log` contenant la commande exacte exécutée et le code de retour du processus.

### 2. Tester manuellement la commande CLI
Pour reproduire le lancement dans un terminal sans passer par l'interface :
```powershell
# Exemple pour un jeu SNES avec RetroArch en mode portable :
.\builds\portable\emulators\retroarch\retroarch.exe -L ".\builds\portable\emulators\cores\snes9x_libretro.dll" ".\builds\portable\roms\snes\MonJeu\MonJeu.sfc" -v
```
Le paramètre `-v` (verbose) affichera directement les bibliothèques ou cores manquants.

### 3. Vérifier la présence des cores LibRetro
Pour RetroArch, les cores doivent être présents dans le dossier `emulators/cores/` :
- SNES : `snes9x_libretro.dll`
- N64 : `mupen64plus_next_libretro.dll`
- PS1 : `mednafen_psx_hw_libretro.dll` ou `swanstation_libretro.dll`
- Arcade : `fbneo_libretro.dll`

---

## 🗄️ 2. Inspection de la Base de Données SQLite

La base de données stocke l'inventaire des jeux, les temps de jeu, les favoris et les paramètres système.

### Pour inspecter `kairo.db` :
1. Téléchargez un visualiseur gratuit tel que **[DB Browser for SQLite](https://sqlitebrowser.org/)**.
2. Ouvrez le fichier `kairo.db` situé dans `%APPDATA%\kairo-os\` (ou `builds/portable/kairo_data/`).
3. Principales tables à consulter :
   - `games` : Liste des jeux détectés, chemins de ROMs, métadonnées et jaquettes.
   - `systems` : Consoles enregistrées et associations d'émulateurs.
   - `app_settings` : Configuration active du frontend.
   - `play_sessions` : Historique des sessions de jeu et durées.

---

## 🖥️ 3. Outils de Développement Web (DevTools F12)

Lors de l'exécution en mode développement (`npm run tauri dev`) :
- Appuyez sur **<kbd>F12</kbd>** ou effectuez un clic droit puis **Inspecter l'élément** pour ouvrir les DevTools Chromium / WebKit.
- **Onglet Console** : Affiche les appels IPC Tauri (`invokeCommand`), les événements gamepad et les erreurs de rendu React.
- **Onglet Réseau (Network)** : Permet de vérifier le chargement des images de jaquettes (`convertFileSrc`) et les requêtes vers l'API ScreenScraper ou le Store GitHub.

---

## 🕹️ 4. Diagnostic Manettes & Sticks Arcade

Si une manette ne répond pas ou a des boutons inversés :

1. **Vérification de la détection Windows** :
   - Tapez `joy.cpl` dans la boîte d'exécution Windows (<kbd>Win</kbd> + <kbd>R</kbd>).
   - Vérifiez que votre manette figure bien dans la liste et que les axes et boutons réagissent.
2. **Configuration dans KaïroOS** :
   - Ouvrez **Paramètres** → **Manettes**.
   - Le sélecteur de joueur (Joueur 1 à 4) affiche en temps réel les manettes connectées.
   - Vous pouvez recalibrer la zone morte (*Deadzone*) pour éviter les dérives de stick (*stick drift*).

---

## ⌨️ 5. Raccourcis Clavier d'Urgence

| Touche | Action | Usage |
| :--- | :--- | :--- |
| **<kbd>Suppr</kbd> / <kbd>Del</kbd>** | **Restauration Thème par Défaut** | À utiliser si un thème expérimental bloque l'écran ou est illisible. |
| **<kbd>F11</kbd>** | **Basculer Plein Écran / Fenêtré** | Utile pour accéder à la barre des tâches ou au terminal en arrière-plan. |
| **<kbd>Échap</kbd>** | **Fermer la fenêtre active / Modal** | Ferme immédiatement toute boîte de dialogue ou menu ouvert. |
