# Credits — real 3D models

Most exhibits in The Unusual Museum are procedural (built from geometry in
code) and all gallery text is original. The eight exhibits below use **real
3D model files**, downloaded from [Poly Pizza](https://poly.pizza) and used
under the license shown on each model's page at download time (verified
2026-10-30). Models are served locally from each gallery's
`assets/models/` folder; if a file ever fails to load, the gallery falls
back to its procedural version automatically.

## Mythos Museum (`museum/`)

| Exhibit | Model | Author | Source | License |
|---|---|---|---|---|
| The Dragon | Dragon | Quaternius | [poly.pizza/m/VBvzjFIYws](https://poly.pizza/m/VBvzjFIYws) | CC0 1.0 (Public Domain) |
| The Unicorn | Unicorn | Thomas DR | [poly.pizza/m/6pM6hFiGolw](https://poly.pizza/m/6pM6hFiGolw) | CC BY (Creative Commons Attribution) |
| The Kraken | Octopus | Poly by Google | [poly.pizza/m/9-b6-yqrwEe](https://poly.pizza/m/9-b6-yqrwEe) | CC BY (Creative Commons Attribution) |
| The Phoenix | Eagle | Poly by Google | [poly.pizza/m/d7CSLvsHULY](https://poly.pizza/m/d7CSLvsHULY) | CC BY (Creative Commons Attribution) |

Honest notes on the two stand-ins:

- **The Kraken** is a real *octopus* model, scaled large and teal-tinted —
  no licensed kraken model exists, and a giant octopus is exactly what
  sailors were describing.
- **The Phoenix** is built on the *eagle* model above, recolored in code
  toward flame orange and gold with a warm emissive glow, with the
  exhibit's rising ember particles kept from the procedural version.

## The Abyss (`abyss/`)

| Exhibit | Model | Author | Source | License |
|---|---|---|---|---|
| Specimen 01 — Humpback Anglerfish | Angler Fish | Anonymous | [poly.pizza/m/85n5_RiSeSf](https://poly.pizza/m/85n5_RiSeSf) | CC BY (Creative Commons Attribution) |

The tank's glowing lure ambience (halo + light, driven by the
bioluminescence slider) is the museum's own addition around the model.

## Verdant (`garden/`)

| Exhibit | Model | Author | Source | License |
|---|---|---|---|---|
| Carrot | Carrot | Poly by Google | [poly.pizza/m/3oFkNid6ofx](https://poly.pizza/m/3oFkNid6ofx) | CC BY (Creative Commons Attribution) |
| Broccoli | Broccoli | Quaternius | [poly.pizza/m/6exp0qAEVd](https://poly.pizza/m/6exp0qAEVd) | CC0 1.0 (Public Domain) |
| Eggplant | Eggplant | Poly by Google | [poly.pizza/m/abKWST5Odkg](https://poly.pizza/m/abKWST5Odkg) | CC BY (Creative Commons Attribution) |

## Attribution

CC BY models are used with attribution as required by the Creative
Commons Attribution license — the author and source for each are listed
in the tables above. CC0 models are in the public domain; their authors
are credited anyway, because it's polite.

Everything else — the cell, the solar system, the elements,
the remaining sea specimens, garden produce and museum creatures,
BodyVerse's procedural fallback organs (including its thyroid), plus
all code and text — is original to this project (MIT, see
[LICENSE](LICENSE); the model files above remain under their own
licenses).

## NASA 3D models — MissionVerse (public domain)

Models from NASA 3D Resources (https://science.nasa.gov/3d-resources/), mirrored at
github.com/nasa/NASA-3D-Resources. NASA imagery and 3D models are not copyrighted
and may be used freely; NASA endorsement is not implied.

| Model | File | Source in NASA repo |
|---|---|---|
| International Space Station | mission/assets/models/iss.glb | 3D Models/International Space Station (ISS) (B) |
| James Webb Space Telescope | mission/assets/models/jwst.glb | 3D Models/James Webb Space Telescope (A) |
| Hubble Space Telescope | mission/assets/models/hubble.glb | 3D Models/Hubble Space Telescope (A) |
| Perseverance Rover | mission/assets/models/perseverance.glb | 3D Models/Mars 2020 Perseverance Rover |
| Saturn V | mission/assets/models/saturn-v.glb | 3D Models/Saturn V |

Full source paths are also listed in mission/model-sources.txt.

## BodyVerse (`body/`) — BodyParts3D real anatomy (CC BY 4.0)

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International

BodyVerse's organs are real human anatomy meshes from the
**BodyParts3D** dataset (Release 4.0), maintained by the Database
Center for Life Science (DBCLS), Japan — source:
https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
One GLB per organ lives in `body/assets/models/` (full provenance,
anatomical concept ids and per-file detail in
`body/assets/models/MANIFEST.md`). The meshes are the dataset's
web-grade release — its 99% polygon-reduced grade — converted without
altering their shared body coordinate system (the brain was reduced
slightly further only to meet a 6 MB file cap; see the manifest). If
a model file ever fails to load, BodyVerse falls back to its original
procedural organ automatically.

Two honest exceptions:

- **Thyroid** — the thyroid gland is *not* present in BodyParts3D
  Release 4.0, so BodyVerse's thyroid is a stylised procedural model,
  not dataset anatomy.
- **Appendix** — the appendix *is* from the dataset (concept FMA14542,
  single mesh FJ2565), like the other 16 organs.

## NASA 3D models — GalaxyVerse (public domain)

Same NASA 3D Resources source as MissionVerse. Files in galaxy/assets/models/:
James Webb Space Telescope (A) detailed and (B) lightweight variants;
Cassiopeia A supernova remnant in three data releases (original, 2023, 2025);
Cygnus Loop; G292.0+1.8; Crab Nebula. Full catalogue with source paths:
galaxy/model-catalogue.md. The six galaxies and Sagittarius A* in GalaxyVerse
are original procedural particle renders, not models.
