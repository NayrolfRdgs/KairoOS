import React, { useState } from 'react';
import { Library, FolderOpen, RefreshCw, Trash2, Check } from 'lucide-react';
import { AppSettings, ScanStats } from '../../../types';
import { scanRomsDirectory, purgeMissingGames } from '../../../api';

interface LibrarySectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
  onScanComplete?: () => void;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  settings,
  updateSetting,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanStats | null>(null);
  const [purging, setPurging] = useState(false);
  const [purgeCount, setPurgeCount] = useState<number | null>(null);

  const handleBrowseFolder = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionner le dossier racine des ROMs',
      });
      if (selected && typeof selected === 'string') {
        updateSetting('roms_path', selected);
      }
    } catch {
      // Fallback
    }
  };

  const handleRescan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const stats = await scanRomsDirectory(settings.roms_path || './roms');
      setScanResult(stats);
      if (onScanComplete) onScanComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      const count = await purgeMissingGames();
      setPurgeCount(count);
      if (onScanComplete) onScanComplete();
      setTimeout(() => setPurgeCount(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Répertoire des ROMs */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Répertoire Racine des ROMs
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={settings.roms_path || './roms'}
            onChange={(e) => updateSetting('roms_path', e.target.value)}
            className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
          />
          <button
            onClick={handleBrowseFolder}
            className="px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Parcourir</span>
          </button>
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scan...' : 'Scanner'}</span>
          </button>
        </div>

        {scanResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
            Scan terminé : {scanResult.games_added} nouveaux jeux trouvés sur {scanResult.total_files_scanned} fichiers analysés.
          </div>
        )}
      </div>

      {/* 2. Options d'affichage & Tri */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Affichage du Catalogue & Démarrage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Scanner automatique au démarrage</div>
              <div className="text-[11px] text-slate-400">Met à jour la bibliothèque automatiquement au boot</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.auto_scan_on_startup)}
              onChange={(e) => updateSetting('auto_scan_on_startup', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Afficher les jeux sans jaquette</div>
              <div className="text-[11px] text-slate-400">Affiche une icône par défaut si pas de média</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.show_games_without_cover ?? true)}
              onChange={(e) => updateSetting('show_games_without_cover', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Action au clic / touche A / ✕ sur un jeu</label>
            <select
              value={settings.game_select_action || 'details'}
              onChange={(e) => updateSetting('game_select_action', e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            >
              <option value="details">Ouvrir la fiche détaillée du jeu</option>
              <option value="launch">Lancer directement (Arcade Rapide)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vue par défaut</label>
            <select
              value={settings.default_view || 'grid'}
              onChange={(e) => updateSetting('default_view', e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            >
              <option value="grid">Grille de jaquettes (Arcade)</option>
              <option value="list">Liste détaillée</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tri par défaut</label>
            <select
              value={settings.default_sort || 'title-asc'}
              onChange={(e) => updateSetting('default_sort', e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            >
              <option value="title-asc">Nom (A → Z)</option>
              <option value="title-desc">Nom (Z → A)</option>
              <option value="rating-desc">Note (Décroissant)</option>
              <option value="release-date-desc">Date de sortie (Récents d'abord)</option>
              <option value="play-time-desc">Temps joué</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Nombre de jeux récents à afficher dans la catégorie</span>
              <span className="font-mono text-purple-600">{settings.recent_games_limit ?? 10} jeux</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={settings.recent_games_limit ?? 10}
              onChange={(e) => updateSetting('recent_games_limit', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-purple-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Purger les jeux dont le fichier ROM a été supprimé</span>
          <button
            onClick={handlePurge}
            disabled={purging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{purging ? 'Purge...' : 'Purger les jeux introuvables'}</span>
          </button>
        </div>

        {purgeCount !== null && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>{purgeCount} jeu(x) orphelin(s) supprimé(s) de la bibliothèque.</span>
          </div>
        )}
      </div>
    </div>
  );
};
