/**
 * Diwali Fireworks & Cracker Simulation Engine
 * High-performance HTML5 Canvas particle physics system with realistic light trails
 */

class FireworksEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.rockets = [];
    this.particles = [];
    this.activeFountains = [];
    this.activeChakris = [];
    this.shockwaves = [];
    this.sparklerActive = false;
    this.sparklerPos = { x: 0, y: 0 };
    this.autoShow = false;
    this.autoTimer = null;
    this.dpr = window.devicePixelRatio || 1;

    this.palette = [
      '#FFD700', // Gold
      '#FF4500', // Saffron / Orange-Red
      '#00FF88', // Emerald Green
      '#FF1493', // Deep Pink
      '#00E5FF', // Cyan / Sky Blue
      '#FFA500', // Marigold Amber
      '#E0B0FF', // Mauve / Lavender
      '#FFFFFF'  // Pure Silver Spark
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Click anywhere on non-interactive areas to launch fireworks
    window.addEventListener('pointerdown', (e) => {
      // Do not intercept clicks on buttons, links, inputs, docks, or interactive tools
      if (e.target && e.target.closest('button, a, input, textarea, select, .floating-cracker-dock, .aarti-player-card, #pujaCanvas, #rangoliCanvas, .quiz-option-btn, .modal-dialog, .diya-garden-card, .greeting-form, .copy-btn, .wa-btn, .interactive-tool-item, .aarti-stanza, .track-pill-btn, .btn-action')) {
        return;
      }
      const x = e.clientX;
      const y = e.clientY;

      if (this.sparklerActive) {
        this.sparklerPos = { x, y };
        this.emitSparkler(x, y, 16);
      } else {
        this.launchRocket(x, y);
      }
    }, { passive: true });

    // Sparkler moving shower
    window.addEventListener('pointermove', (e) => {
      if (this.sparklerActive) {
        this.sparklerPos = {
          x: e.clientX,
          y: e.clientY
        };
        this.emitSparkler(this.sparklerPos.x, this.sparklerPos.y, 4);
      }
    }, { passive: true });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setSparklerMode(enabled) {
    this.sparklerActive = enabled;
  }

  toggleAutoShow(state) {
    this.autoShow = (state !== undefined) ? state : !this.autoShow;
    if (this.autoShow) {
      this.triggerAutoShow();
    } else {
      if (this.autoTimer) clearTimeout(this.autoTimer);
    }
    return this.autoShow;
  }

  triggerAutoShow() {
    if (!this.autoShow) return;
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const targetX = this.width * 0.15 + Math.random() * (this.width * 0.7);
      const targetY = this.height * 0.1 + Math.random() * (this.height * 0.45);
      setTimeout(() => {
        this.launchRocket(targetX, targetY);
      }, i * 250);
    }
    const nextInterval = 800 + Math.random() * 1400;
    this.autoTimer = setTimeout(() => this.triggerAutoShow(), nextInterval);
  }

  launchRocket(targetX, targetY, customColor) {
    const startX = targetX + (Math.random() * 100 - 50);
    const startY = this.height + 10;
    const color = customColor || this.palette[Math.floor(Math.random() * this.palette.length)];

    const speed = 12 + Math.random() * 4;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    this.rockets.push({
      x: startX,
      y: startY,
      vx,
      vy,
      targetY,
      color,
      trail: [],
      life: 0
    });

    if (window.diwaliAudio) {
      window.diwaliAudio.playRocketLaunch();
    }
  }

  burst(x, y, color, particleCount = 75, isHeavy = false) {
    if (window.diwaliAudio) {
      window.diwaliAudio.playBurst(isHeavy);
    }

    const types = ['circle', 'ring', 'willow', 'sparkle'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    for (let i = 0; i < particleCount; i++) {
      let speed, angle, friction, gravity, life;
      angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.2 - 0.1);

      if (chosenType === 'ring') {
        speed = 4.5 + Math.random() * 0.8;
        friction = 0.95;
        gravity = 0.04;
        life = 60 + Math.random() * 25;
      } else if (chosenType === 'willow') {
        speed = 2.5 + Math.random() * 3.5;
        friction = 0.97;
        gravity = 0.08;
        life = 90 + Math.random() * 30;
      } else {
        speed = 1.5 + Math.random() * 6;
        friction = 0.94;
        gravity = 0.05;
        life = 50 + Math.random() * 30;
      }

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.2 ? color : '#FFFFFF',
        alpha: 1,
        maxLife: life,
        life,
        friction,
        gravity,
        size: 1.8 + Math.random() * 2.2,
        twinkle: Math.random() > 0.4
      });
    }

    // Flash illumination
    this.createSkyFlash(x, y, color);
  }

  createSkyFlash(x, y, color) {
    const flash = {
      x,
      y,
      color,
      radius: 120 + Math.random() * 100,
      alpha: 0.35
    };
    this.flashes = this.flashes || [];
    this.flashes.push(flash);
  }

  // 1. Sutli Bomb / Green Hydro Bomb (Blinding Flash + Heavy Screen Shake + Expanding Shockwave + Mushroom Smoke)
  igniteSutliBomb(groundX, groundY) {
    const x = groundX || (this.width * 0.5 + (Math.random() * 80 - 40));
    const y = groundY || (this.height * 0.58);

    // Phase 1: Burning fuse sizzle
    if (window.diwaliAudio) {
      window.diwaliAudio.playSutliBomb();
    }

    const fuseSteps = 12;
    for (let i = 0; i < fuseSteps; i++) {
      setTimeout(() => {
        this.emitSparkler(x, y - 10, 4);
      }, i * 50);
    }

    // Phase 2: Mega detonation after 650ms fuse burn
    setTimeout(() => {
      // Blinding full-screen gold-white flash
      this.createSkyFlash(x, y, '#FFFFFF');
      this.createSkyFlash(x, y, '#FFD700');

      // Expanding Shockwave distortion ring
      this.shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius: Math.min(this.width, this.height) * 0.45,
        alpha: 0.95,
        color: '#FFF2B2'
      });

      // 130 High-Velocity Fiery Sparks & Debris
      for (let i = 0; i < 130; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 14;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          color: Math.random() > 0.4 ? '#FFD700' : (Math.random() > 0.5 ? '#FF5722' : '#FFFFFF'),
          alpha: 1,
          maxLife: 45 + Math.random() * 30,
          life: 45 + Math.random() * 30,
          friction: 0.92,
          gravity: 0.18,
          size: 2.2 + Math.random() * 3,
          twinkle: true
        });
      }

      // 30 Expanding Billowy Smoke Puffs
      for (let s = 0; s < 30; s++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 4.5;
        this.particles.push({
          shape: 'smoke',
          x: x + (Math.random() * 20 - 10),
          y: y + (Math.random() * 20 - 10),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.8,
          color: 'rgba(210, 205, 225, 0.45)',
          alpha: 0.65,
          maxLife: 60 + Math.random() * 45,
          life: 60 + Math.random() * 45,
          friction: 0.94,
          gravity: -0.04, // Gently ascends like real smoke
          size: 14 + Math.random() * 18
        });
      }
    }, 650);
  }

  // 2. Murga Chhap Patakha (Iconic Red Firecrackers: 12 Rapid Snaps + Flying Red Paper Confetti + Smoke)
  igniteMurgaChhap(groundX, groundY) {
    const startX = groundX || (this.width * 0.5 + (Math.random() * 60 - 30));
    const startY = groundY || (this.height * 0.60);

    if (window.diwaliAudio) {
      window.diwaliAudio.playMurgaChhap();
    }

    const totalBursts = 12;
    for (let i = 0; i < totalBursts; i++) {
      setTimeout(() => {
        const curX = startX + (Math.random() * 50 - 25);
        const curY = startY + (Math.random() * 30 - 15);

        // Flash of light
        this.createSkyFlash(curX, curY, '#FF3300');

        // High-speed fiery sparks
        for (let s = 0; s < 22; s++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 8;
          this.particles.push({
            x: curX,
            y: curY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            color: Math.random() > 0.3 ? '#FFA000' : '#FFFFFF',
            alpha: 1,
            maxLife: 25 + Math.random() * 20,
            life: 25 + Math.random() * 20,
            friction: 0.92,
            gravity: 0.14,
            size: 1.8 + Math.random() * 2,
            twinkle: true
          });
        }

        // 10 Tumbling Red & Golden Murga Chhap Paper Wrappers
        const paperColors = ['#DC2626', '#EF4444', '#F59E0B', '#FEE2E2', '#B91C1C'];
        for (let p = 0; p < 10; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6.5;
          this.particles.push({
            shape: 'paper',
            x: curX,
            y: curY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.8,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.25,
            color: paperColors[Math.floor(Math.random() * paperColors.length)],
            alpha: 1,
            maxLife: 70 + Math.random() * 45,
            life: 70 + Math.random() * 45,
            friction: 0.95,
            gravity: 0.08,
            width: 7 + Math.random() * 6,
            height: 4 + Math.random() * 4
          });
        }

        // Puffs of white-grey smoke
        for (let sm = 0; sm < 4; sm++) {
          this.particles.push({
            shape: 'smoke',
            x: curX,
            y: curY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.2 - Math.random() * 1.5,
            color: 'rgba(230, 220, 240, 0.4)',
            alpha: 0.6,
            maxLife: 50 + Math.random() * 30,
            life: 50 + Math.random() * 30,
            friction: 0.96,
            gravity: -0.02,
            size: 10 + Math.random() * 12
          });
        }
      }, i * 75);
    }
  }

  // 3. Bullet Bomb / Mirchi Bomb (Piercing Twin Blast)
  igniteBulletBomb(groundX, groundY) {
    const x = groundX || (this.width * 0.5 + (Math.random() * 80 - 40));
    const y = groundY || (this.height * 0.58);

    if (window.diwaliAudio) {
      window.diwaliAudio.playBulletBomb();
    }

    // Initial sharp blast with green neon sparks
    this.burst(x, y, '#00FF66', 45, false);

    // Followed by louder secondary blast with crimson sparks & shockwave
    setTimeout(() => {
      this.createSkyFlash(x, y, '#FF1744');
      this.shockwaves.push({
        x,
        y,
        radius: 8,
        maxRadius: Math.min(this.width, this.height) * 0.35,
        alpha: 0.9,
        color: '#FF6B6B'
      });
      this.burst(x, y, '#FF3D00', 85, true);
    }, 140);
  }

  // 4. 12-Shot Multi-color Sky Shot (Sequential Aerial Mortars)
  launchSkyShot(startX, startY) {
    if (window.diwaliAudio) {
      window.diwaliAudio.playSkyShot();
    }

    const shotColors = ['#FFD700', '#00FF88', '#FF1493', '#00E5FF', '#FF5722'];
    const totalShots = 5;

    for (let s = 0; s < totalShots; s++) {
      setTimeout(() => {
        const targetX = this.width * 0.2 + (s / (totalShots - 1)) * (this.width * 0.6) + (Math.random() * 60 - 30);
        const targetY = this.height * 0.12 + Math.random() * (this.height * 0.25);
        this.launchRocket(targetX, targetY, shotColors[s % shotColors.length]);
      }, s * 850);
    }
  }

  // 5. Shahi Anaar (Flowerpot Roaring Golden Fountain)
  igniteAnaar(groundX, groundY) {
    if (window.diwaliAudio) {
      window.diwaliAudio.playAnaar();
    }

    const duration = 210; // ~3.5 sec
    this.activeFountains.push({
      x: groundX || (this.width * 0.5),
      y: groundY || (this.height * 0.72),
      framesLeft: duration,
      maxHeight: 340 + Math.random() * 140,
      color: '#FFD700'
    });
  }

  // 6. Ground Chakri (High-speed Whirring Ground Spinner)
  igniteChakri(groundX, groundY) {
    if (window.diwaliAudio) {
      window.diwaliAudio.playChakri();
    }

    this.activeChakris.push({
      x: groundX || (this.width * 0.5),
      y: groundY || (this.height * 0.65),
      angle: 0,
      speed: 0.45,
      framesLeft: 180,
      radius: 26
    });
  }

  // 7. Sparkler Cursor Shower
  emitSparkler(x, y, count = 5) {
    if (window.diwaliAudio && Math.random() > 0.6) {
      window.diwaliAudio.playSparkler(0.1);
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.5;
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 8 - 4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 0.5,
        color: Math.random() > 0.3 ? '#FFE57F' : '#FFFFFF',
        alpha: 1,
        maxLife: 25 + Math.random() * 15,
        life: 25 + Math.random() * 15,
        friction: 0.92,
        gravity: 0.08,
        size: 1.2 + Math.random() * 1.8,
        twinkle: true
      });
    }
  }

  // 8. 1000-Wala Ladi (Firecracker String)
  igniteLadi(startX, startY) {
    if (window.diwaliAudio) {
      window.diwaliAudio.playLadi();
    }

    const totalCrackers = 30;
    const x = startX || (this.width * 0.5);
    const y = startY || (this.height * 0.22);

    for (let i = 0; i < totalCrackers; i++) {
      setTimeout(() => {
        const curY = y + i * 14;
        this.burst(x + (Math.random() * 20 - 10), curY, '#FF3300', 18, i === totalCrackers - 1);
        // Emits flying red paper bits
        for (let p = 0; p < 4; p++) {
          this.particles.push({
            shape: 'paper',
            x: x + (Math.random() * 20 - 10),
            y: curY,
            vx: (Math.random() - 0.5) * 4,
            vy: -2 + Math.random() * 2,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.3,
            color: '#DC2626',
            alpha: 1,
            maxLife: 50 + Math.random() * 30,
            life: 50 + Math.random() * 30,
            friction: 0.95,
            gravity: 0.08,
            width: 6,
            height: 4
          });
        }
      }, i * 85);
    }
  }

  animate() {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();

    // 1. Render Sky Flashes
    if (this.flashes && this.flashes.length > 0) {
      for (let i = this.flashes.length - 1; i >= 0; i--) {
        const f = this.flashes[i];
        const grad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        grad.addColorStop(0, f.color);
        grad.addColorStop(1, 'transparent');

        this.ctx.globalAlpha = f.alpha;
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        this.ctx.fill();

        f.alpha -= 0.05;
        if (f.alpha <= 0) {
          this.flashes.splice(i, 1);
        }
      }
      this.ctx.globalAlpha = 1;
    }

    // 1B. Render Expanding Bomb Shockwaves
    if (this.shockwaves && this.shockwaves.length > 0) {
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, sw.alpha);
        this.ctx.strokeStyle = sw.color || '#FFF2B2';
        this.ctx.lineWidth = Math.max(1.5, 6 * (1 - sw.radius / sw.maxRadius));
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 4;
        sw.alpha -= 0.045;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
    }

    // 2. Update & Draw Rockets
    this.ctx.lineWidth = 2;
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();

      // Draw smoke / spark trail
      this.ctx.strokeStyle = r.color;
      this.ctx.beginPath();
      for (let t = 0; t < r.trail.length; t++) {
        const pt = r.trail[t];
        if (t === 0) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      }
      this.ctx.stroke();

      // Rocket head
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Emit trailing sparks
      if (Math.random() > 0.4) {
        this.particles.push({
          x: r.x,
          y: r.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 2 + 1,
          color: '#FFA500',
          alpha: 0.8,
          maxLife: 15,
          life: 15,
          friction: 0.95,
          gravity: 0.05,
          size: 1.5
        });
      }

      r.x += r.vx;
      r.y += r.vy;
      r.life++;

      // Check if reached apex or target
      if (r.y <= r.targetY || r.vy >= 0 || r.life > 90) {
        this.burst(r.x, r.y, r.color, 85, true);
        this.rockets.splice(i, 1);
      }
    }

    // 3. Update & Draw Active Fountains (Anaar)
    for (let i = this.activeFountains.length - 1; i >= 0; i--) {
      const f = this.activeFountains[i];
      const intensity = Math.sin((1 - f.framesLeft / 180) * Math.PI); // Smooth rise & fall
      const sparkCount = Math.floor(6 + intensity * 12);

      for (let s = 0; s < sparkCount; s++) {
        const spreadAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.75;
        const speed = (4 + Math.random() * 8) * (0.3 + intensity * 0.8);
        this.particles.push({
          x: f.x + (Math.random() * 12 - 6),
          y: f.y,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          color: Math.random() > 0.3 ? '#FFD700' : (Math.random() > 0.5 ? '#FF4500' : '#FFFFFF'),
          alpha: 1,
          maxLife: 35 + Math.random() * 25,
          life: 35 + Math.random() * 25,
          friction: 0.93,
          gravity: 0.16,
          size: 1.5 + Math.random() * 2,
          twinkle: true
        });
      }

      f.framesLeft--;
      if (f.framesLeft <= 0) {
        this.activeFountains.splice(i, 1);
      }
    }

    // 4. Update & Draw Ground Chakris
    for (let i = this.activeChakris.length - 1; i >= 0; i--) {
      const c = this.activeChakris[i];
      c.angle += c.speed;

      for (let arm = 0; arm < 3; arm++) {
        const armAngle = c.angle + (arm * (Math.PI * 2 / 3));
        const px = c.x + Math.cos(armAngle) * c.radius;
        const py = c.y + Math.sin(armAngle) * (c.radius * 0.4); // slight perspective

        // Tangential sparks
        const tangent = armAngle + Math.PI / 2;
        const sparkSpeed = 3.5 + Math.random() * 4;
        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(tangent) * sparkSpeed + (Math.random() - 0.5),
          vy: Math.sin(tangent) * (sparkSpeed * 0.5) + (Math.random() - 0.5),
          color: '#FFB300',
          alpha: 1,
          maxLife: 20 + Math.random() * 15,
          life: 20 + Math.random() * 15,
          friction: 0.94,
          gravity: 0.05,
          size: 1.8,
          twinkle: true
        });
      }

      // Draw Chakri Core disc
      this.ctx.fillStyle = '#FFE082';
      this.ctx.beginPath();
      this.ctx.ellipse(c.x, c.y, 8, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();

      c.framesLeft--;
      if (c.framesLeft <= 0) {
        this.activeChakris.splice(i, 1);
      }
    }

    // 5. Update & Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.twinkle && Math.random() > 0.4) {
        this.ctx.globalAlpha = p.alpha * (0.6 + Math.random() * 0.4);
      } else {
        this.ctx.globalAlpha = p.alpha;
      }

      if (p.shape === 'paper') {
        p.rot = (p.rot || 0) + (p.vRot || 0.1);
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        this.ctx.restore();
      } else if (p.shape === 'smoke') {
        p.size += 0.3;
        const sGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        sGrad.addColorStop(0, p.color);
        sGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = sGrad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (p.life <= 0 || p.alpha <= 0.01) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Draw Sparkler Wand if Active
    if (this.sparklerActive) {
      const sp = this.sparklerPos;
      this.ctx.globalAlpha = 0.9;
      this.ctx.strokeStyle = '#B0BEC5';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(sp.x + 30, sp.y + 40);
      this.ctx.lineTo(sp.x, sp.y);
      this.ctx.stroke();

      // Glowing tip
      const glow = this.ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 16);
      glow.addColorStop(0, '#FFFFFF');
      glow.addColorStop(0.4, '#FFD700');
      glow.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, 16, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
    requestAnimationFrame(this.animate);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.fireworks = new FireworksEngine('fireworksCanvas');
});

