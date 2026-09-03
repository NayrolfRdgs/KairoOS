import React, { useState, useEffect } from 'react';
import {
  Tv,
  Gamepad2,
  Square,
  Play,
  Lock,
  Unlock,
  Clock,
  Wifi,
  Copy,
  Check,
  Flame,
  History,
  Sparkles,
} from 'lucide-react';
import { ThemeMode, StatusResponse, Game } from '../types';

interface DashboardViewProps {
  status: StatusResponse | null;
  recentGames: Game[];
  onLaunchGame: (gameId: string) => Promise<void>;
  onStopGame: () => Promise<void>;
  onLockKiosk: () => Promise<void>;
  onOpenUnlockModal: () => void;
  onNavigateToGames: () => void;
  loading: boolean;
  theme: ThemeMode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  recentGames,
  onLaunchGame,
  onStopGame,
  onLockKiosk,
  onOpenUnlockModal,
  onNavigateToGames,
  loading,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [seconds, setSeconds] = useState<number>(status?.elapsed_seconds || 0);
  const [copiedIp, setCopiedIp] = useState(false);

  // Chronomètre en temps réel
  useEffect(() => {
    if (status?.is_running) {
      setSeconds(status.elapsed_seconds || 0);
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setSeconds(0);
    }
  }, [status?.is_running, status?.elapsed_seconds]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleCopyIp = () => {
    if (status?.local_ip) {
      const url = `http://${status.local_ip}:${status.port || 8080}`;
      navigator.clipboard?.writeText(url);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Carte Principale : Statut en Jeu ou En Attente */}
      <div
        className={`p-6 rounded-3xl border transition-all relative overflow-hidden shadow-lg ${
          status?.is_running
            ? isDark
              ? 'bg-gradient-to-br from-retro-panel to-retro-card border-retro-primary shadow-[0_0_30px_rgba(255,51,102,0.2)]'
              : 'bg-white border-retro-primary shadow-retro-neon'
            : isDark
            ? 'bg-retro-card border-retro-border'
            : 'bg-white border-retro-border shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                status?.is_running ? 'bg-retro-green animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider font-arcade">
              {status?.is_running ? 'SESSION EN COURS 🕹️' : 'BORNE DISPONIBLE'}
            </span>
          </div>

          {status?.is_running ? (
            <span className="px-3 py-1 rounded-full text-xs font-black font-arcade bg-retro-green/20 text-retro-green border border-retro-green/40 flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>EN JEU</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold font-arcade bg-slate-500/20 text-slate-400">
              IDLE (EN ATTENTE)
            </span>
          )}
        </div>

        {status?.is_running ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Jaquette du jeu en cours */}
              <div className="w-28 h-36 rounded-2xl bg-retro-panel border-2 border-retro-primary/40 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                {status.current_game_cover ? (
                  <img
                    src={status.current_game_cover}
                    alt={status.current_game_title || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gamepad2 className="w-12 h-12 text-retro-primary" />
                )}
              </div>

              {/* Titre & Durée */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-retro-cyan/20 text-retro-cyan border border-retro-cyan/40 text-[10px] font-bold font-mono uppercase">
                  {status.current_system_id || 'Arcade'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-arcade text-white tracking-wide leading-tight">
                  {status.current_game_title || 'Jeu en cours'}
                </h2>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-300 font-mono pt-1">
                  <Clock className="w-4 h-4 text-retro-yellow animate-spin" />
                  <span>Durée de session :</span>
                  <span className="text-retro-yellow font-black text-sm">{formatTime(seconds)}</span>
                </div>
              </div>
            </div>

            {/* Bouton STOP d'urgence */}
            <button
              onClick={onStopGame}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-retro-primary hover:from-red-500 hover:to-retro-primary text-white font-black font-arcade text-xs tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>ARRÊTER LE JEU (STOP D'URGENCE)</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-retro-primary/10 border border-retro-primary/20 flex items-center justify-center text-retro-primary">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-base font-arcade">Borne Prête pour une Partie</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Choisissez un jeu dans la bibliothèque ou relancez une session depuis l'historique ci-dessous.
              </p>
            </div>
            <button
              onClick={onNavigateToGames}
              className={`px-6 py-3 rounded-2xl font-bold font-arcade text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 mx-auto ${
                isDark
                  ? 'bg-gradient-to-r from-retro-primary to-retro-purple text-white hover:shadow-retro-primary/30'
                  : 'bg-gradient-to-r from-retro-primary to-retro-orange text-white shadow-retro'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PARCOURIR LES JEUX</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Grille Desktop / Colonnes : Historique Récent + Contrôle Kiosk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Historique des 5 derniers jeux (col-span-7) */}
        <div
          className={`lg:col-span-7 p-6 rounded-3xl border space-y-4 shadow-sm ${
            isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-retro-border/50">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-retro-cyan" />
              <h3 className="text-xs font-black uppercase font-arcade tracking-wider">
                Derniers Jeux Lancés
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Top 5 récents</span>
          </div>

          <div className="space-y-2.5">
            {recentGames.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Aucun historique de partie récent.
              </div>
            ) : (
              recentGames.map((game) => (
                <div
                  key={game.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isDark
                      ? 'bg-retro-panel/60 border-retro-border hover:border-retro-cyan/50'
                      : 'bg-retro-warm/50 border-retro-border hover:border-retro-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-retro-panel border border-retro-border shrink-0 flex items-center justify-center overflow-hidden">
                      {game.cover_url ? (
                        <img src={game.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Gamepad2 className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate">{game.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-mono uppercase font-bold text-retro-cyan">
                          {game.system_id}
                        </span>
                        {game.play_count > 0 && <span>• {game.play_count} partie(s)</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onLaunchGame(game.id)}
                    disabled={loading || status?.is_running}
                    className="px-3 py-1.5 rounded-xl bg-retro-primary/20 hover:bg-retro-primary text-retro-primary hover:text-white border border-retro-primary/40 text-xs font-bold font-arcade shrink-0 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-40"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>RELANCER</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Colonne Droite : Mode Kiosk & Accès Réseau (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Carte Mode Kiosk */}
          <div
            className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
              isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-retro-border/50">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">
                  {status?.kiosk_mode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </span>
                <h3 className="text-xs font-black uppercase font-arcade tracking-wider">
                  Sécurité Mode Salle
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-arcade ${
                  status?.kiosk_mode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {status?.kiosk_mode ? 'VERROUILLÉ 🔒' : 'ADMIN 🔓'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {status?.kiosk_mode
                ? 'Les menus de configuration et de scan sont masqués sur la borne pour les joueurs.'
                : 'La borne est en mode administrateur complet.'}
            </p>

            {status?.kiosk_mode ? (
              <button
                onClick={onOpenUnlockModal}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-retro-dark font-black font-arcade text-xs tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>DÉVERROUILLER AVEC LE PIN</span>
              </button>
            ) : (
              <button
                onClick={onLockKiosk}
                disabled={loading}
                className={`w-full py-3 rounded-2xl border font-bold font-arcade text-xs tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-retro-panel hover:bg-slate-700 text-white border-retro-border'
                    : 'bg-retro-warm hover:bg-slate-200 text-retro-text border-retro-border'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>VERROUILLER EN MODE KIOSK</span>
              </button>
            )}
          </div>

          {/* Carte Accès Réseau & Mobile */}
          <div
            className={`p-6 rounded-3xl border space-y-3 shadow-sm ${
              isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-retro-border/50">
              <Wifi className="w-5 h-5 text-retro-cyan" />
              <h3 className="text-xs font-black uppercase font-arcade tracking-wider">
                Adresse Télécommande
              </h3>
            </div>

            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-retro-panel border-retro-border font-mono' : 'bg-retro-warm border-retro-border font-mono'
              }`}
            >
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px]">URL Wi-Fi Smartphone :</span>
                <span className="font-bold text-retro-cyan text-sm">
                  http://{status?.local_ip || '127.0.0.1'}:{status?.port || 8080}
                </span>
              </div>

              <button
                onClick={handleCopyIp}
                title="Copier l'adresse"
                className={`p-2 rounded-xl border transition-all active:scale-90 ${
                  copiedIp
                    ? 'bg-retro-green text-retro-dark border-retro-green'
                    : isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    : 'bg-white hover:bg-retro-warm text-retro-text border-retro-border'
                }`}
              >
                {copiedIp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
