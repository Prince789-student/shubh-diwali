/**
 * Akash Kandil / Floating Sky Lanterns Engine
 * Interactive wish release into the Deepavali night sky with physics & glowing trails
 */

class SkyLanternEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.lanterns = [];
    this.wishes = [];
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Populate ambient background lanterns
    for (let i = 0; i < 12; i++) {
      this.createLantern({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        text: '',
        color: Math.random() > 0.4 ? '#FFA000' : '#FF5722',
        scale: 0.35 + Math.random() * 0.45,
        speedY: 0.3 + Math.random() * 0.5,
        swaySpeed: 0.02 + Math.random() * 0.02,
        swayAmount: 20 + Math.random() * 30,
        swayOffset: Math.random() * Math.PI * 2
      });
    }

    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.parentElement.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  bindEvents() {
    const releaseBtn = document.getElementById('releaseLanternBtn');
    const wishInput = document.getElementById('lanternWishInput');
    const colorSelect = document.getElementById('lanternColorSelect');

    if (releaseBtn && wishInput) {
      releaseBtn.addEventListener('click', () => {
        const wishText = wishInput.value.trim() || 'सुख, शांति और समृद्धि';
        const color = colorSelect ? colorSelect.value : '#FFA000';

        this.releaseUserLantern(wishText, color);
        wishInput.value = '';

        if (window.diwaliAudio) {
          window.diwaliAudio.playFlowerShower();
        }
      });
    }
  }

  createLantern(options) {
    this.lanterns.push({
      x: options.x,
      y: options.y,
      baseX: options.x,
      text: options.text || '',
      color: options.color || '#FFA000',
      scale: options.scale || 1,
      speedY: options.speedY || 1.2,
      swaySpeed: options.swaySpeed || 0.03,
      swayAmount: options.swayAmount || 35,
      swayOffset: options.swayOffset || 0,
      time: 0,
      alpha: 1
    });
  }

  releaseUserLantern(text, color) {
    const startX = this.width * 0.4 + Math.random() * (this.width * 0.2);
    const startY = this.height - 30;

    this.createLantern({
      x: startX,
      y: startY,
      text: text,
      color: color,
      scale: 1.0,
      speedY: 1.1 + Math.random() * 0.4,
      swaySpeed: 0.025,
      swayAmount: 40,
      swayOffset: Math.random() * Math.PI
    });

    // Add to wish board
    const list = document.getElementById('wishesList');
    if (list) {
      const item = document.createElement('div');
      item.className = 'wish-chip';
      item.innerHTML = `<span>🪔</span> ${text}`;
      list.prepend(item);
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      l.time += l.swaySpeed;
      l.x = l.baseX + Math.sin(l.time + l.swayOffset) * l.swayAmount;
      l.y -= l.speedY;

      // Draw Lantern
      this.drawLantern(l);

      // If floated out of top, recycle or remove
      if (l.y < -80) {
        if (l.text === '') {
          // Recycle ambient lantern
          l.y = this.height + 60;
          l.baseX = Math.random() * this.width;
          l.time = 0;
        } else {
          // User lantern reaches high heavens
          this.lanterns.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(this.animate);
  }

  drawLantern(l) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.scale(l.scale, l.scale);

    // Warm Glow Aura
    const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 55);
    glow.addColorStop(0, 'rgba(255, 220, 100, 0.7)');
    glow.addColorStop(0.5, 'rgba(255, 120, 0, 0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.fill();

    // Paper Body
    const paperGrad = ctx.createLinearGradient(-18, -25, 18, 25);
    paperGrad.addColorStop(0, '#FFF59D');
    paperGrad.addColorStop(0.3, l.color);
    paperGrad.addColorStop(1, '#D84315');

    ctx.fillStyle = paperGrad;
    ctx.beginPath();
    ctx.moveTo(-16, -26);
    ctx.quadraticCurveTo(-24, 0, -18, 24);
    ctx.lineTo(18, 24);
    ctx.quadraticCurveTo(24, 0, 16, -26);
    ctx.closePath();
    ctx.fill();

    // Bamboo Frame Rings
    ctx.strokeStyle = 'rgba(120, 50, 5, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Inner Flame
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 15, 4, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Tassel / Fringe
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 24);
    ctx.lineTo(-10, 36);
    ctx.moveTo(0, 24);
    ctx.lineTo(0, 42);
    ctx.moveTo(10, 24);
    ctx.lineTo(10, 36);
    ctx.stroke();

    // Wish Text Tag
    if (l.text) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px "Poppins", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(l.text.length > 20 ? l.text.substring(0, 20) + '...' : l.text, 0, 58);
    }

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.skyLanterns = new SkyLanternEngine('lanternCanvas');
});

