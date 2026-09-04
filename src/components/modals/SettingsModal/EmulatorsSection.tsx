import React, { useState } from 'react';
import { Cpu, Check, X, Folder } from 'lucide-react';
import { AppSettings, Emulator } from '../../../types';
import { testEmulatorExe } from '../../../api';

interface EmulatorsSectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
  emulators: Emulator[];
}

export const EmulatorsSection: React.FC<EmulatorsSectionProps> = ({
  settings,
  updateSetting,
  emulators = [],
}) => {
  const [testingPath, setTestingPath] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const handleTest = async (emuId: string, path: string) => {
    setTestingPath(emuId);
    try {
      const exists = await testEmulatorExe(path);
      setTestResults((prev) => ({ ...prev, [emuId]: exists }));
    } catch {
      setTestResults((prev) => ({ ...prev, [emuId]: false }));
    } finally {
      setTestingPath(null);
    }
  };

  const supportedEmus = [
    { id: 'retroarch', name: 'RetroArch (Multi-systèmes Libretro)', defaultExe: 'emulators/RetroArch/retroarch.exe', defaultArgs: '-f' },
    { id: 'pcsx2', name: 'PCSX2 (PlayStation 2)', defaultExe: 'emulators/PCSX2/pcsx2-qtx64.exe', defaultArgs: '--fullscreen --nogui' },
    { id: 'dolphin', name: 'Dolphin (GameCube & Wii)', defaultExe: 'emulators/Dolphin/Dolphin.exe', defaultArgs: '-b -e' },
    { id: 'ryujinx', name: 'Ryujinx (Nintendo Switch)', defaultExe: 'emulators/Ryujinx/Ryujinx.exe', defaultArgs: '--fullscreen' },
    { id: 'rpcs3', name: 'RPCS3 (PlayStation 3)', defaultExe: 'emulators/RPCS3/rpcs3.exe', defaultArgs: '--no-gui' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Émulateurs supportés */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Exécutables & Lignes de commande CLI
          </h3>
        </div>

        <div className="space-y-3">
          {supportedEmus.map((emu) => {
            const foundEmu = emulators.find((e) => e.id === emu.id);
            const exePath = foundEmu?.exe_path || emu.defaultExe;
            const args = foundEmu?.default_args || emu.defaultArgs;
            const testStatus = testResults[emu.id];

            return (
              <div key={emu.id} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">{emu.name}</span>
                  <div className="flex items-center gap-2">
                    {testStatus !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          testStatus ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {testStatus ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {testStatus ? 'Exécutable trouvé' : 'Introuvable'}
                      </span>
                    )}

                    <button
                      onClick={() => handleTest(emu.id, exePath)}
                      disabled={testingPath === emu.id}
                      className="px-2.5 py-1 rounded-lg border border-purple-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all shadow-2xs"
                    >
                      {testingPath === emu.id ? 'Vérification...' : 'Tester'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Chemin de l'exécutable</span>
                    <input
                      type="text"
                      defaultValue={exePath}
                      className="w-full text-xs font-mono p-2 rounded-xl border border-purple-100 bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Arguments CLI par défaut</span>
                    <input
                      type="text"
                      defaultValue={args}
                      className="w-full text-xs font-mono p-2 rounded-xl border border-purple-100 bg-white text-slate-700"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Dossiers des Cores & Données */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Dossiers Partagés (Cores, Saves, Screenshots, Cheats)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier des Cores RetroArch</label>
            <input
              type="text"
              placeholder="emulators/RetroArch/cores"
              value={settings.cores_dir || ''}
              onChange={(e) => updateSetting('cores_dir', e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier des Sauvegardes (Saves)</label>
            <input
              type="text"
              placeholder="Par défaut dans le dossier de l'émulateur"
              value={settings.saves_dir || ''}
              onChange={(e) => updateSetting('saves_dir', e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier des Screenshots</label>
            <input
              type="text"
              placeholder="Par défaut: screenshots/"
              value={settings.screenshots_dir || ''}
              onChange={(e) => updateSetting('screenshots_dir', e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dossier des Cheats RetroArch</label>
            <input
              type="text"
              placeholder="Par défaut: emulators/RetroArch/cheats"
              value={settings.cheats_dir || ''}
              onChange={(e) => updateSetting('cheats_dir', e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
