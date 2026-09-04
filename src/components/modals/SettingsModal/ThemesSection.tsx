import React, { useState, useEffect } from 'react';
import { Palette, Download, FolderOpen, Check, RefreshCw, Globe, ExternalLink, Sparkles } from 'lucide-react';
import { useTheme } from '../../../hooks';
import { openThemesFolder, downloadCommunityTheme } from '../../../api';

interface ThemesSectionProps {
  themeManager: ReturnType<typeof useTheme>;
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: string;
  download_url?: string;
}

export const ThemesSection: React.FC<ThemesSectionProps> = ({ themeManager }) => {
  const [tab, setTab] = useState<'installed' | 'community'>('installed');
  const [communityThemes, setCommunityThemes] = useState<any[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const { themes, activeTheme, previewThemeItem, preview, applyTheme, cancelPreview, reloadThemes } = themeManager;

  // Charger les thèmes communautaires depuis GitHub
  const fetchCommunityThemes = async () => {
    setLoadingCommunity(true);
    setCommunityError(null);
    try {
      const res = await fetch('https://api.github.com/repos/NayrolfRdgs/KairoOS-themes/contents/');
      if (!res.ok) {
        throw new Error(`Dépôt distant introuvable (${res.status})`);
      }
      const contents: GitHubContentItem[] = await res.json();
      const folders = contents.filter((item) => item.type === 'dir');

      // Récupérer les détails de chaque dossier de thème
      const loadedThemes = await Promise.all(
        folders.map(async (folder) => {
          try {
            const rawJson = await fetch(
              `https://raw.githubusercontent.com/NayrolfRdgs/KairoOS-themes/main/${folder.name}/theme.json`
            );
            if (rawJson.ok) {
              const parsed = await rawJson.json();
              return {
                ...parsed,
                preview_url: `https://raw.githubusercontent.com/NayrolfRdgs/KairoOS-themes/main/${folder.name}/preview.png`,
                folder_name: folder.name,
              };
            }
          } catch {
            // ignore
          }
          return {
            id: folder.name,
            name: folder.name,
            author: 'Communauté',
            version: '1.0.0',
            description: 'Thème communautaire KaïroOS',
            preview_url: `https://raw.githubusercontent.com/NayrolfRdgs/KairoOS-themes/main/${folder.name}/preview.png`,
            folder_name: folder.name,
          };
        })
      );

      setCommunityThemes(loadedThemes.filter(Boolean));
    } catch (err: any) {
      console.warn('[ThemesSection] Impossible de joindre le store communautaire:', err);
      setCommunityError('Aucun thème distant disponible ou store GitHub inaccessible.');
      setCommunityThemes([]);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    if (tab === 'community' && communityThemes.length === 0) {
      fetchCommunityThemes();
    }
  }, [tab]);

  const handleDownload = async (item: any) => {
    setDownloadingId(item.id);
    try {
      const zipUrl = `https://github.com/NayrolfRdgs/KairoOS-themes/archive/refs/heads/main.zip`;
      await downloadCommunityTheme(item.id, zipUrl);
      await reloadThemes();
      setDownloadSuccessId(item.id);
      setTimeout(() => setDownloadSuccessId(null), 3000);
    } catch (err) {
      console.error('[ThemesSection] Erreur de téléchargement:', err);
      // Fallback
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('installed')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'installed'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Thèmes Installés ({themes.length})
          </button>
          <button
            onClick={() => setTab('community')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'community'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Store Communautaire</span>
          </button>
        </div>

        <button
          onClick={() => openThemesFolder()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-100 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all shadow-2xs"
          title="Ouvrir le dossier themes/ dans l'explorateur Windows"
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
          <span>Dossier Thèmes</span>
        </button>
      </div>

      {/* Tab: Thèmes Installés */}
      {tab === 'installed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((t) => {
              const isCurrent = activeTheme.id === t.id;
              const isPreviewing = previewThemeItem?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => preview(t)}
                  className={`group relative rounded-2xl border-2 p-3.5 transition-all cursor-pointer bg-white shadow-xs ${
                    isCurrent
                      ? 'border-rose-500 ring-4 ring-rose-500/10'
                      : isPreviewing
                      ? 'border-purple-400 border-dashed ring-2 ring-purple-400/20'
                      : 'border-purple-100 hover:border-purple-300'
                  }`}
                >
                  {/* Preview Banner */}
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/60 flex items-center justify-center">
                    {t.preview_url ? (
                      <img
                        src={t.preview_url}
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-1"
                        style={{ backgroundColor: t.colors?.bg_primary || '#f5f0e8' }}
                      >
                        <Palette className="w-8 h-8" style={{ color: t.colors?.accent_primary || '#e63950' }} />
                        <span className="text-[10px] font-black" style={{ color: t.colors?.text_primary || '#1a1a2e' }}>
                          {t.name}
                        </span>
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Actif</span>
                      </div>
                    )}

                    {isPreviewing && !isCurrent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Aperçu en cours
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 tracking-tight">{t.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        Par <span className="font-bold text-slate-600">{t.author}</span> • v{t.version}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 min-h-[32px]">
                    {t.description}
                  </p>

                  {/* Color Palette Strip */}
                  <div className="flex items-center gap-1 mb-3">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors?.bg_primary }}
                      title="Fond principal"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors?.sidebar_bg }}
                      title="Sidebar"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors?.accent_primary }}
                      title="Accent principal"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: t.colors?.accent_secondary }}
                      title="Accent secondaire"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-50">
                    {isPreviewing && !isCurrent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelPreview();
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                      >
                        Annuler
                      </button>
                    )}

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyTheme(t.id);
                        }}
                        className="px-3.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all shadow-xs"
                      >
                        Appliquer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Store Communautaire */}
      {tab === 'community' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>
                Thèmes proposés par la communauté KaïroOS sur{' '}
                <a
                  href="https://github.com/NayrolfRdgs/KairoOS-themes"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-purple-700 underline inline-flex items-center gap-0.5"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>

            <button
              onClick={fetchCommunityThemes}
              disabled={loadingCommunity}
              className="p-1.5 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-all"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCommunity ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {communityError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
              {communityError}
            </div>
          )}

          {communityThemes.length === 0 && !loadingCommunity && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-purple-100 bg-purple-50/20 space-y-2">
              <Palette className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Aucun thème communautaire supplémentaire disponible actuellement.</p>
              <p className="text-[11px] text-slate-400">
                Vous pouvez créer votre propre thème et le soumettre par Pull Request sur le dépôt GitHub KaïroOS-themes !
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communityThemes.map((item) => {
              const isInstalled = themes.some((t) => t.id === item.id);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-purple-100 p-3.5 bg-white shadow-xs space-y-3"
                >
                  <div className="h-28 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200/60">
                    {item.preview_url ? (
                      <img src={item.preview_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Palette className="w-8 h-8 text-purple-400" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      Par <span className="font-bold text-slate-600">{item.author}</span> • v{item.version}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-purple-50">
                    {isInstalled || downloadSuccessId === item.id ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {downloadSuccessId === item.id ? 'Téléchargé !' : 'Installé'}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === item.id ? 'Téléchargement...' : 'Télécharger'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
