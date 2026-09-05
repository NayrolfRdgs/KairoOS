/**
 * =========================================================================
 * Application JavaScript — Thème Kaïro Hub (Rayonnages Plein Écran)
 * =========================================================================
 * Code complet, autonome et modifiable par n'importe qui !
 */

(function () {
  let allGames = [];
  let allSystems = [];
  let activeFilter = null; // null | { type: 'system'|'mode'|'franchise'|'search', id: string, label: string }
  let searchQuery = '';

  // État de navigation manette sur le Hub
  let currentShelfIndex = 0; // 0: consoles, 1: favoris, 2: modes, 3: franchises, 4: all-games
  let currentItemIndex = 0;
  let categoryFocusIndex = 0;

  // DOM Elements
  const headerGamesCount = document.getElementById('header-games-count');
  const searchInput = document.getElementById('hub-search-input');
  const clearSearchBtn = document.getElementById('hub-clear-search');
  const activeFilterBadge = document.getElementById('active-filter-badge');
  const activeFilterText = document.getElementById('active-filter-text');
  const activeFilterClose = document.getElementById('active-filter-close');
  const hubStatusText = document.getElementById('hub-status-text');

  // Shelves Elements
  const shelvesContainer = document.getElementById('hub-shelves-container');
  const categorySection = document.getElementById('category-results-section');
  const categoryTitle = document.getElementById('category-title');
  const categoryGamesPill = document.getElementById('category-games-pill');
  const categoryGamesGrid = document.getElementById('category-games-grid');
  const btnBackToHub = document.getElementById('btn-back-to-hub');
  const btnCloseCategory = document.getElementById('btn-close-category');

  // Rayons individuels
  const consolesRow = document.getElementById('consoles-row');
  const favoritesRow = document.getElementById('favorites-row');
  const favsShelfTitle = document.getElementById('favs-shelf-title');
  const modesGrid = document.getElementById('modes-grid');
  const franchisesRow = document.getElementById('franchises-row');
  const allGamesRow = document.getElementById('all-games-row');
  const allShelfTitle = document.getElementById('all-shelf-title');

  // Boutons Settings
  const btnSettings = document.getElementById('hub-settings-btn');
  const btnGamepad = document.getElementById('hub-gamepad-btn');

  function getKairo() {
    return window.kairo || (window.parent && window.parent.kairo) || null;
  }

  function init() {
    const kairo = getKairo();
    if (kairo && kairo.games && kairo.games.length > 0) {
      setupData(kairo);
    } else {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'KAIRO_READY' }, '*');
      }
      setTimeout(() => {
        const k = getKairo();
        if (k) setupData(k);
      }, 200);
    }

    setupEventListeners();
  }

  function setupData(kairo) {
    allGames = kairo.games || [];
    allSystems = kairo.systems || [];

    if (headerGamesCount) {
      headerGamesCount.textContent = `${allGames.length} jeux`;
    }

    if (kairo.gamepadConnected && hubStatusText) {
      hubStatusText.textContent = kairo.gamepadName || 'Manette connectée';
    }

    renderAllShelves();

    if (kairo.onLibraryUpdate) {
      kairo.onLibraryUpdate((games) => {
        allGames = games;
        if (headerGamesCount) headerGamesCount.textContent = `${allGames.length} jeux`;
        if (activeFilter) {
          renderCategoryView();
        } else {
          renderAllShelves();
        }
      });
    }

    if (kairo.onGamepad) {
      kairo.onGamepad(handleGamepadEvent);
    }
  }

  function renderAllShelves() {
    renderConsolesShelf();
    renderFavoritesShelf();
    renderModesShelf();
    renderFranchisesShelf();
    renderAllGamesShelf();
    updateFocus();
  }

  // 1. Rayon Consoles
  function renderConsolesShelf() {
    if (!consolesRow) return;
    consolesRow.innerHTML = '';

    allSystems.forEach((sys, idx) => {
      const count = allGames.filter((g) => g.system_id === sys.id).length;
      if (count === 0) return;

      const card = document.createElement('div');
      card.className = 'console-card';
      card.id = `item-0-${idx}`;
      card.innerHTML = `
        <div class="console-card-top">
          <div class="console-icon-wrapper">🕹️</div>
          <span class="console-count-pill">${count} jeux</span>
        </div>
        <div>
          <div class="console-name">${sys.name}</div>
          <div class="console-sub">${sys.manufacturer || 'Arcade'}</div>
        </div>
      `;

      card.onclick = () => {
        openCategory('system', sys.id, sys.name.toUpperCase());
      };

      consolesRow.appendChild(card);
    });
  }

  // 2. Rayon Favoris
  function renderFavoritesShelf() {
    if (!favoritesRow) return;
    favoritesRow.innerHTML = '';

    const favs = allGames.filter((g) => g.favorite);
    if (favsShelfTitle) {
      favsShelfTitle.textContent = `Vos Jeux Favoris (${favs.length})`;
    }

    if (favs.length === 0) {
      favoritesRow.innerHTML = '<div style="color: #64748b; font-size: 0.8rem; padding: 10px 0;">Aucun jeu en favori. Appuyez sur (X) sur un jeu pour l\'ajouter ici !</div>';
      return;
    }

    favs.forEach((game, idx) => {
      const card = createGameCard(game, `item-1-${idx}`);
      favoritesRow.appendChild(card);
    });
  }

  // 3. Rayon Modes
  function renderModesShelf() {
    if (!modesGrid) return;
    modesGrid.innerHTML = '';

    const modes = [
      { id: '2-players', name: 'Jeux à 2 Joueurs', icon: '👥', color: '#f43f5e', count: allGames.filter((g) => (g.players || 1) >= 2).length },
      { id: 'fight', name: 'Combat & Versus', icon: '⚔️', color: '#f59e0b', count: allGames.filter((g) => (g.genre || '').toLowerCase().includes('combat') || (g.genre || '').toLowerCase().includes('fight')).length },
      { id: 'platform', name: 'Plateformes', icon: '🎮', color: '#ec4899', count: allGames.filter((g) => (g.genre || '').toLowerCase().includes('platform') || (g.title || '').toLowerCase().includes('mario')).length },
      { id: 'recent', name: 'Récemment Joués', icon: '🕒', color: '#8b5cf6', count: allGames.filter((g) => (g.play_count || 0) > 0 || g.last_played).length },
    ];

    modes.forEach((m, idx) => {
      const tile = document.createElement('div');
      tile.className = 'mode-tile';
      tile.id = `item-2-${idx}`;
      tile.innerHTML = `
        <div class="mode-tile-left">
          <div class="mode-icon-box" style="background: ${m.color}22; color: ${m.color};">${m.icon}</div>
          <div>
            <div class="mode-name">${m.name}</div>
            <div class="mode-count">${m.count} titres compatibles</div>
          </div>
        </div>
        <span style="color: #64748b; font-weight: bold;">➔</span>
      `;

      tile.onclick = () => {
        openCategory('mode', m.id, m.name.toUpperCase());
      };

      modesGrid.appendChild(tile);
    });
  }

  // 4. Rayon Franchises
  function renderFranchisesShelf() {
    if (!franchisesRow) return;
    franchisesRow.innerHTML = '';

    const popularFranchises = ['Mario', 'Zelda', 'Sonic', 'Street Fighter', 'Pokemon', 'Mega Man', 'Donkey Kong', 'Castlevania'];

    popularFranchises.forEach((fname, idx) => {
      const count = allGames.filter((g) => (g.title || '').toLowerCase().includes(fname.toLowerCase()) || (g.franchise || '').toLowerCase().includes(fname.toLowerCase())).length;
      if (count === 0) return;

      const chip = document.createElement('button');
      chip.className = 'franchise-chip';
      chip.id = `item-3-${idx}`;
      chip.innerHTML = `
        <span>${fname}</span>
        <span class="franchise-badge">${count}</span>
      `;

      chip.onclick = () => {
        openCategory('franchise', fname, `FRANCHISE : ${fname.toUpperCase()}`);
      };

      franchisesRow.appendChild(chip);
    });
  }

  // 5. Rayon Tous les Jeux
  function renderAllGamesShelf() {
    if (!allGamesRow) return;
    allGamesRow.innerHTML = '';

    if (allShelfTitle) {
      allShelfTitle.textContent = `Bibliothèque Complète (${allGames.length} jeux)`;
    }

    allGames.forEach((game, idx) => {
      const card = createGameCard(game, `item-4-${idx}`);
      allGamesRow.appendChild(card);
    });
  }

  function createGameCard(game, elementId) {
    const card = document.createElement('div');
    card.className = 'hub-game-card';
    if (elementId) card.id = elementId;

    const coverWrapper = document.createElement('div');
    coverWrapper.className = 'hub-cover-wrapper';

    if (game.cover_url) {
      const img = document.createElement('img');
      img.className = 'hub-cover-img';
      img.src = game.cover_url;
      img.alt = game.title;
      img.loading = 'lazy';
      coverWrapper.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'hub-placeholder';
      placeholder.textContent = '🎮';
      coverWrapper.appendChild(placeholder);
    }

    if (game.favorite) {
      const fav = document.createElement('div');
      fav.className = 'hub-fav-icon';
      fav.textContent = '⭐';
      coverWrapper.appendChild(fav);
    }

    const info = document.createElement('div');
    info.className = 'hub-card-info';

    const title = document.createElement('div');
    title.className = 'hub-card-title';
    title.textContent = game.title;

    const sub = document.createElement('div');
    sub.className = 'hub-card-sub';
    sub.textContent = game.system_id || 'Arcade';

    info.appendChild(title);
    info.appendChild(sub);

    card.appendChild(coverWrapper);
    card.appendChild(info);

    const kairo = getKairo();

    card.onclick = () => {
      if (kairo && kairo.launchGame) kairo.launchGame(game.id);
    };

    card.oncontextmenu = (e) => {
      e.preventDefault();
      if (kairo && kairo.selectGame) kairo.selectGame(game.id);
    };

    return card;
  }

  // =========================================================================
  // GESTION DE LA VUE CATÉGORIE / RÉSULTATS
  // =========================================================================
  function openCategory(type, id, label) {
    activeFilter = { type, id, label };
    categoryFocusIndex = 0;

    if (activeFilterBadge && activeFilterText) {
      activeFilterText.textContent = label;
      activeFilterBadge.style.display = 'flex';
    }

    renderCategoryView();
  }

  function closeCategory() {
    activeFilter = null;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (activeFilterBadge) activeFilterBadge.style.display = 'none';

    if (categorySection) categorySection.style.display = 'none';
    if (shelvesContainer) shelvesContainer.style.display = 'flex';

    renderAllShelves();
  }

  function renderCategoryView() {
    if (!categorySection || !shelvesContainer) return;

    shelvesContainer.style.display = 'none';
    categorySection.style.display = 'flex';

    const list = getCategoryGames();

    if (categoryTitle) categoryTitle.textContent = activeFilter?.label || 'RÉSULTATS';
    if (categoryGamesPill) categoryGamesPill.textContent = `${list.length} JEUX`;

    if (!categoryGamesGrid) return;
    categoryGamesGrid.innerHTML = '';

    if (list.length === 0) {
      categoryGamesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">👾</div>
          <div style="font-weight: 800; font-size: 1.1rem; color: #94a3b8;">Aucun jeu dans cette catégorie</div>
        </div>
      `;
      return;
    }

    list.forEach((game, idx) => {
      const card = createGameCard(game, `cat-game-${idx}`);
      card.style.minWidth = 'auto';
      card.style.maxWidth = 'none';
      if (idx === categoryFocusIndex) {
        card.classList.add('shelf-focus');
      }
      categoryGamesGrid.appendChild(card);
    });

    scrollCategoryFocused();
  }

  function getCategoryGames() {
    if (!activeFilter) return allGames;

    let list = allGames;

    if (activeFilter.type === 'system') {
      list = list.filter((g) => g.system_id === activeFilter.id);
    } else if (activeFilter.type === 'mode') {
      if (activeFilter.id === '2-players') {
        list = list.filter((g) => (g.players || 1) >= 2);
      } else if (activeFilter.id === 'fight') {
        list = list.filter((g) => (g.genre || '').toLowerCase().includes('combat') || (g.genre || '').toLowerCase().includes('fight'));
      } else if (activeFilter.id === 'platform') {
        list = list.filter((g) => (g.genre || '').toLowerCase().includes('platform') || (g.title || '').toLowerCase().includes('mario'));
      } else if (activeFilter.id === 'recent') {
        list = list.filter((g) => (g.play_count || 0) > 0 || g.last_played);
      }
    } else if (activeFilter.type === 'franchise') {
      const f = activeFilter.id.toLowerCase();
      list = list.filter((g) => (g.title || '').toLowerCase().includes(f) || (g.franchise || '').toLowerCase().includes(f));
    } else if (activeFilter.type === 'search') {
      const q = activeFilter.id.toLowerCase().trim();
      list = list.filter((g) => (g.title || '').toLowerCase().includes(q) || (g.system_id || '').toLowerCase().includes(q));
    }

    return list;
  }

  // =========================================================================
  // ÉVÉNEMENTS & NAVIGATION MANETTE
  // =========================================================================
  function setupEventListeners() {
    btnBackToHub?.addEventListener('click', closeCategory);
    btnCloseCategory?.addEventListener('click', closeCategory);
    activeFilterClose?.addEventListener('click', closeCategory);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'block' : 'none';

        if (searchQuery.trim()) {
          openCategory('search', searchQuery, `RECHERCHE : "${searchQuery.trim().toUpperCase()}"`);
        } else {
          closeCategory();
        }
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', closeCategory);
    }

    btnSettings?.addEventListener('click', () => {
      const k = getKairo();
      if (k && k.openSettings) k.openSettings();
    });

    btnGamepad?.addEventListener('click', () => {
      const k = getKairo();
      if (k && k.openGamepadSettings) k.openGamepadSettings();
    });

    window.addEventListener('keydown', handleKeyboard);

    window.addEventListener('message', (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'KAIRO_INIT') {
        const payload = e.data.payload;
        allGames = payload.games || [];
        allSystems = payload.systems || [];
        if (headerGamesCount) headerGamesCount.textContent = `${allGames.length} jeux`;
        renderAllShelves();
      } else if (e.data.type === 'KAIRO_GAMEPAD_EVENT') {
        handleGamepadEvent(e.data.payload);
      }
    });
  }

  function handleGamepadEvent(event) {
    if (!event) return;
    const action = event.action;
    const payload = event.payload || {};
    const kairo = getKairo();

    if (activeFilter) {
      // Navigation dans la vue catégorie
      const list = getCategoryGames();
      const total = list.length;
      if (total === 0) return;

      if (action === 'navigate') {
        const dir = payload.direction;
        if (dir === 'left') categoryFocusIndex = Math.max(0, categoryFocusIndex - 1);
        else if (dir === 'right') categoryFocusIndex = Math.min(total - 1, categoryFocusIndex + 1);
        else if (dir === 'up') categoryFocusIndex = Math.max(0, categoryFocusIndex - 4);
        else if (dir === 'down') categoryFocusIndex = Math.min(total - 1, categoryFocusIndex + 4);

        updateCategoryFocus();
      } else if (action === 'confirm') {
        const target = list[categoryFocusIndex];
        if (target && kairo && kairo.launchGame) kairo.launchGame(target.id);
      } else if (action === 'back') {
        closeCategory();
      } else if (action === 'toggle_favorite') {
        const target = list[categoryFocusIndex];
        if (target && kairo && kairo.toggleFavorite) kairo.toggleFavorite(target.id);
      }
    } else {
      // Navigation sur les rayonnages principaux
      if (action === 'navigate') {
        const dir = payload.direction;
        if (dir === 'up') {
          currentShelfIndex = Math.max(0, currentShelfIndex - 1);
          currentItemIndex = 0;
        } else if (dir === 'down') {
          currentShelfIndex = Math.min(4, currentShelfIndex + 1);
          currentItemIndex = 0;
        } else if (dir === 'left') {
          currentItemIndex = Math.max(0, currentItemIndex - 1);
        } else if (dir === 'right') {
          currentItemIndex = currentItemIndex + 1;
        }
        updateFocus();
      } else if (action === 'confirm') {
        activateCurrentShelfItem();
      } else if (action === 'back') {
        if (searchQuery) closeCategory();
      } else if (action === 'toggle_favorite') {
        toggleFavoriteOnCurrentItem();
      }
    }
  }

  function updateFocus() {
    document.querySelectorAll('.shelf-focus').forEach((el) => el.classList.remove('shelf-focus'));

    const targetEl = document.getElementById(`item-${currentShelfIndex}-${currentItemIndex}`);
    if (targetEl) {
      targetEl.classList.add('shelf-focus');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function updateCategoryFocus() {
    document.querySelectorAll('.shelf-focus').forEach((el) => el.classList.remove('shelf-focus'));
    const target = document.getElementById(`cat-game-${categoryFocusIndex}`);
    if (target) {
      target.classList.add('shelf-focus');
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function scrollCategoryFocused() {
    const target = document.getElementById(`cat-game-${categoryFocusIndex}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function activateCurrentShelfItem() {
    const kairo = getKairo();

    if (currentShelfIndex === 0) {
      // Console sélectionnée
      const sys = allSystems[currentItemIndex];
      if (sys) openCategory('system', sys.id, sys.name.toUpperCase());
    } else if (currentShelfIndex === 1) {
      // Favori sélectionné -> lancer
      const favs = allGames.filter((g) => g.favorite);
      const target = favs[currentItemIndex];
      if (target && kairo && kairo.launchGame) kairo.launchGame(target.id);
    } else if (currentShelfIndex === 2) {
      // Mode sélectionné
      const modeIds = ['2-players', 'fight', 'platform', 'recent'];
      const modeNames = ['JEUX À 2 JOUEURS', 'COMBAT & VERSUS', 'PLATEFORMES', 'RÉCEMMENT JOUÉS'];
      const mId = modeIds[currentItemIndex];
      if (mId) openCategory('mode', mId, modeNames[currentItemIndex]);
    } else if (currentShelfIndex === 3) {
      // Franchise sélectionnée
      const franchises = ['Mario', 'Zelda', 'Sonic', 'Street Fighter', 'Pokemon', 'Mega Man', 'Donkey Kong', 'Castlevania'];
      const f = franchises[currentItemIndex];
      if (f) openCategory('franchise', f, `FRANCHISE : ${f.toUpperCase()}`);
    } else if (currentShelfIndex === 4) {
      // Jeu complet sélectionné -> lancer
      const target = allGames[currentItemIndex];
      if (target && kairo && kairo.launchGame) kairo.launchGame(target.id);
    }
  }

  function toggleFavoriteOnCurrentItem() {
    const kairo = getKairo();
    let target = null;
    if (currentShelfIndex === 1) {
      const favs = allGames.filter((g) => g.favorite);
      target = favs[currentItemIndex];
    } else if (currentShelfIndex === 4) {
      target = allGames[currentItemIndex];
    }
    if (target && kairo && kairo.toggleFavorite) {
      kairo.toggleFavorite(target.id);
    }
  }

  function handleKeyboard(e) {
    if (document.activeElement === searchInput) {
      if (e.key === 'Escape') searchInput.blur();
      return;
    }

    if (e.key === 'Escape' || e.key === 'Backspace') {
      if (activeFilter) closeCategory();
    } else if (e.key === 'Enter') {
      if (activeFilter) {
        const list = getCategoryGames();
        const target = list[categoryFocusIndex];
        const k = getKairo();
        if (target && k && k.launchGame) k.launchGame(target.id);
      } else {
        activateCurrentShelfItem();
      }
    } else if (e.key === 'ArrowRight') {
      handleGamepadEvent({ action: 'navigate', payload: { direction: 'right' } });
    } else if (e.key === 'ArrowLeft') {
      handleGamepadEvent({ action: 'navigate', payload: { direction: 'left' } });
    } else if (e.key === 'ArrowUp') {
      handleGamepadEvent({ action: 'navigate', payload: { direction: 'up' } });
    } else if (e.key === 'ArrowDown') {
      handleGamepadEvent({ action: 'navigate', payload: { direction: 'down' } });
    }
  }

  window.addEventListener('DOMContentLoaded', init);
  init();
})();
