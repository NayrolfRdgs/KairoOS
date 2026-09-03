import React, { useState, useEffect, useCallback } from 'react';
import {
  Header,
  Sidebar,
  BottomNav,
  PinModal,
  DashboardView,
  GamesView,
  AddGameView,
  SettingsView,
  KioskUnlockView,
} from './components';
import {
  ThemeMode,
  StatusResponse,
  Game,
  System,
  RemoteConfig,
  AppSettings,
  Emulator,
} from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // 1. États Globaux en Mémoire (Persistance en variable d'état React, pas de localStorage)
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [pin, setPin] = useState<string>('1234');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'games' | 'add' | 'settings' | 'unlock'>('dashboard');

  // 2. États Données & Réseau
  const [connected, setConnected] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 3. Polling du Statut (toutes les 2 secondes)
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

  // 4. Chargement de la Bibliothèque
  const loadData = useCallback(async () => {
    try {
      const [gamesRes, recentRes, systemsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/games/recent'),
        fetch('/api/systems'),
      ]);

      if (gamesRes.ok) {
        const json = await gamesRes.json();
        if (json.data) setGames(json.data);
      }

      if (recentRes.ok) {
        const json = await recentRes.json();
        if (json.data) setRecentGames(json.data);
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

  // 5. Actions REST avec En-tête X-Kairo-Pin
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
        loadData();
        setCurrentTab('dashboard');
      } else {
        showToast(json.error || 'Erreur de lancement (Vérifiez le PIN)', 'error');
        if (res.status === 401) setPinModalOpen(true);
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
        showToast('🛑 Jeu arrêté avec succès !');
        fetchStatus();
        loadData();
      } else {
        showToast(json.error || 'Erreur lors de l\'arrêt du jeu', 'error');
        if (res.status === 401) setPinModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (gameId: string) => {
    try {
      const res = await fetch(`/api/games/${gameId}/favorite`, {
        method: 'POST',
        headers: {
          'X-Kairo-Pin': pin,
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setGames((prev) =>
          prev.map((g) => (g.id === gameId ? { ...g, favorite: Boolean(json.data) } : g))
        );
        showToast(json.data ? '⭐ Ajouté aux favoris' : 'Favori retiré');
      } else {
        showToast(json.error || 'Erreur de favori (Vérifiez le PIN)', 'error');
        if (res.status === 401) setPinModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddGame = async (path: string, systemId: string, title?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/games/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
        body: JSON.stringify({ path, system_id: systemId, title }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('✅ Jeu ajouté à la borne !');
        loadData();
        setCurrentTab('games');
      } else {
        showToast(json.error || 'Erreur ajout jeu (Vérifiez le PIN)', 'error');
        if (res.status === 401) setPinModalOpen(true);
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
        showToast('🔒 Mode Kiosk activé sur la borne !');
        fetchStatus();
      } else {
        showToast(json.error || 'Erreur verrouillage (Vérifiez le PIN)', 'error');
        if (res.status === 401) setPinModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockKiosk = async (enteredPin: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/kiosk/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPin(enteredPin);
        showToast('🔓 Mode Admin déverrouillé !');
        fetchStatus();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRemoteConfig = async (cfg: RemoteConfig) => {
    setLoading(true);
    try {
      const res = await fetch('/api/remote/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
        body: JSON.stringify(cfg),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPin(cfg.pin);
        showToast('Configuration Remote enregistrée !');
        fetchStatus();
      } else {
        showToast(json.error || 'Erreur enregistrement (Vérifiez le PIN)', 'error');
        if (res.status === 401) setPinModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppSettings = async (settings: AppSettings) => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Paramètres KaïroOS enregistrés !');
        fetchStatus();
      } else {
        showToast(json.error || 'Erreur enregistrement', 'error');
        if (res.status === 401) setPinModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmulators = async (emus: Emulator[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/emulators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kairo-Pin': pin,
        },
        body: JSON.stringify(emus),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Émulateurs enregistrés avec succès !');
      } else {
        showToast(json.error || 'Erreur enregistrement émulateurs', 'error');
        if (res.status === 401) setPinModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${
        isDark ? 'bg-retro-dark text-[#f4f0e8]' : 'bg-[#fbf8f2] text-retro-text'
      }`}
    >
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
      <Header
        connected={connected}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        pin={pin}
        onOpenPinModal={() => setPinModalOpen(true)}
      />

      {/* Corps Principal Responsive (Sidebar Desktop + Contenu Central) */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto overflow-hidden">
        {/* Navigation Latérale Desktop (>= 768px) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          status={status}
          gamesCount={games.length}
          theme={theme}
        />

        {/* Zone de Contenu Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              status={status}
              recentGames={recentGames}
              onLaunchGame={handleLaunchGame}
              onStopGame={handleStopGame}
              onLockKiosk={handleLockKiosk}
              onOpenUnlockModal={() => setCurrentTab('unlock')}
              onNavigateToGames={() => setCurrentTab('games')}
              loading={loading}
              theme={theme}
            />
          )}

          {currentTab === 'games' && (
            <GamesView
              games={games}
              systems={systems}
              status={status}
              onLaunchGame={handleLaunchGame}
              onToggleFavorite={handleToggleFavorite}
              loading={loading}
              theme={theme}
            />
          )}

          {currentTab === 'add' && (
            <AddGameView
              systems={systems}
              onAddGame={handleAddGame}
              loading={loading}
              theme={theme}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              pin={pin}
              onSaveRemoteConfig={handleSaveRemoteConfig}
              onSaveAppSettings={handleSaveAppSettings}
              onSaveEmulators={handleSaveEmulators}
              onReloadAll={async () => {
                await fetchStatus();
                await loadData();
                showToast('Données rafraîchies !');
              }}
              loading={loading}
              theme={theme}
            />
          )}

          {currentTab === 'unlock' && (
            <KioskUnlockView
              status={status}
              onUnlockKiosk={handleUnlockKiosk}
              onLockKiosk={handleLockKiosk}
              loading={loading}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Navigation Basse Mobile (< 768px) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        status={status}
        theme={theme}
      />

      {/* Modale PIN Rapide */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onConfirm={async (enteredPin) => {
          setPin(enteredPin);
          showToast('Code PIN mis à jour !');
        }}
        initialPin={pin}
        theme={theme}
      />
    </div>
  );
}
