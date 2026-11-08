/**
 * Virtual Lakshmi-Ganesh Puja & Royal Aarti Player Engine
 * Native Devotional Audio Controls, Disc Spin, Equalizer & Karaoke-Style Lyric Highlighting
 */

class DiwaliPujaMandir {
  constructor() {
    this.isAartiActive = false;
    this.isPlayingMusic = false;
    this.petals = [];
    this.canvas = document.getElementById('pujaCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    this.currentTrack = 'lakshmi';
    this.currentTimeSec = 0;
    this.currentVerseIdx = 0;

    this.tracks = {
      lakshmi: {
        title: 'श्री महालक्ष्मी जी की आरती (ॐ जय लक्ष्मी माता)',
        singer: 'भक्तिमय स्वर • अलका याग्निक',
        audioId: 'audioLakshmiAarti',
        pane: 'lakshmiAartiPane',
        icon: '🪷',
        duration: 332
      },
      ganesh: {
        title: 'भगवान श्री गणेश जी की आरती (जय गणेश देवा)',
        singer: 'भक्तिमय स्वर • अनुराधा पौडवाल',
        audioId: 'audioGaneshAarti',
        pane: 'ganeshAartiPane',
        icon: '🐘',
        duration: 183
      }
    };

    this.audioLakshmi = null;
    this.audioGanesh = null;

    this.init();
  }

  init() {
    this.audioLakshmi = document.getElementById('audioLakshmiAarti');
    this.audioGanesh = document.getElementById('audioGaneshAarti');

    this.setupAudioListeners();
    this.setupCanvas();
    this.bindEvents();
    this.bindPlayerControls();
    this.initLyricsSynchronizer();
    this.updateTimeDisplay(0, this.tracks.lakshmi.duration);

    this.animatePetals = this.animatePetals.bind(this);
    requestAnimationFrame(this.animatePetals);
  }

  getActiveAudio() {
    return this.currentTrack === 'lakshmi' ? this.audioLakshmi : this.audioGanesh;
  }

  setupAudioListeners() {
    const bindAudio = (audio, trackKey) => {
      if (!audio) return;

      audio.addEventListener('timeupdate', () => {
        if (this.currentTrack !== trackKey) return;
        this.currentTimeSec = Math.floor(audio.currentTime);
        const duration = audio.duration && !isNaN(audio.duration) ? audio.duration : this.tracks[trackKey].duration;
        this.updateTimeDisplay(this.currentTimeSec, duration);
        this.syncVerseWithTime(this.currentTimeSec);
      });

      audio.addEventListener('waiting', () => {
        if (this.currentTrack !== trackKey) return;
        const playBtnText = document.getElementById('aartiPlayBtnText');
        if (playBtnText && this.isPlayingMusic) {
          playBtnText.textContent = 'लोड हो रहा है...';
        }
      });

      audio.addEventListener('playing', () => {
        if (this.currentTrack !== trackKey) return;
        const playBtnIcon = document.getElementById('aartiPlayBtnIcon');
        const playBtnText = document.getElementById('aartiPlayBtnText');
        const disc = document.getElementById('chakraDisc');
        const eq = document.getElementById('playerEqualizer');
        if (playBtnIcon) playBtnIcon.textContent = '⏸';
        if (playBtnText) playBtnText.textContent = 'आरती रोकें';
        if (disc) disc.classList.add('spinning');
        if (eq) eq.classList.add('playing');
        this.isPlayingMusic = true;
      });

      audio.addEventListener('ended', () => {
        if (this.currentTrack !== trackKey) return;
        this.toggleMusicPlayback(false);
        this.currentTimeSec = 0;
        const duration = this.tracks[trackKey].duration;
        this.updateTimeDisplay(0, duration);
        const activePane = document.getElementById(this.tracks[trackKey].pane);
        if (activePane) this.resetLyricsHighlight(activePane);

        // Resume ambient festive music if available
        if (window.diwaliAudio && typeof window.diwaliAudio.resumeFestiveBgm === 'function') {
          window.diwaliAudio.resumeFestiveBgm();
        }
      });
    };

    bindAudio(this.audioLakshmi, 'lakshmi');
    bindAudio(this.audioGanesh, 'ganesh');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  bindEvents() {
    // 1. Ring Bell
    const bellBtn = document.getElementById('ringBellBtn');
    const bellIcon = document.getElementById('mandirBell');
    if (bellBtn) {
      bellBtn.addEventListener('click', () => {
        if (window.diwaliAudio) window.diwaliAudio.playTempleBell();
        if (bellIcon) {
          bellIcon.classList.remove('swing');
          void bellIcon.offsetWidth;
          bellIcon.classList.add('swing');
        }
      });
    }

    // 2. Shankh Naad
    const shankhBtn = document.getElementById('blowShankhBtn');
    const shankhIcon = document.getElementById('mandirShankh');
    if (shankhBtn) {
      shankhBtn.addEventListener('click', () => {
        if (window.diwaliAudio) window.diwaliAudio.playShankh();
        if (shankhIcon) {
          shankhIcon.classList.remove('vibrate');
          void shankhIcon.offsetWidth;
          shankhIcon.classList.add('vibrate');
        }
      });
    }

    // 3. Flower Offering (Pushparpan)
    const flowerBtn = document.getElementById('offerFlowersBtn');
    if (flowerBtn) {
      flowerBtn.addEventListener('click', () => {
        this.showerFlowers();
        if (window.diwaliAudio) window.diwaliAudio.playFlowerShower();
      });
    }

    // 4. Aarti Thali Rotation
    const aartiBtn = document.getElementById('performAartiBtn');
    const thaliElem = document.getElementById('aartiThali');
    if (aartiBtn && thaliElem) {
      aartiBtn.addEventListener('click', () => {
        this.isAartiActive = !this.isAartiActive;
        if (this.isAartiActive) {
          thaliElem.classList.add('orbiting');
          aartiBtn.innerHTML = '<span>🪔</span> आरती संपन्न करें';
          if (window.diwaliAudio) window.diwaliAudio.playTempleBell();
          if (!this.isPlayingMusic) {
            this.toggleMusicPlayback(true);
          }
        } else {
          thaliElem.classList.remove('orbiting');
          aartiBtn.innerHTML = '<span>🪔</span> थाली घुमाएं';
        }
      });
    }
  }

  bindPlayerControls() {
    const playBtn = document.getElementById('mainAartiPlayBtn');
    const trackPills = document.querySelectorAll('.track-pill-btn');
    const progressTrack = document.getElementById('aartiProgressTrack');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.toggleMusicPlayback();
      });
    }

    trackPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const trackKey = pill.dataset.track;
        if (this.currentTrack === trackKey) return;

        trackPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        this.switchTrack(trackKey);
      });
    });

    if (progressTrack) {
      progressTrack.addEventListener('click', (e) => {
        const audio = this.getActiveAudio();
        const rect = progressTrack.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const duration = audio && audio.duration && !isNaN(audio.duration) ? audio.duration : this.tracks[this.currentTrack].duration;
        const targetTime = clickRatio * duration;

        if (audio) {
          audio.currentTime = targetTime;
        }
        this.currentTimeSec = Math.floor(targetTime);
        this.updateTimeDisplay(this.currentTimeSec, duration);
        this.syncVerseWithTime(this.currentTimeSec);
      });
    }
  }

  toggleMusicPlayback(forceState) {
    this.isPlayingMusic = (forceState !== undefined) ? forceState : !this.isPlayingMusic;

    const playBtnIcon = document.getElementById('aartiPlayBtnIcon');
    const playBtnText = document.getElementById('aartiPlayBtnText');
    const disc = document.getElementById('chakraDisc');
    const eq = document.getElementById('playerEqualizer');
    const audio = this.getActiveAudio();

    if (this.isPlayingMusic) {
      if (playBtnIcon) playBtnIcon.textContent = '⏸';
      if (playBtnText) playBtnText.textContent = 'आरती रोकें';
      if (disc) disc.classList.add('spinning');
      if (eq) eq.classList.add('playing');

      // Pause the opposite track immediately
      const otherAudio = (this.currentTrack === 'lakshmi') ? this.audioGanesh : this.audioLakshmi;
      if (otherAudio) {
        otherAudio.pause();
      }

      if (window.diwaliAudio) {
        window.diwaliAudio.playTempleBell();
        // Pause background festive music so devotional Aarti is crystal clear
        if (typeof window.diwaliAudio.pauseFestiveBgm === 'function') {
          window.diwaliAudio.pauseFestiveBgm(false);
        }
      }

      if (audio) {
        audio.volume = 1.0;
        audio.muted = false;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Audio playback error:', err);
            this.isPlayingMusic = false;
            if (playBtnIcon) playBtnIcon.textContent = '▶';
            if (playBtnText) playBtnText.textContent = 'आरती प्रारंभ करें';
            if (disc) disc.classList.remove('spinning');
            if (eq) eq.classList.remove('playing');
          });
        }
      }
    } else {
      if (playBtnIcon) playBtnIcon.textContent = '▶';
      if (playBtnText) playBtnText.textContent = 'आरती प्रारंभ करें';
      if (disc) disc.classList.remove('spinning');
      if (eq) eq.classList.remove('playing');

      if (audio) {
        audio.pause();
      }

      // Resume background music if requested
      if (window.diwaliAudio && typeof window.diwaliAudio.resumeFestiveBgm === 'function') {
        window.diwaliAudio.resumeFestiveBgm();
      }
    }
  }

  switchTrack(trackKey) {
    const track = this.tracks[trackKey];
    if (!track) return;

    // Pause current audio
    const prevAudio = this.getActiveAudio();
    if (prevAudio) {
      prevAudio.pause();
      prevAudio.currentTime = 0;
    }

    const wasPlaying = this.isPlayingMusic;

    this.currentTrack = trackKey;
    this.currentTimeSec = 0;

    // Update Player UI
    const titleElem = document.getElementById('playerTrackTitle');
    const singerElem = document.getElementById('playerTrackSinger');
    const disc = document.getElementById('chakraDisc');
    const totalTimeElem = document.getElementById('aartiTotalTime');

    if (titleElem) titleElem.textContent = track.title;
    if (singerElem) singerElem.textContent = track.singer;
    if (disc) disc.textContent = track.icon;
    if (totalTimeElem) totalTimeElem.textContent = this.formatTime(track.duration);

    // Switch Lyrics Pane
    document.querySelectorAll('.aarti-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById(track.pane);
    if (pane) {
      pane.classList.add('active');
      this.resetLyricsHighlight(pane);
    }

    this.updateTimeDisplay(0, track.duration);

    if (wasPlaying) {
      this.toggleMusicPlayback(true);
    }
  }

  updateTimeDisplay(currentSec, totalSec) {
    const curElem = document.getElementById('aartiCurrentTime');
    const totalElem = document.getElementById('aartiTotalTime');
    const fillElem = document.getElementById('aartiProgressFill');

    if (curElem) curElem.textContent = this.formatTime(currentSec);
    if (totalElem && totalSec) totalElem.textContent = this.formatTime(totalSec);
    if (fillElem && totalSec > 0) {
      const pct = Math.min(100, Math.max(0, (currentSec / totalSec) * 100));
      fillElem.style.width = `${pct}%`;
    }
  }

  formatTime(totalSec) {
    const sec = Math.floor(totalSec || 0);
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  initLyricsSynchronizer() {
    const stanzas = document.querySelectorAll('.aarti-stanza');
    stanzas.forEach((stanza) => {
      stanza.addEventListener('click', () => {
        const parent = stanza.parentElement;
        const paneStanzas = Array.from(parent.querySelectorAll('.aarti-stanza'));
        paneStanzas.forEach(s => s.classList.remove('active-verse'));
        stanza.classList.add('active-verse');
        this.currentVerseIdx = paneStanzas.indexOf(stanza);

        // Jump audio time
        const timeSec = parseInt(stanza.dataset.time || '0', 10);
        const audio = this.getActiveAudio();
        if (audio) {
          audio.currentTime = timeSec;
        }
        this.currentTimeSec = timeSec;
        const duration = this.tracks[this.currentTrack].duration;
        this.updateTimeDisplay(timeSec, duration);

        if (!this.isPlayingMusic) {
          this.toggleMusicPlayback(true);
        }

        if (window.diwaliAudio) window.diwaliAudio.playDiyaIgnite();
      });
    });
  }

  syncVerseWithTime(seconds) {
    const activePane = document.querySelector('.aarti-pane.active');
    if (!activePane) return;

    const stanzas = Array.from(activePane.querySelectorAll('.aarti-stanza'));
    if (stanzas.length === 0) return;

    // Find the matching stanza based on time
    let matchIdx = 0;
    for (let i = 0; i < stanzas.length; i++) {
      const sTime = parseInt(stanzas[i].dataset.time || '0', 10);
      if (seconds >= sTime) {
        matchIdx = i;
      } else {
        break;
      }
    }

    if (matchIdx !== this.currentVerseIdx) {
      this.currentVerseIdx = matchIdx;
      stanzas.forEach((s, idx) => s.classList.toggle('active-verse', idx === matchIdx));
      
      // Keep scroll strictly inside lyrics container without jumping main window
      const targetVerse = stanzas[matchIdx];
      const scrollParent = targetVerse.closest('.lyrics-sync-wrapper') || targetVerse.parentElement;
      if (scrollParent) {
        const targetTop = targetVerse.offsetTop - scrollParent.offsetTop - 15;
        scrollParent.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }
    }
  }

  resetLyricsHighlight(container) {
    this.currentVerseIdx = 0;
    const stanzas = container.querySelectorAll('.aarti-stanza');
    stanzas.forEach((s, idx) => {
      s.classList.toggle('active-verse', idx === 0);
    });
  }

  showerFlowers() {
    if (!this.canvas) return;
    const colors = ['#FF9800', '#FFC107', '#E91E63', '#FFFFFF', '#FF5722'];
    const w = this.canvas.width;
    const count = 35;

    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * w,
        y: -10 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        life: 180
      });
    }
  }

  animatePetals() {
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.petals.length - 1; i >= 0; i--) {
        const p = this.petals[i];
        p.x += p.vx + Math.sin(p.y * 0.04) * 0.8;
        p.y += p.vy;
        p.rot += p.vRot;
        p.life--;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        if (p.y > this.canvas.height + 20 || p.life <= 0) {
          this.petals.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(this.animatePetals);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.pujaMandir = new DiwaliPujaMandir();
});
