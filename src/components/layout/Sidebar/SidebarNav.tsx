import React from 'react';
import { LayoutGrid, Star, Clock } from 'lucide-react';

interface SidebarNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalAllGames: number;
  totalFavorites: number;
  totalRecent: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  selectedCategory,
  onSelectCategory,
  totalAllGames,
  totalFavorites,
  totalRecent,
}) => {
  const navItems = [
    {
      id: 'all',
      label: 'Tous les Jeux',
      icon: LayoutGrid,
      count: totalAllGames,
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Star,
      count: totalFavorites,
      iconColor: 'text-amber-500',
    },
    {
      id: 'recent',
      label: 'Récemment joués',
      icon: Clock,
      count: totalRecent,
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className="space-y-1">
      <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans mb-2">
        BIBLIOTHÈQUE
      </h3>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-rose-600 border border-pink-200/80 shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-rose-500' : item.iconColor || 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                  isSelected
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
