import React from 'react';

interface ConsoleLogoProps {
  systemId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ConsoleLogo: React.FC<ConsoleLogoProps> = ({
  systemId,
  className = '',
  size = 'md',
  showText = false,
}) => {
  const id = (systemId || '').toLowerCase().trim();

  // Dimension presets
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size] || 'w-5 h-5';

  // 1. NINTENDO 64 - Emblème 3D Isométrique Officiel (Vert, Rouge, Bleu, Jaune)
  if (id === 'n64' || id.includes('nintendo 64') || id === 'nintendo64') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="Nintendo 64">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`} fill="none">
          {/* Base / Ombre */}
          <path d="M20 25 L50 8 L80 25 L80 75 L50 92 L20 75 Z" fill="#1e293b" opacity="0.15" />
          
          {/* Colonne gauche (Verte) */}
          <path d="M22 26 L48 41 L48 78 L22 63 Z" fill="#059669" />
          <path d="M22 26 L48 11 L48 41 L22 26 Z" fill="#10b981" />
          
          {/* Colonne droite (Rouge) */}
          <path d="M52 41 L78 26 L78 63 L52 78 Z" fill="#dc2626" />
          <path d="M52 41 L52 11 L78 26 L52 41 Z" fill="#ef4444" />
          
          {/* Arche diagonale (Bleu & Jaune) */}
          <path d="M48 41 L52 41 L78 56 L78 63 L52 78 L48 78 L22 63 L22 56 Z" fill="#2563eb" />
          <path d="M38 50 L62 36 L62 50 L38 64 Z" fill="#f59e0b" />
          
          {/* Reflets & Lignes 3D N */}
          <path d="M48 11 L52 11 L78 26 L74 28 L52 15 L48 15 L26 28 L22 26 Z" fill="#ffffff" opacity="0.6" />
          <path d="M48 41 L52 41 L52 78 L48 78 Z" fill="#1d4ed8" />
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">N64</span>}
      </div>
    );
  }

  // 2. SUPER NINTENDO / SUPER FAMICOM - Logo 4 Couleurs Emblématique
  if (id === 'snes' || id.includes('super nintendo') || id === 'sfc') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="Super Nintendo">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          {/* Fond doux circulaire */}
          <rect width="100" height="100" rx="24" fill="#f1f5f9" />
          
          {/* 4 Boutons / Gemmes Super Famicom / SNES */}
          {/* Haut-Gauche : Jaune */}
          <ellipse cx="36" cy="36" rx="16" ry="16" fill="#eab308" />
          <ellipse cx="34" cy="34" rx="14" ry="14" fill="#facc15" />
          <ellipse cx="32" cy="32" rx="6" ry="6" fill="#ffffff" opacity="0.6" />

          {/* Haut-Droite : Rouge */}
          <ellipse cx="64" cy="36" rx="16" ry="16" fill="#dc2626" />
          <ellipse cx="62" cy="34" rx="14" ry="14" fill="#ef4444" />
          <ellipse cx="60" cy="32" rx="6" ry="6" fill="#ffffff" opacity="0.6" />

          {/* Bas-Gauche : Bleu */}
          <ellipse cx="36" cy="64" rx="16" ry="16" fill="#2563eb" />
          <ellipse cx="34" cy="62" rx="14" ry="14" fill="#3b82f6" />
          <ellipse cx="32" cy="60" rx="6" ry="6" fill="#ffffff" opacity="0.6" />

          {/* Bas-Droite : Vert */}
          <ellipse cx="64" cy="64" rx="16" ry="16" fill="#059669" />
          <ellipse cx="62" cy="62" rx="14" ry="14" fill="#10b981" />
          <ellipse cx="60" cy="60" rx="6" ry="6" fill="#ffffff" opacity="0.6" />
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">SNES</span>}
      </div>
    );
  }

  // 3. SEGA MEGA DRIVE / GENESIS - Logo Métallique Sega & Bannière 16-BIT
  if (id === 'megadrive' || id === 'genesis' || id.includes('mega drive') || id === 'sega') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="Sega Mega Drive">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          {/* Badge Ovale Noir / Orbe Sega */}
          <rect width="100" height="100" rx="22" fill="#0f172a" />
          <ellipse cx="50" cy="50" rx="44" ry="40" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.4" />
          
          {/* Arche Sega Bleu / Blanc Métallique */}
          <path d="M20 54 C20 32 34 22 50 22 C66 22 80 32 80 54 C72 40 62 32 50 32 C38 32 28 40 20 54 Z" fill="#0284c7" />
          
          {/* Bandeau 16-BIT */}
          <rect x="18" y="56" width="64" height="20" rx="6" fill="#d97706" stroke="#fde047" strokeWidth="1.5" />
          <text x="50" y="71" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="1">16-BIT</text>
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">MD</span>}
      </div>
    );
  }

  // 4. GAME BOY ADVANCE (GBA) - Logo Stylisé Nintendo GBA
  if (id === 'gba' || id.includes('advance') || id === 'gameboy advance') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="Game Boy Advance">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          <rect width="100" height="100" rx="22" fill="#4338ca" />
          {/* Coque GBA indigo arrondie */}
          <path d="M16 35 C16 26 30 24 50 24 C70 24 84 26 84 35 L80 65 C80 72 68 76 50 76 C32 76 20 72 20 65 Z" fill="#4f46e5" stroke="#818cf8" strokeWidth="2" />
          {/* Écran central */}
          <rect x="30" y="34" width="40" height="28" rx="4" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
          {/* Lettrage ADVANCE stylisé */}
          <text x="50" y="52" fill="#38bdf8" fontSize="8" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" textAnchor="middle">ADVANCE</text>
          {/* Boutons A / B */}
          <circle cx="75" cy="52" r="2.5" fill="#38bdf8" />
          <circle cx="79" cy="47" r="2.5" fill="#38bdf8" />
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">GBA</span>}
      </div>
    );
  }

  // 5. ARCADE / MAME / NEO-GEO - Marquee d'Arcade & Manette Stick
  if (id === 'arcade' || id === 'mame' || id === 'neogeo' || id === 'fbneo') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="Borne d'Arcade">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          {/* Borne Silhouette Dégradée */}
          <rect width="100" height="100" rx="22" fill="#18181b" />
          
          {/* Marquee Néon Dégradé Rose / Violet */}
          <path d="M22 22 L78 22 L72 38 L28 38 Z" fill="#e11d48" stroke="#fb7185" strokeWidth="1.5" />
          <text x="50" y="34" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1.5">ARCADE</text>
          
          {/* Écran CRT incurvé */}
          <rect x="26" y="42" width="48" height="28" rx="6" fill="#09090b" stroke="#a855f7" strokeWidth="2" />
          <ellipse cx="50" cy="56" rx="20" ry="10" fill="#a855f7" opacity="0.2" />
          
          {/* Joystick Rouge & Boutons d'Arcade */}
          <line x1="42" y1="84" x2="42" y2="76" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="74" r="4.5" fill="#e11d48" />
          <circle cx="54" cy="80" r="2.5" fill="#3b82f6" />
          <circle cx="61" cy="78" r="2.5" fill="#10b981" />
          <circle cx="68" cy="76" r="2.5" fill="#f59e0b" />
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">ARCADE</span>}
      </div>
    );
  }

  // 6. SONY PLAYSTATION (PS1 / PSX) - Logo Officiel 3D PS
  if (id === 'ps1' || id === 'psx' || id === 'playstation' || id === 'ps2' || id === 'ps3') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="PlayStation">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          <rect width="100" height="100" rx="22" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
          
          {/* P Debout (Rouge vif) */}
          <path d="M44 20 L54 20 C64 20 72 26 72 36 C72 46 64 52 54 52 L44 52 Z" fill="#ef4444" />
          <path d="M44 28 L44 76 L34 76 L34 20 L44 20 Z" fill="#dc2626" />
          <path d="M44 28 L52 28 C58 28 62 31 62 36 C62 41 58 44 52 44 L44 44 Z" fill="#f8fafc" />
          
          {/* S Couché (Jaune, Vert, Bleu) */}
          <path d="M32 70 C38 66 52 64 62 66 C72 68 76 74 72 78 C68 82 52 84 40 82 C28 80 26 74 32 70 Z" fill="#f59e0b" />
          <path d="M40 68 C48 65 60 65 68 68 C64 70 54 71 44 71 C38 71 36 69 40 68 Z" fill="#10b981" />
          <path d="M52 74 C62 73 72 74 76 76 C74 78 64 80 54 80 C46 80 44 77 52 74 Z" fill="#0284c7" />
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">PS1</span>}
      </div>
    );
  }

  // 7. NINTENDO ENTERTAINMENT SYSTEM (NES)
  if (id === 'nes' || id.includes('nintendo entertainment') || id === 'famicom') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="NES">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          <rect width="100" height="100" rx="22" fill="#1e293b" />
          {/* Bandeau Rouge Nintendo */}
          <rect x="16" y="32" width="68" height="36" rx="8" fill="#dc2626" stroke="#ef4444" strokeWidth="1.5" />
          <text x="50" y="57" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">NES</text>
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">NES</span>}
      </div>
    );
  }

  // 8. GAME BOY / GAME BOY COLOR (GB / GBC)
  if (id === 'gb' || id === 'gbc' || id === 'gameboy') {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title="Game Boy">
        <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
          <rect width="100" height="100" rx="22" fill="#cbd5e1" />
          {/* Écran vert rétro */}
          <rect x="26" y="24" width="48" height="36" rx="6" fill="#84cc16" stroke="#475569" strokeWidth="2" />
          {/* Croix D-pad */}
          <rect x="28" y="70" width="14" height="5" rx="1" fill="#334155" />
          <rect x="32.5" y="65.5" width="5" height="14" rx="1" fill="#334155" />
          {/* Boutons A B roses */}
          <circle cx="66" cy="74" r="3.5" fill="#db2777" />
          <circle cx="75" cy="70" r="3.5" fill="#db2777" />
        </svg>
        {showText && <span className="font-mono font-black text-slate-800 text-xs tracking-wider">GB</span>}
      </div>
    );
  }

  // FALLBACK PAR DÉFAUT - Manette Rétro Stylisée
  return (
    <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`} title={systemId}>
      <svg viewBox="0 0 100 100" className={`${sizeClasses} drop-shadow-xs`}>
        <rect width="100" height="100" rx="22" fill="#f3e8ff" stroke="#e9d5ff" strokeWidth="2" />
        <path d="M26 40 C26 32 36 28 50 28 C64 28 74 32 74 40 L70 66 C68 74 60 76 54 70 L48 64 L42 70 C36 76 28 74 26 66 Z" fill="#7c3aed" />
        <circle cx="38" cy="44" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="62" cy="42" r="2.5" fill="#f43f5e" />
        <circle cx="58" cy="48" r="2.5" fill="#38bdf8" />
      </svg>
      {showText && <span className="font-mono font-black text-slate-800 text-xs uppercase tracking-wider">{systemId}</span>}
    </div>
  );
};
