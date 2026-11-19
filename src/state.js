// Pure game logic. No Phaser in here, so rules can be tested or ported to another engine.
(function () {
  const CFG = {
    dayStart: 6 * 60,
    dayEnd: 22 * 60,
    minutesPerSecond: 6, // 1 real second = 6 game minutes -> a day lasts ~2.7 min
    startCoins: 300,
    maxEnergy: 100,
    vetCost: 80,
    animals: {
      cow: { label: 'Cow', price: 500, feed: 'hay', product: 'milk', speed: 34 },
      chicken: { label: 'Chicken', price: 50, feed: 'grain', product: 'eggs', speed: 62 },
    },
    sell: { milk: 40, eggs: 8 },
    energy: { feed: 4, clean: 8, milk: 6, collect: 1, pet: 2, feedAllBase: 3, feedAllEach: 2 },
    decayPerDay: { hunger: 45, cleanliness: 32 }, // spread over the waking hours
    overnight: { hunger: 15, cleanliness: 10 },
    eggSpoilDays: 2,
    pens: {
      cow: { x1: 110, x2: 660, y1: 420, y2: 820 },
      chicken: { x1: 1000, x2: 1495, y1: 470, y2: 820 },
    },
    eggZone: { x1: 1250, x2: 1490, y1: 480, y2: 590 },
    caps: { cow: 2, chicken: 6 },
    upgrades: {
      coop: { label: 'Bigger coop', type: 'chicken', add: 3, price: [250, 450, 800] },
      barn: { label: 'Bigger barn', type: 'cow', add: 1, price: [700, 1200, 2000] },
    },
    items: {
      hay: { label: 'Hay bales', qty: 5, price: 60 },
      grain: { label: 'Grain sack', qty: 10, price: 30 },
    },
    names: {
      cow: ['Daisy', 'Bella', 'Clover', 'Buttercup', 'Mabel', 'Rosie', 'Hazel', 'Pearl', 'Maple', 'Lulu'],
      chicken: ['Nugget', 'Pip', 'Henrietta', 'Peanut', 'Goldie', 'Marigold', 'Pepper', 'Biscuit', 'Waffles', 'Sunny', 'Dot', 'Ginger', 'Olive', 'Poppy'],
    },
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // tiny event emitter so the UI can react to changes
  const listeners = {};
  const on = (e, fn) => ((listeners[e] = listeners[e] || []).push(fn));
  const emit = (e, d) => (listeners[e] || []).slice().forEach((fn) => fn(d));
  const off = (e, fn) => (listeners[e] = (listeners[e] || []).filter((f) => f !== fn));

  let S = null;
  let uid = 1;

  function makeAnimal(type) {
    const used = new Set(S.animals.map((a) => a.name));
    const free = CFG.names[type].filter((n) => !used.has(n));
    const pen = CFG.pens[type];
    return {
      id: uid++,
      type,
      variant: pick(window.ART_VARIANTS[type]),
      name: free.length ? pick(free) : pick(CFG.names[type]) + ' ' + uid,
      hunger: 25,
      cleanliness: 90,
      health: 100,
      love: 0,
      product: 0, // milk waiting to be collected (cows)
      unmilkedDays: 0,
      x: rand(pen.x1, pen.x2),
      y: rand(pen.y1, pen.y2),
    };
  }

  function newGame() {
    uid = 1;
    S = {
      day: 1,
      minutes: CFG.dayStart,
      coins: CFG.startCoins,
      energy: CFG.maxEnergy,
      inventory: { hay: 5, grain: 10, milk: 0, eggs: 0 },
      upgrades: { coop: 0, barn: 0 },
      animals: [],
      eggs: [],
      stats: { earned: 0, eggs: 0, milk: 0 },
    };
    S.animals.push(makeAnimal('chicken'));
    S.animals.push(makeAnimal('chicken'));
    spawnEgg();
    save();
    emit('change');
    return S;
  }

  function capacity(type) {
    const up = type === 'cow' ? CFG.upgrades.barn : CFG.upgrades.coop;
    const lvl = S.upgrades[type === 'cow' ? 'barn' : 'coop'];
    return CFG.caps[type] + lvl * up.add;
  }
  const count = (type) => S.animals.filter((a) => a.type === type).length;

  function happiness(a) {
    let h = 100 - Math.max(0, a.hunger - 20) * 0.9 - Math.max(0, 70 - a.cleanliness) * 0.8 + a.love;
    if (a.health <= 0) h = Math.min(h, 10);
    else if (a.health < 50) h -= 15;
    return clamp(Math.round(h), 0, 100);
  }

  function needs(a) {
    if (a.health <= 0) return 'sick';
    if (a.type === 'cow' && a.product > 0) return 'milk';
    if (a.hunger >= 60) return 'hungry';
    if (a.cleanliness <= 40) return 'dirty';
    return null;
  }

  const fail = (msg) => ({ ok: false, msg });
  function spend(cost) {
    if (S.energy < cost) return false;
    S.energy -= cost;
    return true;
  }
  const done = (res) => { save(); emit('change'); return res; };

  // ------------------------------------------------------------ time
  function tick(dt) {
    const dm = dt * CFG.minutesPerSecond;
    S.minutes += dm;
    const span = CFG.dayEnd - CFG.dayStart;
    for (const a of S.animals) {
      a.hunger = clamp(a.hunger + (CFG.decayPerDay.hunger * dm) / span, 0, 100);
      a.cleanliness = clamp(a.cleanliness - (CFG.decayPerDay.cleanliness * dm) / span, 0, 100);
    }
    if (S.minutes >= CFG.dayEnd) return 'night';
    return null;
  }

  // ------------------------------------------------------------ actions
  const find = (id) => S.animals.find((a) => a.id === id);

  function feed(id) {
    const a = find(id);
    const kind = CFG.animals[a.type].feed;
    if (a.hunger < 8) return fail(`${a.name} is full`);
    if (S.inventory[kind] <= 0) return fail(`No ${kind} left. Visit the shop`);
    if (!spend(CFG.energy.feed)) return fail('Too tired. Time to sleep');
    S.inventory[kind]--;
    a.hunger = clamp(a.hunger - 55, 0, 100);
    return done({ ok: true, msg: `Fed ${a.name}`, item: kind });
  }

  function feedAll(type) {
    const kind = CFG.animals[type].feed;
    const hungry = S.animals.filter((a) => a.type === type && a.hunger >= 15).sort((a, b) => b.hunger - a.hunger);
    if (!hungry.length) return fail(`Every ${type} is full`);
    if (S.inventory[kind] <= 0) return fail(`No ${kind} left. Visit the shop`);
    let fed = 0;
    for (const a of hungry) {
      if (S.inventory[kind] <= 0) break;
      const cost = fed === 0 ? CFG.energy.feedAllBase : CFG.energy.feedAllEach;
      if (!spend(cost)) break;
      S.inventory[kind]--;
      a.hunger = clamp(a.hunger - 55, 0, 100);
      fed++;
    }
    if (!fed) return fail('Too tired. Time to sleep');
    return done({ ok: true, msg: `Fed ${fed} ${type}${fed > 1 ? 's' : ''}`, item: kind, fed });
  }

  function clean(id) {
    const a = find(id);
    if (a.cleanliness > 92) return fail(`${a.name} is already spotless`);
    if (!spend(CFG.energy.clean)) return fail('Too tired. Time to sleep');
    a.cleanliness = 100;
    return done({ ok: true, msg: `${a.name} is squeaky clean` });
  }

  function milk(id) {
    const a = find(id);
    if (a.type !== 'cow') return fail('Only cows can be milked');
    if (a.product <= 0) return fail(`${a.name} has no milk yet`);
    if (!spend(CFG.energy.milk)) return fail('Too tired. Time to sleep');
    const n = a.product;
    S.inventory.milk += n;
    S.stats.milk += n;
    a.product = 0;
    a.unmilkedDays = 0;
    return done({ ok: true, msg: `+${n} milk`, amount: n });
  }

  function pet(id) {
    const a = find(id);
    if (a.love >= 20) return fail(`${a.name} is already loving it`);
    if (!spend(CFG.energy.pet)) return fail('Too tired. Time to sleep');
    a.love = clamp(a.love + 10, 0, 20);
    return done({ ok: true, msg: `${a.name} loves you` });
  }

  function vet(id) {
    const a = find(id);
    if (a.health > 0) return fail(`${a.name} is healthy`);
    if (S.coins < CFG.vetCost) return fail(`The vet costs ${CFG.vetCost} coins`);
    S.coins -= CFG.vetCost;
    a.health = 60;
    a.hunger = Math.min(a.hunger, 40);
    return done({ ok: true, msg: `${a.name} is feeling better` });
  }

  function collectEgg(eggId) {
    const i = S.eggs.findIndex((e) => e.id === eggId);
    if (i < 0) return fail('');
    if (!spend(CFG.energy.collect)) return fail('Too tired. Time to sleep');
    S.eggs.splice(i, 1);
    S.inventory.eggs++;
    S.stats.eggs++;
    return done({ ok: true, msg: '+1 egg' });
  }

  function sellAll() {
    const { milk: m, eggs: e } = S.inventory;
    const total = m * CFG.sell.milk + e * CFG.sell.eggs;
    if (!total) return fail('Nothing to sell yet');
    S.inventory.milk = 0;
    S.inventory.eggs = 0;
    S.coins += total;
    S.stats.earned += total;
    return done({ ok: true, msg: `Sold for ${total} coins`, total });
  }

  // ------------------------------------------------------------ shop
  function shopList() {
    const list = [];
    for (const [type, a] of Object.entries(CFG.animals)) {
      const full = count(type) >= capacity(type);
      list.push({ id: type, kind: 'animal', type, label: a.label, price: a.price, icon: `${type}_${window.ART_VARIANTS[type][0]}_0`,
        desc: type === 'cow' ? 'Gives milk every day' : 'Lays 1 to 2 eggs a day', sub: `${count(type)}/${capacity(type)} space`,
        disabled: full ? 'No space' : S.coins < a.price ? 'Need coins' : null });
    }
    for (const [id, it] of Object.entries(CFG.items)) {
      list.push({ id, kind: 'item', label: it.label, price: it.price, icon: `icon_${id}`, desc: `+${it.qty} ${id}`, sub: `You have ${S.inventory[id]}`,
        disabled: S.coins < it.price ? 'Need coins' : null });
    }
    for (const [id, up] of Object.entries(CFG.upgrades)) {
      const lvl = S.upgrades[id];
      const maxed = lvl >= up.price.length;
      list.push({ id, kind: 'upgrade', label: up.label, price: maxed ? 0 : up.price[lvl], icon: id, desc: `+${up.add} ${up.type} space`, sub: `Level ${lvl}/${up.price.length}`,
        disabled: maxed ? 'Maxed' : S.coins < up.price[lvl] ? 'Need coins' : null });
    }
    return list;
  }

  function buy(id) {
    const entry = shopList().find((e) => e.id === id);
    if (!entry) return fail('Unknown item');
    if (entry.disabled) return fail(entry.disabled);
    S.coins -= entry.price;
    let animal = null;
    if (entry.kind === 'animal') {
      animal = makeAnimal(entry.type);
      S.animals.push(animal);
    } else if (entry.kind === 'item') {
      S.inventory[id] += CFG.items[id].qty;
    } else {
      S.upgrades[id]++;
    }
    return done({ ok: true, msg: entry.kind === 'animal' ? `Welcome, ${animal.name}!` : `Bought ${entry.label}`, animal });
  }

  // ------------------------------------------------------------ night
  function spawnEgg() {
    const z = CFG.eggZone;
    const e = { id: uid++, x: rand(z.x1, z.x2), y: rand(z.y1, z.y2), age: 0 };
    S.eggs.push(e);
    return e;
  }

  function sleep() {
    const summary = { eggs: 0, milk: 0, spoiled: 0, sick: [], unhappy: [] };

    // eggs left on the ground age and eventually spoil
    S.eggs.forEach((e) => e.age++);
    const before = S.eggs.length;
    S.eggs = S.eggs.filter((e) => e.age < CFG.eggSpoilDays);
    summary.spoiled = before - S.eggs.length;

    for (const a of S.animals) {
      const happy = happiness(a);
      const canProduce = a.hunger < 70 && a.cleanliness > 30 && a.health > 0;
      if (canProduce) {
        const mult = happy > 80 ? 1.5 : happy > 45 ? 1 : 0.5;
        if (a.type === 'chicken') {
          const n = Math.floor(mult + Math.random() * 0.99);
          for (let i = 0; i < n; i++) spawnEgg();
          summary.eggs += n;
        } else {
          if (a.product > 0) a.unmilkedDays++;
          const n = a.unmilkedDays > 0 ? 1 : mult >= 1.5 ? 2 : 1;
          a.product = Math.min(2, Math.max(a.product, n));
          summary.milk += a.product;
        }
      } else if (a.health > 0) summary.unhappy.push(a.name);

      // health
      if (a.hunger >= 90 || a.cleanliness <= 10) a.health = clamp(a.health - 35, 0, 100);
      else if (happy > 60) a.health = clamp(a.health + 15, 0, 100);
      if (a.health <= 0) summary.sick.push(a.name);

      a.hunger = clamp(a.hunger + CFG.overnight.hunger, 0, 100);
      a.cleanliness = clamp(a.cleanliness - CFG.overnight.cleanliness, 0, 100);
      a.love = 0;
    }

    S.day++;
    S.minutes = CFG.dayStart;
    S.energy = CFG.maxEnergy;
    summary.day = S.day;
    save();
    emit('change');
    return summary;
  }

  // ------------------------------------------------------------ persistence
  const KEY = 'sunny-acres-save-v1';
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ S, uid })); } catch (e) { /* storage unavailable */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      S = data.S;
      uid = data.uid;
      emit('change');
      return true;
    } catch (e) { return false; }
  }
  const hasSave = () => { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };

  function clock() {
    const m = Math.floor(S.minutes);
    const h = Math.floor(m / 60), mm = m % 60;
    return `${String(h).padStart(2, '0')}:${String(Math.floor(mm / 10) * 10).padStart(2, '0')}`;
  }

  window.Farm = {
    CFG, on, off, emit, newGame, load, hasSave, save, tick, clock,
    get state() { return S; },
    happiness, needs, capacity, count, find,
    feed, feedAll, clean, milk, pet, vet, collectEgg, sellAll, shopList, buy, sleep,
  };
})();
