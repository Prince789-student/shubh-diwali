/**
 * Royal Deepavali Photo Frame & DP Maker
 * Client-side Canvas rendering with festive borders, marigold torans, diyas & PNG export
 */

class DiwaliPhotoBooth {
  constructor() {
    this.canvas = document.getElementById('photoBoothCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.userImage = null;
    this.userName = 'शर्मा परिवार';
    this.frameTheme = 'royal-gold';
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderDefaultFrame();
  }

  bindEvents() {
    const uploadInput = document.getElementById('photoUploadInput');
    const nameInput = document.getElementById('photoUserName');
    const downloadBtn = document.getElementById('downloadPhotoFrameBtn');

    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              this.userImage = img;
              this.renderFrame();
              if (window.diwaliAudio) window.diwaliAudio.playFlowerShower();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.userName = e.target.value.trim() || 'आप सभी को';
        this.renderFrame();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadPhoto());
    }
  }

  renderDefaultFrame() {
    this.renderFrame();
  }

  renderFrame() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Clear & Background
    ctx.fillStyle = '#0B071E';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw User Photo (or festive placeholder)
    if (this.userImage) {
      // Calculate aspect ratio crop to center
      const imgRatio = this.userImage.width / this.userImage.height;
      const canvasRatio = w / h;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = h - 80;
        drawW = drawH * imgRatio;
        drawX = (w - drawW) / 2;
        drawY = 40;
      } else {
        drawW = w - 80;
        drawH = drawW / imgRatio;
        drawX = 40;
        drawY = (h - drawH) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(40, 40, w - 80, h - 80, 20);
      ctx.clip();
      ctx.drawImage(this.userImage, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      // Placeholder background with soft temple silhouette
      const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 240);
      grad.addColorStop(0, '#2D1047');
      grad.addColorStop(1, '#090414');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(40, 40, w - 80, h - 80, 20);
      ctx.fill();

      // Placeholder hint
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 22px "Poppins", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📸 अपनी फोटो अपलोड करें', w / 2, h / 2 - 15);
      ctx.font = '15px "Poppins", sans-serif';
      ctx.fillStyle = '#E0D3C1';
      ctx.fillText('सुंदर दीवाली फ्रेम के लिए फोटो चुनें', w / 2, h / 2 + 20);
    }

    // 3. Ornate Double Gold Borders
    ctx.save();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(20, 20, w - 40, h - 40, 24);
    ctx.stroke();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(28, 28, w - 56, h - 56, 18);
    ctx.stroke();
    ctx.restore();

    // 4. Marigold Garland along the top
    this.drawGarland(w);

    // 5. Four Corner Diyas
    this.drawCornerDiya(48, 48);
    this.drawCornerDiya(w - 48, 48);
    this.drawCornerDiya(48, h - 48);
    this.drawCornerDiya(w - 48, h - 48);

    // 6. Top Auspicious Header Banner
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 15px "Cinzel", "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.fillText('॥ शुभ लाभ • ॐ महालक्ष्म्यै नमः ॥', w / 2, 50);
    ctx.shadowBlur = 0;

    // 7. Bottom Festive Ribbon Banner
    this.drawBottomRibbon(w, h);
  }

  drawGarland(w) {
    const ctx = this.ctx;
    const count = 15;
    const spacing = (w - 70) / count;

    for (let i = 0; i <= count; i++) {
      const x = 35 + i * spacing;
      const y = 30 + Math.sin((i / count) * Math.PI) * 12;
      const isMarigold = i % 2 === 0;

      ctx.fillStyle = isMarigold ? '#FF9800' : '#FFD54F';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Green mango leaf separator
      if (i % 3 === 0) {
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.ellipse(x, y + 8, 3, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawCornerDiya(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Glow
    const glow = ctx.createRadialGradient(0, -6, 1, 0, -6, 18);
    glow.addColorStop(0, '#FFF59D');
    glow.addColorStop(0.4, '#FF9800');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -6, 18, 0, Math.PI * 2);
    ctx.fill();

    // Flame
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.quadraticCurveTo(6, -8, 0, -2);
    ctx.quadraticCurveTo(-6, -8, 0, -18);
    ctx.fill();

    // Bowl
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBottomRibbon(w, h) {
    const ctx = this.ctx;
    const bannerY = h - 65;

    // Dark Gold Glassy Ribbon
    const grad = ctx.createLinearGradient(0, bannerY - 20, 0, bannerY + 30);
    grad.addColorStop(0, 'rgba(15, 8, 33, 0.95)');
    grad.addColorStop(1, 'rgba(38, 17, 66, 0.95)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, bannerY - 18, w - 100, 48, 14);
    ctx.fill();
    ctx.stroke();

    // Text: शुभ दीपावली
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px "Rozha One", "Cinzel Decorative", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ शुभ दीपावली 2026 ✨`, w / 2, bannerY + 6);

    // Subtext: Sender Name
    ctx.font = '600 13px "Poppins", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`सप्रेम शुभाभिनंदन: ${this.userName}`, w / 2, bannerY + 23);
  }

  downloadPhoto() {
    if (!this.canvas) return;
    const a = document.createElement('a');
    a.download = `shubh-diwali-photo-frame-${Date.now()}.png`;
    a.href = this.canvas.toDataURL('image/png');
    a.click();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.diwaliPhotoBooth = new DiwaliPhotoBooth();
});

