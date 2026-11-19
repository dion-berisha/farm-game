// Shared UI building blocks: text styles, panels, buttons, stat bars.
(function () {
  const FONT = '"Fredoka", "Trebuchet MS", "Segoe UI", sans-serif';
  const C = {
    ink: '#4a2e19', cream: 0xfff3d6, creamDark: 0xf3dfb2, wood: 0x8a5a33, woodDark: 0x5e3a1f,
    green: 0x6cc04a, greenDark: 0x4a9a30, red: 0xe2483d, blue: 0x4b8fe2, yellow: 0xffc93c, grey: 0xb9ad9a,
  };

  const text = (scene, x, y, str, size = 22, color = C.ink, extra = {}) =>
    scene.add.text(x, y, str, { fontFamily: FONT, fontSize: size + 'px', color, fontStyle: '600', resolution: 2, ...extra });

  function panel(scene, x, y, w, h, opts = {}) {
    const g = scene.add.graphics();
    const r = opts.radius ?? 22;
    g.fillStyle(0x000000, 0.22).fillRoundedRect(x + 4, y + 7, w, h, r);
    g.fillStyle(opts.border ?? C.wood, 1).fillRoundedRect(x, y, w, h, r);
    g.fillStyle(opts.fill ?? C.cream, 1).fillRoundedRect(x + 6, y + 6, w - 12, h - 12, r - 5);
    g.lineStyle(2, 0xe8cf9e, 1).strokeRoundedRect(x + 12, y + 12, w - 24, h - 24, r - 9);
    return g;
  }

  const shade = (col, amt) => {
    const c = Phaser.Display.Color.IntegerToColor(col);
    return Phaser.Display.Color.GetColor(
      Phaser.Math.Clamp(c.red + amt, 0, 255), Phaser.Math.Clamp(c.green + amt, 0, 255), Phaser.Math.Clamp(c.blue + amt, 0, 255));
  };

  // Chunky game button with icon + label, hover and press feedback
  function button(scene, x, y, w, h, { label = '', icon = null, color = C.green, size = 22, onClick }) {
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    const draw = (col, pressed) => {
      g.clear();
      const off = pressed ? 3 : 0;
      g.fillStyle(0x000000, 0.25).fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, h / 2.6);
      g.fillStyle(shade(col, -45), 1).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2.6);
      g.fillStyle(col, 1).fillRoundedRect(-w / 2, -h / 2 + off, w, h - 4, h / 2.6);
      g.fillStyle(0xffffff, 0.28).fillRoundedRect(-w / 2 + 8, -h / 2 + off + 4, w - 16, (h - 4) / 2.6, h / 5);
      g.lineStyle(3, 0x3b2716, 1).strokeRoundedRect(-w / 2, -h / 2 + off, w, h - 4 + (pressed ? 1 : 4), h / 2.6);
    };
    draw(color, false);
    c.add(g);
    let ico = null;
    const t = text(scene, 0, -2, label, size, '#ffffff', { stroke: '#3b2716', strokeThickness: 4 }).setOrigin(0.5);
    if (icon) {
      ico = scene.add.image(0, -2, icon).setDisplaySize(h * 0.6, h * 0.6);
      c.add(ico);
      if (label) {
        const totalW = h * 0.6 + 8 + t.width;
        ico.x = -totalW / 2 + h * 0.3;
        t.x = ico.x + h * 0.3 + 8 + t.width / 2;
      }
    }
    c.add(t);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.enabled = true;
    c.baseColor = color;
    c.on('pointerover', () => c.enabled && scene.tweens.add({ targets: c, scale: 1.05, duration: 90 }));
    c.on('pointerout', () => { scene.tweens.add({ targets: c, scale: 1, duration: 90 }); draw(c.enabled ? c.baseColor : C.grey, false); });
    c.on('pointerdown', () => { if (!c.enabled) return; draw(c.baseColor, true); });
    c.on('pointerup', () => {
      if (!c.enabled) return;
      draw(c.baseColor, false);
      Sound.play('click');
      onClick && onClick();
    });
    c.setEnabled = (on) => {
      c.enabled = on;
      draw(on ? c.baseColor : C.grey, false);
      c.setAlpha(on ? 1 : 0.75);
      return c;
    };
    c.setLabel = (s) => { t.setText(s); return c; };
    return c;
  }

  // Rounded stat bar. Returns a function to update the value (0..100)
  function bar(scene, container, x, y, w, h, color) {
    const g = scene.add.graphics();
    container.add(g);
    let shown = -1;
    return (v) => {
      v = Phaser.Math.Clamp(v, 0, 100);
      if (Math.abs(v - shown) < 0.5) return;
      shown = v;
      g.clear();
      g.fillStyle(0x3b2716, 1).fillRoundedRect(x - 2, y - 2, w + 4, h + 4, (h + 4) / 2);
      g.fillStyle(0xf1e2c0, 1).fillRoundedRect(x, y, w, h, h / 2);
      const col = typeof color === 'function' ? color(v) : color;
      if (v > 2) {
        const fw = Math.max(h, (w * v) / 100);
        g.fillStyle(col, 1).fillRoundedRect(x, y, fw, h, h / 2);
        g.fillStyle(0xffffff, 0.35).fillRoundedRect(x + 3, y + 2, fw - 6, h / 3, h / 6);
      }
    };
  }

  const levelColor = (v) => (v > 60 ? 0x6cc04a : v > 30 ? 0xffc93c : 0xe2483d);

  // Very small synth sound effects with WebAudio, so there are no audio files to manage
  const Sound = (() => {
    let ctx = null;
    const tones = {
      click: [[660, 0.05, 'triangle']],
      good: [[523, 0.08, 'triangle'], [784, 0.12, 'triangle']],
      coin: [[988, 0.06, 'square'], [1319, 0.14, 'square']],
      bad: [[220, 0.15, 'sawtooth']],
      pop: [[880, 0.06, 'sine']],
      moo: [[140, 0.5, 'sawtooth']],
      cluck: [[700, 0.04, 'square'], [520, 0.05, 'square']],
    };
    return {
      muted: false,
      play(name) {
        if (this.muted) return;
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          let t = ctx.currentTime;
          for (const [f, d, type] of tones[name] || []) {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = type; o.frequency.setValueAtTime(f, t);
            if (name === 'moo') o.frequency.linearRampToValueAtTime(110, t + d);
            g.gain.setValueAtTime(name === 'moo' ? 0.05 : 0.08, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + d);
            o.connect(g).connect(ctx.destination);
            o.start(t); o.stop(t + d + 0.02);
            t += d * 0.8;
          }
        } catch (e) { /* audio blocked */ }
      },
    };
  })();

  window.UI = { FONT, C, text, panel, button, bar, levelColor, shade };
  window.Sound = Sound;
})();
