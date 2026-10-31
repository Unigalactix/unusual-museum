# Elementum — The Periodic Table in 3D

An original, interactive 3D periodic table containing **all 118 elements**, built for
[The Unusual Museum](../index.html). Every element is a coloured 3D tile in the classic
table layout; clicking a tile flies the camera in and opens its fact panel, and the
**Atom view** builds that element's atom — nucleus plus animated electron shells —
directly from its electron-shell data.

## Features

- All 118 elements with atomic number, symbol, name, standard atomic mass
  (bracketed mass numbers for synthetic elements), category, group, period,
  room-temperature state, electrons-per-shell, and an original one-line blurb
- 3D tiles coloured by family (alkali metals, noble gases, lanthanides…) with
  canvas-generated faces — no image assets
- Hover lift + tooltip, click-to-focus camera flights
- Atom viewer: nucleus sized from atomic mass, shell rings with orbiting
  electrons generated from each element's real shell configuration
- Category filter chips and live search by name, symbol or atomic number
- Fully static: Three.js from a CDN, no build step

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Layout notes

Lanthanum and actinium sit in group 3 of the main table; the remaining f-block
elements (Ce–Lu, Th–Lr) are shown on the two detached rows beneath it, as in most
printed tables.

## Data

Names, masses and electron configurations are standard factual data. Shell
configurations use the commonly published per-shell values (including the
well-known chromium, copper, silver and gold anomalies). All descriptive text
was written for this project.

MIT © Rajesh Kodaganti
