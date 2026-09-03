import React, { useState } from 'react';
import { Folder, FolderOpen, RefreshCw, Check } from 'lucide-react';
import { ScanStats } from '../../../types';
import { scanRomsDirectory } from '../../../api';


interface FoldersTabProps {
  romsPath: string;
  setRomsPath: (path: string) => void;
  onScanComplete?: () => void;
}

export const FoldersTab: React.FC<FoldersTabProps> = ({
  romsPath,
  setRomsPath,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanStats | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleBrowseFolder = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionner le dossier racine des ROMs',
      });
      if (selected && typeof selected === 'string') {
        setRomsPath(selected);
      }
    } catch {
      // Fallback
    }
  };

  const handleRescanNow = async () => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      const stats = await scanRomsDirectory(romsPath || './roms');
      setScanResult(stats);
      if (onScanComplete) onScanComplete();
    } catch (err: any) {
      setScanError(err.message || 'Erreur lors du scan des ROMs');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dossier ROMs Racine */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
          Répertoire Racine des ROMs (Mode Portable & Fixe)
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-50/40 border border-purple-100 focus-within:border-rose-500 shadow-xs">
            <Folder className="w-4 h-4 text-rose-500 shrink-0" />
            <input
              type="text"
              value={romsPath}
              onChange={(e) => setRomsPath(e.target.value)}
              placeholder="ex: .\roms ou D:\Emulation\Roms"
              className="w-full bg-transparent text-slate-800 font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleBrowseFolder}
            className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Parcourir</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          En mode portable, le dossier racine est <code className="text-rose-600 font-bold font-mono">./roms</code> à côté de l'exécutable. Vos jeux, métadonnées JSON et jaquettes sont automatiquement chargés au lancement.
        </p>
      </div>

      {/* 2. Bouton d'Actualisation / Rescan */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 text-rose-500 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Actualiser la liste des jeux</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Re-scanne le dossier des ROMs pour détecter les nouveaux jeux ajoutés et recharger les métadonnées.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRescanNow}
            disabled={isScanning}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scan en cours...' : 'Actualiser les Jeux'}</span>
          </button>
        </div>

        {/* Résultat du Scan */}
        {scanResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Scan terminé avec succès !</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-normal">
              {scanResult.total_files_scanned} fichiers scannés • {scanResult.games_added} nouveaux jeux ajoutés • {scanResult.games_updated} jeux mis à jour
            </p>
          </div>
        )}

        {scanError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            {scanError}
          </div>
        )}
      </div>
    </div>
  );
};
