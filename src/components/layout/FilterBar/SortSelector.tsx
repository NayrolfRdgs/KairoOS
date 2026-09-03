import React from 'react';
import { ChevronDown, Gamepad2 } from 'lucide-react';
import { SortOption } from '../../../utils';

interface SortSelectorProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
  totalGames: number;
  filteredCount: number;
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  sortBy,
  onSortChange,
  filteredCount,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* TRIER PAR */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
          TRIER PAR
        </span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-slate-700 hover:border-rose-300 focus:outline-none focus:border-rose-500 shadow-xs cursor-pointer transition-all"
          >
            <option value="title_asc">Nom (A → Z)</option>
            <option value="title_desc">Nom (Z → A)</option>
            <option value="rating_desc">Meilleures Notes ⭐</option>
            <option value="release_year_desc">Année (Récent)</option>
            <option value="release_year_asc">Année (Ancien)</option>
            <option value="play_count_desc">Plus Joués</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Pill Total Jeux */}
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50/80 border border-pink-200/60 text-rose-600 text-xs font-black shadow-xs font-sans">
        <Gamepad2 className="w-3.5 h-3.5" />
        <span>{filteredCount} JEUX</span>
      </div>
    </div>
  );
};
