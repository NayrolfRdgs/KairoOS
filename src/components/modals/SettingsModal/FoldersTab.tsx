import React from 'react';
import { Folder } from 'lucide-react';

interface FoldersTabProps {
  romsPath: string;
  setRomsPath: (path: string) => void;
}

export const FoldersTab: React.FC<FoldersTabProps> = ({ romsPath, setRomsPath }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
          Répertoire Racine des ROMs par Défaut
        </label>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-retro-bg border border-retro-border focus-within:border-retro-primary">
          <Folder className="w-4 h-4 text-retro-primary shrink-0" />
          <input
            type="text"
            value={romsPath}
            onChange={(e) => setRomsPath(e.target.value)}
            placeholder="ex: D:\Emulation\Roms ou .\roms pour mode portable"
            className="w-full bg-transparent text-retro-text font-mono text-xs focus:outline-none"
          />
        </div>
        <p className="text-[10px] text-retro-textMuted mt-1.5 leading-relaxed">
          En version portable, vous pouvez utiliser <code className="text-retro-primary font-bold">.\roms</code> pour que
          le logiciel charge automatiquement les jeux placés sur votre clé USB ou disque dur externe.
        </p>
      </div>
    </div>
  );
};
