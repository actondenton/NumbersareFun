# NumbersareFun

NumbersareFun is a Vite-powered incremental game prototype about making numbers feel tactile, funny, and increasingly strange.

## Active App

Use these files for current gameplay work:

- `index.html` defines the active single-page shell and overlays.
- `src/main.ts` loads shared data, installs the mode switch shell, and lazy-loads gameplay behind the curtain transition.
- `src/game/legacy-boot.js` contains the current Number 1, Number 2, ascension, save/load, and black-hole gameplay.
- `style.css` is the active stylesheet for the Vite app.
- `ascension-tree-data.js`, `ascension2-tree-data.js`, and `number2-upgrades.js` are active gameplay data files loaded by `src/main.ts`.

## Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run test:run
npm run build
```

GitHub Pages deploys from `.github/workflows/pages.yml`, which runs the tests before building the Vite artifact.
