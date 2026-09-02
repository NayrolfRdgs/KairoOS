import React from 'react';
import { Filter } from 'lucide-react';
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
  selectedGenre,
  onGenreChange,
  availableGenres,
  totalGames,
  filteredCount,
}) => {
  return (
    <div className="flex items-center flex-wrap gap-3">
      {/* Filtre par Genre */}
      {availableGenres.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-retro-textMuted" />
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-retro-bg hover:bg-white border border-retro-border text-retro-text text-xs font-semibold focus:outline-none focus:border-retro-primary cursor-pointer transition-all"
          >
            <option value="">Tous les Genres</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sélecteur de Tri */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-retro-textLight uppercase tracking-wider hidden sm:inline">
          Trier:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-1.5 rounded-xl bg-retro-bg hover:bg-white border border-retro-border text-retro-text text-xs font-semibold focus:outline-none focus:border-retro-primary cursor-pointer transition-all"
        >
          <option value="title-asc">Nom (A → Z)</option>
          <option value="title-desc">Nom (Z → A)</option>
          <option value="release-desc">Date de Sortie (Plus récents 📅)</option>
          <option value="release-asc">Date de Sortie (Plus anciens 📅)</option>
          <option value="rating">Mieux Notés (⭐)</option>
          <option value="play-time">Plus Joués (⏱️)</option>
          <option value="recent">Plus Fréquents (🎮)</option>
        </select>
      </div>

      {/* Compteur de Résultats */}
      <div className="text-xs text-retro-textMuted font-bold px-2.5 py-1 rounded-lg bg-retro-bg border border-retro-border">
        <span className="text-retro-primary font-black">{filteredCount}</span>
        <span className="text-retro-textLight">/{totalGames} jeux</span>
      </div>
    </div>
  );
};
