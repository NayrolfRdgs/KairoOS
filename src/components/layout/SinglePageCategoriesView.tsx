import React, { useState, useMemo } from 'react';
import {
  Gamepad2,
  Search,
  Settings as SettingsIcon,
  Star,
  Users,
  Sparkles,
  Layers,
  Clock,
  PlusCircle,
  Lock,
  Flame,
  Swords,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Game, System, AppMode, Theme, FranchiseCollection } from '../../types';
import { GameCard } from '../games/GameCard';
import { ConsoleLogo } from '../common/ConsoleLogo';

interface SinglePageCategoriesViewProps {
  systems: System[];
  allGames: Game[];
  allFranchises: (FranchiseCollection | string)[];
  favoriteGames: Game[];
  twoPlayerGames: Game[];
  recentGames: Game[];
  focusedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenSettings: () => void;
  onOpenGamepadSettings: () => void;
  onOpenScanner?: () => void;
  onOpenAddGame?: () => void;
  onOpenKioskUnlock?: () => void;
  gamepadConnected: boolean;
  gamepadName: string | null;
  appMode?: AppMode;
  theme: Theme;
}

export const SinglePageCategoriesView: React.FC<SinglePageCategoriesViewProps> = ({
  systems,
  allGames,
  allFranchises,
  favoriteGames,
  twoPlayerGames,
  recentGames,
  focusedGameId,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenAddGame,
  onOpenKioskUnlock,
  gamepadConnected,
  gamepadName,
  appMode = 'admin',
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string | null>(null);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string | null>(null);

  const isKiosk = appMode === 'kiosk';
  const layout = theme.layout || {
    show_consoles_row: true,
    show_modes_row: true,
    show_genres_row: true,
    show_favorites_row: true,
    show_all_games_row: true,
  };

  // Filtrage si recherche
  const searchedGames = useMemo(() => {
    let list = allGames;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.system_id && g.system_id.toLowerCase().includes(q)) ||
          (g.franchise && g.franchise.toLowerCase().includes(q))
      );
    }
    if (selectedSystemFilter) {
      list = list.filter((g) => g.system_id === selectedSystemFilter);
    }
    if (selectedGenreFilter) {
      list = list.filter(
        (g) => g.franchise?.toLowerCase() === selectedGenreFilter.toLowerCase()
      );
    }
    return list;
  }, [allGames, searchQuery, selectedSystemFilter, selectedGenreFilter]);

  // Systèmes avec jeux
  const systemsWithCounts = useMemo(() => {
    return systems.map((sys) => {
      const count = allGames.filter((g) => g.system_id === sys.id).length;
      return { ...sys, count };
    });
  }, [systems, allGames]);

  // Jeux de combat / action / plateformes
  const fightGames = useMemo(() => {
    return allGames.filter((g) => {
      const t = g.title.toLowerCase();
      const desc = (g.synopsis || '').toLowerCase();
      return (
        t.includes('street fighter') ||
        t.includes('mortal kombat') ||
        t.includes('tekken') ||
        t.includes('kof') ||
        t.includes('fight') ||
        desc.includes('combat') ||
        desc.includes('fighting')
      );
    });
  }, [allGames]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
    >
      {/* 1. Header Plein Écran Moderne (Sans Sidebar) */}
      <header
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--border-color)',
        }}
        className="px-6 py-3.5 border-b flex items-center justify-between gap-4 shrink-0 shadow-xs z-30"
      >
        {/* Logo & Borne Status */}
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: 'var(--accent-primary)' }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-black/10 shrink-0"
          >
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-base font-black tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                KAÏRO
              </span>
              <span
                style={{ backgroundColor: 'var(--accent-primary)' }}
                className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white font-mono uppercase"
              >
                HUB
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
                className="px-2 py-0.5 rounded-md border text-[10px] font-bold"
              >
                {allGames.length} jeux
              </span>
            </div>
            <div
              className="flex items-center gap-2 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {gamepadConnected
                  ? `${gamepadName || 'Manette connectée'}`
                  : 'Borne prête'}
              </span>
            </div>
          </div>
        </div>

        {/* Barre de Recherche intégrée */}
        <div className="flex-1 max-w-md mx-4">
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border shadow-2xs transition-colors focus-within:border-[var(--accent-primary)]"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un jeu, une console, une saga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
              className="bg-transparent text-xs font-semibold focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Boutons d'Action Rapide */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedSystemFilter && (
            <button
              onClick={() => setSelectedSystemFilter(null)}
              className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1"
            >
              <span>Filtre: {selectedSystemFilter.toUpperCase()}</span>
              <span>✕</span>
            </button>
          )}

          {selectedGenreFilter && (
            <button
              onClick={() => setSelectedGenreFilter(null)}
              className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1"
            >
              <span>Saga: {selectedGenreFilter}</span>
              <span>✕</span>
            </button>
          )}

          {isKiosk ? (
            <button
              onClick={onOpenKioskUnlock}
              className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 animate-pulse"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kiosk</span>
            </button>
          ) : (
            <>
              {onOpenAddGame && (
                <button
                  onClick={onOpenAddGame}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                  className="p-2 rounded-xl border hover:scale-105 shadow-2xs transition-all"
                  title="Ajouter un jeu"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onOpenGamepadSettings}
                style={{
                  backgroundColor: gamepadConnected
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'var(--bg-card)',
                  borderColor: gamepadConnected ? '#10b981' : 'var(--border-color)',
                  color: gamepadConnected ? '#10b981' : 'var(--text-secondary)',
                }}
                className="p-2 rounded-xl border hover:scale-105 shadow-2xs transition-all"
                title="Configuration manettes"
              >
                <Gamepad2 className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSettings}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border hover:scale-102 shadow-2xs transition-all text-xs font-bold"
                title="Paramètres de la borne"
              >
                <SettingsIcon
                  className="w-4 h-4"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <span>Paramètres</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* 2. Contenu Défilable Plein Écran par Catégories */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin">
        {/* Si une recherche ou un filtre est actif, on affiche les résultats directs */}
        {searchQuery.trim() || selectedSystemFilter || selectedGenreFilter ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <h3
                  style={{ color: 'var(--text-primary)' }}
                  className="text-base font-black tracking-tight"
                >
                  Résultats ({searchedGames.length} jeux)
                </h3>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSystemFilter(null);
                  setSelectedGenreFilter(null);
                }}
                style={{ color: 'var(--accent-primary)' }}
                className="text-xs font-bold hover:underline"
              >
                Effacer les filtres
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {searchedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFocused={focusedGameId === game.id}
                  onSelect={onSelectGame}
                  onLaunch={onLaunchGame}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
              {searchedGames.length === 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                  }}
                  className="w-full p-8 rounded-3xl border text-center text-xs text-slate-400 font-bold"
                >
                  Aucun jeu ne correspond à votre recherche.
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* RAYON 1 : 🕹️ Consoles & Systèmes */}
            {layout.show_consoles_row !== false && systemsWithCounts.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers
                      className="w-4 h-4"
                      style={{ color: 'var(--accent-primary)' }}
                    />
                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="text-base font-black tracking-tight"
                    >
                      Consoles & Systèmes Rétro
                    </h3>
                  </div>
                  <span
                    style={{ color: 'var(--text-muted)' }}
                    className="text-xs font-medium"
                  >
                    Sélectionnez une plateforme
                  </span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {systemsWithCounts.map((sys) => {
                    const isSelected = selectedSystemFilter === sys.id;

                    return (
                      <div
                        key={sys.id}
                        onClick={() =>
                          setSelectedSystemFilter(
                            selectedSystemFilter === sys.id ? null : sys.id
                          )
                        }
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--bg-card)',
                          borderColor: isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--border-color)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        }}
                        className={`min-w-[170px] p-3.5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 shadow-2xs flex flex-col justify-between shrink-0 group ${
                          isSelected ? 'ring-2 ring-[var(--accent-primary)]/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(255,255,255,0.2)'
                                : 'var(--bg-secondary)',
                            }}
                            className="p-2 rounded-xl flex items-center justify-center"
                          >
                            <ConsoleLogo
                              systemId={sys.id}
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                          <span
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(255,255,255,0.25)'
                                : 'var(--bg-secondary)',
                              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold"
                          >
                            {sys.count} jeux
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-black truncate">{sys.name}</div>
                          <div
                            className="text-[10px] opacity-75 truncate"
                            style={{
                              color: isSelected ? '#ffffff' : 'var(--text-muted)',
                            }}
                          >
                            {sys.manufacturer || 'Arcade'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* RAYON 2 : ⭐ Favoris */}
            {layout.show_favorites_row !== false && favoriteGames.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star
                      className="w-4 h-4 text-amber-500 fill-amber-500"
                    />
                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="text-base font-black tracking-tight"
                    >
                      Vos Jeux Favoris ({favoriteGames.length})
                    </h3>
                  </div>
                  <span
                    style={{ color: 'var(--text-muted)' }}
                    className="text-xs font-medium"
                  >
                    Accès rapide
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none items-center">
                  {favoriteGames.map((game) => (
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
              </section>
            )}

            {/* RAYON 3 : 👥 Modes de Jeux (2 Joueurs & Multijoueur) */}
            {layout.show_modes_row !== false && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users
                      className="w-4 h-4"
                      style={{ color: 'var(--accent-primary)' }}
                    />
                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="text-base font-black tracking-tight"
                    >
                      Modes & Jeux Multijoueur
                    </h3>
                  </div>
                  <span
                    style={{ color: 'var(--text-muted)' }}
                    className="text-xs font-medium"
                  >
                    Idéal pour borne à deux
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => {
                      if (twoPlayerGames.length > 0) {
                        onSelectGame(twoPlayerGames[0]);
                      }
                    }}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                    }}
                    className="p-4 rounded-2xl border hover:border-[var(--accent-primary)] cursor-pointer transition-all shadow-2xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          style={{ color: 'var(--text-primary)' }}
                          className="text-xs font-black"
                        >
                          Mode 2 Joueurs
                        </div>
                        <div
                          style={{ color: 'var(--text-muted)' }}
                          className="text-[10px]"
                        >
                          {twoPlayerGames.length} jeux compatibles
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <div
                    onClick={() => {
                      if (fightGames.length > 0) {
                        onSelectGame(fightGames[0]);
                      }
                    }}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                    }}
                    className="p-4 rounded-2xl border hover:border-[var(--accent-primary)] cursor-pointer transition-all shadow-2xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
                        <Swords className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          style={{ color: 'var(--text-primary)' }}
                          className="text-xs font-black"
                        >
                          Jeux de Combat & Versus
                        </div>
                        <div
                          style={{ color: 'var(--text-muted)' }}
                          className="text-[10px]"
                        >
                          {fightGames.length} jeux arcade
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <div
                    onClick={() => {
                      if (recentGames.length > 0) {
                        onSelectGame(recentGames[0]);
                      }
                    }}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                    }}
                    className="p-4 rounded-2xl border hover:border-[var(--accent-primary)] cursor-pointer transition-all shadow-2xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          style={{ color: 'var(--text-primary)' }}
                          className="text-xs font-black"
                        >
                          Récemment Joués
                        </div>
                        <div
                          style={{ color: 'var(--text-muted)' }}
                          className="text-[10px]"
                        >
                          {recentGames.length} sessions
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </section>
            )}

            {/* RAYON 4 : 🏷️ Sagas & Franchises Célèbres */}
            {layout.show_genres_row !== false && allFranchises.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame
                      className="w-4 h-4"
                      style={{ color: 'var(--accent-primary)' }}
                    />
                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="text-base font-black tracking-tight"
                    >
                      Sagas & Franchises Phares
                    </h3>
                  </div>
                  <span
                    style={{ color: 'var(--text-muted)' }}
                    className="text-xs font-medium"
                  >
                    Filtrer par univers
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {allFranchises.map((item) => {
                    const franchiseName = typeof item === 'string' ? item : item.name;
                    const franchiseId = typeof item === 'string' ? item : item.id;
                    const count = allGames.filter(
                      (g) => g.franchise?.toLowerCase() === franchiseName.toLowerCase()
                    ).length;
                    const isSelected = selectedGenreFilter === franchiseName;

                    return (
                      <button
                        key={franchiseId}
                        onClick={() =>
                          setSelectedGenreFilter(
                            selectedGenreFilter === franchiseName ? null : franchiseName
                          )
                        }
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--bg-card)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          borderColor: isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--border-color)',
                        }}
                        className={`px-3.5 py-2 rounded-xl border-2 text-xs font-bold whitespace-nowrap transition-all hover:scale-105 shadow-2xs flex items-center gap-2 ${
                          isSelected ? 'ring-2 ring-[var(--accent-primary)]/20' : ''
                        }`}
                      >
                        <span className="capitalize">{franchiseName}</span>
                        <span
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.25)'
                              : 'var(--bg-secondary)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          }}
                          className="px-1.5 py-0.2 rounded-md text-[10px] font-mono"
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* RAYON 5 : 🎮 Tous les Jeux (Bibliothèque Complète) */}
            {layout.show_all_games_row !== false && allGames.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="w-4 h-4"
                      style={{ color: 'var(--accent-primary)' }}
                    />
                    <h3
                      style={{ color: 'var(--text-primary)' }}
                      className="text-base font-black tracking-tight"
                    >
                      Bibliothèque Complète ({allGames.length} jeux)
                    </h3>
                  </div>
                  <span
                    style={{ color: 'var(--text-muted)' }}
                    className="text-xs font-medium"
                  >
                    Défilement horizontal
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none items-center">
                  {allGames.map((game) => (
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
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};
