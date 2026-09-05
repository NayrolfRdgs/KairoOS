# 🎨 Architecture des Thèmes & UIs Modulaires — KaïroOS

Dans KaïroOS, chaque thème n'est pas un simple fichier de configuration : **chaque thème est un module d'interface utilisateur (UI) complet et indépendant**, avec son propre code React, son propre agencement HTML, son propre design et ses propres interactions.

---

## 📁 Structure des dossiers

```
src/themes/
  ├── types.ts                 ← Contrat d'interface TypeScript (ThemeUIProps)
  ├── index.ts                 ← Registre central des thèmes (THEME_UI_REGISTRY)
  ├── ClassicArcadeTheme/      ← UI 1 : Thème Classique Arcade (Barre latérale + Grille)
  │     └── index.tsx
  └── HubShelfTheme/           ← UI 2 : Thème Hub Moderne (Rayonnages par catégories plein écran)
        └── index.tsx
```

---

## 🚀 Comment créer votre propre interface (UI personnalisée)

Pour créer une interface 100% sur mesure :

### 1. Créez votre dossier dans `src/themes/`
Exemple : `src/themes/MonInterfaceCustom/index.tsx`

### 2. Implémentez le composant en utilisant `ThemeUIProps`
```tsx
import React from 'react';
import { ThemeUIProps } from '../types';

export const MonInterfaceCustom: React.FC<ThemeUIProps> = ({
  systems,
  allGames,
  filteredAndSortedGames,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenSettings,
  theme,
}) => {
  return (
    <div className="flex flex-col h-full w-full p-8 bg-black text-white">
      <h1 className="text-3xl font-bold">Ma Propre UI de Borne !</h1>
      
      {/* Vous pouvez coder n'importe quoi ici : une roue de sélection type Hyperspin,
          un coverflow 3D, une interface épurée type Apple TV, etc. */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {filteredAndSortedGames.map((game) => (
          <div
            key={game.id}
            onClick={() => onLaunchGame(game)}
            className="p-4 bg-zinc-900 rounded-xl cursor-pointer hover:scale-105 transition-transform"
          >
            <img src={game.cover_url || ''} alt={game.title} className="w-full h-40 object-cover rounded" />
            <h3 className="mt-2 font-bold">{game.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. Enregistrez votre thème dans `src/themes/index.ts`
```tsx
import { MonInterfaceCustom } from './MonInterfaceCustom';

export const THEME_UI_REGISTRY: Record<string, React.FC<ThemeUIProps>> = {
  'kairo-default': ClassicArcadeTheme,
  'kairo-hub': HubShelfTheme,
  'mon-theme-custom': MonInterfaceCustom, // ← Votre nouveau thème !
};
```

### 4. Créez la déclaration du thème dans `themes/mon-theme-custom/theme.json`
```json
{
  "id": "mon-theme-custom",
  "name": "Mon Interface Personnalisée",
  "author": "Votre Nom",
  "version": "1.0.0",
  "description": "Une interface arcade entièrement codée sur mesure"
}
```

Votre interface apparaîtra instantanément dans le sélecteur de thèmes de KaïroOS et sera sélectionnable en un clic !
