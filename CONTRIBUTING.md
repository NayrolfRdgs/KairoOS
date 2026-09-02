# Guide de Contribution à KaïroOS

Merci de vouloir contribuer à KaïroOS ! 🎮

## Règles et Standards

1. **Rust (`kairo-core` & `src-tauri`)** :
   - Formatez le code avec `cargo fmt`.
   - Assurez-vous que `cargo clippy` et `cargo test --all` ne génèrent aucune erreur.

2. **Frontend React 19 (`src/`)** :
   - Respectez les types TypeScript stricts (`npx tsc --noEmit`).
   - Tout composant interactif doit supporter la navigation à la manette via le hook `useGamepad`.

3. **Commits et Branches** :
   - Utilisez des messages de commit conventionnels (ex: `feat: add RPCS3 support`, `fix: handle disc change`).
   - Créez des branches dédiées pour vos fonctionnalités (`feature/nom-feature` ou `fix/nom-bug`).
