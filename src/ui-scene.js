// HUD, animal care menu, shop, toasts and dialogs. Runs on top of the Farm scene.
(function () {
  const { text, panel, button, bar, levelColor, C } = UI;

  class UIScene extends Phaser.Scene {
    constructor() { super('UI'); }

    create() {
      this.farm = this.scene.get('Farm');
      this.menu = null;
      this.modal = null;
      this.toasts = [];
      this.buildHud();
      this.onChange = () => this.refreshHud();
      Farm.on('change', this.onChange);
      this.events.once('shutdown', () => Farm.off('change', this.onChange));
      this.refreshHud(true);

      this.input.keyboard.on('keydown-ESC', () => { this.closeMenu(); this.closeModal(); });
      this.input.keyboard.on('keydown-M', () => { Sound.muted = !Sound.muted; this.toast(Sound.muted ? 'Sound off' : 'Sound on'); });

      if (Farm.state.day === 1 && Farm.state.minutes < 380) {
        const tips = ['Click an animal to feed, clean or pet it', 'Click the trough or feeder to feed everyone at once',
          'Pick up eggs and sell them at the market cart', 'Save up 500 coins for your first cow'];
        tips.forEach((t, i) => this.time.delayedCall(800 + i * 2600, () => this.toast(t)));
      }
    }

    blocking() { return !!this.modal; }

    // ------------------------------------------------------------ HUD
    buildHud() {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.25).fillRoundedRect(12, 14, 1576, 66, 22);
      g.fillStyle(0x5e3a1f, 1).fillRoundedRect(10, 8, 1580, 66, 22);
      g.fillStyle(0x8a5a33, 1).fillRoundedRect(14, 10, 1572, 58, 19);
      g.fillStyle(0xa86d3e, 1).fillRoundedRect(20, 13, 1560, 14, 7);

      const pill = (x, w) => {
        g.fillStyle(0x3b2716, 1).fillRoundedRect(x - 2, 17, w + 4, 48, 22);
        g.fillStyle(C.cream, 1).fillRoundedRect(x, 19, w, 44, 20);
      };
      this.chips = {};
      // coins
      pill(26, 170);
      this.add.image(52, 41, 'icon_coin').setDisplaySize(36, 36);
      this.coinText = text(this, 78, 41, '0', 26).setOrigin(0, 0.5);
      this.chips.coins = { x: 52, y: 41, target: this.coinText };
      this.coinShown = Farm.state.coins;
      // day + clock
      pill(208, 230);
      this.dayIcon = this.add.image(234, 41, 'icon_sun').setDisplaySize(34, 34);
      this.dayText = text(this, 258, 41, '', 24).setOrigin(0, 0.5);
      // energy
      pill(450, 250);
      this.add.image(474, 41, 'icon_bolt').setDisplaySize(32, 32);
      const ec = this.add.container(0, 0);
      this.energyBar = bar(this, ec, 496, 33, 140, 16, levelColor);
      this.energyText = text(this, 648, 41, '', 20).setOrigin(0, 0.5);
      // inventory
      const inv = [['hay', 'icon_hay'], ['grain', 'icon_grain'], ['milk', 'icon_milk'], ['eggs', 'icon_egg']];
      this.invText = {};
      inv.forEach(([k, icon], i) => {
        const x = 716 + i * 118;
        pill(x, 106);
        const ic = this.add.image(x + 26, 41, icon).setDisplaySize(32, 32);
        this.invText[k] = text(this, x + 50, 41, '0', 24).setOrigin(0, 0.5);
        this.chips[k] = { x: x + 26, y: 41, target: ic };
      });
      // buttons
      button(this, 1236, 40, 118, 50, { label: 'Shop', icon: 'icon_shop', color: 0xffa53c, size: 21, onClick: () => this.openShop() });
      button(this, 1362, 40, 118, 50, { label: 'Sell', icon: 'icon_coin', color: C.green, size: 21, onClick: () => { this.closeMenu(); this.farm.goSell(); } });
      button(this, 1500, 40, 132, 50, { label: 'Sleep', icon: 'icon_bed', color: C.blue, size: 21, onClick: () => this.confirmSleep() });
    }

    refreshHud(instant) {
      const s = Farm.state;
      for (const k of Object.keys(this.invText)) this.invText[k].setText(s.inventory[k]);
      if (instant) this.coinShown = s.coins;
    }

    bump(key) {
      const chip = this.chips[key];
      if (!chip) return;
      this.tweens.add({ targets: chip.target, scale: chip.target.scale * 1.25, duration: 90, yoyo: true });
    }

    flyTo(icon, x, y, key) {
      const chip = this.chips[key];
      const p = this.add.image(x, y, icon).setDisplaySize(34, 34).setDepth(100);
      const o = { t: 0 };
      const c = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x, y), new Phaser.Math.Vector2(x + (chip.x - x) * 0.2, y - 160), new Phaser.Math.Vector2(chip.x, chip.y));
      this.tweens.add({
        targets: o, t: 1, duration: 650, ease: 'Sine.in',
        onUpdate: () => { const pt = c.getPoint(o.t); p.setPosition(pt.x, pt.y); },
        onComplete: () => { p.destroy(); this.bump(key); if (key === 'coins') Sound.play('pop'); },
      });
    }

    update(time, delta) {
      const s = Farm.state;
      if (!s) return;
      // count coins up smoothly
      if (this.coinShown !== s.coins) {
        const diff = s.coins - this.coinShown;
        this.coinShown += Math.sign(diff) * Math.max(1, Math.ceil(Math.abs(diff) * 0.08));
        if (Math.abs(s.coins - this.coinShown) < 1) this.coinShown = s.coins;
      }
      this.coinText.setText(Math.round(this.coinShown).toLocaleString());
      const night = s.minutes >= 19 * 60;
      this.dayIcon.setTexture(night ? 'icon_moon' : 'icon_sun');
      this.dayText.setText(`Day ${s.day}   ${Farm.clock()}`);
      this.energyBar(s.energy);
      this.energyText.setText(Math.round(s.energy));
      if (this.menu) this.updateMenu();
    }

    // ------------------------------------------------------------ toasts
    toast(msg, bad) {
      if (!msg) return;
      if (bad) Sound.play('bad');
      const c = this.add.container(800, 846).setDepth(200);
      const t = text(this, 0, 0, msg, 22, '#ffffff').setOrigin(0.5);
      const w = t.width + 50;
      const g = this.add.graphics();
      g.fillStyle(bad ? 0x9e2f26 : 0x3b2716, 0.9).fillRoundedRect(-w / 2, -24, w, 48, 24);
      if (bad) g.lineStyle(3, 0xffb4a8, 1).strokeRoundedRect(-w / 2, -24, w, 48, 24);
      c.add([g, t]);
      this.toasts.forEach((o) => this.tweens.add({ targets: o, y: o.y - 56, duration: 200 }));
      this.toasts.unshift(c);
      c.setAlpha(0).setScale(0.8);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 220, ease: 'Back.out' });
      this.time.delayedCall(2300, () => this.tweens.add({
        targets: c, alpha: 0, duration: 300, onComplete: () => { this.toasts = this.toasts.filter((o) => o !== c); c.destroy(); },
      }));
      if (this.toasts.length > 3) { const old = this.toasts.pop(); this.tweens.add({ targets: old, alpha: 0, duration: 150 }); }
    }

    // ------------------------------------------------------------ animal menu
    openMenu(view) {
      this.closeMenu();
      const a = view.d;
      const W = 320, H = a.health < 100 ? 322 : 292;
      view.hold = true;
      const c = this.add.container(0, 0).setDepth(50);
      this.menu = { view, c, W, H };
      c.add(panel(this, -W / 2, -H, W, H, { radius: 20 }));
      const tail = this.add.graphics();
      tail.fillStyle(C.wood, 1).fillTriangle(-16, -8, 16, -8, 0, 14);
      tail.fillStyle(C.cream, 1).fillTriangle(-9, -10, 9, -10, 0, 4);
      c.add(tail);
      this.menu.tail = tail;

      c.add(this.add.image(-W / 2 + 46, -H + 50, `${a.type}_${a.variant}_0`).setScale(a.type === 'cow' ? 0.42 : 0.8));
      c.add(text(this, -W / 2 + 92, -H + 30, a.name, 26, C.ink, { fontStyle: '700' }));
      c.add(text(this, -W / 2 + 93, -H + 60, Farm.CFG.animals[a.type].label, 16, '#8a5a33'));
      const close = this.add.image(W / 2 - 26, -H + 26, 'icon_close').setScale(0.8).setInteractive({ useHandCursor: true });
      close.on('pointerup', () => this.closeMenu());
      c.add(close);

      const rows = [['Food', 'icon_' + Farm.CFG.animals[a.type].feed], ['Clean', 'icon_drop'], ['Happy', 'icon_heart']];
      if (a.health < 100) rows.push(['Health', 'icon_cross']);
      this.menu.bars = rows.map(([label, icon], i) => {
        const y = -H + 98 + i * 30;
        c.add(this.add.image(-W / 2 + 34, y, icon).setDisplaySize(22, 22));
        c.add(text(this, -W / 2 + 52, y, label, 17).setOrigin(0, 0.5));
        return bar(this, c, -W / 2 + 120, y - 7, W - 160, 14, levelColor);
      });

      const isCow = a.type === 'cow';
      const sick = a.health <= 0;
      const btns = [
        { label: 'Feed', icon: 'icon_' + Farm.CFG.animals[a.type].feed, color: C.green, act: 'feed' },
        { label: 'Clean', icon: 'icon_brush', color: C.blue, act: 'clean' },
        isCow ? { label: 'Milk', icon: 'icon_bucket', color: 0xffa53c, act: 'milk' } : { label: 'Eggs', icon: 'icon_egg', color: 0xffa53c, act: 'eggs' },
        sick ? { label: `Vet ${Farm.CFG.vetCost}`, icon: 'icon_cross', color: C.red, act: 'vet' } : { label: 'Pet', icon: 'icon_heart', color: 0xff6f91, act: 'pet' },
      ];
      this.menu.buttons = btns.map((b, i) => {
        const bx = (i % 2 === 0 ? -1 : 1) * 72;
        const by = -92 + Math.floor(i / 2) * 52;
        const btn = button(this, bx, by, 136, 46, {
          label: b.label, icon: b.icon, color: b.color, size: 19,
          onClick: () => {
            this.closeMenu();
            if (b.act === 'eggs') this.farm.collectAllEggs();
            else this.farm.performAction(b.act, a.id);
          },
        });
        btn.act = b.act;
        c.add(btn);
        return btn;
      });
      this.positionMenu();
      c.setScale(0.6).setAlpha(0);
      this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 260, ease: 'Back.out' });
      Sound.play(isCow ? 'moo' : 'cluck');
    }

    positionMenu() {
      const { view, c, W, H, tail } = this.menu;
      const a = view.d;
      const top = a.y - view.body.height - 8;
      let x = Phaser.Math.Clamp(a.x, W / 2 + 10, 1600 - W / 2 - 10);
      let y = top;
      let below = false;
      if (y - H < 90) { y = a.y + 20 + H; below = true; }
      if (y > 890) y = 890;
      c.setPosition(x, y);
      tail.setVisible(!below);
      tail.x = Phaser.Math.Clamp(a.x - x, -W / 2 + 30, W / 2 - 30);
    }

    updateMenu() {
      const { view, bars, buttons } = this.menu;
      const a = view.d;
      if (!Farm.find(a.id)) { this.closeMenu(); return; }
      bars[0](100 - a.hunger);
      bars[1](a.cleanliness);
      bars[2](Farm.happiness(a));
      if (bars[3]) bars[3](a.health);
      for (const b of buttons) {
        let on = true;
        if (b.act === 'milk') on = a.product > 0;
        if (b.act === 'eggs') on = Farm.state.eggs.length > 0;
        if (b.act === 'feed') on = Farm.state.inventory[Farm.CFG.animals[a.type].feed] > 0;
        if (b.enabled !== on) b.setEnabled(on);
      }
    }

    closeMenu() {
      if (!this.menu) return;
      const { c, view } = this.menu;
      view.hold = false; // performAction re-applies hold if an action was chosen
      this.menu = null;
      this.tweens.add({ targets: c, scale: 0.7, alpha: 0, duration: 140, onComplete: () => c.destroy() });
    }

    // ------------------------------------------------------------ modals
    openModal(w, h, title) {
      this.closeMenu();
      this.closeModal(true);
      this.farm.paused = true;
      const blocker = this.add.rectangle(0, 0, 1600, 900, 0x1a1208, 0.5).setOrigin(0).setDepth(300).setInteractive();
      const c = this.add.container(800, 470).setDepth(301);
      c.add(panel(this, -w / 2, -h / 2, w, h, { radius: 28 }));
      if (title) {
        const rg = this.add.graphics();
        const rw = Math.max(280, title.length * 22 + 80);
        rg.fillStyle(0x000000, 0.2).fillRoundedRect(-rw / 2 + 3, -h / 2 - 30, rw, 62, 18);
        rg.fillStyle(0xa8332b, 1).fillTriangle(-rw / 2 - 30, -h / 2 + 12, -rw / 2 + 10, -h / 2 - 22, -rw / 2 + 10, -h / 2 + 34);
        rg.fillStyle(0xa8332b, 1).fillTriangle(rw / 2 + 30, -h / 2 + 12, rw / 2 - 10, -h / 2 - 22, rw / 2 - 10, -h / 2 + 34);
        rg.fillStyle(0xe2483d, 1).fillRoundedRect(-rw / 2, -h / 2 - 34, rw, 62, 18);
        rg.lineStyle(4, 0x3b2716, 1).strokeRoundedRect(-rw / 2, -h / 2 - 34, rw, 62, 18);
        c.add(rg);
        c.add(text(this, 0, -h / 2 - 4, title, 34, '#ffffff', { fontStyle: '700', stroke: '#3b2716', strokeThickness: 6 }).setOrigin(0.5));
      }
      c.setScale(0.7).setAlpha(0);
      this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
      this.modal = { blocker, c, w, h };
      return c;
    }

    closeModal(instant) {
      if (!this.modal) return;
      const { blocker, c } = this.modal;
      this.modal = null;
      this.farm.paused = false;
      if (instant) { blocker.destroy(); c.destroy(); return; }
      this.tweens.add({ targets: [c, blocker], alpha: 0, duration: 160, onComplete: () => { blocker.destroy(); c.destroy(); } });
    }

    closeButton(c, w, h) {
      const x = this.add.image(w / 2 - 28, -h / 2 + 28, 'icon_close').setInteractive({ useHandCursor: true });
      x.on('pointerup', () => { Sound.play('click'); this.closeModal(); });
      c.add(x);
    }

    openShop() {
      const w = 1040, h = 640;
      const c = this.openModal(w, h, 'Farm Shop');
      this.closeButton(c, w, h);
      const list = Farm.shopList();
      list.forEach((it, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const cx = -320 + col * 320, cy = -110 + row * 270;
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.12).fillRoundedRect(cx - 145, cy - 112 + 5, 290, 250, 18);
        g.fillStyle(0xffffff, 0.7).fillRoundedRect(cx - 145, cy - 112, 290, 250, 18);
        g.lineStyle(3, 0xd9b77e, 1).strokeRoundedRect(cx - 145, cy - 112, 290, 250, 18);
        c.add(g);
        const img = this.add.image(cx, cy - 40, it.icon);
        const maxH = it.kind === 'item' ? 70 : 100;
        img.setScale(Math.min(maxH / img.height, 200 / img.width));
        c.add(img);
        c.add(text(this, cx, cy + 30, it.label, 24, C.ink, { fontStyle: '700' }).setOrigin(0.5));
        c.add(text(this, cx, cy + 56, `${it.desc}  ·  ${it.sub}`, 16, '#8a5a33').setOrigin(0.5));
        const b = button(this, cx, cy + 100, 180, 48, {
          label: it.disabled === 'Maxed' ? 'Maxed' : String(it.price), icon: it.disabled === 'Maxed' ? null : 'icon_coin', color: C.green, size: 22,
          onClick: () => {
            const res = Farm.buy(it.id);
            if (!res.ok) { this.toast(res.msg, true); return; }
            Sound.play('coin');
            this.toast(res.msg);
            if (res.animal) this.farm.addAnimal(res.animal, true);
            this.openShop();
          },
        });
        if (it.disabled) { b.setEnabled(false); if (it.disabled === 'No space') c.add(text(this, cx + 100, cy - 100, 'Full', 15, '#b0402f', { fontStyle: '700' }).setOrigin(0.5, 0)); }
        c.add(b);
      });
    }

    confirmSleep() {
      if (this.farm.sleeping) return;
      const w = 520, h = 260;
      const c = this.openModal(w, h, 'Bedtime?');
      c.add(text(this, 0, -30, 'End the day and go to sleep?\nAnimals produce overnight.', 24, C.ink, { align: 'center' }).setOrigin(0.5));
      c.add(button(this, -110, 70, 180, 56, { label: 'Not yet', color: 0xb9ad9a, onClick: () => this.closeModal() }));
      c.add(button(this, 110, 70, 180, 56, { label: 'Sleep', icon: 'icon_bed', color: C.blue, onClick: () => { this.closeModal(); this.farm.goToSleep(false); } }));
    }

    showMorning(sum, forced) {
      const lines = [];
      if (forced) lines.push(['icon_bolt', 'You stayed up too late and passed out']);
      lines.push(['icon_egg', `${sum.eggs} egg${sum.eggs === 1 ? '' : 's'} laid overnight`]);
      if (Farm.count('cow')) lines.push(['icon_milk', `${sum.milk} milk ready in the barn`]);
      if (sum.spoiled) lines.push(['icon_egg', `${sum.spoiled} old egg${sum.spoiled > 1 ? 's' : ''} spoiled`]);
      if (sum.unhappy.length) lines.push(['icon_heart', `Not producing: ${sum.unhappy.slice(0, 3).join(', ')}${sum.unhappy.length > 3 ? '...' : ''}`]);
      if (sum.sick.length) lines.push(['icon_cross', `Sick: ${sum.sick.slice(0, 3).join(', ')}. Call the vet`]);
      const w = 600, h = 200 + lines.length * 46;
      const c = this.openModal(w, h, `Day ${sum.day}`);
      c.add(text(this, 0, -h / 2 + 62, 'Good morning!', 30, C.ink, { fontStyle: '700' }).setOrigin(0.5));
      lines.forEach(([icon, str], i) => {
        const y = -h / 2 + 116 + i * 46;
        c.add(this.add.image(-w / 2 + 70, y, icon).setDisplaySize(32, 32));
        c.add(text(this, -w / 2 + 100, y, str, 22).setOrigin(0, 0.5));
      });
      c.add(button(this, 0, h / 2 - 50, 220, 58, { label: "Let's go!", icon: 'icon_sun', color: C.green, onClick: () => this.closeModal() }));
      Sound.play('good');
    }
  }

  window.UIScene = UIScene;
})();
