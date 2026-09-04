import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface GamepadFooterBarProps {
  buttonStyle?: 'xbox' | 'playstation';
  isGameRunning?: boolean;
  isDetailsModalOpen?: boolean;
  isOtherModalOpen?: boolean;
  gameSelectAction?: 'launch' | 'details';
  isConnected?: boolean;
  gamepadName?: string | null;
}

export const GamepadFooterBar: React.FC<GamepadFooterBarProps> = ({
  buttonStyle = 'xbox',
  isGameRunning = false,
  isDetailsModalOpen = false,
  isOtherModalOpen = false,
  gameSelectAction = 'details',
  isConnected = false,
  gamepadName,
}) => {
  const isXbox = buttonStyle === 'xbox';

  // Badge rendu selon le style Xbox ou PlayStation
  const renderBadge = (key: 'A' | 'B' | 'X' | 'Y' | 'LB_RB' | 'SELECT' | 'START') => {
    switch (key) {
      case 'A':
        return isXbox ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] shadow-2xs">
            A
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[11px] shadow-2xs">
            ✕
          </span>
        );
      case 'B':
        return isXbox ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[11px] shadow-2xs">
            B
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[11px] shadow-2xs">
            ○
          </span>
        );
      case 'X':
        return isXbox ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[11px] shadow-2xs">
            X
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white font-black text-[11px] shadow-2xs">
            □
          </span>
        );
      case 'Y':
        return isXbox ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[11px] shadow-2xs">
            Y
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[11px] shadow-2xs">
            △
          </span>
        );
      case 'LB_RB':
        return isXbox ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-black/10">
            LB/RB
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-black/10">
            L1/R1
          </span>
        );
      case 'SELECT':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-black/10">
            {isXbox ? 'Back' : 'Share'}
          </span>
        );
      case 'START':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-black/10">
            {isXbox ? 'Start' : 'Options'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
      }}
      className="shrink-0 h-11 border-t px-4 flex items-center justify-between text-xs font-semibold select-none backdrop-blur-xs z-30 transition-colors"
    >
      {/* Liste des raccourcis contextuels */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
        {isGameRunning ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200">
                {isXbox ? 'Back + Start' : 'Share + Options'}
              </span>
              <span className="font-bold text-rose-600">Quitter le jeu (Coin + Start)</span>
            </div>
          </>
        ) : isDetailsModalOpen ? (
          <>
            <div className="flex items-center gap-1.5">
              {renderBadge('A')}
              <span className="text-[11px] font-bold text-[var(--text-primary)]">Lancer le jeu</span>
            </div>
            <div className="flex items-center gap-1.5">
              {renderBadge('B')}
              <span className="text-[11px]">Fermer</span>
            </div>
            <div className="flex items-center gap-1.5">
              {renderBadge('X')}
              <span className="text-[11px]">Favori</span>
            </div>
            <div className="flex items-center gap-1.5">
              {renderBadge('Y')}
              <span className="text-[11px]">Émulateur</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              {renderBadge('LB_RB')}
              <span className="text-[11px]">Changer d'onglet</span>
            </div>
          </>
        ) : isOtherModalOpen ? (
          <>
            <div className="flex items-center gap-1.5">
              {renderBadge('B')}
              <span className="text-[11px] font-bold text-[var(--text-primary)]">Fermer / Retour</span>
            </div>
            <div className="flex items-center gap-1.5">
              {renderBadge('A')}
              <span className="text-[11px]">Valider</span>
            </div>
          </>
        ) : (
          <>
            {/* Mode Catalogue */}
            <div className="flex items-center gap-1.5">
              {renderBadge('A')}
              <span className="text-[11px] font-bold text-[var(--text-primary)]">
                {gameSelectAction === 'launch' ? 'Lancer' : 'Fiche du jeu'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {renderBadge('Y')}
              <span className="text-[11px]">
                {gameSelectAction === 'launch' ? 'Fiche du jeu' : 'Onglet émulateur'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {renderBadge('X')}
              <span className="text-[11px]">Favori</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              {renderBadge('LB_RB')}
              <span className="text-[11px]">Système préc. / suiv.</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              {renderBadge('SELECT')}
              <span className="text-[11px]">Paramètres</span>
            </div>
          </>
        )}
      </div>

      {/* Statut manette à droite */}
      <div className="shrink-0 flex items-center gap-2 pl-3 border-l border-black/5 dark:border-white/5">
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
            color: isConnected ? '#059669' : '#64748b',
          }}
          title={gamepadName || (isConnected ? 'Manette active' : 'Aucune manette détectée')}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isConnected ? (gamepadName ? gamepadName.slice(0, 18) : 'Manette connectée') : 'Clavier / Souris'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
        </div>
      </div>
    </footer>
  );
};
