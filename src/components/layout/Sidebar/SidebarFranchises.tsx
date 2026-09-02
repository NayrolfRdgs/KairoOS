import React from 'react';
import { Trophy, Tag } from 'lucide-react';
import { FranchiseCollection, CustomFranchise } from '../../../types';

interface SidebarFranchisesProps {
  popularFranchises: FranchiseCollection[];
  customFranchises: CustomFranchise[];
  enabledFranchises: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  gamesCountByFranchise: Record<string, number>;
}

export const SidebarFranchises: React.FC<SidebarFranchisesProps> = ({
  popularFranchises,
  customFranchises,
  enabledFranchises,
  selectedCategory,
  onSelectCategory,
  gamesCountByFranchise,
}) => {
  const visiblePopular = popularFranchises.filter((f) => enabledFranchises.includes(f.id));
  const visibleCustom = customFranchises.filter((f) => enabledFranchises.includes(f.id));

  if (visiblePopular.length === 0 && visibleCustom.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-wider text-retro-textLight px-3 mb-2 flex items-center justify-between">
        <span>Franchises Cultes</span>
        <Trophy className="w-3 h-3 text-retro-primary" />
      </div>

      <div className="space-y-1">
        {visiblePopular.map((franchise) => {
          const count = gamesCountByFranchise[franchise.id] || 0;
          const isSelected = selectedCategory === `franchise:${franchise.id}`;

          return (
            <button
              key={franchise.id}
              onClick={() => onSelectCategory(`franchise:${franchise.id}`)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-retro-purple text-white shadow-retro-md font-bold scale-[1.02]'
                  : 'text-retro-text hover:bg-retro-bg'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-retro-primary'}`} />
                <span className="truncate">{franchise.name}</span>
              </div>
              {count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {visibleCustom.map((custom) => {
          const count = gamesCountByFranchise[custom.id] || 0;
          const isSelected = selectedCategory === `franchise:${custom.id}`;

          return (
            <button
              key={custom.id}
              onClick={() => onSelectCategory(`franchise:${custom.id}`)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-retro-cyan text-white shadow-retro-cyan font-bold scale-[1.02]'
                  : 'text-retro-text hover:bg-retro-bg'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-retro-cyan'}`} />
                <span className="truncate">{custom.name}</span>
              </div>
              {count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
