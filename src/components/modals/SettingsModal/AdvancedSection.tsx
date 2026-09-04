import React, { useState } from 'react';
import { Settings, Shield, FileText, Download, Upload, RotateCcw, Check } from 'lucide-react';
import { AppSettings } from '../../../types';
import { openLogsFolder, exportConfig, importConfig, resetSettings } from '../../../api';

interface AdvancedSectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
  onLockKioskNow?: () => void;
  onReloadSettings?: () => void;
}

export const AdvancedSection: React.FC<AdvancedSectionProps> = ({
  settings,
  updateSetting,
  onLockKioskNow,
  onReloadSettings,
}) => {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExport = async () => {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const target = await save({
        title: 'Exporter la configuration KaïroOS',
        defaultPath: 'kairo-config-backup.zip',
        filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
      });
      if (target && typeof target === 'string') {
        await exportConfig(target);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        title: 'Importer une archive de configuration KaïroOS',
        multiple: false,
        filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
      });
      if (selected && typeof selected === 'string') {
        await importConfig(selected);
        setImportSuccess(true);
        if (onReloadSettings) onReloadSettings();
        setTimeout(() => setImportSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      try {
        await resetSettings();
        setResetSuccess(true);
        if (onReloadSettings) onReloadSettings();
        setTimeout(() => setResetSuccess(false), 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Mode Kiosk & Sécurité */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Sécurité & Mode Salle d'Arcade (Kiosk)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Mode Kiosk au démarrage</div>
              <div className="text-[11px] text-slate-400">Verrouille automatiquement l'accès admin au boot</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.kiosk_mode)}
              onChange={(e) => updateSetting('kiosk_mode', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>

          {onLockKioskNow && (
            <div className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-rose-900">Verrouiller maintenant</div>
                <div className="text-[11px] text-rose-600">Basculer immédiatement en mode joueur</div>
              </div>
              <button
                onClick={onLockKioskNow}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-xs"
              >
                Verrouiller
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. CLI Globaux & Logs */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Options Système & Journaux
          </h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Arguments CLI supplémentaires globaux
          </label>
          <input
            type="text"
            placeholder="Ex: --verbose --no-splash"
            value={settings.extra_cli_args || ''}
            onChange={(e) => updateSetting('extra_cli_args', e.target.value)}
            className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
          />
          <p className="text-[10px] text-slate-400 mt-1">Ajoutés à tous les lancements d'émulateurs.</p>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 bg-purple-50/10">
          <div>
            <div className="text-xs font-black text-slate-800">Journaux d'erreurs (Debug Logs)</div>
            <div className="text-[11px] text-slate-400">Consigner les logs de crash et d'exécution dans logs/</div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(settings.debug_logs)}
              onChange={(e) => updateSetting('debug_logs', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
            <button
              onClick={() => openLogsFolder()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Ouvrir les logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sauvegarde & Restauration */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Sauvegarde & Restauration de Configuration
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Exporter la configuration (ZIP)</span>
          </button>

          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all"
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Importer une configuration</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Réinitialiser aux valeurs par défaut</span>
          </button>
        </div>

        {exportSuccess && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Configuration exportée avec succès !</span>
          </div>
        )}

        {importSuccess && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Configuration importée avec succès !</span>
          </div>
        )}

        {resetSuccess && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Tous les paramètres ont été réinitialisés.</span>
          </div>
        )}
      </div>
    </div>
  );
};
