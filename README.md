# The Unusual Museum

**Twelve interactive 3D galleries you can rotate, zoom and explore in the browser** — a living cell, the human body, creatures that never existed, deep-sea specimens, the solar system and its stars, all 118 elements, a garden of lentils, vegetables and leafy greens, dinosaurs, microbes, gemstones, real NASA spacecraft, and glowing fungi.

🔗 **Live site:** https://unigalactix.github.io/unusual-museum/

Every exhibit is real, explorable 3D built with [Three.js](https://threejs.org/) — no pre-rendered images, no build step, no backend. Most models are procedural (built from geometry in code) and all text was written for this project; thirteen exhibits use real licensed model files instead (eight CC0/CC BY models via Poly Pizza, five public-domain NASA models), with the procedural version kept as an automatic fallback where one exists — see [3D model credits](#3d-model-credits) and CREDITS.md.

## The galleries

| Gallery | What's inside |
|---|---|
| [CellVerse](cell/) | A living animal cell — 14 organelle types, hybrid exploded view, X-ray membrane, labels |
| [BodyVerse](body/) | The human body — 18 organs in a glass figure, beating heart, breathing lungs, systems filter |
| [Mythos Museum](museum/) | Creatures that never existed — Phoenix, Kraken, Dragon, Unicorn, with a day ⇄ dusk hall |
| [The Abyss](abyss/) | Deep-sea specimens in glass tanks — anglerfish, viperfish, dumbo octopus, sonar pulse, bioluminescence control |
| [Cosmos](space/) | Sun, all 8 planets + Moon + Pluto, asteroid belt, and a 12-star inspector with the Sun for scale |
| [Elementum](elements/) | All 118 elements as 3D tiles in the classic table + an atom viewer with true proton/neutron-cluster nuclei and real electron shells |
| [Verdant](garden/) | The garden — 10 lentils & legumes, 18 vegetables, 12 leafy greens with nutrition and classic dishes |
| [DinoVerse](dino/) | The prehistoric hall — 8 dinosaurs (and one pterosaur) with era, size and diet data |
| [MicroVerse](micro/) | The invisible world — 8 microbes: bacteriophage, coronaviruses, tardigrade, amoeba and friends (sizes honestly not to scale) |
| [GemVerse](gems/) | The jeweller's vault — 8 gemstones with Mohs hardness, formulas and faceted physical materials |
| [MissionVerse](mission/) | Real spacecraft — NASA's own public-domain 3D models: ISS, JWST, Hubble, Perseverance, Saturn V |
| [FungiVerse](fungi/) | The forest floor — 8 fungi with honest edibility labels and a day ⇄ night glow mode |

## Quality bar

Per the museum's charter, *every asset is 3D and as life-like as procedural code can make it*: ACES filmic tone mapping, soft shadows, environment reflections, physical materials (wet clearcoat on organs and sea creatures, sheened coats, glossy produce skins), canvas-painted textures (dragon scales, Jupiter's bands and Great Red Spot, chromatin, leaf veins…), and motion everywhere it belongs — a beating heart, breathing lungs, flapping fins, orbiting electrons, rising embers.

## 3D model credits

Eight exhibits use real 3D models from [Poly Pizza](https://poly.pizza), each under the license shown on its page (full table with authors and links in [CREDITS.md](CREDITS.md)):

- **Dragon** by Quaternius — CC0 1.0 — Mythos Museum
- **Unicorn** by Thomas DR — CC BY — Mythos Museum
- **Octopus** by Poly by Google — CC BY — Mythos Museum (stands in as the Kraken)
- **Eagle** by Poly by Google — CC BY — Mythos Museum (recolored as the Phoenix)
- **Angler Fish** by Anonymous — CC BY — The Abyss, Tank 01
- **Carrot** by Poly by Google — CC BY — Verdant
- **Broccoli** by Quaternius — CC0 1.0 — Verdant
- **Eggplant** by Poly by Google — CC BY — Verdant

## Run it locally

```sh
cd unusual-museum
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

GitHub Pages, deployed from the `main` branch root. The root `.nojekyll` keeps folder names untouched. Three.js is loaded from the jsDelivr CDN via ES-module import maps in each gallery.

## Structure

```
index.html        — the museum hall (hub)
cell/  body/  museum/  abyss/  space/  elements/  garden/  dino/  micro/  gems/  mission/  fungi/
  index.html  css/styles.css  js/*.js   — each gallery is fully self-contained
```

## License

MIT — see [LICENSE](LICENSE). Built by [Rajesh Kodaganti](https://github.com/Unigalactix).
