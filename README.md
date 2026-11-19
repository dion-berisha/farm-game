# Sunny Acres

A 2D farm game prototype built with **Phaser 3**. You play a farmer who looks after cows and chickens: buy them, feed them, clean them, milk the cows, collect eggs and sell everything at the market.

## Run it

- **Easiest:** double-click `index.html`. It runs straight from the folder, no install needed.
- **With a dev server:** `npm install` then `npm start`, then open http://localhost:5173

## How to play

| Action | How |
|---|---|
| Walk | Click anywhere on the grass |
| Care for an animal | Click it to open its card: Feed, Clean, Milk / Eggs, Pet, Vet |
| Feed everyone at once | Click the trough (cows) or the feeder (chickens) |
| Collect eggs | Click an egg, or click the coop to collect them all |
| Sell milk and eggs | Click the market cart or the Sell button |
| Buy animals, feed, upgrades | Shop button |
| End the day | Sleep button or click the house |
| Mute | Press `M` |

The game saves automatically in the browser.

## Game rules (src/state.js)

- Every action costs **energy**. Sleeping refills it.
- Animals get **hungry** and **dirty** over the day. Happiness depends on both, plus petting.
- Overnight, an animal only produces if hunger < 70, cleanliness > 30 and it is not sick.
  Happier animals produce more (chickens lay 1 to 2 eggs, cows give 1 to 2 milk).
- Eggs left on the ground spoil after 2 days. Unmilked cows produce less.
- Neglected animals lose health and get **sick**. The vet costs 80 coins.
- At 22:00 the farmer passes out and the day ends automatically.

All numbers (prices, decay rates, energy costs, day length) live in `CFG` at the top of `src/state.js`.

## Project structure

```
index.html          entry point
vendor/phaser.min.js  Phaser 3.90 (bundled so it works offline)
src/art.js          all characters, buildings and icons drawn as SVG (no image files)
src/state.js        game logic only, no rendering. Easy to port or test
src/ui.js           text styles, panels, buttons, bars, synth sound effects
src/world.js        scenery, fences, day/night lighting, Farmer and Animal views
src/scenes.js       Boot, Title and Farm scenes
src/ui-scene.js     HUD, animal card, shop, toasts, morning summary
src/main.js         Phaser game config
```

## Swapping in real art later

Every texture is registered by key in `src/art.js` (for example `cow_holstein_0`, `chicken_white_2`, `barn`, `icon_milk`).
To use PNG sprites instead, load them in `BootScene` with `this.load.image(key, 'assets/....png')` using the same keys and remove the matching SVG entries.
Animal frames: `_0` idle, `_1` and `_2` walk steps (chickens: `_2` is the peck pose).
