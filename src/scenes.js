// Boot (rasterize art), Title screen and the main Farm scene.
(function () {
  const { text, button, C } = UI;

  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
      const { width, height } = this.scale;
      const label = text(this, width / 2, height / 2, 'Loading the farm...', 40, '#ffffff', { stroke: '#3b2716', strokeThickness: 6 }).setOrigin(0.5);
      const fonts = document.fonts && document.fonts.load
        ? Promise.race([Promise.all([document.fonts.load('600 24px "Fredoka"'), document.fonts.load('700 24px "Fredoka"')]), new Promise((r) => setTimeout(r, 2500))])
        : Promise.resolve();
      const keys = Object.keys(window.ART);
      let left = keys.length;
      const tex = new Promise((resolve) => keys.forEach((k) => {
        const img = new Image();
        const finish = () => { if (--left === 0) resolve(); };
        img.onload = () => { this.textures.addImage(k, img); finish(); };
        img.onerror = () => { console.warn('SVG failed to load:', k); finish(); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(window.ART[k]);
      }));
      Promise.all([fonts, tex]).then(() => { label.destroy(); this.scene.start('Title'); });
    }
  }

  class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }
    create() {
      this.W = World.build(this);
      this.decor = [];
      const mk = (type, variant, x, y) => this.decor.push(new World.AnimalView(this, { id: this.decor.length, type, variant, x, y, cleanliness: 100, health: 100 }, { decor: true }));
      mk('cow', 'holstein', 300, 600); mk('cow', 'brown', 480, 720);
      mk('chicken', 'white', 1150, 620); mk('chicken', 'brown', 1300, 700); mk('chicken', 'white', 1080, 760);
      const farmer = this.add.image(800, 430, 'farmer_0').setOrigin(0.5, 1).setDepth(470);
      this.tweens.add({ targets: farmer, scaleY: 1.03, duration: 900, yoyo: true, repeat: -1 });

      this.add.rectangle(0, 0, 1600, 900, 0x1b2a10, 0.18).setOrigin(0).setDepth(9500);
      const title = text(this, 800, 150, 'Sunny Acres', 120, '#fff6d8', {
        fontStyle: '700', stroke: '#5e3a1f', strokeThickness: 14,
        shadow: { offsetX: 0, offsetY: 8, color: '#3b2716', blur: 0, fill: true, stroke: true },
      }).setOrigin(0.5).setDepth(9600);
      this.tweens.add({ targets: title, y: 162, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      text(this, 800, 262, 'Raise cows and chickens. Sell milk and eggs. Grow your farm.', 28, '#ffffff', { stroke: '#3b2716', strokeThickness: 6 })
        .setOrigin(0.5).setDepth(9600);

      const start = (fresh) => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Farm', { newGame: fresh }));
      };
      let y = 560;
      if (Farm.hasSave()) {
        button(this, 800, y, 320, 78, { label: 'Continue', icon: 'icon_sun', color: C.green, size: 32, onClick: () => start(false) }).setDepth(9600);
        y += 100;
      }
      button(this, 800, y, 320, 78, { label: 'New Farm', icon: 'icon_up', color: 0xffa53c, size: 32, onClick: () => start(true) }).setDepth(9600);
      text(this, 800, 870, 'Tip: press M to mute', 18, '#ffffff', { stroke: '#3b2716', strokeThickness: 4 }).setOrigin(0.5).setDepth(9600);
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }
    update(time, delta) {
      const dt = delta / 1000;
      this.decor.forEach((a) => a.update(dt));
      World.applyLight(this.W, 600, time, dt);
    }
  }

  class FarmScene extends Phaser.Scene {
    constructor() { super('Farm'); }
    init(data) { this.fresh = !!(data && data.newGame); }

    create() {
      if (this.fresh || !Farm.load()) Farm.newGame();
      this.paused = false;
      this.sleeping = false;
      this.W = World.build(this);

      // clicking open ground walks the farmer there
      const ground = this.add.zone(0, 0, 1600, 900).setOrigin(0).setDepth(-999).setInteractive();
      ground.on('pointerdown', (p) => {
        if (this.ui.menu) { this.ui.closeMenu(); return; }
        if (this.ui.blocking()) return;
        this.farmer.walkTo(p.worldX, p.worldY);
        this.marker(p.worldX, Math.max(p.worldY, 280));
      });

      this.farmer = new World.Farmer(this, 800, 380);
      this.animals = new Map();
      Farm.state.animals.forEach((a) => this.addAnimal(a));
      this.eggs = new Map();
      this.syncEggs();

      this.clickable(this.W.trough, () => this.feedAll('cow', this.W.trough));
      this.clickable(this.W.feeder, () => this.feedAll('chicken', this.W.feeder));
      this.clickable(this.W.cart, () => this.goSell());
      this.clickable(this.W.coop, () => this.collectAllEggs());
      this.clickable(this.W.house, () => this.ui.confirmSleep());

      this.onChange = () => this.refreshProps();
      Farm.on('change', this.onChange);
      this.events.once('shutdown', () => Farm.off('change', this.onChange));
      this.refreshProps();

      this.scene.launch('UI');
      this.ui = this.scene.get('UI');
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    clickable(img, fn) {
      img.setInteractive({ useHandCursor: true });
      img.on('pointerover', () => img.setTint(0xfff2c8));
      img.on('pointerout', () => img.clearTint());
      img.on('pointerdown', (p, lx, ly, ev) => {
        if (this.ui.menu) this.ui.closeMenu();
        if (this.ui.blocking()) return;
        ev.stopPropagation();
        fn();
      });
    }

    marker(x, y) {
      const m = this.add.ellipse(x, y, 34, 14).setStrokeStyle(3, 0xffffff, 0.9).setDepth(y - 1);
      this.tweens.add({ targets: m, scale: 0.3, alpha: 0, duration: 450, onComplete: () => m.destroy() });
    }

    addAnimal(a, pop) {
      const v = new World.AnimalView(this, a);
      v.body.on('pointerdown', (p, lx, ly, ev) => {
        ev.stopPropagation();
        if (this.ui.blocking() || this.sleeping) return;
        this.ui.openMenu(v);
      });
      this.animals.set(a.id, v);
      if (pop) {
        v.pop();
        this.burst(a.x, a.y - 30, 'puff', 8, 0.5);
      }
      return v;
    }

    syncEggs() {
      const live = new Set(Farm.state.eggs.map((e) => e.id));
      for (const [id, s] of this.eggs) if (!live.has(id)) { s.destroy(); this.eggs.delete(id); }
      for (const e of Farm.state.eggs) {
        if (this.eggs.has(e.id)) continue;
        const s = this.add.image(e.x, e.y, 'egg').setOrigin(0.5, 1).setDepth(e.y).setInteractive({ useHandCursor: true });
        s.setScale(0);
        this.tweens.add({ targets: s, scale: 1, duration: 400, ease: 'Back.out', delay: Math.random() * 400 });
        this.tweens.add({ targets: s, angle: { from: -6, to: 6 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        s.on('pointerdown', (p, lx, ly, ev) => {
          ev.stopPropagation();
          if (this.ui.menu) this.ui.closeMenu();
          if (this.ui.blocking()) return;
          this.farmer.walkTo(e.x - 30, e.y + 4, () => this.pickEgg(e.id));
        });
        this.eggs.set(e.id, s);
      }
    }

    pickEgg(id) {
      const s = this.eggs.get(id);
      if (!s) return;
      const res = Farm.collectEgg(id);
      if (!res.ok) { if (res.msg) this.ui.toast(res.msg, true); return; }
      this.eggs.delete(id);
      Sound.play('pop');
      this.ui.flyTo('icon_egg', s.x, s.y - 14, 'eggs');
      s.destroy();
    }

    refreshProps() {
      const st = Farm.state;
      const avg = (type) => {
        const list = st.animals.filter((a) => a.type === type);
        return list.length ? list.reduce((t, a) => t + a.hunger, 0) / list.length : 100;
      };
      this.W.trough.setTexture(avg('cow') < 35 ? 'trough_full' : 'trough_empty');
      this.W.feeder.setTexture(avg('chicken') < 35 ? 'feeder_full' : 'feeder_empty');
    }

    // ------------------------------------------------------------ actions
    performAction(kind, id) {
      const v = this.animals.get(id);
      if (!v || this.farmer.busy) return;
      const a = v.d;
      v.hold = true;
      const off = a.type === 'cow' ? 92 : 48;
      const side = this.farmer.x < a.x ? -1 : 1;
      this.farmer.walkTo(a.x + side * off, a.y + 3, () => {
        this.farmer.face(a.x);
        this.farmer.work(() => {
          v.hold = false;
          const res = kind === 'eggs' ? this.collectAllEggs() : Farm[kind](id);
          if (kind !== 'eggs') this.feedback(kind, res, v);
        });
      });
    }

    feedback(kind, res, v) {
      if (!res.ok) { this.ui.toast(res.msg, true); return; }
      const a = v.d;
      const top = a.y - v.body.height + 10;
      if (kind === 'feed') {
        this.arc(res.item === 'hay' ? 'icon_hay' : 'icon_grain', this.farmer.x, this.farmer.y - 60, a.x, a.y - 30);
        this.tweens.add({ targets: v.body, scaleY: 0.92, duration: 120, yoyo: true, repeat: 3, delay: 350 });
        Sound.play(a.type === 'cow' ? 'moo' : 'cluck');
      } else if (kind === 'clean') {
        this.burst(a.x, a.y - 30, 'sparkle', 10, 0.9);
        this.burst(a.x, a.y - 20, 'dot', 12, 1);
        Sound.play('good');
      } else if (kind === 'milk') {
        const b = this.add.image(a.x, a.y - 10, 'icon_bucket').setDepth(5000);
        this.tweens.add({ targets: b, y: a.y - 70, duration: 300, ease: 'Back.out', onComplete: () => { b.destroy(); this.ui.flyTo('icon_milk', a.x, a.y - 70, 'milk'); } });
        Sound.play('moo');
      } else if (kind === 'pet') {
        this.burst(a.x, top, 'icon_heart', 6, 0.6, true);
        Sound.play('pop');
      } else if (kind === 'vet') {
        this.burst(a.x, a.y - 30, 'icon_cross', 5, 0.6, true);
        Sound.play('good');
      }
      this.floatText(a.x, top - 10, res.msg, kind === 'milk' ? '#4b8fe2' : '#ffffff');
    }

    feedAll(type, prop) {
      if (this.farmer.busy) return;
      this.farmer.walkTo(prop.x - 70, prop.y + 8, () => {
        this.farmer.face(prop.x);
        this.farmer.work(() => {
          const res = Farm.feedAll(type);
          if (!res.ok) { this.ui.toast(res.msg, true); return; }
          this.arc(res.item === 'hay' ? 'icon_hay' : 'icon_grain', this.farmer.x, this.farmer.y - 60, prop.x, prop.y - 25);
          this.burst(prop.x, prop.y - 20, 'puff', 6, 0.35);
          this.floatText(prop.x, prop.y - 70, res.msg, '#ffffff');
          Sound.play(type === 'cow' ? 'moo' : 'cluck');
        });
      });
    }

    collectAllEggs() {
      const eggs = Farm.state.eggs.slice();
      if (!eggs.length) { this.ui.toast('No eggs right now. Check back tomorrow'); return { ok: false }; }
      this.farmer.walkTo(1300, 600, () => {
        eggs.forEach((e, i) => this.time.delayedCall(i * 140, () => this.pickEgg(e.id)));
      });
      return { ok: true };
    }

    goSell() {
      if (this.farmer.busy) return;
      this.farmer.walkTo(760, 872, () => {
        this.farmer.face(870);
        const res = Farm.sellAll();
        if (!res.ok) { this.ui.toast(res.msg, true); return; }
        Sound.play('coin');
        const n = Math.min(12, Math.ceil(res.total / 20));
        for (let i = 0; i < n; i++) this.time.delayedCall(i * 70, () => this.ui.flyTo('icon_coin', 870 + Phaser.Math.Between(-40, 40), 760, 'coins'));
        this.floatText(870, 690, `+${res.total} coins`, '#ffd23f');
      });
    }

    // ------------------------------------------------------------ fx
    floatText(x, y, str, color) {
      const t = text(this, x, y, str, 26, color, { stroke: '#3b2716', strokeThickness: 6 }).setOrigin(0.5).setDepth(9800);
      this.tweens.add({ targets: t, y: y - 50, alpha: { from: 1, to: 0 }, duration: 1300, ease: 'Cubic.out', onComplete: () => t.destroy() });
    }
    burst(x, y, key, n, scale = 1, rise = false) {
      for (let i = 0; i < n; i++) {
        const p = this.add.image(x, y, key).setDepth(9700).setScale(scale * 0.3);
        const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const r = Phaser.Math.Between(30, 70);
        this.tweens.add({
          targets: p, x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r * 0.6 - (rise ? 50 : 0),
          scale, alpha: 0, angle: Phaser.Math.Between(-60, 60), duration: Phaser.Math.Between(600, 900), ease: 'Cubic.out',
          onComplete: () => p.destroy(),
        });
      }
    }
    arc(key, x1, y1, x2, y2) {
      const p = this.add.image(x1, y1, key).setDepth(9700);
      const curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x1, y1), new Phaser.Math.Vector2((x1 + x2) / 2, Math.min(y1, y2) - 80), new Phaser.Math.Vector2(x2, y2));
      const o = { t: 0 };
      this.tweens.add({
        targets: o, t: 1, duration: 450, ease: 'Sine.in',
        onUpdate: () => { const pt = curve.getPoint(o.t); p.setPosition(pt.x, pt.y); p.angle += 8; },
        onComplete: () => { p.destroy(); this.burst(x2, y2, 'puff', 5, 0.3); },
      });
    }

    // ------------------------------------------------------------ sleep
    goToSleep(forced) {
      if (this.sleeping) return;
      this.sleeping = true;
      this.ui.closeMenu();
      const go = () => {
        this.cameras.main.fadeOut(900, 10, 14, 40);
        this.ui.cameras.main.fadeOut(900, 10, 14, 40);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          const summary = Farm.sleep();
          this.syncEggs();
          this.farmer.sprite.setPosition(800, 340);
          this.refreshProps();
          this.time.delayedCall(500, () => {
            this.cameras.main.fadeIn(800, 10, 14, 40);
            this.ui.cameras.main.fadeIn(800, 10, 14, 40);
            this.sleeping = false;
            this.ui.showMorning(summary, forced);
          });
        });
      };
      if (forced) go();
      else this.farmer.walkTo(800, 318, go);
    }

    update(time, delta) {
      const dt = Math.min(delta / 1000, 0.1);
      if (!this.paused && !this.sleeping) {
        if (Farm.tick(dt) === 'night') { this.ui.toast('It is late. You fell asleep in the field', true); this.goToSleep(true); }
      }
      this.farmer.update(dt);
      this.animals.forEach((v) => v.update(dt));
      World.applyLight(this.W, Farm.state.minutes, time, dt);
    }
  }

  window.BootScene = BootScene;
  window.TitleScene = TitleScene;
  window.FarmScene = FarmScene;
})();
