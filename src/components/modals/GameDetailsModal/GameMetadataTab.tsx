import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Game, LocalGameMetadata } from '../../../types';

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
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    <div className="space-y-4 max-w-2xl">
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
        💾 L'enregistrement créera ou mettra à jour directement le fichier{' '}
        <code className="font-mono font-bold">.json</code> adjacent à votre ROM pour une portabilité 100% autonome.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Titre du Jeu
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Franchise / Saga
          </label>
          <input
            type="text"
            value={metaFranchise}
            onChange={(e) => setMetaFranchise(e.target.value)}
            placeholder="ex: Super Mario, Zelda, Sonic..."
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Date de Sortie (YYYY-MM-DD)
          </label>
          <input
            type="text"
            value={metaReleaseDate}
            onChange={(e) => setMetaReleaseDate(e.target.value)}
            placeholder="ex: 1991-11-21"
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Genre / Type de Jeu
          </label>
          <input
            type="text"
            value={metaGenre}
            onChange={(e) => setMetaGenre(e.target.value)}
            placeholder="ex: Plateforme, Combat, RPG..."
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Développeur
          </label>
          <input
            type="text"
            value={metaDeveloper}
            onChange={(e) => setMetaDeveloper(e.target.value)}
            placeholder="ex: Nintendo EAD, Capcom..."
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Éditeur (Publisher)
          </label>
          <input
            type="text"
            value={metaPublisher}
            onChange={(e) => setMetaPublisher(e.target.value)}
            placeholder="ex: Nintendo, Sega, Sony..."
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Nombre de Joueurs
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={metaPlayers}
            onChange={(e) => setMetaPlayers(e.target.value)}
            placeholder="ex: 1, 2, 4..."
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
            Note (0.0 à 5.0)
          </label>
          <input
            type="text"
            value={metaRating}
            onChange={(e) => setMetaRating(e.target.value)}
            placeholder="ex: 4.8"
            className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-retro-text mb-1">
          Synopsis / Résumé
        </label>
        <textarea
          rows={3}
          value={metaSynopsis}
          onChange={(e) => setMetaSynopsis(e.target.value)}
          placeholder="Histoire du jeu..."
          className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
        />
      </div>

      <div className="pt-2 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-retro-primary text-white font-bold text-xs uppercase tracking-wider shadow-retro-neon hover:scale-105 active:scale-95 transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Enregistrer Métadonnées & Fichier JSON</span>
        </button>

        {savedSuccess && (
          <span className="text-emerald-600 font-bold text-xs animate-fadeIn">
            ✓ Fichier JSON et métadonnées sauvegardés !
          </span>
        )}
      </div>
    </div>
  );
};
