import React from 'react';
import { Clock } from 'lucide-react';
import { Game } from '../../../types';
import { formatPlayTime } from '../../../utils';
import { GameCardCover } from './GameCardCover';
import { GameCardOverlay } from './GameCardOverlay';

interface GameCardProps {
  game: Game;
  isFocused: boolean;
  onSelect: (game: Game) => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFocused,
  onSelect,
  onLaunch,
  onToggleFavorite,
}) => {
  const playTimeStr = formatPlayTime(game.play_time_seconds);

  return (
    <div
      onClick={() => onSelect(game)}
      onDoubleClick={() => onLaunch(game)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-200 cursor-pointer shadow-retro hover:shadow-retro-md ${
        isFocused
          ? 'gamepad-focused border-retro-primary z-20'
          : 'border-retro-border hover:border-retro-primary/60 hover:-translate-y-1'
      }`}
    >
      {/* Zone Jaquette + Overlay d'actions */}
      <div className="relative">
        <GameCardCover game={game} onToggleFavorite={onToggleFavorite} />
        <GameCardOverlay
          game={game}
          isFocused={isFocused}
          onSelect={onSelect}
          onLaunch={onLaunch}
        />
      </div>

      {/* Corps de la Carte */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-xs font-bold text-retro-text truncate font-display tracking-wide" title={game.title}>
            {game.title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-[10px] text-retro-textMuted">
            <span className="truncate uppercase font-semibold text-retro-primary">{game.system_id}</span>
            {game.release_date && <span className="font-medium">{game.release_date.slice(0, 4)}</span>}
          </div>
        </div>

        {playTimeStr && (
          <div className="mt-2 pt-2 border-t border-retro-border flex items-center gap-1.5 text-[10px] text-retro-textMuted font-medium">
            <Clock className="w-3 h-3 text-retro-cyan" />
            <span>{playTimeStr}</span>
          </div>
        )}
      </div>
    </div>
  );
};
