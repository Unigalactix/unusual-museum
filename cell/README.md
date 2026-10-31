# CellVerse — Interactive 3D Cell Explorer

An original, interactive 3D biology website: a stylised animal cell floating in
a dark void that you can rotate, zoom, explode apart and explore organelle by
organelle — entirely in the browser, with no build step.

**Live idea:** open it, drag the cell, click the glowing orange capsule — that
is a mitochondrion, and CellVerse will fly the camera in and tell you what it
does.

Created by **Rajesh Kodaganti**.

## Features

- **Fully procedural 3D cell** — every organelle is generated from Three.js
  geometry at load time. No model files, no textures, no image assets.
- **14 explorable organelle types** — membrane, nucleus, nucleolus,
  mitochondria, rough endoplasmic reticulum, Golgi apparatus, ribosomes,
  lysosomes, peroxisomes, centrosome, vacuole, cytoskeleton, cytoplasm and
  free vesicles, each with an original plain-English description and a fun fact.
- **Orbit, zoom and auto-rotate** — drag to spin, scroll to zoom; the cell
  slowly rotates on its own until you first grab it.
- **Hover highlighting with tooltips**, and **click-to-focus**: the camera
  smoothly flies to the organelle you pick, whether you click it in 3D or
  choose it from the searchable sidebar list.
- **Floating labels** projected from the 3D scene each frame, which fade out
  as their organelle rotates to the far side of the cell.
- **Exploded view slider** — pull the cell apart to see how the organelles
  are arranged inside.
- **X-ray membrane toggle** — fade the cell membrane away to look inside.
- **Glassmorphism UI** that adapts to mobile: the info panel and list become
  a bottom-sheet style layout on small screens.
- **Graceful failure** — a loading overlay while the scene builds, and a clear
  message if WebGL is unavailable.

## How it works

- `js/organelles.js` holds the content: one entry per organelle type with its
  colour, tagline, description and fact. The sidebar, labels and info panel
  are all generated from this data.
- `js/main.js` builds the scene with seeded random placement (so the cell is
  identical on every visit), shared materials per organelle type, raycasting
  for hover/click picking — preferring inner organelles over the membrane and
  cytoplasm shells so nothing inside is un-clickable — and a small
  easing-based camera animation for focus flights.
- Exploding is simple and effective: every instance remembers its home
  position and an outward offset, and the slider lerps between the two.

## Tech

- [Three.js](https://threejs.org/) 0.160 via CDN ES-module import map
  (jsDelivr), including `OrbitControls` from the examples modules.
- Vanilla JavaScript (ES modules), HTML and CSS — no framework, no bundler.
- Google Fonts (Sora + Inter); everything else is system/procedural.
- Hosted as a plain static site — ideal for GitHub Pages.

## Run it locally

Any static file server works:

```bash
cd cell-explorer-3d
python3 -m http.server 8000
# then open http://localhost:8000
```

> Note: because the scripts are ES modules, opening `index.html` directly
> from disk (`file://`) will not work in most browsers — use a local server.

## Deploy on GitHub Pages

1. Push this folder as a repository (the cell site lives at the repo root).
2. In the repository, go to **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, select
   `main` and `/ (root)`, and save.
4. GitHub Pages will publish it at `https://<username>.github.io/<repo>/`.
   The included `.nojekyll` file keeps Pages from processing the site with
   Jekyll, so folders like `js/` and `css/` are served exactly as-is.

## Project structure

```
cell-explorer-3d/
├── index.html          # Page shell, UI panels, import map
├── css/
│   └── styles.css      # Dark glassmorphism theme, responsive layout
├── js/
│   ├── main.js         # Three.js scene, interactions, UI wiring
│   └── organelles.js   # Organelle content data (name, colour, facts)
├── .nojekyll           # GitHub Pages: serve files as-is
├── LICENSE             # MIT
└── README.md
```

## License

MIT — see [LICENSE](LICENSE). © 2026 Rajesh Kodaganti.
