import React, { useState, useEffect } from 'react';
import {
  Palette,
  FolderOpen,
  Check,
  RotateCcw,
  Save,
  Type,
  LayoutGrid,
  Image as ImageIcon,
  Sparkles,
  Tv,
} from 'lucide-react';
import { useTheme } from '../../../hooks';
import { openThemesFolder } from '../../../api';

interface ThemesSectionProps {
  themeManager: ReturnType<typeof useTheme>;
  onThemeChange?: (themeId: string) => void;
}

// Composant pour sélecteur de couleur interactif avec pastille et code hex
interface ColorPickerFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (hex: string) => void;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  description,
  value,
  onChange,
}) => {
  const [localHex, setLocalHex] = useState(value || '#000000');

  useEffect(() => {
    setLocalHex(value || '#000000');
  }, [value]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      onChange(val);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalHex(val);
    onChange(val);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
      className="p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors hover:border-[var(--accent-primary)]/40"
    >
      <div className="min-w-0 flex-1">
        <div
          style={{ color: 'var(--text-primary)' }}
          className="text-xs font-bold truncate"
        >
          {label}
        </div>
        {description && (
          <div
            style={{ color: 'var(--text-muted)' }}
            className="text-[10px] truncate"
          >
            {description}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Input HEX */}
        <input
          type="text"
          value={localHex}
          onChange={handleHexChange}
          maxLength={7}
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-color)',
          }}
          className="w-20 px-2 py-1 text-center font-mono text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
        />

        {/* Swatch & Picker */}
        <div className="relative w-8 h-8 rounded-xl border border-black/20 shadow-xs overflow-hidden cursor-pointer shrink-0">
          <input
            type="color"
            value={value && value.startsWith('#') ? value : '#000000'}
            onChange={handlePickerChange}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
            title="Choisir la couleur"
          />
          <div
            className="w-full h-full pointer-events-none rounded-xl"
            style={{ backgroundColor: value || '#000000' }}
          />
        </div>
      </div>
    </div>
  );
};

