import React, { useState } from 'react';
import { X, FolderSearch, CheckCircle2, AlertCircle, RefreshCw, Folder } from 'lucide-react';
import { ScanStats } from '../types';

interface ScannerModalProps {
  onClose: () => void;
  onScan: (path: string, calculateHashes: boolean) => Promise<ScanStats>;
  onScanComplete: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  onClose,
  onScan,
  onScanComplete,
}) => {
  const [folderPath, setFolderPath] = useState<string>('D:\\Roms');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-xl bg-arcade-surface border border-arcade-border rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-arcade-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-arcade-card border border-arcade-border flex items-center justify-center">
              <FolderSearch className="w-5 h-5 text-arcade-accent" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase font-display tracking-wider text-arcade-text">
                Scanner de ROMs
              </h2>
              <span className="text-[11px] text-arcade-muted">
                Indexation automatique et détection par console
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isScanning}
            className="p-2 rounded-full bg-black/50 border border-white/10 text-arcade-muted hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-arcade-text mb-2">
              Dossier Racine des ROMs
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-arcade-card border border-arcade-border focus-within:border-arcade-accent">
              <Folder className="w-4 h-4 text-arcade-accent shrink-0" />
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="ex: D:\Emulation\Roms ou C:\Games"
                className="w-full bg-transparent text-arcade-text font-mono text-xs focus:outline-none"
                disabled={isScanning}
              />
            </div>
            <p className="text-[10px] text-arcade-muted mt-1.5">
              Le scanner recherche récursivement dans les sous-dossiers (ex: <code className="text-arcade-accent">snes/</code>, <code className="text-arcade-accent">ps2/</code>, <code className="text-arcade-accent">switch/</code>, <code className="text-arcade-accent">n64/</code>).
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-arcade-card/60 border border-arcade-border">
            <input
              type="checkbox"
              id="calcHash"
              checked={calculateHashes}
              onChange={(e) => setCalculateHashes(e.target.checked)}
              className="w-4 h-4 rounded border-arcade-border text-arcade-accent focus:ring-arcade-accent"
              disabled={isScanning}
            />
            <label htmlFor="calcHash" className="text-xs text-arcade-text cursor-pointer">
              <span className="font-bold block">Calculer les Checksums SHA1</span>
              <span className="text-[10px] text-arcade-muted block">
                Utile pour le scraping exact ScreenScraper (plus lent sur les gros fichiers ISO).
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/50 flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {stats && (
            <div className="p-4 rounded-2xl bg-arcade-card border border-arcade-border space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-arcade-success font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Scan terminé avec succès !</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-arcade-surface border border-arcade-border/50">
                  <span className="text-arcade-muted text-[10px] block">Fichiers Lus</span>
                  <span className="font-black text-arcade-text">{stats.total_files_scanned}</span>
                </div>
                <div className="p-2 rounded-lg bg-arcade-surface border border-arcade-border/50">
                  <span className="text-arcade-accent text-[10px] block">Jeux Ajoutés</span>
                  <span className="font-black text-arcade-accent">+{stats.games_added}</span>
                </div>
                <div className="p-2 rounded-lg bg-arcade-surface border border-arcade-border/50">
                  <span className="text-arcade-muted text-[10px] block">Mis à jour</span>
                  <span className="font-black text-arcade-text">{stats.games_updated}</span>
                </div>
              </div>

              {stats.systems_detected.length > 0 && (
                <div className="text-[11px] text-arcade-muted">
                  <span className="font-semibold text-arcade-text">Consoles détectées : </span>
                  {stats.systems_detected.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-arcade-border/60">
          <button
            onClick={onClose}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl text-xs font-bold text-arcade-muted hover:text-white transition-all disabled:opacity-50"
          >
            Fermer
          </button>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-arcade-accent to-arcade-neon text-arcade-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-arcade-accent/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin fill-arcade-bg" />
                <span>Scan en cours...</span>
              </>
            ) : (
              <>
                <FolderSearch className="w-4 h-4 fill-arcade-bg" />
                <span>Lancer le Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
