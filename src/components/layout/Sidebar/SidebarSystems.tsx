import React from 'react';
import { Gamepad2, Disc, Smartphone, Tv, Box, Flame } from 'lucide-react';
import { System } from '../../../types';

interface SidebarSystemsProps {
  systems: System[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  gamesCountBySystem: Record<string, number>;
}

export const SidebarSystems: React.FC<SidebarSystemsProps> = ({
  systems,
  selectedCategory,
  onSelectCategory,
  gamesCountBySystem,
}) => {
  const getSystemIcon = (iconType: string) => {
    switch (iconType) {
      case 'disc':
        return <Disc className="w-4 h-4" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'box':
        return <Box className="w-4 h-4" />;
      case 'monitor':
        return <Tv className="w-4 h-4" />;
      case 'joystick':
        return <Flame className="w-4 h-4 text-retro-primary" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-wider text-retro-textLight px-3 mb-2">
        Consoles & Systèmes
      </div>

      <div className="space-y-1">
        {systems.map((sys) => {
          const count = gamesCountBySystem[sys.id] || 0;
          const isSelected = selectedCategory === `system:${sys.id}`;

          return (
            <button
              key={sys.id}
              onClick={() => onSelectCategory(`system:${sys.id}`)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-retro-cyan text-white shadow-retro-cyan font-bold scale-[1.02]'
                  : 'text-retro-text hover:bg-retro-bg'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {getSystemIcon(sys.icon)}
                <span className="truncate">{sys.name}</span>
              </div>
              {count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
