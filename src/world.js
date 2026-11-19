// Scenery, ambient life, the farmer and animal views. Shared by the title and farm scenes.
(function () {
  const clamp = Phaser.Math.Clamp;

  // ---------------------------------------------------------------- fences
  function post(g, x, y) {
    g.fillStyle(0x3b2716, 1).fillRoundedRect(x - 5, y - 38, 10, 40, 3);
    g.fillStyle(0xa86b3a, 1).fillRoundedRect(x - 3, y - 36, 6, 36, 2);
    g.fillStyle(0xc98a50, 1).fillRect(x - 3, y - 36, 2, 34);
  }
  function rail(g, x1, y1, x2, y2) {
    g.lineStyle(8, 0x3b2716, 1).lineBetween(x1, y1, x2, y2);
    g.lineStyle(4, 0xc08348, 1).lineBetween(x1, y1, x2, y2);
  }
  // Fences are drawn once into cached textures (cheap to render, still depth-sorted per segment)
  function fenceH(scene, x1, x2, y) {
    const len = x2 - x1, key = `fenceH_${len}`;
    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ add: false });
      rail(g, 5, 12, len + 5, 12);
      rail(g, 5, 26, len + 5, 26);
      for (let x = 0; x <= len + 1; x += 42) post(g, x + 5, 40);
      post(g, len + 5, 40);
      g.generateTexture(key, len + 10, 44);
      g.destroy();
    }
    scene.add.image(x1 - 5, y - 40, key).setOrigin(0).setDepth(y);
  }
  function fenceV(scene, x, y1, y2) {
    const ys = [];
    for (let y = y1; y < y2; y += 36) ys.push(y);
    ys.push(y2);
    for (let i = 1; i < ys.length; i++) {
      const dy = ys[i] - ys[i - 1], first = i === 1, key = `fenceV_${dy}_${first ? 1 : 0}`;
      if (!scene.textures.exists(key)) {
        const g = scene.make.graphics({ add: false });
        rail(g, 7, 12, 7, dy + 12);
        rail(g, 7, 26, 7, dy + 26);
        post(g, 7, dy + 40);
        if (first) post(g, 7, 40);
        g.generateTexture(key, 14, dy + 44);
        g.destroy();
      }
      scene.add.image(x - 7, ys[i - 1] - 40, key).setOrigin(0).setDepth(ys[i]);
    }
  }

  // ---------------------------------------------------------------- scenery
  function build(scene) {
    const W = {};
    scene.add.image(0, 0, 'bg').setOrigin(0).setDepth(-1000);

    W.sun = scene.add.image(1470, 100, 'sun').setDepth(-990);
    scene.tweens.add({ targets: W.sun, angle: 360, duration: 60000, repeat: -1 });
    scene.tweens.add({ targets: W.sun, scale: 1.06, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    for (let i = 0; i < 5; i++) {
      const c = scene.add.image(Phaser.Math.Between(-100, 1600), Phaser.Math.Between(50, 160), 'cloud')
        .setDepth(-980).setScale(Phaser.Math.FloatBetween(0.6, 1.1)).setAlpha(0.95);
      const drift = () => {
        const d = ((1800 - c.x) / 1900) * Phaser.Math.Between(70000, 110000);
        scene.tweens.add({ targets: c, x: 1800, duration: d, onComplete: () => { c.x = -200; c.y = Phaser.Math.Between(50, 160); drift(); } });
      };
      drift();
    }

    const prop = (x, y, key, opts = {}) => {
      const img = scene.add.image(x, y, key).setOrigin(0.5, 1).setDepth(opts.depth ?? y);
      if (opts.scale) img.setScale(opts.scale);
      if (opts.flip) img.setFlipX(true);
      return img;
    };

    // fences: cow pen (left) and chicken run (right), with gates facing the path
    fenceH(scene, 70, 700, 382);
    fenceH(scene, 70, 700, 852);
    fenceV(scene, 70, 382, 852);
    fenceV(scene, 700, 382, 568);
    fenceV(scene, 700, 652, 852);
    fenceH(scene, 960, 1540, 402);
    fenceH(scene, 960, 1540, 852);
    fenceV(scene, 1540, 402, 852);
    fenceV(scene, 960, 402, 586);
    fenceV(scene, 960, 668, 852);

    W.house = prop(800, 312, 'house');
    W.houseGlow = prop(800, 312, 'house_glow', { depth: 313 }).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    W.barn = prop(240, 398, 'barn');
    W.coop = prop(1400, 458, 'coop');
    W.trough = prop(560, 440, 'trough_empty');
    W.feeder = prop(1080, 478, 'feeder_empty');
    W.cart = prop(870, 862, 'cart');
    prop(410, 400, 'hay');
    prop(452, 392, 'hay', { scale: 0.8 });
    prop(1190, 458, 'hay', { scale: 0.75 });

    prop(40, 392, 'tree');
    prop(1575, 420, 'tree_apple');
    prop(1020, 330, 'tree_apple', { scale: 0.85 });
    prop(330, 300, 'tree', { scale: 0.75 });
    prop(25, 905, 'tree');
    prop(1590, 905, 'tree', { flip: true });
    [[932, 352], [660, 362], [1560, 650], [22, 640], [700, 905], [1170, 352]].forEach(([x, y]) => prop(x, y, 'bush'));
    [[730, 480], [880, 530], [735, 770], [900, 700], [965, 345], [628, 330], [1240, 365], [395, 318]].forEach(([x, y]) => prop(x, y, 'flowers'));
    [[880, 430], [40, 520], [1240, 900]].forEach(([x, y]) => prop(x, y, 'rock'));

    // chimney smoke
    scene.time.addEvent({
      delay: 650, loop: true, callback: () => {
        const p = scene.add.image(852, 120, 'puff').setScale(0.35).setAlpha(0.7).setDepth(-500);
        scene.tweens.add({ targets: p, y: 40, x: 852 + Phaser.Math.Between(-10, 30), scale: 1.1, alpha: 0, duration: 2600, onComplete: () => p.destroy() });
      },
    });

    // butterflies
    for (let i = 0; i < 3; i++) {
      const b = scene.add.image(Phaser.Math.Between(200, 1400), Phaser.Math.Between(300, 800), 'bf_0').setDepth(2000);
      W.butterflies = W.butterflies || [];
      W.butterflies.push(b);
      scene.time.addEvent({ delay: 140 + i * 13, loop: true, callback: () => b.setTexture(b.texture.key === 'bf_0' ? 'bf_1' : 'bf_0') });
      const fly = () => scene.tweens.add({
        targets: b, x: Phaser.Math.Between(150, 1450), y: Phaser.Math.Between(280, 840),
        duration: Phaser.Math.Between(5000, 9000), ease: 'Sine.inOut', onComplete: fly,
      });
      fly();
    }

    // night: tint overlay + fireflies
    W.night = scene.add.rectangle(0, 0, 1600, 900, 0x14204a, 0).setOrigin(0).setDepth(9000);
    W.fireflies = [];
    for (let i = 0; i < 18; i++) {
      const f = scene.add.image(Phaser.Math.Between(50, 1550), Phaser.Math.Between(300, 880), 'glow').setDepth(9001).setAlpha(0);
      f.phase = Math.random() * 10;
      f.vx = Phaser.Math.FloatBetween(-12, 12); f.vy = Phaser.Math.FloatBetween(-8, 8);
      W.fireflies.push(f);
    }
    return W;
  }

  // Lighting by time of day (minutes since midnight)
  function applyLight(W, m, time, dt) {
    let col = 0x14204a, a = 0;
    if (m < 420) { col = 0xff9a3c; a = 0.22 * (1 - (m - 360) / 60); }
    else if (m >= 1020 && m < 1140) { col = 0xff8a3c; a = 0.18 * ((m - 1020) / 120); }
    else if (m >= 1140) {
      const t = clamp((m - 1140) / 180, 0, 1);
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(0xff8a3c), Phaser.Display.Color.IntegerToColor(0x14204a), 1, t);
      col = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
      a = 0.2 + 0.42 * t;
    }
    W.night.setFillStyle(col, Math.max(0, a));
    const nf = clamp((m - 1110) / 120, 0, 1);
    W.houseGlow.setAlpha(nf);
    W.sun.setAlpha(1 - nf * 0.9);
    for (const f of W.fireflies) {
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 30 || f.x > 1570) f.vx *= -1;
      if (f.y < 280 || f.y > 890) f.vy *= -1;
      f.setAlpha(nf * (0.5 + 0.5 * Math.sin(time / 300 + f.phase)));
    }
  }

  // ---------------------------------------------------------------- farmer
  class Farmer {
    constructor(scene, x, y) {
      this.scene = scene;
      this.sprite = scene.add.image(x, y, 'farmer_0').setOrigin(0.5, 1);
      this.target = null;
      this.cb = null;
      this.t = 0;
      this.busy = false;
      this.speed = 260;
    }
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    walkTo(x, y, cb) {
      if (this.busy) return;
      this.target = { x: clamp(x, 20, 1580), y: clamp(y, 280, 888) };
      this.cb = cb || null;
    }
    face(x) { this.sprite.setFlipX(x < this.sprite.x); }
    work(done) {
      this.busy = true;
      this.sprite.setTexture('farmer_0');
      this.scene.tweens.add({
        targets: this.sprite, scaleY: 0.9, scaleX: 1.08, duration: 110, yoyo: true, repeat: 1,
        onComplete: () => { this.busy = false; done && done(); },
      });
    }
    update(dt) {
      const s = this.sprite;
      s.setDepth(s.y + 1);
      if (!this.target || this.busy) {
        if (!this.busy) { s.setTexture('farmer_0'); s.scaleY = 1 + Math.sin(this.scene.time.now / 400) * 0.012; }
        return;
      }
      const dx = this.target.x - s.x, dy = this.target.y - s.y;
      const d = Math.hypot(dx, dy);
      const step = this.speed * dt;
      if (d <= step) {
        s.setPosition(this.target.x, this.target.y);
        this.target = null;
        s.setTexture('farmer_0');
        const cb = this.cb; this.cb = null;
        cb && cb();
        return;
      }
      s.x += (dx / d) * step; s.y += (dy / d) * step;
      if (Math.abs(dx) > 2) s.setFlipX(dx < 0);
      this.t += dt;
      s.setTexture(Math.floor(this.t / 0.14) % 2 ? 'farmer_1' : 'farmer_2');
      s.scaleY = 1;
    }
  }

  // ---------------------------------------------------------------- animals
  const NEED_ICON = { sick: 'icon_cross', milk: 'icon_bucket', hungry: null, dirty: 'icon_drop' };

  class AnimalView {
    constructor(scene, data, opts = {}) {
      this.scene = scene;
      this.d = data;
      this.decor = !!opts.decor; // title screen animals: no needs, no input
      const key = (f) => `${data.type}_${data.variant}_${f}`;
      this.key = key;
      this.c = scene.add.container(data.x, data.y);
      this.body = scene.add.image(0, 0, key(0)).setOrigin(0.5, 1);
      this.dirt = scene.add.image(0, 0, `dirt_${data.type}`).setOrigin(0.5, 1).setAlpha(0);
      this.c.add([this.body, this.dirt]);
      const h = this.body.height;
      this.bubble = scene.add.container(0, -h + (data.type === 'cow' ? 18 : 4)).setScale(0);
      this.bubbleIcon = scene.add.image(0, -32, 'icon_drop').setScale(0.8);
      this.bubble.add([scene.add.image(0, 0, 'bubble').setOrigin(0.5, 1), this.bubbleIcon]);
      this.c.add(this.bubble);
      this.need = null;
      this.mode = 'idle';
      this.timer = Phaser.Math.FloatBetween(0.5, 3);
      this.t = Math.random() * 10;
      this.hold = false;
      this.pen = Farm.CFG.pens[data.type];
      this.speed = Farm.CFG.animals[data.type].speed;
      this.needTimer = 0;
      if (!this.decor) {
        this.body.setInteractive({ useHandCursor: true });
        this.body.on('pointerover', () => this.body.setTint(0xfff2c8));
        this.body.on('pointerout', () => this.refreshTint());
      }
    }
    refreshTint() {
      if (this.d.health <= 0) this.body.setTint(0xc9dba0);
      else this.body.clearTint();
    }
    pop() {
      this.c.setScale(0);
      this.scene.tweens.add({ targets: this.c, scale: 1, duration: 450, ease: 'Back.out' });
    }
    update(dt) {
      const d = this.d;
      this.t += dt;
      const happy = this.decor ? 80 : Farm.happiness(d);
      if (this.hold) {
        this.mode = 'idle';
        this.body.setTexture(this.key(0));
        this.body.y = 0;
      } else if (this.mode === 'idle') {
        this.timer -= dt;
        if (d.type === 'chicken') this.body.setTexture(this.key(Math.sin(this.t * 3 + d.id) > 0.6 ? 2 : 0));
        else this.body.setTexture(this.key(0));
        this.body.y = 0;
        if (this.timer <= 0) {
          this.mode = 'walk';
          const p = this.pen;
          this.tx = clamp(d.x + Phaser.Math.Between(-220, 220), p.x1, p.x2);
          this.ty = clamp(d.y + Phaser.Math.Between(-140, 140), p.y1, p.y2);
        }
      } else {
        const dx = this.tx - d.x, dy = this.ty - d.y;
        const dist = Math.hypot(dx, dy);
        const sp = this.speed * (d.health <= 0 ? 0.35 : 0.6 + (happy / 100) * 0.55) * dt;
        if (dist <= sp) {
          this.mode = 'idle';
          this.timer = Phaser.Math.FloatBetween(1.2, d.type === 'cow' ? 5 : 3);
        } else {
          d.x += (dx / dist) * sp; d.y += (dy / dist) * sp;
          if (Math.abs(dx) > 1) { this.body.setFlipX(dx < 0); this.dirt.setFlipX(dx < 0); }
          const rate = d.type === 'cow' ? 0.26 : 0.12;
          this.body.setTexture(this.key(Math.floor(this.t / rate) % 2 ? 1 : 2));
          this.body.y = -Math.abs(Math.sin(this.t * (d.type === 'cow' ? 12 : 22))) * (d.type === 'cow' ? 2 : 3);
        }
      }
      this.dirt.y = this.body.y;
      this.c.setPosition(d.x, d.y);
      this.c.setDepth(d.y);
      if (this.decor) return;

      this.dirt.setAlpha(clamp((72 - d.cleanliness) / 60, 0, 0.95));
      this.needTimer -= dt;
      if (this.needTimer <= 0) {
        this.needTimer = 0.4;
        this.refreshTint();
        const need = Farm.needs(d);
        if (need !== this.need) {
          this.need = need;
          this.scene.tweens.killTweensOf(this.bubble);
          if (need) {
            this.bubbleIcon.setTexture(NEED_ICON[need] || (d.type === 'cow' ? 'icon_hay' : 'icon_grain'));
            this.bubble.setScale(0);
            this.scene.tweens.add({ targets: this.bubble, scale: 1, duration: 300, ease: 'Back.out' });
          } else {
            this.scene.tweens.add({ targets: this.bubble, scale: 0, duration: 200 });
          }
        }
      }
      if (this.need) this.bubbleIcon.y = -32 + Math.sin(this.t * 4) * 2;
    }
    destroy() { this.c.destroy(); }
  }

  window.World = { build, applyLight, Farmer, AnimalView };
})();
