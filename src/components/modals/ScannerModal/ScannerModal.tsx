import React, { useState } from 'react';
import { X, FolderSearch, AlertCircle, RefreshCw, Folder } from 'lucide-react';
import { ScanStats } from '../../../types';
import { ScanStatsCard } from './ScanStatsCard';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (path: string, calculateHashes: boolean) => Promise<ScanStats>;
  onScanComplete: () => void;
  defaultPath?: string;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  onClose,
  onScan,
  onScanComplete,
  defaultPath = './roms',
}) => {
  const [folderPath, setFolderPath] = useState<string>(defaultPath);
  const [calculateHashes, setCalculateHashes] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartScan = async () => {
    if (!folderPath.trim()) {
      setErrorMsg('Veuillez spécifier un chemin de dossier valide.');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    setStats(null);

    try {
      const result = await onScan(folderPath, calculateHashes);
      setStats(result);
      onScanComplete();
    } catch (err: any) {
      setErrorMsg(typeof err === 'string' ? err : err?.message || 'Erreur lors du scan.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-retro-text/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-xl bg-white border border-retro-border rounded-3xl shadow-retro-lg p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-retro-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-retro-bg border border-retro-border flex items-center justify-center">
              <FolderSearch className="w-5 h-5 text-retro-primary" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase font-display tracking-wider text-retro-text">
                Scanner de ROMs
              </h2>
              <span className="text-[11px] text-retro-textMuted">
                Indexation automatique et détection par console
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isScanning}
            className="p-2 rounded-full hover:bg-retro-bg text-retro-textMuted hover:text-retro-text transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
              Dossier Racine des ROMs
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-retro-bg border border-retro-border focus-within:border-retro-primary">
              <Folder className="w-4 h-4 text-retro-primary shrink-0" />
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="ex: D:\Emulation\Roms ou C:\Games"
                className="w-full bg-transparent text-retro-text font-mono text-xs focus:outline-none"
                disabled={isScanning}
              />
            </div>
            <p className="text-[10px] text-retro-textMuted mt-1.5">
              Recherche automatique dans les sous-dossiers (ex:{' '}
              <code className="text-retro-primary font-bold">snes/</code>,{' '}
              <code className="text-retro-primary font-bold">ps1/</code>,{' '}
              <code className="text-retro-primary font-bold">switch/</code>).
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-retro-bg border border-retro-border">
            <input
              type="checkbox"
              id="calcHash"
              checked={calculateHashes}
              onChange={(e) => setCalculateHashes(e.target.checked)}
              className="w-4 h-4 rounded border-retro-border text-retro-primary focus:ring-retro-primary"
              disabled={isScanning}
            />
            <label htmlFor="calcHash" className="text-xs text-retro-text cursor-pointer">
              <span className="font-bold block">Calculer les Checksums SHA1</span>
              <span className="text-[10px] text-retro-textMuted block">
                Utile pour le scraping exact ScreenScraper.
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {stats && <ScanStatsCard stats={stats} />}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-retro-border">
          <button
            onClick={onClose}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl text-xs font-bold text-retro-textMuted hover:text-retro-text transition-all disabled:opacity-50"
          >
            Fermer
          </button>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-retro-primary to-retro-purple text-white font-bold text-xs uppercase tracking-wider shadow-retro-neon hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scan en cours...</span>
              </>
            ) : (
              <>
                <FolderSearch className="w-4 h-4" />
                <span>Lancer le Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
