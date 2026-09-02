import React from 'react';
import { SortOption } from '../../../utils';
import { SearchInput } from './SearchInput';
import { SortSelector } from './SortSelector';

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
      <SearchInput searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <SortSelector
        sortBy={sortBy}
        onSortChange={onSortChange}
        selectedGenre={selectedGenre}
        onGenreChange={onGenreChange}
        availableGenres={availableGenres}
        totalGames={totalGames}
        filteredCount={filteredCount}
      />
    </div>
  );
};
