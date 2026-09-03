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

  // Sélection du jeu en vedette pour la borne d'arcade :
  // Déterminé par le temps de jeu, les favoris et rotation aléatoire (ne change PAS au survol des cartes)
  const [spotlightGameId, setSpotlightGameId] = React.useState<string | null>(null);

  const pickSpotlightGame = React.useCallback(() => {
    if (games.length === 0) return;
    const pool: Game[] = [];
    for (const g of games) {
      pool.push(g);
      if (g.favorite) pool.push(g);
      if (g.play_time_seconds && g.play_time_seconds > 0) pool.push(g);
    }
    const picked = pool[Math.floor(Math.random() * pool.length)] || games[0];
    setSpotlightGameId(picked.id);
  }, [games]);

  React.useEffect(() => {
    if (games.length > 0 && (!spotlightGameId || !games.some((g) => g.id === spotlightGameId))) {
      pickSpotlightGame();
    }
  }, [games, selectedCategory, spotlightGameId, pickSpotlightGame]);

  const featuredGame = games.find((g) => g.id === spotlightGameId) || games[0];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
      {/* 1. Grande bannière de proposition de jeux (Hero Showcase) */}
      {featuredGame && (
        <HeroShowcase
          game={featuredGame}
          onLaunch={onLaunchGame}
          onOpenDetails={onSelectGame}
          onToggleFavorite={onToggleFavorite}
          onOpenGamepadConfig={onOpenGamepadConfig}
        />
      )}

      {/* 2. En-tête de catégorie */}
      <div className="flex items-center justify-between pt-2 pb-2 border-b border-purple-100/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
            {categoryTitle || 'CATALOGUE DE JEUX'}
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
          {games.length} {games.length > 1 ? 'JEUX' : 'JEU'}
        </span>
      </div>

      {/* 3. Grille des jeux au format 3:4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5 justify-items-center">
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
