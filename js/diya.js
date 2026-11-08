/**
 * Deepavali Diya Lighting Engine
 * Interactive Deepotsav, 21-Diya Courtyard, and Akhand Diya mechanics
 */

class DiyaGarden {
  constructor() {
    this.totalDiyas = 21;
    this.litDiyas = new Set();
    this.akhandLit = true;
    this.init();
  }

  init() {
    this.setupAkhandDiya();
    this.renderDiyaGarden();
    this.updateCounter();
  }

  setupAkhandDiya() {
    const akhandBtn = document.getElementById('akhandDiyaTrigger');
    const akhandElem = document.getElementById('akhandDiya');
    if (!akhandBtn || !akhandElem) return;

    akhandBtn.addEventListener('click', () => {
      this.akhandLit = !this.akhandLit;
      if (this.akhandLit) {
        akhandElem.classList.add('lit');
        akhandElem.classList.remove('unlit');
        akhandBtn.innerHTML = '<span>🪔</span> अखंड ज्योति प्रज्वलित है';
        if (window.diwaliAudio) window.diwaliAudio.playDiyaIgnite();
        if (window.fireworks) {
          const rect = akhandElem.getBoundingClientRect();
          window.fireworks.emitSparkler(rect.left + rect.width / 2, rect.top, 25);
        }
      } else {
        akhandElem.classList.remove('lit');
        akhandElem.classList.add('unlit');
        akhandBtn.innerHTML = '<span>🔥</span> अखंड ज्योति प्रज्वलित करें';
      }
    });
  }

  renderDiyaGarden() {
    const container = document.getElementById('diyaGrid');
    if (!container) return;
    container.innerHTML = '';

    // Sanskrit names & blessings for each of the 21 diyas
    const diyaNames = [
      '१. सुख (Happiness)', '२. शांति (Peace)', '३. समृद्धि (Prosperity)', '४. स्वास्थ्य (Health)',
      '५. विद्या (Wisdom)', '६. आनंद (Joy)', '७. भक्ति (Devotion)', '८. कीर्ति (Glory)',
      '९. मैत्री (Harmony)', '१०. ऐश्वर्य (Wealth)', '११. सत्य (Truth)', '१२. धर्म (Righteousness)',
      '१३. प्रेम (Love)', '१४. तेज (Radiance)', '१५. विजय (Victory)', '१६. शक्ति (Strength)',
      '१७. उत्साह (Enthusiasm)', '१८. संतोष (Contentment)', '१९. रक्षा (Protection)',
      '२०. आरोग्य (Wellness)', '२१. मोक्ष (Enlightenment)'
    ];

    for (let i = 1; i <= this.totalDiyas; i++) {
      const diyaCard = document.createElement('div');
      diyaCard.className = 'diya-slot unlit';
      diyaCard.id = `diya-${i}`;
      diyaCard.dataset.index = i;
      diyaCard.setAttribute('role', 'button');
      diyaCard.setAttribute('tabindex', '0');
      diyaCard.setAttribute('aria-label', `Light Diya ${i}: ${diyaNames[i - 1]}`);

      diyaCard.innerHTML = `
        <div class="diya-flame-wrapper">
          <div class="diya-aura"></div>
          <div class="diya-flame">
            <div class="flame-inner"></div>
          </div>
          <div class="diya-smoke"></div>
        </div>
        <div class="diya-clay-base">
          <svg viewBox="0 0 100 50" class="clay-svg">
            <defs>
              <linearGradient id="clayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#D97706" />
                <stop offset="50%" stop-color="#92400E" />
                <stop offset="100%" stop-color="#78350F" />
              </linearGradient>
              <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#F59E0B" />
                <stop offset="50%" stop-color="#FCD34D" />
                <stop offset="100%" stop-color="#F59E0B" />
              </linearGradient>
            </defs>
            <!-- Diya Bowl -->
            <path d="M 10,20 Q 50,55 90,20 Q 50,30 10,20 Z" fill="url(#clayGrad)" />
            <!-- Rim -->
            <ellipse cx="50" cy="20" rx="40" ry="8" fill="url(#rimGrad)" stroke="#B45309" stroke-width="1.5" />
            <!-- Oil & Cotton Wick -->
            <ellipse cx="50" cy="21" rx="30" ry="5" fill="#451A03" opacity="0.8" />
            <path d="M 50,22 Q 53,14 50,11" stroke="#FEF3C7" stroke-width="2.5" stroke-linecap="round" fill="none" />
          </svg>
        </div>
        <div class="diya-label">${diyaNames[i - 1]}</div>
      `;

      // Click / tap handler
      const toggle = () => this.lightDiya(i);
      diyaCard.addEventListener('click', toggle);
      diyaCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      container.appendChild(diyaCard);
    }

    // Attach batch buttons
    const lightAllBtn = document.getElementById('lightAllDiyasBtn');
    if (lightAllBtn) {
      lightAllBtn.addEventListener('click', () => this.lightAllDiyas());
    }

    const resetDiyasBtn = document.getElementById('resetDiyasBtn');
    if (resetDiyasBtn) {
      resetDiyasBtn.addEventListener('click', () => this.resetDiyas());
    }
  }

