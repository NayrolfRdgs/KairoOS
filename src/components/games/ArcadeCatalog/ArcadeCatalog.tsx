import React, { useMemo } from 'react';
import { Game } from '../../../types';
import { HeroShowcase } from '../HeroShowcase';
import { GameShelf } from '../GameShelf';

interface ArcadeCatalogProps {
  games: Game[];
  focusedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenGamepadConfig?: () => void;
  selectedCategory: string;
  isSearching: boolean;
}

export const ArcadeCatalog: React.FC<ArcadeCatalogProps> = ({
  games,
  focusedGameId,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenGamepadConfig,
  selectedCategory,
  isSearching,
}) => {
  // Jeu mis en avant (Hero) : Priorité au jeu actuellement focus ou au premier jeu 'featured' ou au premier de la liste
  const featuredGame = useMemo(() => {
    if (focusedGameId) {
      const found = games.find((g) => g.id === focusedGameId);
      if (found) return found;
    }
    const hero = games.find((g) => g.featured) || games[0];
    return hero || null;
  }, [games, focusedGameId]);

  // Étagère 1 : À l'affiche (Top rated / Featured)
  const aLafficheGames = useMemo(() => {
    return games.filter((g) => g.rating && g.rating >= 4.7);
  }, [games]);

  // Étagère 2 : Recommandés pour vous
  const recommendedGames = useMemo(() => {
    return games.filter((g) => !aLafficheGames.some((ag) => ag.id === g.id));
  }, [games, aLafficheGames]);

  // Étagère 3 : Récemment joués
  const recentGames = useMemo(() => {
    return games.filter((g) => g.last_played || g.play_count > 0);
  }, [games]);

  // Étagère 4 : Favoris
  const favoriteGames = useMemo(() => {
    return games.filter((g) => g.favorite);
  }, [games]);

  if (games.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none">
        <p className="text-sm font-bold font-sans">Aucun jeu trouvé pour cette sélection.</p>
      </div>
    );
  }

  // Si on est en mode recherche ou filtrage précis
  if (isSearching || (selectedCategory !== 'all' && selectedCategory !== 'favorites' && selectedCategory !== 'recent')) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {featuredGame && (
          <HeroShowcase
            game={featuredGame}
            onLaunch={onLaunchGame}
            onOpenDetails={onSelectGame}
            onToggleFavorite={onToggleFavorite}
            onOpenGamepadConfig={onOpenGamepadConfig}
            isFocused={focusedGameId === featuredGame.id}
          />
        )}

        <GameShelf
          title={`JEUX DISPONIBLES (${games.length})`}
          games={games}
          focusedGameId={focusedGameId}
          onSelectGame={onSelectGame}
          onLaunchGame={onLaunchGame}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
      {/* 1. Zone Héro Spectaculaire (À l'affiche) */}
      {featuredGame && (
        <HeroShowcase
          game={featuredGame}
          onLaunch={onLaunchGame}
          onOpenDetails={onSelectGame}
          onToggleFavorite={onToggleFavorite}
          onOpenGamepadConfig={onOpenGamepadConfig}
          isFocused={focusedGameId === featuredGame.id}
        />
      )}

      {/* 2. Rayon 1 : À L'AFFICHE */}
      <GameShelf
        title="À L'AFFICHE"
        games={aLafficheGames.length > 0 ? aLafficheGames : games.slice(0, 8)}
        focusedGameId={focusedGameId}
        onSelectGame={onSelectGame}
        onLaunchGame={onLaunchGame}
        onToggleFavorite={onToggleFavorite}
      />

      {/* 3. Rayon 2 : RECOMMANDÉ POUR VOUS */}
      <GameShelf
        title="RECOMMANDÉ POUR VOUS"
        games={recommendedGames.length > 0 ? recommendedGames : games.slice(6)}
        focusedGameId={focusedGameId}
        onSelectGame={onSelectGame}
        onLaunchGame={onLaunchGame}
        onToggleFavorite={onToggleFavorite}
      />

      {/* 4. Rayon 3 : VOS FAVORIS (si présents) */}
      {favoriteGames.length > 0 && (
        <GameShelf
          title="VOS FAVORIS"
          games={favoriteGames}
          focusedGameId={focusedGameId}
          onSelectGame={onSelectGame}
          onLaunchGame={onLaunchGame}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* 5. Rayon 4 : RÉCEMMENT JOUÉS (si présents) */}
      {recentGames.length > 0 && (
        <GameShelf
          title="RÉCEMMENT JOUÉS"
          games={recentGames}
          focusedGameId={focusedGameId}
          onSelectGame={onSelectGame}
          onLaunchGame={onLaunchGame}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
};
