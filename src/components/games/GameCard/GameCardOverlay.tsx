import React from 'react';
import { Play, Info } from 'lucide-react';
import { Game } from '../../../types';

interface GameCardOverlayProps {
  game: Game;
  isFocused: boolean;
  onSelect: (game: Game) => void;
  onLaunch: (game: Game) => void;
}

export const GameCardOverlay: React.FC<GameCardOverlayProps> = ({
  game,
  isFocused,
  onSelect,
  onLaunch,
}) => {
  return (
    <div
      className={`absolute inset-0 bg-retro-text/40 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-200 ${
        isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLaunch(game);
        }}
        title="Lancer le jeu (Entrée ou Double-clic)"
        className="w-12 h-12 rounded-full bg-retro-primary text-white flex items-center justify-center shadow-retro-neon hover:scale-110 active:scale-95 transition-all"
      >
        <Play className="w-6 h-6 fill-white ml-0.5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(game);
        }}
        title="Détails & Config"
        className="w-10 h-10 rounded-full bg-white text-retro-text flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
      >
        <Info className="w-5 h-5 text-retro-text" />
      </button>
    </div>
  );
};
