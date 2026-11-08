/**
 * Personalized Diwali Greeting Card Maker & Shubhkaamna Patra
 * High-definition Canvas rendering, themes, Sanskrit shlokas, PNG download, and WhatsApp share
 */

class DiwaliGreetingCard {
  constructor() {
    this.canvas = document.getElementById('greetingCardCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.recipient = 'स्नेही स्वजन';
    this.sender = 'अपना कॉलेज बिहार परिवार';
    this.currentTheme = 'royal-gold';
    this.currentWish = `दीयों की रोशनी से झिलमिलाता आंगन हो,\nपटाखों की गूंज से आसमां रोशन हो,\nऐसी आए यह पावन दीवाली आपके द्वार,\nहर ओर खुशियों और समृद्धि का संचार हो!`;

    this.themes = {
      'royal-gold': {
        bgStart: '#2A0812',
        bgEnd: '#0D0205',
        border: '#D4AF37',
        accent: '#FFD700',
        textColor: '#FFF8E7',
        name: 'शाही स्वर्ण (Royal Gold)'
      },
      'midnight-sky': {
        bgStart: '#0B0D26',
        bgEnd: '#03040E',
        border: '#64B5F6',
        accent: '#80D8FF',
        textColor: '#FFFFFF',
        name: 'नक्षत्र आकाश (Midnight Sky)'
      },
      'marigold-amber': {
        bgStart: '#3E1404',
        bgEnd: '#1A0600',
        border: '#FFA000',
        accent: '#FFD54F',
        textColor: '#FFF9C4',
        name: 'गेंदा अंबर (Marigold Amber)'
      },
      'vedic-emerald': {
        bgStart: '#08231A',
        bgEnd: '#020D0A',
        border: '#4CAF50',
        accent: '#A5D6A7',
        textColor: '#E8F5E9',
        name: 'वैदिक हरित (Vedic Emerald)'
      }
    };

    this.init();
  }

  init() {
    this.bindInputs();
    this.renderCard();
  }

  bindInputs() {
    const toInput = document.getElementById('cardRecipient');
    const fromInput = document.getElementById('cardSender');
    const wishSelect = document.getElementById('cardWishSelect');
    const customWishInput = document.getElementById('cardCustomWish');

    if (toInput) {
      toInput.addEventListener('input', (e) => {
        this.recipient = e.target.value.trim() || 'स्नेही स्वजन';
        this.renderCard();
      });
    }

    if (fromInput) {
      fromInput.addEventListener('input', (e) => {
        this.sender = e.target.value.trim() || 'आपका परिवार';
        this.renderCard();
      });
    }

    if (wishSelect) {
      wishSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          if (customWishInput) {
            customWishInput.style.display = 'block';
            this.currentWish = customWishInput.value.trim() || 'शुभ दीपावली!';
          }
        } else {
          if (customWishInput) customWishInput.style.display = 'none';
          this.currentWish = e.target.value;
        }
        this.renderCard();
      });
    }

    if (customWishInput) {
      customWishInput.addEventListener('input', (e) => {
        this.currentWish = e.target.value.trim() || 'शुभ दीपावली!';
        this.renderCard();
      });
    }

    // Theme selector
    const themeBtns = document.querySelectorAll('.card-theme-btn');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTheme = btn.dataset.theme;
        this.renderCard();
      });
    });

    // Download Button
    const downloadBtn = document.getElementById('downloadCardBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadCard());
    }

    // WhatsApp Share Button
    const shareBtn = document.getElementById('shareCardWhatsAppBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareOnWhatsApp());
    }
  }

  renderCard() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const theme = this.themes[this.currentTheme] || this.themes['royal-gold'];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, theme.bgStart);
    bgGrad.addColorStop(1, theme.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Background Rangoli Watermark
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = theme.border;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 8; r++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.strokeRect(-120, -120, 240, 240);
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Ornate Double Gold Borders
    ctx.save();
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // Corner Ornaments
    this.drawCorner(32, 32, theme.border);
    this.drawCorner(w - 32, 32, theme.border, Math.PI / 2);
    this.drawCorner(w - 32, h - 32, theme.border, Math.PI);
    this.drawCorner(32, h - 32, theme.border, -Math.PI / 2);
    ctx.restore();

    // 4. Header: Auspicious Shubh Labh / Swastika
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 20px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ श्री गणेशाय नमः ॥ श्री महालक्ष्म्यै नमः ॥', w / 2, 70);

    // 5. Main Title: शुभ दीपावली / HAPPY DIWALI
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px "Rozha One", "Cinzel Decorative", Georgia, serif';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.fillText('शुभ दीपावली', w / 2, 125);
    ctx.shadowBlur = 0;

    ctx.font = '600 16px "Cinzel", "Poppins", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.letterSpacing = '4px';
    ctx.fillText('— FESTIVAL OF LIGHTS —', w / 2, 152);

    // 6. Radiant Center Diya Graphic
    this.drawCenterDiya(w / 2, 230, theme.accent);

    // 7. Recipient Salutation
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 22px "Poppins", sans-serif';
    ctx.fillText(`प्रिय ${this.recipient},`, w / 2, 320);

    // 8. Wish Text (Multi-line centered)
    ctx.fillStyle = theme.textColor;
    ctx.font = '16px "Poppins", sans-serif';
    const lines = this.currentWish.split('\n');
    let startY = 360;
    lines.forEach(line => {
      ctx.fillText(line, w / 2, startY);
      startY += 26;
    });

    // 9. Sender Sign-off
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 18px "Poppins", sans-serif';
    ctx.fillText('सप्रेम शुभाभिनंदन सहित,', w / 2, startY + 25);
    ctx.font = 'italic bold 20px "Poppins", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this.sender, w / 2, startY + 55);

    // 10. Shloka Footer
    ctx.font = '13px "Poppins", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('तमसो मा ज्योतिर्गमय • दीप से दीप जले', w / 2, h - 45);
  }

  drawCorner(x, y, color, rotation = 0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 25);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(8, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCenterDiya(x, y, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Flame Glow Aura
    const glow = ctx.createRadialGradient(0, -25, 2, 0, -25, 45);
    glow.addColorStop(0, '#FFF59D');
    glow.addColorStop(0.3, '#FF9800');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -25, 45, 0, Math.PI * 2);
    ctx.fill();

    // Flame Teardrop
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.quadraticCurveTo(14, -25, 0, -10);
    ctx.quadraticCurveTo(-14, -25, 0, -50);
    ctx.fill();

    // Inner White Flame
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.quadraticCurveTo(7, -26, 0, -14);
    ctx.quadraticCurveTo(-7, -26, 0, -42);
    ctx.fill();

    // Clay Diya Bowl
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.quadraticCurveTo(0, 28, 36, 0);
    ctx.quadraticCurveTo(0, 10, -36, 0);
    ctx.fill();

    ctx.restore();
  }

  downloadCard() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `shubh-diwali-wishes-${this.recipient.replace(/\s+/g, '-')}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  shareOnWhatsApp() {
    const text = `🪔✨ *शुभ दीपावली की हार्दिक शुभकामनाएँ!* ✨🪔\n\nप्रिय ${this.recipient},\n\n"${this.currentWish}"\n\nसप्रेम शुभाभिनंदन सहित:\n*— ${this.sender}*\n\n🎆 सुख, समृद्धि और आरोग्य की मंगलकामनाएं! 🎆\n\n👇 हमारी दीपावली उत्सव वेबसाइट देखें:\n${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.diwaliCard = new DiwaliGreetingCard();
});

