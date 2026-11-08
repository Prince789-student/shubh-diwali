/**
 * Interactive Rangoli Studio & Mandala Coloring Engine
 * Traditional Indian Rangoli patterns with interactive sand powder coloring & PNG export
 */

class RangoliStudio {
  constructor() {
    this.selectedColor = '#FB8C00'; // Default Marigold Orange
    this.currentPattern = 'lotus';
    this.isDrawing = false;
    this.brushMode = 'fill'; // 'fill' or 'brush'
    this.canvas = document.getElementById('rangoliFreehandCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.init();
  }

  init() {
    this.setupPalette();
    this.setupPatternSelector();
    this.setupPatternSVGs();
    this.setupTools();
    this.setupCanvas();
  }

  setupPalette() {
    const paletteContainer = document.getElementById('rangoliPalette');
    if (!paletteContainer) return;

    const colors = [
      { name: 'सिंदूर (Sindoor Red)', hex: '#E53935' },
      { name: 'हल्दी (Turmeric Yellow)', hex: '#FFD54F' },
      { name: 'गुलाल (Gulal Pink)', hex: '#EC407A' },
      { name: 'गेंदा (Marigold Orange)', hex: '#FB8C00' },
      { name: 'मयूर (Peacock Cyan)', hex: '#00BCD4' },
      { name: 'नील (Royal Blue)', hex: '#1E88E5' },
      { name: 'धानी (Emerald Green)', hex: '#43A047' },
      { name: 'जामुनी (Royal Purple)', hex: '#8E24AA' },
      { name: 'चावल चूर्ण (Pure White)', hex: '#FFFFFF' }
    ];

    paletteContainer.innerHTML = '';
    colors.forEach((col, idx) => {
      const swatch = document.createElement('button');
      swatch.className = `palette-swatch ${idx === 3 ? 'active' : ''}`;
      swatch.style.backgroundColor = col.hex;
      swatch.title = col.name;
      swatch.setAttribute('aria-label', col.name);

      swatch.addEventListener('click', () => {
        document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedColor = col.hex;
      });

      paletteContainer.appendChild(swatch);
    });
  }

  setupPatternSelector() {
    const tabs = document.querySelectorAll('.rangoli-pattern-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentPattern = tab.dataset.pattern;
        this.loadPattern(this.currentPattern);
      });
    });
  }

  loadPattern(type) {
    const patterns = document.querySelectorAll('.rangoli-svg-template');
    patterns.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`rangoli-${type}`);
    if (target) {
      target.classList.add('active');
      this.attachFillListeners(target);
    }
  }

  setupPatternSVGs() {
    const firstPattern = document.getElementById(`rangoli-${this.currentPattern}`);
    if (firstPattern) {
      firstPattern.classList.add('active');
      this.attachFillListeners(firstPattern);
    }
  }

  attachFillListeners(container) {
    const paths = container.querySelectorAll('.colorable');
    paths.forEach(p => {
      p.addEventListener('click', (e) => {
        e.stopPropagation();
        p.setAttribute('fill', this.selectedColor);
        p.style.transition = 'fill 0.25s ease-out';
        if (window.diwaliAudio) window.diwaliAudio.playSparkler(0.06);

        if (window.fireworks) {
          const rect = p.getBoundingClientRect();
          window.fireworks.emitSparkler(rect.left + rect.width / 2, rect.top + rect.height / 2, 5);
        }
      });
    });
  }

  setupTools() {
    // Mode switcher (Fill vs Sand Brush)
    const modeFillBtn = document.getElementById('rangoliModeFill');
    const modeBrushBtn = document.getElementById('rangoliModeBrush');
    if (modeFillBtn && modeBrushBtn) {
      modeFillBtn.addEventListener('click', () => {
        this.brushMode = 'fill';
        modeFillBtn.classList.add('active');
        modeBrushBtn.classList.remove('active');
        if (this.canvas) this.canvas.style.pointerEvents = 'none';
      });

      modeBrushBtn.addEventListener('click', () => {
        this.brushMode = 'brush';
        modeBrushBtn.classList.add('active');
        modeFillBtn.classList.remove('active');
        if (this.canvas) this.canvas.style.pointerEvents = 'auto';
      });
    }

    // Reset Rangoli
    const resetBtn = document.getElementById('resetRangoliBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const activeSVG = document.querySelector('.rangoli-svg-template.active');
        if (activeSVG) {
          activeSVG.querySelectorAll('.colorable').forEach(p => {
            p.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
          });
        }
        if (this.ctx && this.canvas) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
      });
    }

    // Auto Harmonize (Fill with traditional festive palette)
    const autoFillBtn = document.getElementById('autoFillRangoliBtn');
    if (autoFillBtn) {
      autoFillBtn.addEventListener('click', () => {
        const festiveHarmonies = ['#FB8C00', '#FFD54F', '#E53935', '#00BCD4', '#43A047', '#EC407A', '#FFFFFF'];
        const activeSVG = document.querySelector('.rangoli-svg-template.active');
        if (activeSVG) {
          const paths = activeSVG.querySelectorAll('.colorable');
          paths.forEach((p, idx) => {
            const c = festiveHarmonies[idx % festiveHarmonies.length];
            setTimeout(() => {
              p.setAttribute('fill', c);
            }, idx * 20);
          });
          if (window.diwaliAudio) window.diwaliAudio.playFlowerShower();
        }
      });
    }

    // Export Rangoli
    const downloadBtn = document.getElementById('downloadRangoliBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadRangoli());
    }
  }

  setupCanvas() {
    if (!this.canvas || !this.ctx) return;
    const resize = () => {
      const container = this.canvas.parentElement;
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const startDraw = (e) => {
      if (this.brushMode !== 'brush') return;
      this.isDrawing = true;
      this.drawPowder(e);
    };

    const drawMove = (e) => {
      if (!this.isDrawing || this.brushMode !== 'brush') return;
      this.drawPowder(e);
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    this.canvas.addEventListener('pointerdown', startDraw);
    this.canvas.addEventListener('pointermove', drawMove);
    this.canvas.addEventListener('pointerup', stopDraw);
    this.canvas.addEventListener('pointerleave', stopDraw);
  }

  drawPowder(e) {
    if (!this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw sand particle cluster
    this.ctx.fillStyle = this.selectedColor;
    for (let i = 0; i < 7; i++) {
      const offsetX = (Math.random() - 0.5) * 14;
      const offsetY = (Math.random() - 0.5) * 14;
      const radius = 1 + Math.random() * 2.5;

      this.ctx.beginPath();
      this.ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  downloadRangoli() {
    const activeSVG = document.querySelector('.rangoli-svg-template.active');
    if (!activeSVG) return;

    // Convert SVG to dataURL then draw to an offscreen canvas
    const svgData = new XMLSerializer().serializeToString(activeSVG);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 600;
      exportCanvas.height = 600;
      const expCtx = exportCanvas.getContext('2d');

      // Festive Background
      expCtx.fillStyle = '#0B071E';
      expCtx.fillRect(0, 0, 600, 600);

      // Gold Border
      expCtx.strokeStyle = '#D4AF37';
      expCtx.lineWidth = 8;
      expCtx.strokeRect(15, 15, 570, 570);

      // Draw SVG
      expCtx.drawImage(img, 40, 40, 520, 520);

      // Overlay freehand canvas if present
      if (this.canvas) {
        expCtx.drawImage(this.canvas, 40, 40, 520, 520);
      }

      // Title
      expCtx.fillStyle = '#FFD700';
      expCtx.font = 'bold 20px "Cinzel Decorative", Georgia, serif';
      expCtx.textAlign = 'center';
      expCtx.fillText('शुभ दीपावली रंगोली', 300, 575);

      const pngURL = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `shubh-diwali-rangoli-${Date.now()}.png`;
      a.href = pngURL;
      a.click();
      URL.revokeObjectURL(blobURL);
    };
    img.src = blobURL;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.rangoliStudio = new RangoliStudio();
});

