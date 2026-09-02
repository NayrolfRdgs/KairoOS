import React, { useRef, useEffect } from 'react';
import { Gamepad2, Disc, Smartphone, Tv, Box, Flame, Star, LayoutGrid } from 'lucide-react';
import { System } from '../types';

interface SystemSelectorProps {
  systems: System[];
  selectedSystemId: string;
  onSelectSystem: (systemId: string) => void;
  gamesCountBySystem: Record<string, number>;
  totalAllGames: number;
  totalFavorites: number;
}

export const SystemSelector: React.FC<SystemSelectorProps> = ({
  systems,
  selectedSystemId,
  onSelectSystem,
  gamesCountBySystem,
  totalAllGames,
  totalFavorites,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector<HTMLElement>(`[data-system-id="${selectedSystemId}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedSystemId]);

  const getSystemIcon = (id: string, iconType: string) => {
    if (id === 'all') return <LayoutGrid className="w-5 h-5" />;
    if (id === 'favorites') return <Star className="w-5 h-5 text-arcade-gold fill-arcade-gold" />;

    switch (iconType) {
      case 'disc':
        return <Disc className="w-5 h-5" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'box':
        return <Box className="w-5 h-5" />;
      case 'monitor':
        return <Tv className="w-5 h-5" />;
      case 'joystick':
        return <Flame className="w-5 h-5 text-arcade-neon" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full bg-arcade-surface/50 border-b border-arcade-border/40 py-3 px-6 select-none">
      <div
        ref={containerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
      >
        <button
          data-system-id="all"
          onClick={() => onSelectSystem('all')}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
            selectedSystemId === 'all'
              ? 'bg-arcade-card border-arcade-accent text-arcade-accent shadow-lg shadow-arcade-accent/20 scale-105 ring-2 ring-arcade-accent/30'
              : 'bg-arcade-surface/80 border-arcade-border text-arcade-muted hover:text-arcade-text hover:border-arcade-border/80'
          }`}
        >
          {getSystemIcon('all', '')}
          <span>Tous les Jeux</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-arcade-bg text-arcade-muted font-semibold">
            {totalAllGames}
          </span>
        </button>

        <button
          data-system-id="favorites"
          onClick={() => onSelectSystem('favorites')}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
            selectedSystemId === 'favorites'
              ? 'bg-arcade-card border-arcade-gold text-arcade-gold shadow-lg shadow-arcade-gold/20 scale-105 ring-2 ring-arcade-gold/30'
              : 'bg-arcade-surface/80 border-arcade-border text-arcade-muted hover:text-arcade-text hover:border-arcade-border/80'
          }`}
        >
          {getSystemIcon('favorites', '')}
          <span>Favoris</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-arcade-bg text-arcade-muted font-semibold">
            {totalFavorites}
          </span>
        </button>

        <div className="w-px h-6 bg-arcade-border/60 mx-1" />

        {systems.map((sys) => {
          const count = gamesCountBySystem[sys.id] || 0;
          const isSelected = selectedSystemId === sys.id;

          return (
            <button
              key={sys.id}
              data-system-id={sys.id}
              onClick={() => onSelectSystem(sys.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-arcade-card border-arcade-accent text-arcade-accent shadow-lg shadow-arcade-accent/20 scale-105 ring-2 ring-arcade-accent/30'
                  : 'bg-arcade-surface/80 border-arcade-border text-arcade-muted hover:text-arcade-text hover:border-arcade-border/80'
              }`}
            >
              {getSystemIcon(sys.id, sys.icon)}
              <span>{sys.short_name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-arcade-accent/20 text-arcade-accent' : 'bg-arcade-bg text-arcade-muted'
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
