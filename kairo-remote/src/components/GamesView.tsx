import React, { useState } from 'react';
import {
  Search,
  Gamepad2,
  Play,
  Star,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ThemeMode, Game, System, StatusResponse } from '../types';

interface GamesViewProps {
  games: Game[];
  systems: System[];
  status: StatusResponse | null;
  onLaunchGame: (gameId: string) => Promise<void>;
  onToggleFavorite: (gameId: string) => Promise<void>;
  loading: boolean;
  theme: ThemeMode;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  systems,
  status,
  onLaunchGame,
  onToggleFavorite,
  loading,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Filtrage
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      !searchQuery ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.franchise && game.franchise.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (game.genre && game.genre.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSystem = selectedSystem === 'all' || game.system_id === selectedSystem;
    const matchesFavorites = !favoritesOnly || game.favorite;

    return matchesSearch && matchesSystem && matchesFavorites;
  });

  const getSystemBadgeColor = (sysId: string) => {
    switch (sysId.toLowerCase()) {
      case 'snes':
      case 'super_nintendo':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'ps1':
      case 'ps2':
      case 'playstation':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'n64':
      case 'gamecube':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'switch':
      case 'arcade':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'megadrive':
      case 'genesis':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-retro-cyan/20 text-retro-cyan border-retro-cyan/40';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Barre de Recherche et Filtres */}
      <div
        className={`p-4 rounded-3xl border space-y-3 shadow-sm ${
          isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, genre, franchise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold font-sans border transition-all focus:outline-none ${
                isDark
                  ? 'bg-retro-panel border-retro-border text-white placeholder-slate-500 focus:border-retro-cyan'
                  : 'bg-retro-warm border-retro-border text-retro-text placeholder-slate-400 focus:border-retro-primary'
              }`}
            />
          </div>

          {/* Bouton Favoris Only */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-arcade flex items-center justify-center gap-1.5 border transition-all shrink-0 ${
              favoritesOnly
                ? 'bg-retro-yellow text-retro-dark border-retro-yellow font-black shadow-md'
                : isDark
                ? 'bg-retro-panel border-retro-border text-slate-400 hover:text-white'
                : 'bg-retro-warm border-retro-border text-slate-600 hover:text-retro-text'
            }`}
          >
            <Star className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
            <span>Favoris ({games.filter((g) => g.favorite).length})</span>
          </button>
        </div>

        {/* Filtres par Système (Pills horizontales) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedSystem('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
              selectedSystem === 'all'
                ? isDark
                  ? 'bg-retro-primary text-white shadow-md shadow-retro-primary/30'
                  : 'bg-retro-primary text-white shadow-retro'
                : isDark
                ? 'bg-retro-panel text-slate-400 hover:text-white'
                : 'bg-retro-warm text-slate-600 hover:text-retro-text'
            }`}
          >
            TOUS ({games.length})
          </button>

          {systems.map((sys) => {
            const count = games.filter((g) => g.system_id === sys.id).length;
            if (count === 0) return null;
            const isSelected = selectedSystem === sys.id;

            return (
              <button
                key={sys.id}
                onClick={() => setSelectedSystem(sys.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-retro-purple text-white shadow-md shadow-retro-purple/30'
                    : isDark
                    ? 'bg-retro-panel text-slate-400 hover:text-white'
                    : 'bg-retro-warm text-slate-600 hover:text-retro-text'
                }`}
              >
                {sys.short_name || sys.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Grille Responsive des Jeux */}
      {filteredGames.length === 0 ? (
        <div
          className={`p-12 rounded-3xl border text-center space-y-3 ${
            isDark ? 'bg-retro-card border-retro-border text-slate-400' : 'bg-white border-retro-border text-slate-500'
          }`}
        >
          <Gamepad2 className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs font-bold font-arcade">Aucun jeu ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map((game) => {
            const isCurrent = status?.current_game_id === game.id;

            return (
              <div
                key={game.id}
                className={`p-4 rounded-3xl border flex flex-col justify-between transition-all duration-200 relative group overflow-hidden ${
                  isCurrent
                    ? isDark
                      ? 'bg-retro-panel border-retro-green shadow-[0_0_20px_rgba(0,255,136,0.3)] ring-2 ring-retro-green/50'
                      : 'bg-white border-retro-green shadow-retro-neon ring-2 ring-retro-green/50'
                    : isDark
                    ? 'bg-retro-card border-retro-border hover:border-retro-primary/60 text-white'
                    : 'bg-white border-retro-border hover:border-retro-primary text-retro-text shadow-sm'
                }`}
              >
                {/* En-tête de Carte : Badge Système + Bouton Favori */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-lg border ${getSystemBadgeColor(
                      game.system_id
                    )}`}
                  >
                    {game.system_id}
                  </span>

                  <button
                    onClick={() => onToggleFavorite(game.id)}
                    title={game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    className={`p-1.5 rounded-xl border transition-all active:scale-90 ${
                      game.favorite
                        ? 'bg-retro-yellow text-retro-dark border-retro-yellow shadow-xs'
                        : isDark
                        ? 'bg-retro-panel border-retro-border text-slate-500 hover:text-retro-yellow'
                        : 'bg-retro-warm border-retro-border text-slate-400 hover:text-retro-yellow'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${game.favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Corps de Carte : Jaquette & Titre */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-16 h-20 rounded-2xl bg-retro-panel border border-retro-border shrink-0 flex items-center justify-center overflow-hidden shadow-sm relative">
                    {game.cover_url ? (
                      <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 className="w-7 h-7 text-slate-500" />
                    )}

                    {isCurrent && (
                      <div className="absolute inset-0 bg-retro-green/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Flame className="w-6 h-6 text-retro-green animate-bounce" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-bold text-xs leading-snug line-clamp-2">{game.title}</h3>
                    {game.franchise && (
                      <p className="text-[10px] text-retro-cyan font-semibold truncate">
                        {game.franchise}
                      </p>
                    )}
                    {game.genre && (
                      <p className="text-[10px] text-slate-400 truncate">{game.genre}</p>
                    )}
                  </div>
                </div>

                {/* Pied de Carte : Bouton Lancer / Statut en Jeu */}
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-2xl bg-retro-green/20 border border-retro-green/40 text-retro-green font-black font-arcade text-xs text-center flex items-center justify-center gap-1.5 animate-pulse">
                    <Flame className="w-4 h-4" />
                    <span>ACTUELLEMENT EN JEU</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onLaunchGame(game.id)}
                    disabled={loading || status?.is_running}
                    className={`w-full py-2.5 rounded-2xl font-bold font-arcade text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-gradient-to-r from-retro-primary to-retro-purple hover:shadow-retro-primary/30 text-white'
                        : 'bg-gradient-to-r from-retro-primary to-retro-orange text-white shadow-retro'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>LANCER SUR LA BORNE</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