  lightDiya(index) {
    const elem = document.getElementById(`diya-${index}`);
    if (!elem) return;

    if (!this.litDiyas.has(index)) {
      this.litDiyas.add(index);
      elem.classList.remove('unlit');
      elem.classList.add('lit');

      if (window.diwaliAudio) window.diwaliAudio.playDiyaIgnite();

      if (window.fireworks) {
        const rect = elem.getBoundingClientRect();
        window.fireworks.emitSparkler(rect.left + rect.width / 2, rect.top + 20, 8);
      }
    } else {
      this.litDiyas.delete(index);
      elem.classList.remove('lit');
      elem.classList.add('unlit');
    }

    this.updateCounter();
  }

  lightAllDiyas() {
    let delay = 0;
    for (let i = 1; i <= this.totalDiyas; i++) {
      setTimeout(() => {
        if (!this.litDiyas.has(i)) {
          this.lightDiya(i);
        }
      }, delay);
      delay += 55;
    }
  }

  resetDiyas() {
    this.litDiyas.clear();
    for (let i = 1; i <= this.totalDiyas; i++) {
      const elem = document.getElementById(`diya-${i}`);
      if (elem) {
        elem.classList.remove('lit');
        elem.classList.add('unlit');
      }
    }
    this.updateCounter();
  }

  updateCounter() {
    const countElem = document.getElementById('diyaCounter');
    const barElem = document.getElementById('diyaProgressBar');
    const statusElem = document.getElementById('diyaStatusMsg');
    const count = this.litDiyas.size;

    if (countElem) countElem.textContent = `${count} / ${this.totalDiyas}`;
    if (barElem) {
      const pct = (count / this.totalDiyas) * 100;
      barElem.style.width = `${pct}%`;
    }

    if (statusElem) {
      if (count === 0) {
        statusElem.textContent = 'दीप जलाकर अंधेरे को दूर भगाएं (Click diyas to illuminate)';
      } else if (count < this.totalDiyas) {
        statusElem.textContent = `अद्भुत! ${count} दीपक प्रज्वलित हो चुके हैं...`;
      } else {
        statusElem.textContent = '✨ जय श्री राम! संपूर्ण प्रांगण आलोकित है! महा दीपावली की मंगलकामनाएं ✨';
        this.triggerGrandCelebration();
      }
    }
  }

  triggerGrandCelebration() {
    if (window.diwaliAudio) {
      window.diwaliAudio.playTempleBell();
      setTimeout(() => window.diwaliAudio.playShankh(), 400);
    }
    if (window.fireworks) {
      window.fireworks.burst(window.innerWidth * 0.5, window.innerHeight * 0.25, '#FFD700', 120, true);
    }

    const modal = document.getElementById('deepotsavBlessingModal');
    if (modal) {
      modal.classList.add('show');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.diyaGarden = new DiyaGarden();
});

