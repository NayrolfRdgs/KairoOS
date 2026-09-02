import React, { useState, useEffect, useCallback } from 'react';
import {
  Gamepad2,
  Tv,
  Power,
  Search,
  PlusCircle,
  Sliders,
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Sparkles,
  Layers,
} from 'lucide-react';

interface StatusResponse {
  is_running: boolean;
  current_game_id?: string;
  current_game_title?: string;
  current_system_id?: string;
  elapsed_seconds?: number;
  kiosk_mode: boolean;
  port: number;
  version: string;
}

interface Game {
  id: string;
  system_id: string;
  title: string;
  original_title?: string;
  file_path: string;
  cover_url?: string;
  genre?: string;
  players?: number;
  rating?: number;
  release_date?: string;
  favorite: boolean;
}

interface System {
  id: string;
  name: string;
  short_name: string;
  icon_name?: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'games' | 'add' | 'settings' | 'unlock'>('dashboard');
  const [pin, setPin] = useState<string>('1234');
  const [pinInput, setPinInput] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filtres Jeux
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');

  // Formulaire Ajout
  const [addPath, setAddPath] = useState<string>('');
  const [addSystemId, setAddSystemId] = useState<string>('snes');
  const [addTitle, setAddTitle] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Polling du statut de la borne (toutes les 2 secondes)
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setStatus(data);
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  }, []);

  // 2. Chargement des jeux et systèmes
  const loadData = useCallback(async () => {
    try {
      const [gamesRes, systemsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/systems'),
      ]);

      if (gamesRes.ok) {
        const json = await gamesRes.json();
        if (json.data) setGames(json.data);
      }

      if (systemsRes.ok) {
        const json = await systemsRes.json();
        if (json.data) setSystems(json.data);
      }
    } catch (e) {
      console.warn('Erreur chargement données:', e);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    loadData();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus, loadData]);

  // 3. Actions REST avec PIN
  const handleLaunchGame = async (gameId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/games/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
        body: JSON.stringify({ game_id: gameId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('🎮 Jeu lancé sur la borne !');
        fetchStatus();
      } else {
        showToast(json.error || 'Erreur de lancement (Vérifiez le PIN)', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStopGame = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/games/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('🛑 Jeu arrêté');
        fetchStatus();
      } else {
        showToast(json.error || 'Erreur (Vérifiez le PIN)', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPath.trim()) {
      showToast('Chemin de fichier requis', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/games/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
        body: JSON.stringify({
          path: addPath.trim(),
          system_id: addSystemId,
          title: addTitle.trim() ? addTitle.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('✅ Jeu ajouté avec succès !');
        setAddPath('');
        setAddTitle('');
        loadData();
        setCurrentTab('games');
      } else {
        showToast(json.error || 'Erreur ajout jeu (Vérifiez le PIN)', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLockKiosk = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kiosk/lock', {
        method: 'POST',
        headers: { 'X-Kairo-Pin': pin },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('🔒 Mode Kiosk activé');
        fetchStatus();
      } else {
        showToast(json.error || 'Erreur (Vérifiez le PIN)', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockKiosk = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kiosk/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput || pin }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('🔓 Mode Admin déverrouillé !');
        setPinInput('');
        fetchStatus();
        setCurrentTab('dashboard');
      } else {
        showToast(json.error || 'Code PIN incorrect', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((g) => {
    const matchesSearch = !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === 'all' || g.system_id === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  return (
    <div className="flex flex-col min-h-screen bg-retro-dark text-slate-100 max-w-md mx-auto relative shadow-2xl pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold font-arcade shadow-2xl flex items-center gap-2 animate-bounce ${
            toast.type === 'success'
              ? 'bg-retro-green text-retro-dark'
              : 'bg-retro-primary text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Fixe */}
      <header className="sticky top-0 z-40 bg-retro-card/90 backdrop-blur-md border-b border-retro-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-retro-primary flex items-center justify-center text-white shadow-md">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider uppercase font-arcade text-white">
                Kaïro<span className="text-retro-primary">OS</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-retro-purple/40 text-retro-cyan border border-retro-purple/60 font-mono">
                REMOTE
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-retro-green animate-pulse' : 'bg-retro-primary'
                }`}
              />
              <span className={connected ? 'text-retro-green font-semibold' : 'text-retro-primary font-semibold'}>
                {connected ? 'Borne En Ligne' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </div>

        {/* PIN Selector en mémoire */}
        <div className="flex items-center gap-1.5 bg-retro-dark px-2.5 py-1 rounded-xl border border-retro-border">
          <KeyRound className="w-3.5 h-3.5 text-retro-yellow" />
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            title="Code PIN KaïroOS"
            placeholder="PIN"
            className="w-12 bg-transparent text-xs font-mono font-bold text-center text-retro-yellow focus:outline-none"
          />
        </div>
      </header>

      {/* Corps Principal selon l'onglet */}
      <main className="flex-1 p-4 space-y-4">
        {/* ==================== 1. DASHBOARD ==================== */}
        {currentTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Statut du Jeu en cours */}
            <div className="p-5 rounded-3xl bg-retro-card border border-retro-border shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-arcade">
                  État de la Borne
                </span>
                {status?.is_running ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-retro-green/20 text-retro-green border border-retro-green/40 animate-pulse">
                    EN JEU 🕹️
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-300">
                    EN ATTENTE (IDLE)
                  </span>
                )}
              </div>

              {status?.is_running ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-retro-primary/20 border border-retro-primary/40 text-retro-primary">
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white leading-tight">
                        {status.current_game_title || 'Jeu en cours'}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        Système : {status.current_system_id?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleStopGame}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-retro-primary hover:bg-retro-primary/90 active:scale-95 text-white font-bold font-arcade text-xs shadow-lg shadow-retro-primary/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>ARRÊTER LE JEU (STOP D'URGENCE)</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Gamepad2 className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-xs text-slate-400">Aucun jeu en cours d'exécution.</p>
                  <button
                    onClick={() => setCurrentTab('games')}
                    className="px-4 py-2 rounded-xl bg-retro-primary text-white text-xs font-bold font-arcade shadow-md"
                  >
                    Choisir un Jeu 🎮
                  </button>
                </div>
              )}
            </div>

            {/* Carte Mode Kiosk */}
            <div className="p-4 rounded-3xl bg-retro-card border border-retro-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    status?.kiosk_mode
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-retro-green/20 border-retro-green/40 text-retro-green'
                  }`}
                >
                  {status?.kiosk_mode ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-arcade">
                    {status?.kiosk_mode ? 'MODE KIOSK ACTIF 🔒' : 'MODE ADMIN 🔓'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {status?.kiosk_mode
                      ? 'Menus et scans masqués sur la borne'
                      : 'Accès libre aux paramètres'}
                  </p>
                </div>
              </div>

              {status?.kiosk_mode ? (
                <button
                  onClick={() => setCurrentTab('unlock')}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-retro-dark font-bold font-arcade text-xs shadow-sm"
                >
                  Déverrouiller
                </button>
              ) : (
                <button
                  onClick={handleLockKiosk}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold font-arcade text-xs"
                >
                  Verrouiller
                </button>
              )}
            </div>

            {/* Infos Réseau & Borne */}
            <div className="p-4 rounded-3xl bg-retro-card/60 border border-retro-border/60 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Port d'écoute :</span>
                <span className="font-mono text-white font-bold">{status?.port || 8080}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Version :</span>
                <span className="font-mono text-white">v{status?.version || '0.1.0'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total jeux indexés :</span>
                <span className="font-mono text-retro-cyan font-bold">{games.length} jeux</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. LISTE DES JEUX ==================== */}
        {currentTab === 'games' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Barre de Recherche */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un jeu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-retro-card border border-retro-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-retro-primary"
              />
            </div>

            {/* Filtre par Système (Pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedSystem('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
                  selectedSystem === 'all'
                    ? 'bg-retro-primary text-white shadow-md'
                    : 'bg-retro-card text-slate-400 hover:text-white'
                }`}
              >
                TOUS ({games.length})
              </button>
              {systems.map((sys) => {
                const count = games.filter((g) => g.system_id === sys.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={sys.id}
                    onClick={() => setSelectedSystem(sys.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
                      selectedSystem === sys.id
                        ? 'bg-retro-purple text-white shadow-md'
                        : 'bg-retro-card text-slate-400 hover:text-white'
                    }`}
                  >
                    {sys.short_name || sys.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Grille / Liste des Jeux */}
            <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1">
              {filteredGames.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Aucun jeu trouvé pour cette recherche.
                </div>
              ) : (
                filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 rounded-2xl bg-retro-card border border-retro-border flex items-center justify-between gap-3 hover:border-retro-primary/50 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-retro-panel border border-retro-border flex items-center justify-center shrink-0 overflow-hidden">
                        {game.cover_url ? (
                          <img src={game.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Gamepad2 className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="uppercase font-mono text-retro-cyan font-semibold">
                            {game.system_id}
                          </span>
                          {game.genre && <span>• {game.genre}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchGame(game.id)}
                      disabled={loading}
                      className="px-3 py-2 rounded-xl bg-retro-primary/20 hover:bg-retro-primary text-retro-primary hover:text-white border border-retro-primary/40 text-xs font-bold font-arcade flex items-center gap-1 shrink-0 transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>LANCER</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== 3. AJOUTER UN JEU ==================== */}
        {currentTab === 'add' && (
          <form onSubmit={handleAddGame} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-retro-card border border-retro-border space-y-4">
              <div className="flex items-center gap-2 text-retro-primary">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm font-arcade uppercase text-white">
                  Ajouter un Jeu à la Borne
                </h3>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Chemin absolu ou relatif du fichier ROM *
                </label>
                <input
                  type="text"
                  placeholder="ex: ./roms/snes/Super Mario World.sfc"
                  value={addPath}
                  onChange={(e) => setAddPath(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-retro-dark border border-retro-border text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-retro-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Console / Système *
                </label>
                <select
                  value={addSystemId}
                  onChange={(e) => setAddSystemId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-retro-dark border border-retro-border text-xs text-white font-bold focus:outline-none focus:border-retro-primary"
                >
                  {systems.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.name} ({sys.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Titre Personnalisé (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Laisser vide pour détection automatique"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-retro-dark border border-retro-border text-xs text-white placeholder-slate-600 focus:outline-none focus:border-retro-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-retro-primary to-retro-purple text-white font-bold font-arcade text-xs shadow-lg shadow-retro-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>AJOUTER À KAÏROOS</span>
              </button>
            </div>
          </form>
        )}

        {/* ==================== 4. PARAMÈTRES ==================== */}
        {currentTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-retro-card border border-retro-border space-y-4">
              <div className="flex items-center gap-2 text-retro-yellow">
                <Sliders className="w-5 h-5" />
                <h3 className="font-bold text-sm font-arcade uppercase text-white">
                  Paramètres Distants
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-retro-dark border border-retro-border flex items-center justify-between">
                  <span>Code PIN actuel :</span>
                  <span className="font-mono font-bold text-retro-yellow text-sm">{pin}</span>
                </div>

                <div className="p-3 rounded-2xl bg-retro-dark border border-retro-border flex items-center justify-between">
                  <span>Mode Kiosk Borne :</span>
                  <span
                    className={`font-bold font-arcade ${
                      status?.kiosk_mode ? 'text-amber-400' : 'text-retro-green'
                    }`}
                  >
                    {status?.kiosk_mode ? 'ACTIVÉ 🔒' : 'DÉSACTIVÉ 🔓'}
                  </span>
                </div>
              </div>

              <button
                onClick={loadData}
                className="w-full py-3 rounded-2xl bg-retro-panel hover:bg-slate-700 text-white font-bold font-arcade text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rafraîchir les Données</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== 5. DÉVERROUILLAGE KIOSK ==================== */}
        {currentTab === 'unlock' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-6 rounded-3xl bg-retro-card border-2 border-amber-500/40 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-base font-arcade text-white">
                DÉVERROUILLAGE DU MODE KIOSK
              </h3>
              <p className="text-xs text-slate-400">
                Saisissez le code PIN pour basculer la borne en mode Admin à distance.
              </p>

              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Entrez le PIN (défaut: 1234)"
                className="w-full px-4 py-3 rounded-2xl bg-retro-dark border-2 border-retro-border text-center text-lg font-mono font-bold tracking-widest text-retro-yellow focus:outline-none focus:border-amber-500"
              />

              <button
                onClick={handleUnlockKiosk}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-retro-dark font-bold font-arcade text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>DÉVERROUILLER LA BORNE</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Barre de Navigation Inférieure Fixe (PWA Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-retro-card/95 backdrop-blur-md border-t border-retro-border px-2 py-2 flex items-center justify-around z-40">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentTab === 'dashboard' ? 'text-retro-primary font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-arcade">Borne</span>
        </button>

        <button
          onClick={() => setCurrentTab('games')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentTab === 'games' ? 'text-retro-primary font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-arcade">Jeux</span>
        </button>

        <button
          onClick={() => setCurrentTab('add')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentTab === 'add' ? 'text-retro-primary font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-arcade">Ajouter</span>
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentTab === 'settings' ? 'text-retro-primary font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-arcade">Réglages</span>
        </button>
      </nav>
    </div>
  );
}