export const ThemesSection: React.FC<ThemesSectionProps> = ({ themeManager }) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    activeTheme,
    colorPresets,
    activePresetId,
    updateThemeColor,
    updateThemeLayout,
    updateThemeFont,
    updateThemeAsset,
    applyColorPreset,
    saveCurrentTheme,
    resetThemeToDefault,
  } = themeManager;

  const currentColors = activeTheme?.colors || colorPresets[0].colors;
  const currentLayout = activeTheme?.layout || {
    card_radius: '16px',
    sidebar_width: '280px',
    card_gap: '16px',
    card_aspect: 'poster',
    card_glow: 'subtle',
    scanlines: 'none',
    card_shadow: 'soft',
    card_scale: 'dynamic',
  };
  const currentFonts = activeTheme?.fonts || {
    primary: 'Outfit, Inter, system-ui, sans-serif',
    arcade: 'Press Start 2P, monospace',
    size_base: '14px',
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveCurrentTheme();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('[ThemesSection] Erreur lors de la sauvegarde du thème:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Thème Unique & Actions Clés */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        className="p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-black/10 shrink-0"
            style={{ backgroundColor: currentColors.bg_primary }}
          >
            <Sparkles className="w-6 h-6" style={{ color: currentColors.accent_primary }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{ color: 'var(--accent-primary)' }}
                className="text-[10px] font-black uppercase tracking-wider"
              >
                🎨 Thème Unique KaïroOS
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)',
                }}
                className="px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold"
              >
                {activePresetId === 'custom'
                  ? 'Variante Personnalisée'
                  : colorPresets.find((p) => p.id === activePresetId)?.name}
              </span>
            </div>
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-base font-black tracking-tight"
            >
              Personnalisation Complète du Thème
            </h3>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">
              Tous les réglages visuels, couleurs, effets rétro arcade et styles de tuiles sont appliqués en direct.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => openThemesFolder()}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold hover:opacity-80 transition-all shadow-2xs"
            title="Ouvrir le dossier du thème sur le disque"
          >
            <FolderOpen className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            <span>Dossier</span>
          </button>

          <button
            onClick={resetThemeToDefault}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold hover:opacity-80 transition-all"
            title="Rétablir les couleurs et réglages d'origine"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black hover:opacity-90 transition-all shadow-sm"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Enregistré !</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Enregistrement...' : 'Sauvegarder'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mini Mockup / Live Preview interactif */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        className="p-5 rounded-3xl border shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span
              style={{ color: 'var(--text-primary)' }}
              className="text-xs font-black uppercase tracking-wider"
            >
              Aperçu en Direct de l'Interface
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-mono">
            Mise à jour instantanée en direct
          </span>
        </div>

        <div
          style={{
            backgroundColor: currentColors.bg_primary,
            borderColor: currentColors.border,
          }}
          className="p-4 rounded-2xl border flex gap-4 overflow-hidden relative shadow-inner min-h-[170px]"
        >
          {/* Mini Sidebar */}
          <div
            style={{
              backgroundColor: currentColors.sidebar_bg,
              borderColor: currentColors.border,
              width: currentLayout.sidebar_width === '240px' ? '80px' : currentLayout.sidebar_width === '320px' ? '110px' : '95px',
            }}
            className="rounded-xl border p-2 flex flex-col gap-1.5 shrink-0 transition-all duration-300"
          >
            <div className="flex items-center gap-1 mb-1">
              <div
                className="w-3.5 h-3.5 rounded-md"
                style={{ backgroundColor: currentColors.accent_primary }}
              />
              <div
                className="w-10 h-2 rounded"
                style={{ backgroundColor: currentColors.text_primary, opacity: 0.8 }}
              />
            </div>
            <div
              className="px-1.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1"
              style={{
                backgroundColor: currentColors.accent_primary,
                color: '#ffffff',
              }}
            >
              <span>Tous les jeux</span>
            </div>
            <div
              className="px-1.5 py-1 rounded-lg text-[9px] font-bold"
              style={{ color: currentColors.text_secondary }}
            >
              Favoris
            </div>
            <div
              className="px-1.5 py-1 rounded-lg text-[9px] font-bold"
              style={{ color: currentColors.text_muted }}
            >
              Récents
            </div>
          </div>

          {/* Mini Main View */}
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div
                className="h-3 w-28 rounded"
                style={{ backgroundColor: currentColors.text_primary }}
              />
              <div className="flex gap-1.5">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold"
                  style={{
                    backgroundColor: currentColors.accent_secondary,
                    color: '#ffffff',
                  }}
                >
                  Secondaire
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold"
                  style={{
                    backgroundColor: currentColors.success,
                    color: '#ffffff',
                  }}
                >
                  En ligne
                </span>
              </div>
            </div>

            <div
              style={{ gap: currentLayout.card_gap || '16px' }}
              className="grid grid-cols-2 flex-1 items-stretch"
            >
              {/* Mini Card 1 (Focused) */}
              <div
                style={{
                  backgroundColor: currentColors.bg_card,
                  borderColor: currentColors.accent_primary,
                  borderRadius: currentLayout.card_radius || '16px',
                  boxShadow: currentLayout.card_glow === 'neon'
                    ? `0 0 20px 2px ${currentColors.accent_primary}`
                    : currentLayout.card_glow === 'subtle'
                    ? `0 0 10px -2px ${currentColors.accent_primary}`
                    : undefined,
                  transform: currentLayout.card_scale === 'dynamic' ? 'scale(1.03)' : undefined,
                }}
                className="p-2.5 border-2 shadow-xs flex flex-col justify-between transition-all"
              >
                <div
                  className="h-12 rounded-lg mb-1 flex items-center justify-center text-[10px] font-black"
                  style={{
                    backgroundColor: currentColors.bg_secondary,
                    color: currentColors.accent_primary,
                  }}
                >
                  Jeu Actif
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold truncate"
                    style={{ color: currentColors.text_primary }}
                  >
                    Super Mario World
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentColors.accent_primary }}
                  />
                </div>
              </div>

              {/* Mini Card 2 */}
              <div
                style={{
                  backgroundColor: currentColors.bg_card,
                  borderColor: currentColors.border,
                  borderRadius: currentLayout.card_radius || '16px',
                }}
                className="p-2.5 border shadow-2xs flex flex-col justify-between transition-all"
              >
                <div
                  className="h-12 rounded-lg mb-1 flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: currentColors.bg_secondary,
                    color: currentColors.text_muted,
                  }}
                >
                  Tuile Normale
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-medium truncate"
                    style={{ color: currentColors.text_secondary }}
                  >
                    Sonic The Hedgehog
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1 : Variantes Rapides (Presets de Couleurs en 1-Clic) */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        className="p-5 rounded-3xl border shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3
              style={{ color: 'var(--text-primary)' }}
              className="text-xs font-black uppercase tracking-wider"
            >
              Variantes de Couleurs Prédéfinies (1-Clic)
            </h3>
          </div>
          <span style={{ color: 'var(--text-muted)' }} className="text-[11px]">
            Cliquez sur une variante pour charger instantanément toute sa palette
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {colorPresets.map((preset) => {
            const isSelected = activePresetId === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => applyColorPreset(preset.id)}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                }}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] shadow-2xs ${
                  isSelected ? 'ring-2 ring-[var(--accent-primary)]/20' : 'hover:border-[var(--accent-primary)]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{ color: 'var(--text-primary)' }}
                    className="text-xs font-black truncate"
                  >
                    {preset.name}
                  </span>
                  {isSelected && (
                    <div
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-black text-white flex items-center gap-0.5 shrink-0"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <span>Actif</span>
                    </div>
                  )}
                </div>

                <p
                  style={{ color: 'var(--text-muted)' }}
                  className="text-[10px] line-clamp-1 mb-2"
                >
                  {preset.description}
                </p>

                {/* Palette Swatches */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: preset.colors.bg_primary }}
                    title={`Fond: ${preset.colors.bg_primary}`}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: preset.colors.bg_card }}
                    title={`Cartes: ${preset.colors.bg_card}`}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: preset.colors.sidebar_bg }}
                    title={`Sidebar: ${preset.colors.sidebar_bg}`}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: preset.colors.accent_primary }}
                    title={`Accent principal: ${preset.colors.accent_primary}`}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                    style={{ backgroundColor: preset.colors.accent_secondary }}
                    title={`Accent secondaire: ${preset.colors.accent_secondary}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2 : Ambiance & Effets Visuels Rétro Arcade */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        className="p-5 rounded-3xl border shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-xs font-black uppercase tracking-wider"
          >
            Ambiance & Effets Visuels Rétro Arcade
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Scanlines CRT */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Lignes de Balayage (CRT)
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Effet écran cathodique arcade
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: 'Sans', value: 'none' },
                { label: 'Subtil (12%)', value: 'light' },
                { label: 'Rétro (28%)', value: 'retro' },
                { label: 'Intense (44%)', value: 'intense' },
              ].map((opt) => {
                const isCur = (currentLayout.scanlines || 'none') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('scanlines', opt.value as any)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 px-1.5 text-[10px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lueur Néon (Card Glow) */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Lueur Néon sur Sélection
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Halo lumineux autour des cartes actives
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Désactivé', value: 'none' },
                { label: 'Subtil', value: 'subtle' },
                { label: 'Néon Fort', value: 'neon' },
              ].map((opt) => {
                const isCur = (currentLayout.card_glow || 'subtle') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('card_glow', opt.value as any)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 px-1 text-[10px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format / Aspect Ratio des Tuiles */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Format des Cartes de Jeux
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Ratio géométrique des tuiles
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Boîtier 3:4', value: 'poster' },
                { label: 'Carré 1:1', value: 'square' },
                { label: 'Vidéo 16:9', value: 'landscape' },
              ].map((opt) => {
                const isCur = (currentLayout.card_aspect || 'poster') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('card_aspect', opt.value as any)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 px-1 text-[10px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zoom dynamique au focus */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Zoom au Focus / Survol
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Agrandissement de la carte sélectionnée
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Statique (0%)', value: 'none' },
                { label: 'Léger (+2.5%)', value: 'subtle' },
                { label: 'Pop (+5%)', value: 'dynamic' },
              ].map((opt) => {
                const isCur = (currentLayout.card_scale || 'dynamic') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('card_scale', opt.value as any)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 px-1 text-[10px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 : Formes, Agencement & Polices */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        className="p-5 rounded-3xl border shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-xs font-black uppercase tracking-wider"
          >
            Style & Agencement de la Grille
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Arrondi des cartes */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Arrondi des Cartes
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Rayon de courbure des tuiles
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: 'Carré', value: '0px' },
                { label: '8px', value: '8px' },
                { label: '16px', value: '16px' },
                { label: '24px', value: '24px' },
              ].map((opt) => {
                const isCur = currentLayout.card_radius === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('card_radius', opt.value)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 text-[11px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Espacement de la grille */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Espacement Grille
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Espace entre chaque carte
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Compact', value: '12px' },
                { label: 'Normal', value: '16px' },
                { label: 'Aéré', value: '24px' },
              ].map((opt) => {
                const isCur = currentLayout.card_gap === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('card_gap', opt.value)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 text-[11px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Largeur barre latérale */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                Largeur Menu Latéral
              </div>
              <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                Dimension de la barre latérale
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'Étroit', value: '240px' },
                { label: 'Standard', value: '280px' },
                { label: 'Large', value: '320px' },
              ].map((opt) => {
                const isCur = currentLayout.sidebar_width === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeLayout('sidebar_width', opt.value)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 text-[11px] font-bold rounded-xl border transition-all text-center"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typographie */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5"
          >
            <div className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                  Typographie
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                  Police d'écriture globale
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: 'Moderne', value: 'Outfit, Inter, system-ui, sans-serif' },
                { label: 'Pixel Rétro', value: 'Press Start 2P, monospace' },
              ].map((opt) => {
                const isCur = currentFonts.primary === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateThemeFont('primary', opt.value)}
                    style={{
                      backgroundColor: isCur ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: isCur ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isCur ? 'transparent' : 'var(--border-color)',
                    }}
                    className="py-1 text-[10px] font-bold rounded-xl border transition-all text-center truncate"
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallpaper personnalisé */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
            className="p-3.5 rounded-2xl border space-y-2.5 sm:col-span-2 md:col-span-4"
          >
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                  Image de Fond Personnalisée (Wallpaper)
                </div>
                <div style={{ color: 'var(--text-muted)' }} className="text-[10px]">
                  Chemin local (ex: C:/Images/fond.jpg) ou URL web
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ex: https://example.com/wallpaper.jpg ou C:/Images/fond.png"
                value={activeTheme?.assets?.background_image || ''}
                onChange={(e) => updateThemeAsset('background_image', e.target.value.trim() || null)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
              {activeTheme?.assets?.background_image && (
                <button
                  onClick={() => updateThemeAsset('background_image', null)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:text-red-500 transition-colors"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 : Personnalisation Précise des Couleurs */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        className="p-5 rounded-3xl border shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="text-xs font-black uppercase tracking-wider"
          >
            Personnalisation Précise des Couleurs (HEX & Pipette)
          </h3>
        </div>

        {/* Accents */}
        <div className="space-y-2">
          <h4
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] font-black uppercase tracking-wider"
          >
            Couleurs d'Accents & Sélections
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorPickerField
              label="Accent Principal"
              description="Boutons actifs, sélection manette, focus"
              value={currentColors.accent_primary}
              onChange={(val) => updateThemeColor('accent_primary', val)}
            />
            <ColorPickerField
              label="Accent Secondaire"
              description="Badges secondaires, dégradés et détails"
              value={currentColors.accent_secondary}
              onChange={(val) => updateThemeColor('accent_secondary', val)}
            />
          </div>
        </div>

        {/* Arrière-plans */}
        <div className="space-y-2 pt-2">
          <h4
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] font-black uppercase tracking-wider"
          >
            Arrière-plans & Surfaces
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <ColorPickerField
              label="Fond Principal"
              description="Arrière-plan global"
              value={currentColors.bg_primary}
              onChange={(val) => updateThemeColor('bg_primary', val)}
            />
            <ColorPickerField
              label="Fond Secondaire"
              description="Bandes et conteneurs"
              value={currentColors.bg_secondary}
              onChange={(val) => updateThemeColor('bg_secondary', val)}
            />
            <ColorPickerField
              label="Cartes de Jeux"
              description="Surface des tuiles"
              value={currentColors.bg_card}
              onChange={(val) => updateThemeColor('bg_card', val)}
            />
            <ColorPickerField
              label="Menu Latéral"
              description="Arrière-plan navigation"
              value={currentColors.sidebar_bg}
              onChange={(val) => updateThemeColor('sidebar_bg', val)}
            />
          </div>
        </div>

        {/* Typographie & États */}
        <div className="space-y-2 pt-2">
          <h4
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] font-black uppercase tracking-wider"
          >
            Typographie, Bordures & Statuts
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <ColorPickerField
              label="Texte Principal"
              description="Titres et labels"
              value={currentColors.text_primary}
              onChange={(val) => updateThemeColor('text_primary', val)}
            />
            <ColorPickerField
              label="Texte Secondaire"
              description="Sous-titres et détails"
              value={currentColors.text_secondary}
              onChange={(val) => updateThemeColor('text_secondary', val)}
            />
            <ColorPickerField
              label="Bordures"
              description="Séparateurs et contours"
              value={currentColors.border}
              onChange={(val) => updateThemeColor('border', val)}
            />
            <ColorPickerField
              label="Succès / En ligne"
              description="Statuts de connexion"
              value={currentColors.success}
              onChange={(val) => updateThemeColor('success', val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
