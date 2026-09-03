import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  FolderOpen,
  Search,
  Check,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { System } from '../../../types';
import { searchOnlineGameMetadata } from '../../../utils/scraper';

interface AddGameModalProps {
  systems: System[];
  onClose: () => void;
  onAddGame: (gameData: {
    filePath: string;
    systemId: string;
    title?: string;
    coverUrl?: string;
    franchise?: string;
    genre?: string;
    developer?: string;
    releaseDate?: string;
    synopsis?: string;
    rating?: number;
    players?: number;
  }) => Promise<void>;
  defaultSystemId?: string;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  systems,
  onClose,
  onAddGame,
  defaultSystemId = 'arcade',
}) => {
  const [filePath, setFilePath] = useState('');
  const [systemId, setSystemId] = useState(defaultSystemId);
  const [title, setTitle] = useState('');
  const [franchise, setFranchise] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [genre, setGenre] = useState('');
  const [developer, setDeveloper] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [players, setPlayers] = useState('2');
  const [synopsis, setSynopsis] = useState('');
  const [isSearchingCover, setIsSearchingCover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-extraction du titre lors de la saisie du fichier
  const handleFilePathChange = (path: string) => {
    setFilePath(path);
    if (!title && path) {
      const fileName = path.split(/[/\\]/).pop() || '';
      const clean = fileName.replace(/\.[^/.]+$/, '').replace(/[\(\[\{].*?[\)\]\}]/g, '').trim();
      setTitle(clean);
    }
  };

  // Parcourir un fichier localement
  const handleBrowseFile = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        title: 'Sélectionner une ROM ou un exécutable de jeu',
      });
      if (selected && typeof selected === 'string') {
        handleFilePathChange(selected);
      }
    } catch {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFilePathChange(file.name);
          if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      input.click();
    }
  };

  // Recherche automatique des métadonnées & jaquette
  const handleAutoSearch = async () => {
    if (!title && !filePath) {
      setError('Veuillez d\'abord saisir un titre ou choisir un fichier.');
      return;
    }

    setIsSearchingCover(true);
    setError(null);

    try {
      const queryTitle = title || filePath.split(/[/\\]/).pop() || '';
      const meta = await searchOnlineGameMetadata(queryTitle, systemId);

      if (meta.title) setTitle(meta.title);
      if (meta.cover_url) setCoverUrl(meta.cover_url);
      if (meta.genre) setGenre(meta.genre);
      if (meta.developer) setDeveloper(meta.developer);
      if (meta.release_date) setReleaseDate(meta.release_date);
      if (meta.players) setPlayers(meta.players.toString());
      if (meta.synopsis) setSynopsis(meta.synopsis);
    } catch {
      setError('Erreur lors de la recherche automatique.');
    } finally {
      setIsSearchingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePath.trim()) {
      setError('Le chemin du fichier est obligatoire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAddGame({
        filePath: filePath.trim(),
        systemId,
        title: title.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        franchise: franchise.trim() || undefined,
        genre: genre.trim() || undefined,
        developer: developer.trim() || undefined,
        releaseDate: releaseDate.trim() || undefined,
        synopsis: synopsis.trim() || undefined,
        players: parseInt(players, 10) || 2,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout du jeu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-purple-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">
                AJOUTER UN JEU MANUELLEMENT
              </h2>
              <p className="text-xs text-slate-500">
                Parcourez votre disque ou entrez le chemin d'une ROM / exécutable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin bg-gradient-to-b from-white to-purple-50/20">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* 1. Chemin du Fichier & Parcourir */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Fichier de la ROM / Jeu *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filePath}
                onChange={(e) => handleFilePathChange(e.target.value)}
                placeholder="ex: D:\Roms\arcade\sf2ce.zip ou .\roms\snes\mario.sfc"
                className="flex-1 px-4 py-2.5 rounded-xl border border-purple-100 bg-white font-mono text-xs focus:outline-none focus:border-rose-500 shadow-xs"
                required
              />
              <button
                type="button"
                onClick={handleBrowseFile}
                className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Parcourir</span>
              </button>
            </div>
          </div>

          {/* 2. Console / Système & Titre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Console / Système
              </label>
              <select
                value={systemId}
                onChange={(e) => setSystemId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Titre du Jeu
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Street Fighter II"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
              />
            </div>
          </div>

          {/* 3. Franchise optionnelle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Franchise / Saga (Optionnel)
            </label>
            <input
              type="text"
              value={franchise}
              onChange={(e) => setFranchise(e.target.value)}
              placeholder="ex: Street Fighter, Mario, Zelda..."
              className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-white text-xs text-slate-800 focus:outline-none focus:border-rose-500 shadow-xs"
            />
          </div>

          {/* 4. Bouton Recherche Automatique de Métadonnées & Jaquette */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Recherche Automatique de Jaquette & Infos
              </span>
              <span className="text-[11px] text-slate-500">
                Récupère automatiquement la jaquette 3D, l'année, le genre et la description en 1 clic.
              </span>
            </div>

            <button
              type="button"
              onClick={handleAutoSearch}
              disabled={isSearchingCover}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20 flex items-center gap-1.5 active:scale-95 transition-all shrink-0 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearchingCover ? 'Recherche...' : 'Rechercher Jaquette'}</span>
            </button>
          </div>

          {/* 5. Jaquette Image URL & Prévisualisation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                URL ou Chemin de la Jaquette (Cover)
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... ou C:\Images\cover.png"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-white text-xs font-mono focus:outline-none focus:border-rose-500 shadow-xs"
              />
            </div>

            <div className="flex justify-center">
              <div className="w-20 h-28 rounded-xl bg-slate-100 border border-purple-100 overflow-hidden flex items-center justify-center shadow-xs">
                {coverUrl ? (
                  <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* 6. Métadonnées Supplémentaires */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="ex: Combat"
                className="w-full px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Développeur</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="ex: Capcom"
                className="w-full px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Année</label>
              <input
                type="text"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                placeholder="ex: 1992"
                className="w-full px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Joueurs</label>
              <input
                type="number"
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-semibold"
              />
            </div>
          </div>

          {/* 7. Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Description / Synopsis
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Courte description du jeu..."
              className="w-full px-4 py-2 rounded-xl border border-purple-100 bg-white text-xs font-sans focus:outline-none focus:border-rose-500 shadow-xs"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-purple-100 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Ajout en cours...' : 'Ajouter le Jeu à la Borne'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
