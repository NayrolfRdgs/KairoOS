import React, { useState } from 'react';
import { Check, Search, Sparkles } from 'lucide-react';
import { Game, LocalGameMetadata } from '../../../types';

import { searchOnlineGameMetadata } from '../../../utils/scraper';

interface GameMetadataTabProps {
  game: Game;
  onSaveMetadata: (gameId: string, metadata: LocalGameMetadata) => Promise<void>;
}

export const GameMetadataTab: React.FC<GameMetadataTabProps> = ({ game, onSaveMetadata }) => {
  const [metaTitle, setMetaTitle] = useState(game.title);
  const [metaFranchise, setMetaFranchise] = useState(game.franchise || '');
  const [metaReleaseDate, setMetaReleaseDate] = useState(game.release_date || '');
  const [metaDeveloper, setMetaDeveloper] = useState(game.developer || '');
  const [metaPublisher, setMetaPublisher] = useState(game.publisher || '');
  const [metaGenre, setMetaGenre] = useState(game.genre || '');
  const [metaRating, setMetaRating] = useState<string>(game.rating ? game.rating.toString() : '');
  const [metaPlayers, setMetaPlayers] = useState<string>(game.players ? game.players.toString() : '');
  const [metaSynopsis, setMetaSynopsis] = useState(game.synopsis || '');
  const [isSearching, setIsSearching] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAutoFetch = async () => {
    setIsSearching(true);
    try {
      const scraped = await searchOnlineGameMetadata(metaTitle || game.title, game.system_id);
      if (scraped.title) setMetaTitle(scraped.title);
      if (scraped.release_date) setMetaReleaseDate(scraped.release_date);
      if (scraped.developer) setMetaDeveloper(scraped.developer);
      if (scraped.publisher) setMetaPublisher(scraped.publisher);
      if (scraped.genre) setMetaGenre(scraped.genre);
      if (scraped.rating) setMetaRating(scraped.rating.toString());
      if (scraped.players) setMetaPlayers(scraped.players.toString());
      if (scraped.synopsis) setMetaSynopsis(scraped.synopsis);
    } catch (err) {
      console.warn('Erreur auto scrape:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    const parsedRating = parseFloat(metaRating);
    const parsedPlayers = parseInt(metaPlayers, 10);

    const metadata: LocalGameMetadata = {
      title: metaTitle.trim() || game.title,
      franchise: metaFranchise.trim() ? metaFranchise.trim() : undefined,
      system_id: game.system_id,
      release_date: metaReleaseDate.trim() ? metaReleaseDate.trim() : undefined,
      developer: metaDeveloper.trim() ? metaDeveloper.trim() : undefined,
      publisher: metaPublisher.trim() ? metaPublisher.trim() : undefined,
      genre: metaGenre.trim() ? metaGenre.trim() : undefined,
      rating: isNaN(parsedRating) ? undefined : parsedRating,
      players: isNaN(parsedPlayers) ? undefined : parsedPlayers,
      synopsis: metaSynopsis.trim() ? metaSynopsis.trim() : undefined,
    };

    await onSaveMetadata(game.id, metadata);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* 1. Bloc de Recherche Automatique */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Actualiser automatiquement les informations
          </span>
          <span className="text-[11px] text-slate-500">
            Recherche en ligne le titre officiel, l'année, le développeur, le genre et la description.
          </span>
        </div>

        <button
          type="button"
          onClick={handleAutoFetch}
          disabled={isSearching}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20 flex items-center gap-1.5 active:scale-95 transition-all shrink-0 disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isSearching ? 'Recherche...' : 'Rechercher Infos'}</span>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
        💾 L'enregistrement créera ou mettra à jour directement le fichier{' '}
        <code className="font-mono font-bold">.json</code> adjacent à votre ROM pour une portabilité 100% autonome.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Titre du Jeu
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Franchise / Saga
          </label>
          <input
            type="text"
            value={metaFranchise}
            onChange={(e) => setMetaFranchise(e.target.value)}
            placeholder="ex: Super Mario, Zelda, Sonic..."
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Date de Sortie (YYYY ou YYYY-MM-DD)
          </label>
          <input
            type="text"
            value={metaReleaseDate}
            onChange={(e) => setMetaReleaseDate(e.target.value)}
            placeholder="ex: 1991-11-21"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Genre / Type de Jeu
          </label>
          <input
            type="text"
            value={metaGenre}
            onChange={(e) => setMetaGenre(e.target.value)}
            placeholder="ex: Plateforme, Combat, RPG..."
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Développeur
          </label>
          <input
            type="text"
            value={metaDeveloper}
            onChange={(e) => setMetaDeveloper(e.target.value)}
            placeholder="ex: Capcom, Nintendo EAD, Konami"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Éditeur
          </label>
          <input
            type="text"
            value={metaPublisher}
            onChange={(e) => setMetaPublisher(e.target.value)}
            placeholder="ex: Capcom, Sega, Nintendo"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Note (sur 5.0)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={metaRating}
            onChange={(e) => setMetaRating(e.target.value)}
            placeholder="ex: 4.8"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Nombre de Joueurs
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={metaPlayers}
            onChange={(e) => setMetaPlayers(e.target.value)}
            placeholder="ex: 2"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
          Synopsis / Description
        </label>
        <textarea
          rows={3}
          value={metaSynopsis}
          onChange={(e) => setMetaSynopsis(e.target.value)}
          placeholder="Résumé ou histoire du jeu..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-100 text-xs font-sans text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        {savedSuccess ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Check className="w-4 h-4" />
            <span>Métadonnées enregistrées avec succès !</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">Fichier .json prêt à être mis à jour</span>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Enregistrer les Métadonnées</span>
        </button>
      </div>
    </div>
  );
};
