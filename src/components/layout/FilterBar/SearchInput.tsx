import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Rechercher un jeu (ex: Mario, Zelda, Tekken)...',
}) => {
  return (
    <div className="flex-1 min-w-[240px] max-w-md relative">
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-retro-bg border border-retro-border focus-within:border-retro-primary focus-within:bg-white focus-within:shadow-retro-neon transition-all">
        <Search className="w-4 h-4 text-retro-textMuted shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
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
  );
};
