/**
 * =========================================================================
 * Application JavaScript — Thème Classic Arcade pour KaïroOS
 * =========================================================================
 * Code complet, autonome et modifiable par n'importe qui !
 */

(function () {
  let allGames = [];
  let allSystems = [];
  let currentFilter = 'all'; // 'all' | 'favorites' | '2-players' | 'recent' | 'system:<id>'
  let searchQuery = '';
  let focusedIndex = 0;
  let heroGames = [];
  let currentHeroIndex = 0;
  let heroTimer = null;

  // DOM Elements
  const systemsListEl = document.getElementById('systems-list');
  const catalogGridEl = document.getElementById('catalog-grid');
  const catalogTitleEl = document.getElementById('catalog-title');
  const catalogCountEl = document.getElementById('catalog-count');
  const activeFilterLabel = document.getElementById('active-filter-label');
  const searchInput = document.getElementById('search-bar');
  const clearSearchBtn = document.getElementById('btn-clear-search');
  const statusLabel = document.getElementById('status-label');

  // Badges
  const badgeAll = document.getElementById('badge-all');
  const badgeFavs = document.getElementById('badge-favs');
  const badge2p = document.getElementById('badge-2p');
  const badgeRecent = document.getElementById('badge-recent');

  // Hero Elements
  const heroBg = document.getElementById('hero-bg');
  const heroTitle = document.getElementById('hero-title');
  const heroSynopsis = document.getElementById('hero-synopsis');
  const heroSystemPill = document.getElementById('hero-system-pill');
  const heroPlayBtn = document.getElementById('hero-play-btn');
  const heroDetailsBtn = document.getElementById('hero-details-btn');
  const heroDots = document.getElementById('hero-dots');

  // Boutons Paramètres
  const btnSettings = document.getElementById('btn-open-settings');
  const btnGamepadSettings = document.getElementById('btn-gamepad-settings');

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

    if (kairo.gamepadConnected && statusLabel) {
      statusLabel.textContent = kairo.gamepadName || 'Manette connectée';
    }

    updateHeroShowcase();
    renderBadges();
    renderSystems();
    renderGames();

    if (kairo.onLibraryUpdate) {
      kairo.onLibraryUpdate((games) => {
        allGames = games;
        updateHeroShowcase();
        renderBadges();
        renderSystems();
        renderGames();
      });
    }

    if (kairo.onGamepad) {
      kairo.onGamepad(handleGamepadEvent);
    }
  }

  function updateHeroShowcase() {
    if (allGames.length === 0) return;
    // Sélectionne jusqu'à 5 jeux phares (favoris ou avec le plus de sessions)
    const favs = allGames.filter((g) => g.favorite);
    heroGames = favs.length > 0 ? favs.slice(0, 5) : allGames.slice(0, 5);
    currentHeroIndex = 0;
    renderHeroSlide();

    if (heroTimer) clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      if (heroGames.length <= 1) return;
      currentHeroIndex = (currentHeroIndex + 1) % heroGames.length;
      renderHeroSlide();
    }, 6000);
  }

  function renderHeroSlide() {
    const game = heroGames[currentHeroIndex];
    if (!game) return;

    if (heroTitle) heroTitle.textContent = game.title;
    if (heroSynopsis) heroSynopsis.textContent = game.synopsis || 'Jeu d\'arcade culte prêt à être lancé.';
    if (heroSystemPill) heroSystemPill.textContent = (game.system_id || 'Arcade').toUpperCase();

    if (heroBg) {
      const bgUrl = game.backdrop_url || game.cover_url;
      if (bgUrl) {
        heroBg.style.backgroundImage = `url("${bgUrl}")`;
      } else {
        heroBg.style.backgroundImage = 'none';
      }
    }

    if (heroPlayBtn) {
      heroPlayBtn.onclick = () => {
        const k = getKairo();
        if (k && k.launchGame) k.launchGame(game.id);
      };
    }

    if (heroDetailsBtn) {
      heroDetailsBtn.onclick = () => {
        const k = getKairo();
        if (k && k.selectGame) k.selectGame(game.id);
      };
    }

    if (heroDots) {
      heroDots.innerHTML = '';
      heroGames.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `hero-dot ${idx === currentHeroIndex ? 'active' : ''}`;
        dot.onclick = () => {
          currentHeroIndex = idx;
          renderHeroSlide();
        };
        heroDots.appendChild(dot);
      });
    }
  }

  function renderBadges() {
    if (badgeAll) badgeAll.textContent = allGames.length;
    if (badgeFavs) badgeFavs.textContent = allGames.filter((g) => g.favorite).length;
    if (badge2p) badge2p.textContent = allGames.filter((g) => (g.players || 1) >= 2).length;
    if (badgeRecent) badgeRecent.textContent = allGames.filter((g) => (g.play_count || 0) > 0 || g.last_played).length;
  }

  function renderSystems() {
    if (!systemsListEl) return;
    systemsListEl.innerHTML = '';

    allSystems.forEach((sys) => {
      const count = allGames.filter((g) => g.system_id === sys.id).length;
      if (count === 0) return;

      const btn = document.createElement('button');
      const isSelected = currentFilter === `system:${sys.id}`;
      btn.className = `nav-item ${isSelected ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="nav-icon">🕹️</span>
        <span class="nav-label">${sys.name}</span>
        <span class="count-badge">${count}</span>
      `;
      btn.onclick = () => {
        currentFilter = `system:${sys.id}`;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        updateNavSelection();
        focusedIndex = 0;
        renderGames();
      };
      systemsListEl.appendChild(btn);
    });
  }

  function updateNavSelection() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => item.classList.remove('active'));

    if (currentFilter === 'all') document.getElementById('nav-all')?.classList.add('active');
    else if (currentFilter === 'favorites') document.getElementById('nav-favs')?.classList.add('active');
    else if (currentFilter === '2-players') document.getElementById('nav-2p')?.classList.add('active');
    else if (currentFilter === 'recent') document.getElementById('nav-recent')?.classList.add('active');
  }

  function getFilteredGames() {
    let list = allGames;

    if (currentFilter === 'favorites') {
      list = list.filter((g) => g.favorite);
    } else if (currentFilter === '2-players') {
      list = list.filter((g) => (g.players || 1) >= 2);
    } else if (currentFilter === 'recent') {
      list = list.filter((g) => (g.play_count || 0) > 0 || g.last_played);
    } else if (currentFilter.startsWith('system:')) {
      const sysId = currentFilter.replace('system:', '');
      list = list.filter((g) => g.system_id === sysId);
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

  function renderGames() {
    if (!catalogGridEl) return;
    catalogGridEl.innerHTML = '';

    const list = getFilteredGames();

    if (catalogCountEl) catalogCountEl.textContent = `${list.length} JEUX`;

    if (catalogTitleEl) {
      if (searchQuery) {
        catalogTitleEl.textContent = `Résultats pour "${searchQuery}"`;
      } else if (currentFilter === 'all') {
        catalogTitleEl.textContent = 'Tous les Jeux';
      } else if (currentFilter === 'favorites') {
        catalogTitleEl.textContent = 'Vos Jeux Favoris';
      } else if (currentFilter === '2-players') {
        catalogTitleEl.textContent = 'Jeux à 2 Joueurs (Versus & Co-op)';
      } else if (currentFilter === 'recent') {
        catalogTitleEl.textContent = 'Récemment Joués';
      } else if (currentFilter.startsWith('system:')) {
        const sys = allSystems.find((s) => s.id === currentFilter.replace('system:', ''));
        catalogTitleEl.textContent = sys ? sys.name : 'Console';
      }
    }

    if (activeFilterLabel) {
      activeFilterLabel.textContent = catalogTitleEl ? catalogTitleEl.textContent : 'Catalogue';
    }

    if (list.length === 0) {
      catalogGridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">👾</div>
          <div style="font-weight: 800; font-size: 1.1rem; color: #94a3b8;">Aucun jeu trouvé</div>
          <div style="font-size: 0.8rem; margin-top: 6px;">Essayez d'ajuster votre recherche ou sélectionnez une autre catégorie.</div>
        </div>
      `;
      return;
    }

    const kairo = getKairo();

    list.forEach((game, idx) => {
      const isFocused = idx === focusedIndex;
      const card = document.createElement('div');
      card.className = `game-card ${isFocused ? 'gamepad-focus' : ''}`;
      card.id = `game-${idx}`;

      const coverContainer = document.createElement('div');
      coverContainer.className = 'cover-container';

      if (game.cover_url) {
        const img = document.createElement('img');
        img.className = 'cover-img';
        img.src = game.cover_url;
        img.alt = game.title;
        img.loading = 'lazy';
        coverContainer.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'cover-placeholder';
        placeholder.innerHTML = `<div>🕹️</div><div style="font-size: 0.7rem; font-weight: bold; margin-top: 4px;">${game.title}</div>`;
        coverContainer.appendChild(placeholder);
      }

      if (game.favorite) {
        const fav = document.createElement('div');
        fav.className = 'favorite-star';
        fav.textContent = '⭐';
        coverContainer.appendChild(fav);
      }

      const info = document.createElement('div');
      info.className = 'card-info';

      const title = document.createElement('div');
      title.className = 'game-title';
      title.textContent = game.title;

      const sub = document.createElement('div');
      sub.className = 'game-sub';
      sub.textContent = game.system_id || 'Arcade';

      info.appendChild(title);
      info.appendChild(sub);

      card.appendChild(coverContainer);
      card.appendChild(info);

      card.onclick = () => {
        focusedIndex = idx;
        updateFocus();
        if (kairo && kairo.launchGame) kairo.launchGame(game.id);
      };

      card.oncontextmenu = (e) => {
        e.preventDefault();
        focusedIndex = idx;
        updateFocus();
        if (kairo && kairo.selectGame) kairo.selectGame(game.id);
      };

      catalogGridEl.appendChild(card);
    });

    scrollFocusedIntoView();
  }

  function updateFocus() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((c, idx) => {
      if (idx === focusedIndex) c.classList.add('gamepad-focus');
      else c.classList.remove('gamepad-focus');
    });
    scrollFocusedIntoView();
  }

  function scrollFocusedIntoView() {
    const el = document.getElementById(`game-${focusedIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function setupEventListeners() {
    // Événements navigation de la sidebar
    document.getElementById('nav-all')?.addEventListener('click', () => {
      currentFilter = 'all';
      updateNavSelection();
      focusedIndex = 0;
      renderGames();
    });

    document.getElementById('nav-favs')?.addEventListener('click', () => {
      currentFilter = 'favorites';
      updateNavSelection();
      focusedIndex = 0;
      renderGames();
    });

    document.getElementById('nav-2p')?.addEventListener('click', () => {
      currentFilter = '2-players';
      updateNavSelection();
      focusedIndex = 0;
      renderGames();
    });

    document.getElementById('nav-recent')?.addEventListener('click', () => {
      currentFilter = 'recent';
      updateNavSelection();
      focusedIndex = 0;
      renderGames();
    });

    // Recherche
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
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

    // Actions Settings
    btnSettings?.addEventListener('click', () => {
      const k = getKairo();
      if (k && k.openSettings) k.openSettings();
    });

    btnGamepadSettings?.addEventListener('click', () => {
      const k = getKairo();
      if (k && k.openGamepadSettings) k.openGamepadSettings();
    });

    // Clavier
    window.addEventListener('keydown', handleKeyboard);

    // Messages postMessage
    window.addEventListener('message', (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'KAIRO_INIT') {
        const payload = e.data.payload;
        allGames = payload.games || [];
        allSystems = payload.systems || [];
        updateHeroShowcase();
        renderBadges();
        renderSystems();
        renderGames();
      } else if (e.data.type === 'KAIRO_GAMEPAD_EVENT') {
        handleGamepadEvent(e.data.payload);
      }
    });
  }

  function handleGamepadEvent(event) {
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
      if (target && kairo && kairo.launchGame) kairo.launchGame(target.id);
    } else if (action === 'back') {
      if (currentFilter !== 'all' || searchQuery) {
        currentFilter = 'all';
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        updateNavSelection();
        focusedIndex = 0;
        renderGames();
      }
    } else if (action === 'toggle_favorite') {
      const target = list[focusedIndex];
      if (target && kairo && kairo.toggleFavorite) kairo.toggleFavorite(target.id);
    }
  }

  function handleKeyboard(e) {
    if (document.activeElement === searchInput) {
      if (e.key === 'Escape') searchInput.blur();
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
      if (target && kairo && kairo.launchGame) kairo.launchGame(target.id);
    } else if (e.key === ' ' || e.key.toLowerCase() === 'y') {
      e.preventDefault();
      const target = list[focusedIndex];
      if (target && kairo && kairo.selectGame) kairo.selectGame(target.id);
    } else if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'x') {
      const target = list[focusedIndex];
      if (target && kairo && kairo.toggleFavorite) kairo.toggleFavorite(target.id);
    } else if (e.key === 'Escape') {
      if (currentFilter !== 'all' || searchQuery) {
        currentFilter = 'all';
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        updateNavSelection();
        focusedIndex = 0;
        renderGames();
      }
    }
  }

  window.addEventListener('DOMContentLoaded', init);
  init();
})();
