import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative flex-1 max-w-xl">
      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder="Rechercher un jeu, une console, un genre..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-11 pr-20 py-2.5 rounded-full bg-white border border-purple-100/90 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 shadow-xs transition-all"
      />

      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 pointer-events-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 border border-slate-200">
            CTRL K
          </span>
        )}
      </div>
    </div>
  );
};
