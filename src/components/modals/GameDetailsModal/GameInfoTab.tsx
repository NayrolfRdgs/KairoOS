import React from 'react';
import { Clock, Play, HardDrive, Users, Folder } from 'lucide-react';
import { Game } from '../../../types';
import { formatPlayTime, formatFileSize } from '../../../utils';

interface GameInfoTabProps {
  game: Game;
}

export const GameInfoTab: React.FC<GameInfoTabProps> = ({ game }) => {
  const playTimeDisplay = formatPlayTime(game.play_time_seconds) || '0 min';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Colonne Jaquette */}
      <div className="flex flex-col items-center">
        <div className="w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-retro-bg border border-retro-border shadow-retro-md flex items-center justify-center">
          {game.cover_url ? (
            <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4 text-retro-textMuted">
              <span className="font-bold text-retro-text">{game.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Colonne Détails & Synopsis */}
      <div className="md:col-span-2 space-y-5">
        <div>
          <h3 className="text-xs font-black uppercase text-retro-textLight tracking-wider mb-1.5">
            Synopsis / Histoire
          </h3>
          <p className="text-retro-text leading-relaxed text-xs">
            {game.synopsis ||
              'Aucun résumé disponible pour ce jeu. Vous pouvez éditer les métadonnées pour enrichir la fiche.'}
          </p>
        </div>

        {/* Grille de stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
            <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Temps Joué</span>
            <div className="flex items-center gap-1.5 font-bold text-retro-text">
              <Clock className="w-4 h-4 text-retro-cyan" />
              <span>{playTimeDisplay}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
            <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Lancements</span>
            <div className="flex items-center gap-1.5 font-bold text-retro-text">
              <Play className="w-4 h-4 text-retro-primary" />
              <span>{game.play_count} fois</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
            <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Taille Fichier</span>
            <div className="flex items-center gap-1.5 font-bold text-retro-text">
              <HardDrive className="w-4 h-4 text-retro-yellow" />
              <span>{formatFileSize(game.file_size)}</span>
            </div>
          </div>

          {game.release_date && (
            <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
              <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Sortie</span>
              <span className="font-bold text-retro-text truncate block">{game.release_date}</span>
            </div>
          )}

          {game.developer && (
            <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
              <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Développeur</span>
              <span className="font-bold text-retro-text truncate block">{game.developer}</span>
            </div>
          )}

          {game.genre && (
            <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
              <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Genre</span>
              <span className="font-bold text-retro-text truncate block">{game.genre}</span>
            </div>
          )}

          {game.players && (
            <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
              <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Joueurs</span>
              <div className="flex items-center gap-1.5 font-bold text-retro-text">
                <Users className="w-4 h-4 text-retro-purple" />
                <span>{game.players} Joueur(s)</span>
              </div>
            </div>
          )}
        </div>

        {/* Chemin du fichier */}
        <div className="p-3 rounded-xl bg-retro-bg border border-retro-border text-[11px] font-mono text-retro-textMuted truncate flex items-center gap-2">
          <Folder className="w-4 h-4 text-retro-primary shrink-0" />
          <span className="truncate">{game.file_path}</span>
        </div>
      </div>
    </div>
  );
};
