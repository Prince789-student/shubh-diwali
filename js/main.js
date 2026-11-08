/**
 * Deepavali 2026 - Main Application Controller
 * Streamlined Navigation, Hub Tabs, Floating Cracker Dock & Micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initFairyLights();
  initSoundControls();
  initCrackerDock();
  initSmoothNav();
  initHubTabs();
  initModalHandlers();
  initAutoOpenFestiveMusic();
});

// Auto-trigger festive ambient music on user's first gesture (without clashing with Aarti)
function initAutoOpenFestiveMusic() {
  let hasTriggered = false;
  const startFestiveAmbient = (e) => {
    // If the click/touch is on the Aarti section, player or controls, do NOT start background music!
    if (e && e.target && e.target.closest('#mainAartiPlayBtn, .btn-play-aarti, .track-pill-btn, #mandir, .aarti-stanza, .aarti-player-card')) {
      return;
    }
    if (window.pujaMandir && window.pujaMandir.isPlayingMusic) {
      return;
    }
    if (hasTriggered) return;
    hasTriggered = true;

    if (window.diwaliAudio && !window.diwaliAudio.userExplicitlyPausedBgm) {
      window.diwaliAudio.playFestiveBgm();
    }

    ['pointerdown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev => {
      window.removeEventListener(ev, startFestiveAmbient);
    });
  };

  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev => {
    window.addEventListener(ev, startFestiveAmbient, { passive: true });
  });
}

// 1. Top Festoon Border (Clean micro-lights embedded in header, never overlapping links)
function initFairyLights() {
  const container = document.getElementById('fairyLightsString');
  if (!container) return;

  const totalBulbs = Math.min(48, Math.floor(window.innerWidth / 28));
  const bulbColors = ['#FFD700', '#FF4500', '#00FF88', '#00E5FF', '#FF1493', '#FFB300'];

  container.innerHTML = '';
  for (let i = 0; i < totalBulbs; i++) {
    const bulb = document.createElement('div');
    bulb.className = 'festoon-bulb';
    const color = bulbColors[i % bulbColors.length];
    bulb.style.setProperty('--bulb-color', color);
    bulb.style.animationDelay = `${(i % 6) * 0.22}s`;
    container.appendChild(bulb);
  }
}

// 2. Sound & Music Controls
function initSoundControls() {
  const musicToggleBtn = document.getElementById('toggleMusicBtn');
  const sfxToggleBtn = document.getElementById('toggleSfxBtn');

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      if (!window.diwaliAudio) return;
      window.diwaliAudio.toggleFestiveBgm();
    });
  }

  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      if (!window.diwaliAudio) return;
      const isMuted = window.diwaliAudio.toggleMute();
      sfxToggleBtn.classList.toggle('muted', isMuted);
      sfxToggleBtn.innerHTML = isMuted ? '<span>🔇</span> म्यूट' : '<span>🔊</span> ध्वनि';
    });
  }
}

// 3. Floating Bottom Cracker Dock (Always accessible, zero top clutter)
function initCrackerDock() {
  // Rocket button
  const rocketBtn = document.getElementById('launchRocketBtn');
  if (rocketBtn) {
    rocketBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        const x = window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6);
        const y = window.innerHeight * 0.15 + Math.random() * (window.innerHeight * 0.35);
        window.fireworks.launchRocket(x, y);
      }
    });
  }

  // 1. Sutli Bomb / Hydro Bomb (King of Diwali Explosions)
  const sutliBtn = document.getElementById('igniteSutliBombBtn');
  if (sutliBtn) {
    sutliBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        window.fireworks.igniteSutliBomb(window.innerWidth * 0.5, window.innerHeight * 0.58);
      }
    });
  }

  // 2. Murga Chhap Patakha (Iconic Red Paper Firecrackers)
  const murgaBtn = document.getElementById('igniteMurgaChhapBtn');
  if (murgaBtn) {
    murgaBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        window.fireworks.igniteMurgaChhap(window.innerWidth * 0.5, window.innerHeight * 0.60);
      }
    });
  }

  // 3. Bullet Bomb / Mirchi Bomb (Piercing Twin Blast)
  const bulletBtn = document.getElementById('igniteBulletBombBtn');
  if (bulletBtn) {
    bulletBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        window.fireworks.igniteBulletBomb(window.innerWidth * 0.5, window.innerHeight * 0.58);
      }
    });
  }

  // 4. 12-Shot Multi-color Sky Shot (Aerial Repeater Mortar)
  const skyShotBtn = document.getElementById('launchSkyShotBtn');
  if (skyShotBtn) {
    skyShotBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        window.fireworks.launchSkyShot();
      }
    });
  }

  // Anaar (Flowerpot Fountain)
  const anaarBtn = document.getElementById('igniteAnaarBtn');
  if (anaarBtn) {
    anaarBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        window.fireworks.igniteAnaar(window.innerWidth * 0.5, window.innerHeight * 0.72);
      }
    });
  }

  // Chakri (Ground Spinner)
  const chakriBtn = document.getElementById('igniteChakriBtn');
  if (chakriBtn) {
    chakriBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.setSparklerMode(false);
        window.fireworks.igniteChakri(window.innerWidth * 0.5, window.innerHeight * 0.65);
      }
    });
  }

  // Phuljhari (Sparkler cursor)
  const sparklerBtn = document.getElementById('toggleSparklerBtn');
  if (sparklerBtn) {
    sparklerBtn.addEventListener('click', () => {
      if (!window.fireworks) return;
      const willBeActive = !window.fireworks.sparklerActive;
      window.fireworks.setSparklerMode(willBeActive);
      sparklerBtn.classList.toggle('active', willBeActive);
      sparklerBtn.innerHTML = willBeActive
        ? '<span>✨</span> फुलझड़ी: चालू'
        : '<span>✨</span> फुलझड़ी';
    });
  }

  // Ladi (1000-Wala string)
  const ladiBtn = document.getElementById('igniteLadiBtn');
  if (ladiBtn) {
    ladiBtn.addEventListener('click', () => {
      if (window.fireworks) {
        window.fireworks.igniteLadi(window.innerWidth * 0.5, window.innerHeight * 0.22);
      }
    });
  }

  // Grand Auto Show
  const autoShowBtn = document.getElementById('toggleAutoShowBtn');
  if (autoShowBtn) {
    autoShowBtn.addEventListener('click', () => {
      if (!window.fireworks) return;
      const running = window.fireworks.toggleAutoShow();
      autoShowBtn.classList.toggle('active', running);
      autoShowBtn.innerHTML = running
        ? '<span>🎆</span> भव्य शो: ON'
        : '<span>🎆</span> भव्य शो';
    });
  }
}

// 4. Master Hub Tabs (Consolidating activities into smooth, compact tabbed panels)
function initHubTabs() {
  const tabButtons = document.querySelectorAll('.hub-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.festive-section');
      if (!container) return;

      const groupButtons = container.querySelectorAll('.hub-tab-btn');
      const groupPanes = container.querySelectorAll('.hub-tab-pane');

      groupButtons.forEach(b => b.classList.remove('active'));
      groupPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        target.classList.add('active');
        // Trigger resize events for canvases if inside (e.g. rangoli, photo frame, sky lanterns)
        window.dispatchEvent(new Event('resize'));
        if (window.diwaliAudio) window.diwaliAudio.playDiyaIgnite();
      }
    });
  });
}

// 5. Smooth Navigation & Mobile Menu
function initSmoothNav() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Mobile menu toggle
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('mainNavLinks');
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileNavToggle.classList.toggle('active');
    });

    links.forEach(l => {
      l.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileNavToggle.classList.remove('active');
      });
    });
  }
}

// 6. Celebration Modal Handler
function initModalHandlers() {
  const modal = document.getElementById('deepotsavBlessingModal');
  const closeBtn = document.getElementById('closeModalBtn');
  if (modal && closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
  }
}
