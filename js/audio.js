/**
 * Deepavali Audio Engine - Web Audio API Synthesizer
 * 100% Offline, Zero external asset lag, Rich festive acoustic synthesis
 */

class DiwaliAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientRunning = false;
    this.ambientNodes = [];
    this.ambientGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.melodyTimer = null;
    this.bgmAudio = null;
    this.userExplicitlyPausedBgm = false;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.warn('Web Audio API not supported on this browser.');
      return;
    }
    this.ctx = new AudioCtx();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // SFX Gain
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // Ambient Gain
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      const v = Math.max(0, Math.min(1, val));
      this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  // 1. Temple Bell (Ghanti)
  playTempleBell() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const partials = [
      { f: 1100, gain: 0.6, decay: 2.5 },
      { f: 2200, gain: 0.35, decay: 1.8 },
      { f: 3350, gain: 0.2, decay: 1.2 },
      { f: 4400, gain: 0.1, decay: 0.8 },
      { f: 5600, gain: 0.05, decay: 0.4 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);

      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + p.decay);
    });
  }

  // 2. Holy Shankh (Conch) Drone
  playShankh() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 3.5;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Pitch sweep mimicking conch airflow
    osc1.frequency.setValueAtTime(210, now);
    osc1.frequency.linearRampToValueAtTime(265, now + 0.6);
    osc1.frequency.linearRampToValueAtTime(260, now + duration - 0.8);
    osc1.frequency.linearRampToValueAtTime(180, now + duration);

    osc2.frequency.setValueAtTime(212, now);
    osc2.frequency.linearRampToValueAtTime(267, now + 0.6);
    osc2.frequency.linearRampToValueAtTime(262, now + duration - 0.8);
    osc2.frequency.linearRampToValueAtTime(182, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1600, now + 0.8);
    filter.frequency.linearRampToValueAtTime(600, now + duration);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.5);
    gain.gain.setValueAtTime(0.6, now + duration - 0.7);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // 3. Diya Ignition (Whoosh + Soft Magic Chime)
  playDiyaIgnite() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Magic flame chime
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.5);
    });
  }

  // 4. Firework Rocket Launch Whistle (Realistic High-velocity Whoosh)
  playRocketLaunch() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 0.85;

    // Layer 1: High whistling siren oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.85);
    osc.frequency.linearRampToValueAtTime(1200, now + duration);

    oscGain.gain.setValueAtTime(0.04, now);
    oscGain.gain.linearRampToValueAtTime(0.35, now + duration * 0.6);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration);

    // Layer 2: White noise whoosh
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + duration);
    filter.Q.value = 3;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.02, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + duration * 0.7);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  // 5. Firework Burst / Explosion (Heavy Transient + Sub-bass Boom + Sizzles)
  playBurst(isHeavy = false) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = isHeavy ? 1.4 : 0.85;

    // Transient Snap (Sharp explosive spike)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(isHeavy ? 350 : 650, now);
    snapOsc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    snapGain.gain.setValueAtTime(isHeavy ? 1.0 : 0.7, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.15);

    // Sub-Bass Boom (Visceral punch)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(isHeavy ? 140 : 180, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
    subGain.gain.setValueAtTime(isHeavy ? 0.95 : 0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.6 : 0.4));
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + (isHeavy ? 0.6 : 0.4));

    // Low-Pass Filtered Noise Body & Rumble
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.05 * white) / 1.05;
      lastOut = data[i];
      data[i] *= 2.8;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isHeavy ? 800 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 1.1 : 0.75, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);

    // Crackle sprinkles after burst
    setTimeout(() => this.playSparkler(isHeavy ? 0.45 : 0.25), isHeavy ? 200 : 150);

    // Haptic feedback
    if (navigator.vibrate) {
      try { navigator.vibrate(isHeavy ? [60, 40, 100] : 40); } catch(e) {}
    }
  }

  // 5A. Sutli Bomb / Hydro Bomb (King of Diwali Explosions: Fuse Sizzle + Blinding Screen Shake + Ultra Sub-Bass)
  playSutliBomb() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Phase 1: Fuse hissing & sparkling for 0.7s
    const fuseTime = 0.65;
    for (let i = 0; i < 14; i++) {
      const sparkTime = now + (i * (fuseTime / 14));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400 + Math.random() * 2000, sparkTime);
      gain.gain.setValueAtTime(0.12, sparkTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sparkTime + 0.03);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(sparkTime);
      osc.stop(sparkTime + 0.03);
    }

    // Phase 2: Mega Blast at (now + fuseTime)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const blastTime = this.ctx.currentTime;

      // Earth-shaking sub-bass oscillator
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(220, blastTime);
      sub.frequency.exponentialRampToValueAtTime(32, blastTime + 0.6);
      subGain.gain.setValueAtTime(1.4, blastTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.2);
      sub.connect(subGain);
      subGain.connect(this.sfxGain);
      sub.start(blastTime);
      sub.stop(blastTime + 1.2);

      // Sharp explosive tear / crack transient
      const crack = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crack.type = 'sawtooth';
      crack.frequency.setValueAtTime(1200, blastTime);
      crack.frequency.exponentialRampToValueAtTime(50, blastTime + 0.18);
      crackGain.gain.setValueAtTime(1.2, blastTime);
      crackGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 0.2);
      crack.connect(crackGain);
      crackGain.connect(this.sfxGain);
      crack.start(blastTime);
      crack.stop(blastTime + 0.2);

      // Heavy 2.2-second explosion rumble
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.08 * white) / 1.08;
        lastOut = data[i];
        data[i] *= 3.8;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, blastTime);
      filter.frequency.exponentialRampToValueAtTime(50, blastTime + 2.0);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(1.5, blastTime);
      gain.gain.exponentialRampToValueAtTime(0.001, blastTime + 2.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(blastTime);

      // Screen shake & heavy haptic feedback
      this.triggerScreenShake();
      if (navigator.vibrate) {
        try { navigator.vibrate([100, 40, 200, 50, 150]); } catch(e) {}
      }
    }, fuseTime * 1000);
  }

  // 5B. Murga Chhap Patakha (Iconic Indian Red Paper Firecracker: Rapid Machine-gun Cracks & Paper Scattering)
  playMurgaChhap() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const delay = i * 75 + (Math.random() * 25);
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Snappy crack
        const snap = this.ctx.createOscillator();
        const snapGain = this.ctx.createGain();
        snap.type = 'triangle';
        snap.frequency.setValueAtTime(1100 + Math.random() * 800, now);
        snap.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        snapGain.gain.setValueAtTime(0.85, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        snap.connect(snapGain);
        snapGain.connect(this.sfxGain);
        snap.start(now);
        snap.stop(now + 0.09);

        // Mini boom punch
        const punch = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punch.type = 'sine';
        punch.frequency.setValueAtTime(260, now);
        punch.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        punchGain.gain.setValueAtTime(0.65, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        punch.connect(punchGain);
        punchGain.connect(this.sfxGain);
        punch.start(now);
        punch.stop(now + 0.14);

        if (navigator.vibrate && i % 3 === 0) {
          try { navigator.vibrate(35); } catch(e) {}
        }
      }, delay);
    }
  }

  // 5C. Bullet Bomb / Mirchi Bomb (Piercing Twin Blast)
  playBulletBomb() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // First sharp crack
    this.playBurst(false);
    // Followed by louder secondary blast
    setTimeout(() => {
      this.playBurst(true);
      this.triggerScreenShake();
    }, 140);
  }

  // 5D. 12-Shot Sky Shot (Sequential Aerial Mortars)
  playSkyShot() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const shots = 5;
    for (let s = 0; s < shots; s++) {
      setTimeout(() => {
        this.playRocketLaunch();
        setTimeout(() => {
          this.playBurst(true);
          this.playSparkler(0.6);
        }, 750);
      }, s * 850);
    }
  }

  // Helper: Trigger visual screen shake & flash on page
  triggerScreenShake() {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('screen-shake');
    void document.body.offsetWidth;
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 450);

    const flash = document.getElementById('bombFlashOverlay');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 180);
    }
  }

  // 6. Sparkler (Phuljhari) & Cracker Crackle
  playSparkler(duration = 0.3) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const count = Math.floor(duration * 24);

    for (let i = 0; i < count; i++) {
      const clickTime = now + (Math.random() * duration);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + Math.random() * 3800, clickTime);

      gain.gain.setValueAtTime(0.12 + Math.random() * 0.1, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.025);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.025);
    }
  }

  // 7. Ground Chakri (High-speed Whirring Spinner + Sizzling Embers)
  playChakri() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 2.8;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.6);
    osc.frequency.linearRampToValueAtTime(520, now + 2.0);
    osc.frequency.linearRampToValueAtTime(90, now + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.value = 6;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.4);
    gain.gain.setValueAtTime(0.38, now + 2.0);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration);

    // Continuous sparkles along chakri
    const interval = setInterval(() => {
      if (this.ctx && !this.isMuted) this.playSparkler(0.15);
    }, 140);
    setTimeout(() => clearInterval(interval), duration * 1000);
  }

  // 7A. Shahi Anaar (Roaring Volcanic Fountain)
  playAnaar() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 3.5;

    // Volcanic roaring noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(2200, now + 1.2);
    filter.frequency.linearRampToValueAtTime(700, now + duration);
    filter.Q.value = 2.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.8);
    gain.gain.setValueAtTime(0.45, now + 2.5);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);

    // Sizzling sparks
    const interval = setInterval(() => {
      if (this.ctx && !this.isMuted) this.playSparkler(0.2);
    }, 150);
    setTimeout(() => clearInterval(interval), duration * 1000);
  }

  // 7B. Patakho ki Ladi (1000-Wala Grand Chain Cracker)
  playLadi() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const totalCrackers = 30;
    for (let i = 0; i < totalCrackers; i++) {
      const delay = i * 85;
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        this.playBurst(i === totalCrackers - 1);
        this.playSparkler(0.12);
      }, delay);
    }
  }

  // 8. Flower Shower Chime (Aarti & Puja)
  playFlowerShower() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Pentatonic Raga Bhupali notes (Sa, Re, Ga, Pa, Dha)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    for (let i = 0; i < 4; i++) {
      const note = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now + i * 0.08);

      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.6);
    }
  }

  // 9. Sweet Pack Chime (Mithai Box)
  playSweetPack() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // 10. Ambient Indian Tanpura & Bansuri Melody Generator
  startAmbientMusic() {
    this.ensureContext();
    if (this.ambientRunning || !this.ctx) return;
    this.ambientRunning = true;

    // Tanpura Drone in C (Sa = 130.81Hz, Pa = 196.00Hz)
    const baseFreqs = [130.81, 196.00, 261.63];
    this.ambientNodes = [];

    baseFreqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      // Subtle LFO for breathing drone effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + Math.random() * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();

      this.ambientNodes.push(osc, lfo);
    });

    // Festive Diwali Sitar & Shehnai Melodic Generator in Raga Bhupali (C, D, E, G, A)
    const festivePhrases = [
      [261.63, 329.63, 392.00],        // Sa - Ga - Pa
      [329.63, 392.00, 440.00, 523.25],// Ga - Pa - Dha - Sa'
      [523.25, 440.00, 392.00, 329.63],// Sa' - Dha - Pa - Ga
      [293.66, 329.63, 293.66, 261.63],// Re - Ga - Re - Sa
      [392.00, 523.25, 659.25]         // Pa - Sa' - Ga'
    ];
    let phraseIdx = 0;

    const playMelodicPhrase = () => {
      if (!this.ambientRunning || !this.ctx || this.isMuted) {
        this.melodyTimer = setTimeout(playMelodicPhrase, 2000);
        return;
      }

      const phrase = festivePhrases[phraseIdx % festivePhrases.length];
      phraseIdx++;

      phrase.forEach((note, step) => {
        const stepTime = this.ctx.currentTime + step * 0.32;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Sitar / Shehnai warmth: triangle with resonant band
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, stepTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, stepTime);

        gain.gain.setValueAtTime(0.001, stepTime);
        gain.gain.linearRampToValueAtTime(0.12, stepTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(stepTime);
        osc.stop(stepTime + 1.2);
      });

      // Occasional temple bell overtone
      if (Math.random() > 0.5) {
        setTimeout(() => this.playTempleBell(), 800);
      }

      const nextDelay = 1800 + Math.random() * 2000;
      this.melodyTimer = setTimeout(playMelodicPhrase, nextDelay);
    };

    this.melodyTimer = setTimeout(playMelodicPhrase, 800);
  }

  stopAmbientMusic() {
    this.ambientRunning = false;
    if (this.melodyTimer) clearTimeout(this.melodyTimer);
    this.ambientNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.ambientNodes = [];
    this.pauseFestiveBgm(true);
  }

  // 11. Authentic Festive Shehnai & Sitar Background Music Engine
  playFestiveBgm() {
    if (!this.bgmAudio) {
      this.bgmAudio = document.getElementById('audioFestiveBgm');
    }
    if (this.bgmAudio && !this.isMuted) {
      this.bgmAudio.volume = 0.5;
      const promise = this.bgmAudio.play();
      if (promise !== undefined) {
        promise.then(() => {
          this.ambientRunning = true;
          this.userExplicitlyPausedBgm = false;
          this.updateBgmUi(true);
        }).catch(() => {
          // Awaiting user gesture
        });
      }
    }
  }

  pauseFestiveBgm(userExplicit = false) {
    if (!this.bgmAudio) {
      this.bgmAudio = document.getElementById('audioFestiveBgm');
    }
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.ambientRunning = false;
      if (userExplicit) {
        this.userExplicitlyPausedBgm = true;
      }
      this.updateBgmUi(false);
    }
  }

  resumeFestiveBgm() {
    if (!this.userExplicitlyPausedBgm) {
      this.playFestiveBgm();
    }
  }

  toggleFestiveBgm() {
    if (!this.bgmAudio) {
      this.bgmAudio = document.getElementById('audioFestiveBgm');
    }
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.pauseFestiveBgm(true);
      return false;
    } else {
      this.playFestiveBgm();
      return true;
    }
  }

  updateBgmUi(isPlaying) {
    const musicToggleBtn = document.getElementById('toggleMusicBtn');
    if (musicToggleBtn) {
      if (isPlaying) {
        musicToggleBtn.classList.add('active');
        musicToggleBtn.innerHTML = '<span>🎵</span> संगीत';
        musicToggleBtn.setAttribute('title', 'उत्सव संगीत रोकें');
      } else {
        musicToggleBtn.classList.remove('active');
        musicToggleBtn.innerHTML = '<span>🔇</span> संगीत';
        musicToggleBtn.setAttribute('title', 'उत्सव संगीत चालू करें');
      }
    }
  }
}

// Global instance
window.diwaliAudio = new DiwaliAudioEngine();

// Auto-unlock Web Audio context on first mobile/desktop user gesture
if (typeof window !== 'undefined') {
  const unlockAudioContext = () => {
    if (window.diwaliAudio) {
      window.diwaliAudio.ensureContext();
    }
    ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(ev => {
      window.removeEventListener(ev, unlockAudioContext);
    });
  };
  ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(ev => {
    window.addEventListener(ev, unlockAudioContext, { passive: true, once: true });
  });
}

