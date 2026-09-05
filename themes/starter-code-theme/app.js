/**
 * =========================================================================
 * Application JavaScript — Thème Neon Arcade pour KaïroOS
 * =========================================================================
 * Ce script montre l'utilisation complète de l'API fournie par KaïroOS :
 * - `kairo.games` : Liste de tous les jeux
 * - `kairo.systems` : Liste des consoles
 * - `kairo.launchGame(id)` : Lancement de l'émulateur
 * - `kairo.selectGame(id)` : Fiche de détails du jeu
 * - `kairo.toggleFavorite(id)` : Favoris
 * - `kairo.openSettings()` : Paramètres
 * - `kairo.onGamepad(callback)` : Contrôle manette
 */

(function () {
  let allGames = [];
  let allSystems = [];
  let selectedSystemId = null;
  let searchQuery = '';
  let focusedIndex = 0;

  // Éléments DOM
  const totalGamesPill = document.getElementById('total-games-pill');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const systemsBar = document.getElementById('systems-bar');
  const gamesGrid = document.getElementById('games-grid');
  const currentCategoryLabel = document.getElementById('current-category-label');
  const settingsBtn = document.getElementById('settings-btn');
  const gamepadBtn = document.getElementById('gamepad-btn');

  // Récupération de l'objet bridge Kaïro
  function getKairo() {
    return window.kairo || (window.parent && window.parent.kairo) || null;
  }

  // Initialisation
  function init() {
    const kairo = getKairo();

    if (kairo && kairo.games && kairo.games.length > 0) {
      loadData(kairo);
    } else {
      // Signalement à Kaïro que l'iframe est prête
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'KAIRO_READY' }, '*');
      }
      setTimeout(() => {
        const k = getKairo();
        if (k) loadData(k);
      }, 200);
    }

    setupEvents();
  }

  function loadData(kairo) {
    allGames = kairo.games || [];
    allSystems = kairo.systems || [];

    if (totalGamesPill) {
      totalGamesPill.textContent = `${allGames.length} JEUX`;
    }

    renderSystems();
    renderGames();

    // Écoute des mises à jour de la bibliothèque
    if (kairo.onLibraryUpdate) {
      kairo.onLibraryUpdate((updatedGames) => {
        allGames = updatedGames;
        if (totalGamesPill) {
          totalGamesPill.textContent = `${allGames.length} JEUX`;
        }
        renderGames();
      });
    }

    // Écoute des inputs manette
    if (kairo.onGamepad) {
      kairo.onGamepad(handleGamepadAction);
    }
  }

  function setupEvents() {
    // Écoute des messages postMessage
    window.addEventListener('message', (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'KAIRO_INIT') {
        const payload = e.data.payload;
        allGames = payload.games || [];
        allSystems = payload.systems || [];
        if (totalGamesPill) totalGamesPill.textContent = `${allGames.length} JEUX`;
        renderSystems();
        renderGames();
      } else if (e.data.type === 'KAIRO_LIBRARY_UPDATE') {
        allGames = e.data.payload?.games || [];
        if (totalGamesPill) totalGamesPill.textContent = `${allGames.length} JEUX`;
        renderGames();
      } else if (e.data.type === 'KAIRO_GAMEPAD_EVENT') {
        handleGamepadAction(e.data.payload);
      }
    });

    // Recherche textuelle
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        focusedIndex = 0;
        renderGames();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchQuery = '';
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        focusedIndex = 0;
        renderGames();
      });
    }

    // Boutons de navigation
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const k = getKairo();
        if (k && k.openSettings) k.openSettings();
      });
    }

    if (gamepadBtn) {
      gamepadBtn.addEventListener('click', () => {
        const k = getKairo();
        if (k && k.openGamepadSettings) k.openGamepadSettings();
      });
    }

    // Navigation au clavier
    window.addEventListener('keydown', handleKeyboard);
  }

  // Filtrage des jeux
  function getFilteredGames() {
    let list = allGames;

    if (selectedSystemId) {
      list = list.filter((g) => g.system_id === selectedSystemId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.system_id && g.system_id.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // Rendu des consoles
  function renderSystems() {
    if (!systemsBar) return;
    systemsBar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = `sys-chip ${selectedSystemId === null ? 'active' : ''}`;
    allBtn.innerHTML = `<span>🕹️</span> <span>Tous les Systèmes</span>`;
    allBtn.onclick = () => {
      selectedSystemId = null;
      focusedIndex = 0;
      renderSystems();
      renderGames();
    };
    systemsBar.appendChild(allBtn);

    allSystems.forEach((sys) => {
      const count = allGames.filter((g) => g.system_id === sys.id).length;
      if (count === 0) return;

      const btn = document.createElement('button');
      btn.className = `sys-chip ${selectedSystemId === sys.id ? 'active' : ''}`;
      btn.innerHTML = `<span>🎮</span> <span>${sys.name}</span> <small style="opacity:0.7;">(${count})</small>`;
      btn.onclick = () => {
        selectedSystemId = selectedSystemId === sys.id ? null : sys.id;
        focusedIndex = 0;
        renderSystems();
        renderGames();
      };
      systemsBar.appendChild(btn);
    });
  }

  // Rendu de la grille
  function renderGames() {
    if (!gamesGrid) return;
    gamesGrid.innerHTML = '';

    const list = getFilteredGames();

    if (currentCategoryLabel) {
      if (searchQuery) {
        currentCategoryLabel.textContent = `Recherche : "${searchQuery}" (${list.length})`;
      } else if (selectedSystemId) {
        const s = allSystems.find((sys) => sys.id === selectedSystemId);
        currentCategoryLabel.textContent = `${s ? s.name : selectedSystemId} (${list.length} jeux)`;
      } else {
        currentCategoryLabel.textContent = `Tous les Jeux (${list.length})`;
      }
    }

    if (list.length === 0) {
      gamesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b; font-weight: 700;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">👾</div>
          <div>Aucun jeu trouvé pour cette sélection</div>
        </div>
      `;
      return;
    }

    const kairo = getKairo();

    list.forEach((game, idx) => {
      const isFocused = idx === focusedIndex;
      const card = document.createElement('div');
      card.className = `game-card ${isFocused ? 'gamepad-focus' : ''}`;
      card.id = `game-card-${idx}`;

      // Jaquette
      const coverBox = document.createElement('div');
      coverBox.className = 'cover-container';

      if (game.cover_url) {
        const img = document.createElement('img');
        img.className = 'cover-img';
        img.src = game.cover_url;
        img.alt = game.title;
        img.loading = 'lazy';
        coverBox.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-cover';
        placeholder.innerHTML = `<span>🎮</span><span style="font-size: 0.65rem; font-weight: bold; text-align: center; padding: 0 10px;">${game.title}</span>`;
        coverBox.appendChild(placeholder);
      }

      if (game.favorite) {
        const fav = document.createElement('div');
        fav.className = 'fav-badge';
        fav.textContent = '⭐';
        coverBox.appendChild(fav);
      }

      // Métadonnées
      const meta = document.createElement('div');
      meta.className = 'card-meta';

      const title = document.createElement('div');
      title.className = 'game-name';
      title.textContent = game.title;

      const sub = document.createElement('div');
      sub.className = 'game-sub';
      sub.innerHTML = `
        <span class="sys-tag">${game.system_id || 'Arcade'}</span>
        <span>${game.year || ''}</span>
      `;

      meta.appendChild(title);
      meta.appendChild(sub);

      card.appendChild(coverBox);
      card.appendChild(meta);

      // Clic pour lancer
      card.onclick = () => {
        focusedIndex = idx;
        updateFocus();
        if (kairo && kairo.launchGame) {
          kairo.launchGame(game.id);
        }
      };

      // Clic droit pour ouvrir les détails
      card.oncontextmenu = (e) => {
        e.preventDefault();
        focusedIndex = idx;
        updateFocus();
        if (kairo && kairo.selectGame) {
          kairo.selectGame(game.id);
        }
      };

      gamesGrid.appendChild(card);
    });

    scrollFocusedIntoView();
  }

  function updateFocus() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((c, idx) => {
      if (idx === focusedIndex) {
        c.classList.add('gamepad-focus');
      } else {
        c.classList.remove('gamepad-focus');
      }
    });
    scrollFocusedIntoView();
  }

  function scrollFocusedIntoView() {
    const el = document.getElementById(`game-card-${focusedIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Navigation manette
  function handleGamepadAction(event) {
    if (!event) return;
    const list = getFilteredGames();
    const total = list.length;
    const kairo = getKairo();

    const action = event.action;
    const payload = event.payload || {};

    if (action === 'navigate') {
      const dir = payload.direction;
      if (dir === 'left') {
        focusedIndex = Math.max(0, focusedIndex - 1);
        updateFocus();
      } else if (dir === 'right') {
        focusedIndex = Math.min(total - 1, focusedIndex + 1);
        updateFocus();
      } else if (dir === 'up') {
        focusedIndex = Math.max(0, focusedIndex - 4);
        updateFocus();
      } else if (dir === 'down') {
        focusedIndex = Math.min(total - 1, focusedIndex + 4);
        updateFocus();
      }
    } else if (action === 'confirm') {
      const target = list[focusedIndex];
      if (target && kairo && kairo.launchGame) {
        kairo.launchGame(target.id);
      }
    } else if (action === 'back') {
      if (selectedSystemId || searchQuery) {
        selectedSystemId = null;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        focusedIndex = 0;
        renderSystems();
        renderGames();
      }
    } else if (action === 'toggle_favorite') {
      const target = list[focusedIndex];
      if (target && kairo && kairo.toggleFavorite) {
        kairo.toggleFavorite(target.id);
      }
    } else if (action === 'prev_system') {
      cycleSystem(-1);
    } else if (action === 'next_system') {
      cycleSystem(1);
    }
  }

  function cycleSystem(delta) {
    const available = allSystems.filter(
      (sys) => allGames.filter((g) => g.system_id === sys.id).length > 0
    );
    if (available.length === 0) return;

    if (selectedSystemId === null) {
      selectedSystemId = delta > 0 ? available[0].id : available[available.length - 1].id;
    } else {
      const curr = available.findIndex((s) => s.id === selectedSystemId);
      const next = curr + delta;
      if (next < 0) selectedSystemId = null;
      else if (next >= available.length) selectedSystemId = null;
      else selectedSystemId = available[next].id;
    }

    focusedIndex = 0;
    renderSystems();
    renderGames();
  }

  // Clavier
  function handleKeyboard(e) {
    if (document.activeElement === searchInput) {
      if (e.key === 'Escape') {
        searchInput.blur();
      }
      return;
    }

    const list = getFilteredGames();
    const total = list.length;
    const kairo = getKairo();

    if (e.key === 'ArrowRight') {
      focusedIndex = Math.min(total - 1, focusedIndex + 1);
      updateFocus();
    } else if (e.key === 'ArrowLeft') {
      focusedIndex = Math.max(0, focusedIndex - 1);
      updateFocus();
    } else if (e.key === 'ArrowUp') {
      focusedIndex = Math.max(0, focusedIndex - 4);
      updateFocus();
    } else if (e.key === 'ArrowDown') {
      focusedIndex = Math.min(total - 1, focusedIndex + 4);
      updateFocus();
    } else if (e.key === 'Enter') {
      const target = list[focusedIndex];
      if (target && kairo && kairo.launchGame) {
        kairo.launchGame(target.id);
      }
    } else if (e.key === ' ' || e.key.toLowerCase() === 'y') {
      e.preventDefault();
      const target = list[focusedIndex];
      if (target && kairo && kairo.selectGame) {
        kairo.selectGame(target.id);
      }
    } else if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'x') {
      const target = list[focusedIndex];
      if (target && kairo && kairo.toggleFavorite) {
        kairo.toggleFavorite(target.id);
      }
    } else if (e.key === 'Escape') {
      if (selectedSystemId || searchQuery) {
        selectedSystemId = null;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        renderSystems();
        renderGames();
      }
    }
  }

  window.addEventListener('DOMContentLoaded', init);
  init();
})();
