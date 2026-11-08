/**
 * Royal Deepavali Mithai Box & Gifting Engine
 * Interactive Indian Sweets selection, custom box packing, and virtual sweet gifting
 */

class MithaiBoxManager {
  constructor() {
    this.maxSlots = 6;
    this.packedSweets = [];
    this.sweetsCatalog = [
      { id: 'kaju-katli', name: 'काजू कतली (Kaju Katli)', desc: 'Pure cashew diamond with silver vark', icon: '💎', color: '#E0E0E0' },
      { id: 'motichoor-laddoo', name: 'मोतीचूर लड्डू (Motichoor Laddoo)', desc: 'Desi ghee golden saffron pearls', icon: '🟡', color: '#FFA000' },
      { id: 'gulab-jamun', name: 'गुलाब जामुन (Gulab Jamun)', desc: 'Khoya dumplings soaked in cardamom chashni', icon: '🟤', color: '#5D4037' },
      { id: 'gujiya', name: 'गुझिया (Crispy Gujiya)', desc: 'Crisp pastry filled with sweet mawa & dry fruits', icon: '🥟', color: '#FFE082' },
      { id: 'soan-papdi', name: 'सोन पापड़ी (Soan Papdi)', desc: 'The legendary flaky festive pass-along king!', icon: '📦', color: '#FFE57F' },
      { id: 'kaju-roll', name: 'काजू पिस्ता रोल (Kaju Pista Roll)', desc: 'Rich pistachio nestled in creamy cashew wrap', icon: '🟢', color: '#81C784' }
    ];
    this.init();
  }

  init() {
    this.renderCatalog();
    this.renderBoxSlots();
    this.bindEvents();
  }

  renderCatalog() {
    const container = document.getElementById('sweetsGrid');
    if (!container) return;
    container.innerHTML = '';

    this.sweetsCatalog.forEach(sweet => {
      const card = document.createElement('div');
      card.className = 'sweet-picker-card';
      card.innerHTML = `
        <div class="sweet-picker-icon">${sweet.icon}</div>
        <div class="sweet-picker-info">
          <h4>${sweet.name}</h4>
          <p>${sweet.desc}</p>
        </div>
        <button class="btn-pack-sweet" data-id="${sweet.id}" aria-label="Add ${sweet.name} to box">
          <span>+ डिब्बे में रखें</span>
        </button>
      `;

      card.querySelector('.btn-pack-sweet').addEventListener('click', () => {
        this.addSweet(sweet);
      });

      container.appendChild(card);
    });
  }

  renderBoxSlots() {
    const boxContainer = document.getElementById('mithaiBoxSlots');
    if (!boxContainer) return;
    boxContainer.innerHTML = '';

    for (let i = 0; i < this.maxSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'mithai-slot';
      slot.dataset.slotIndex = i;

      const sweet = this.packedSweets[i];
      if (sweet) {
        slot.classList.add('filled');
        slot.innerHTML = `
          <div class="slot-sweet-icon">${sweet.icon}</div>
          <div class="slot-sweet-name">${sweet.name.split(' ')[0]}</div>
          <button class="btn-remove-sweet" title="Remove" aria-label="Remove sweet">&times;</button>
        `;
        slot.querySelector('.btn-remove-sweet').addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeSweet(i);
        });
      } else {
        slot.classList.remove('filled');
        slot.innerHTML = `<span class="empty-slot-text">खाली डिब्बा #${i + 1}</span>`;
      }

      boxContainer.appendChild(slot);
    }

    this.updateBoxStatus();
  }

  addSweet(sweet) {
    if (this.packedSweets.length >= this.maxSlots) {
      alert('आपका डिब्बा भर चुका है! (Mithai Box is already full with 6 delicious sweets)');
      return;
    }

    this.packedSweets.push(sweet);
    this.renderBoxSlots();

    if (window.diwaliAudio) window.diwaliAudio.playSweetPack();
    if (window.fireworks) {
      const box = document.getElementById('mithaiBoxSlots');
      if (box) {
        const rect = box.getBoundingClientRect();
        window.fireworks.emitSparkler(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
      }
    }
  }

  removeSweet(index) {
    this.packedSweets.splice(index, 1);
    this.renderBoxSlots();
  }

  updateBoxStatus() {
    const countElem = document.getElementById('packedCount');
    if (countElem) {
      countElem.textContent = `${this.packedSweets.length} / ${this.maxSlots}`;
    }
  }

  bindEvents() {
    // Clear box
    const clearBtn = document.getElementById('clearMithaiBoxBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.packedSweets = [];
        this.renderBoxSlots();
      });
    }

    // Auto-pack Royal Assortment
    const autoPackBtn = document.getElementById('autoPackMithaiBtn');
    if (autoPackBtn) {
      autoPackBtn.addEventListener('click', () => {
        this.packedSweets = [...this.sweetsCatalog];
        this.renderBoxSlots();
        if (window.diwaliAudio) window.diwaliAudio.playFlowerShower();
      });
    }

    // Share / Send Sweet Box
    const sendBtn = document.getElementById('sendMithaiBoxBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendSweetBox());
    }
  }

  sendSweetBox() {
    if (this.packedSweets.length === 0) {
      alert('कृपया डिब्बे में कम से कम एक मिठाई रखें! (Please pack at least one sweet into the box)');
      return;
    }

    const recipient = document.getElementById('mithaiRecipientName')?.value.trim() || 'आप सभी को';
    const sender = document.getElementById('mithaiSenderName')?.value.trim() || 'अपना कॉलेज बिहार';
    const note = document.getElementById('mithaiCustomNote')?.value.trim() || 'दीपावली के इस पावन पर्व पर आपके जीवन में मिठास और खुशहाली बनी रहे!';

    const sweetNames = this.packedSweets.map(s => `${s.icon} ${s.name}`).join('\n');
    const shareText = `🪔✨ *शुभ दीपावली की मीठी सौगात!* ✨🪔\n\nप्रिय ${recipient},\n\n${sender} ने आपके लिए प्रेम से सजाया हुआ शाही मिठाई का डिब्बा भेजा है:\n\n${sweetNames}\n\n💌 *संदेश:* "${note}"\n\n🎆 सुख, शांति और समृद्धि की मंगलकामनाओं सहित Happy Diwali! 🎆\n\n👇 अपनी दीवाली वेबसाइट देखें:\n${window.location.href}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mithaiBox = new MithaiBoxManager();
});

