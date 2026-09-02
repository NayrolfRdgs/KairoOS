import { Search, Filter, X } from 'lucide-react';

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'rating'
  | 'play-time'
  | 'recent'
  | 'release-desc'
  | 'release-asc';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
  totalGames: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedGenre,
  onGenreChange,
  availableGenres,
  totalGames,
  filteredCount,
}) => {
  return (
    <div className="bg-white border-b border-retro-border px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none shrink-0 shadow-sm">
      {/* Search Input Bar (Support Clavier & Souris) */}
      <div className="flex-1 min-w-[240px] max-w-md relative">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-retro-bg border border-retro-border focus-within:border-retro-primary focus-within:bg-white focus-within:shadow-retro-neon transition-all">
          <Search className="w-4 h-4 text-retro-textMuted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un jeu (ex: Mario, Zelda, Tekken)..."
            className="w-full bg-transparent text-xs font-medium text-retro-text placeholder-retro-textLight focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-md hover:bg-retro-border text-retro-textMuted hover:text-retro-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sorting & Filter Controls */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Genre Filter */}
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

        {/* Sort By Selector */}
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

        {/* Results Counter */}
        <div className="text-xs text-retro-textMuted font-bold px-2.5 py-1 rounded-lg bg-retro-bg border border-retro-border">
          <span className="text-retro-primary font-black">{filteredCount}</span>
          <span className="text-retro-textLight">/{totalGames} jeux</span>
        </div>
      </div>
    </div>
  );
};
