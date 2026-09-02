import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ScanStats } from '../../../types';

interface ScanStatsCardProps {
  stats: ScanStats;
}

export const ScanStatsCard: React.FC<ScanStatsCardProps> = ({ stats }) => {
  return (
    <div className="p-4 rounded-2xl bg-retro-bg border border-retro-border space-y-3 animate-fadeIn">
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
        <CheckCircle2 className="w-4 h-4" />
        <span>Scan terminé avec succès !</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-white border border-retro-border">
          <span className="text-retro-textMuted text-[10px] block">Fichiers Lus</span>
          <span className="font-black text-retro-text">{stats.total_files_scanned}</span>
        </div>
        <div className="p-2 rounded-lg bg-white border border-retro-border">
          <span className="text-retro-primary text-[10px] block">Jeux Ajoutés</span>
          <span className="font-black text-retro-primary">+{stats.games_added}</span>
        </div>
        <div className="p-2 rounded-lg bg-white border border-retro-border">
          <span className="text-retro-textMuted text-[10px] block">Mis à jour</span>
          <span className="font-black text-retro-text">{stats.games_updated}</span>
        </div>
      </div>
    </div>
  );
};
