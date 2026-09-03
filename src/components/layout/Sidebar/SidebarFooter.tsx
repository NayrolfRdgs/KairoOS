import React from 'react';
import { Gamepad2 } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  return (
    <div className="p-3 border-t border-purple-100/70 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
      <div className="p-3 rounded-2xl bg-white/90 border border-purple-100/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-rose-600 font-sans">
              KAÏRO OS
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              v2.0
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Borne connectée</span>
          </div>
        </div>

        {/* 3D Glowing Cabinet Art */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-pink-500/30">
          <Gamepad2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
