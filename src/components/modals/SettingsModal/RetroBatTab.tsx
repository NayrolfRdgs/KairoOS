import React, { useState } from 'react';
import { Eye, EyeOff, Folder, Monitor, Cpu, Globe } from 'lucide-react';

interface RetroBatTabProps {
  retroarchShader: string;
  setRetroarchShader: (val: any) => void;
  aspectRatio: string;
  setAspectRatio: (val: any) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  metadataLanguage: string;
  setMetadataLanguage: (val: any) => void;
  launchResolution: string;
  setLaunchResolution: (val: any) => void;
  forcedFullscreen: string;
  setForcedFullscreen: (val: any) => void;
  autosaveEnabled: boolean;
  setAutosaveEnabled: (val: boolean) => void;
  rewindEnabled: boolean;
  setRewindEnabled: (val: boolean) => void;
  cheatsDir: string;
  setCheatsDir: (val: string) => void;
  savesDir: string;
  setSavesDir: (val: string) => void;
  screenshotsDir: string;
  setScreenshotsDir: (val: string) => void;
  scrapingDelaySeconds: number;
  setScrapingDelaySeconds: (val: number) => void;
  screenscraperSsid: string;
  setScreenscraperSsid: (val: string) => void;
  screenscraperSspassword: string;
  setScreenscraperSspassword: (val: string) => void;
}

export const RetroBatTab: React.FC<RetroBatTabProps> = ({
  retroarchShader,
  setRetroarchShader,
  aspectRatio,
  setAspectRatio,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  metadataLanguage,
  setMetadataLanguage,
  launchResolution,
  setLaunchResolution,
  forcedFullscreen,
  setForcedFullscreen,
  autosaveEnabled,
  setAutosaveEnabled,
  rewindEnabled,
  setRewindEnabled,
  cheatsDir,
  setCheatsDir,
  savesDir,
  setSavesDir,
  screenshotsDir,
  setScreenshotsDir,
  scrapingDelaySeconds,
  setScrapingDelaySeconds,
  screenscraperSsid,
  setScreenscraperSsid,
  screenscraperSspassword,
  setScreenscraperSspassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Shaders & Ratio d'Écran */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Rendu Graphique & Écran (Inspiration RetroBat)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Shaders d'Émulation (RetroArch)
            </label>
            <select
              value={retroarchShader}
              onChange={(e) => setRetroarchShader(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800"
            >
              <option value="none">Aucun (Rendu natif net)</option>
              <option value="scanlines_light">Scanlines légères</option>
              <option value="scanlines_strong">Scanlines fortes (Arcade CRT)</option>
              <option value="crt_curved">CRT courbé rétro (Tube cathodique)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Injecté dynamiquement via --set-shader au lancement.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ratio d'Écran
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800"
            >
              <option value="4:3">4:3 (Ratio authentique rétro)</option>
              <option value="16:9">16:9 (Plein écran étiré)</option>
              <option value="pixel_perfect">Pixel Perfect (1:1)</option>
              <option value="stretch">Étirer pour remplir l'écran</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Format de l'affichage vidéo par défaut.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Résolution de Lancement
            </label>
            <select
              value={launchResolution}
              onChange={(e) => setLaunchResolution(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800"
            >
              <option value="native">Native (Selon l'émulateur)</option>
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="4k">4K Ultra HD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mode Plein Écran Forcé
            </label>
            <select
              value={forcedFullscreen}
              onChange={(e) => setForcedFullscreen(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800"
            >
              <option value="per_game">Selon la configuration du jeu</option>
              <option value="always">Toujours forcer le plein écran (-F)</option>
              <option value="never">Toujours en mode fenêtré</option>
            </select>
          </div>
        </div>

        {/* Sliders Luminosité / Contraste */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-50">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Luminosité Émulateur</span>
              <span className="font-mono text-purple-600">{brightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Contraste Émulateur</span>
              <span className="font-mono text-purple-600">{contrast}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Sauvegarde & Rewind */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Sauvegardes & Rembobinage (Rewind)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Sauvegarde Automatique (Autosave)</div>
              <div className="text-[11px] text-slate-400">Reprendre exactement là où vous vous étiez arrêté</div>
            </div>
            <input
              type="checkbox"
              checked={autosaveEnabled}
              onChange={(e) => setAutosaveEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Rewind (Rembobinage temps réel)</div>
              <div className="text-[11px] text-amber-600 font-medium">Désactivé par défaut (consommation RAM)</div>
            </div>
            <input
              type="checkbox"
              checked={rewindEnabled}
              onChange={(e) => setRewindEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>
        </div>
      </div>

      {/* 3. Dossiers Personnalisés */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Dossiers Custom (Sauvegardes, Captures, Cheats)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier Sauvegardes (Saves)</label>
            <input
              type="text"
              placeholder="Ex: D:/KaïroSaves"
              value={savesDir}
              onChange={(e) => setSavesDir(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-purple-100 font-mono bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier Captures d'Écran</label>
            <input
              type="text"
              placeholder="Ex: D:/KaïroScreens"
              value={screenshotsDir}
              onChange={(e) => setScreenshotsDir(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-purple-100 font-mono bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier Cheats RetroArch</label>
            <input
              type="text"
              placeholder="Ex: D:/KaïroCheats"
              value={cheatsDir}
              onChange={(e) => setCheatsDir(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-purple-100 font-mono bg-purple-50/20"
            />
          </div>
        </div>
      </div>

      {/* 4. Métadonnées & ScreenScraper */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Métadonnées & Compte ScreenScraper
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Langue des Métadonnées</label>
            <select
              value={metadataLanguage}
              onChange={(e) => setMetadataLanguage(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-slate-800"
            >
              <option value="fr">Français (Prioritaire)</option>
              <option value="en">Anglais (Fallback)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Délai scraping (secondes)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={scrapingDelaySeconds}
              onChange={(e) => setScrapingDelaySeconds(parseInt(e.target.value, 10) || 1)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ScreenScraper SSID</label>
            <input
              type="text"
              placeholder="Votre identifiant"
              value={screenscraperSsid}
              onChange={(e) => setScreenscraperSsid(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ScreenScraper Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={screenscraperSspassword}
                onChange={(e) => setScreenscraperSspassword(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-100 bg-purple-50/20 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
