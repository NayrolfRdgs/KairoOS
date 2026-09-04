import React from 'react';
import { Game } from '../../../types';
import { GameCard } from '../GameCard';
import { HeroShowcase } from '../HeroShowcase';
import { Gamepad2 } from 'lucide-react';

interface ArcadeCatalogProps {
  games: Game[];
  focusedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenGamepadConfig?: () => void;
  selectedCategory: string;
  isSearching: boolean;
  categoryTitle?: string;
}

export const ArcadeCatalog: React.FC<ArcadeCatalogProps> = ({
  games,
  focusedGameId,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenGamepadConfig,
  categoryTitle,
  selectedCategory,
}) => {
  if (games.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center text-rose-500 mb-3 shadow-xs">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <p className="text-base font-black text-slate-700">Aucun jeu dans cette sélection</p>
        <p className="text-xs text-slate-400 mt-1">Ajoutez des ROMs ou modifiez les filtres dans les paramètres.</p>
      </div>
    );
  }

  // Sélection de jusqu'à 4 jeux en vedette pour le carrousel supérieur (Hero Showcase)
  // Basé sur le temps de jeu, favoris, récents et découverte
  const featuredGames = React.useMemo(() => {
    if (games.length === 0) return [];
    if (games.length <= 4) return games;

    const sorted = [...games].sort((a, b) => {
      const aScore = (a.play_time_seconds || 0) * 2 + (a.favorite ? 1000 : 0);
      const bScore = (b.play_time_seconds || 0) * 2 + (b.favorite ? 1000 : 0);
      return bScore - aScore;
    });

    return sorted.slice(0, 4);
  }, [games]);

  const [heroIndex, setHeroIndex] = React.useState(0);

  // Remettre à 0 si la sélection de jeux change
  React.useEffect(() => {
    setHeroIndex(0);
  }, [selectedCategory]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
      {/* 1. Grande bannière Carrousel de proposition de jeux (jusqu'à 4 jeux) */}
      {featuredGames.length > 0 && (
        <HeroShowcase
          games={featuredGames}
          currentIndex={heroIndex}
          onIndexChange={setHeroIndex}
          onLaunch={onLaunchGame}
          onOpenDetails={onSelectGame}
          onToggleFavorite={onToggleFavorite}
          onOpenGamepadConfig={onOpenGamepadConfig}
        />
      )}

      {/* 2. En-tête de catégorie */}
      <div
        style={{ borderColor: 'var(--border-color)' }}
        className="flex items-center justify-between pt-2 pb-2 border-b"
      >
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: 'var(--accent-primary)' }}
            className="w-2.5 h-2.5 rounded-full shadow-xs animate-pulse"
          />
          <h2
            style={{ color: 'var(--text-primary)' }}
            className="text-xs font-black uppercase tracking-wider font-mono"
          >
            {categoryTitle || 'CATALOGUE DE JEUX'}
          </h2>
        </div>
        <span
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--accent-primary)',
            borderColor: 'var(--border-color)',
          }}
          className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border"
        >
          {games.length} {games.length > 1 ? 'JEUX' : 'JEU'}
        </span>
      </div>

      {/* 3. Grille des jeux au format 3:4 */}
      <div
        style={{ gap: 'var(--card-gap, 16px)' }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 justify-items-center"
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFocused={focusedGameId === game.id}
            onSelect={onSelectGame}
            onLaunch={onLaunchGame}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
