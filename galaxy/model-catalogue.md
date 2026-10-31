# GalaxyVerse — NASA 3D Model Catalogue

Source: **NASA 3D Resources** (public domain), via the GitHub mirror
[github.com/nasa/NASA-3D-Resources](https://github.com/nasa/NASA-3D-Resources) (default branch `master`).
Swept 2026-10-30: full tree listing (1,199 files, 257 GLBs) searched for Webb/JWST and every
galaxy / nebula / star-cluster / supernova-remnant / observatory model in the collection.

> **⚠ DRACOLoader required for everything in this catalogue.** Every GLB inspected — all 8 downloaded
> files and all 21 catalogued observatory files — lists `KHR_draco_mesh_compression` in
> `extensionsUsed`. This matches the MissionVerse NASA models. Any loader for these files must
> configure Three.js DRACOLoader alongside GLTFLoader.

Downloaded files live in `galaxy/assets/models/`. All downloads were verified: `glTF` magic bytes
present and the GLB header's declared length equals the actual file size.

---

## 1. James Webb Space Telescope — variants

The repo holds exactly **two** GLB variants of JWST. **Both were captured** (each ≤ 25 MB).
(Separate 3D-printing STL part files and a "(Mirror)" parts kit in .7z/PowerPoint form also exist —
not GLB, not listed here.)

| Display name | Repo source path | Size (bytes) | Downloaded | Local file | Draco |
|---|---|---:|---|---|---|
| James Webb Space Telescope (A) — detailed assembly, 1,600 meshes | `3D Models/James Webb Space Telescope (A)/James Webb Space Telescope (A).glb` | 4,710,016 | Yes | `jwst-a.glb` | Yes |
| James Webb Space Telescope (B) — lightweight, single mesh | `3D Models/James Webb Space Telescope (B)/James Webb Space Telescope (B).glb` | 1,004,248 | Yes | `jwst-b.glb` | Yes |

Note: variant (A) is the same model MissionVerse already flies as `mission/assets/models/jwst.glb`
(same byte size). Variant (B) is the new capture — a much lighter single-mesh Webb, useful as the
gallery's fast-loading or background-fleet version.

## 2. Galaxies & nebulae

**Honest headline: the repo contains no galaxy GLBs at all.** There is no Andromeda, Milky Way,
Sombrero or other galaxy in GLB form. The famous **Whirlpool Galaxy** exists only as two `.7z`
archives of 3D-printing parts under `3D Printing/Whirlpool Galaxy/` — no GLB.

What the collection *does* have in GLB form is a strong set of **nebulae and supernova remnants** —
all six were captured (each ≤ 25 MB):

| Display name | Repo source path | Size (bytes) | Downloaded | Local file | Draco |
|---|---|---:|---|---|---|
| Cassiopeia A Supernova (original) | `3D Models/Cassiopeia A Supernova/Cassiopeia A Supernova.glb` | 10,475,620 | Yes | `cassiopeia-a.glb` | Yes |
| Cassiopeia A Supernova (B) (2023) | `3D Models/Cassiopeia A Supernova (B) (2023)/Cassiopeia A Supernova (B) (2023).glb` | 15,932,656 | Yes | `cassiopeia-a-2023.glb` | Yes |
| Cassiopeia A Supernova (C) (2025) | `3D Models/Cassiopeia A Supernova (C) (2025)/Cassiopeia A Supernova (C) (2025).glb` | 8,502,472 | Yes | `cassiopeia-a-2025.glb` | Yes |
| Cygnus Loop Supernova | `3D Models/Cygnus Loop Supernova/Cygnus Loop Supernova.glb` | 2,888,172 | Yes | `cygnus-loop.glb` | Yes |
| G292.0+1.8 Supernova Remnant | `3D Models/G292.0+1.8 Supernova Remnant/G292.0+1.8 Supernova Remnant.glb` | 1,200,552 | Yes | `g292-supernova-remnant.glb` | Yes |
| Crab Nebula | `3D Printing/Crab Nebula/Crab Nebula.glb` | 2,209,524 | Yes | `crab-nebula.glb` | Yes |

The three Cassiopeia A versions are three different data releases of the same remnant (original,
2023 and 2025) — ideal for a "same object, evolving data" exhibit. A keyword sweep of all 257 GLBs
in the repo confirmed these six are the *only* celestial-object (non-spacecraft) GLBs in the
collection.

**Nebula/remnant models that exist only in print formats (no GLB — not downloaded):**

| Display name | Repo location | Format |
|---|---|---|
| Eta Carinae Homunculus Nebula (3 mass-loss variants) | `3D Printing/Eta Carinae Homunculus Nebula*/` | STL parts |
| Pillars of Creation (full, mini, per-pillar) | `3D Printing/Pillars of Creation/` | STL parts |
| Tycho Supernova Remnant (inner/outer shells) | `3D Printing/Tycho Supernova Remnant/` | STL parts |
| IC 443 (Jellyfish Nebula) | `3D Printing/IC 443 (Jellyfish Nebula)/` | .7z archives |
| Whirlpool Galaxy | `3D Printing/Whirlpool Galaxy/` | .7z archives |

## 3. Other observatories

Catalogued with sizes; **not downloaded** (outside this sweep's capture scope — all are ≤ 25 MB and
fetchable the same way if a future gallery wants them). Every one is Draco-compressed.

| Display name | Repo source path | Size (bytes) | Downloaded | Draco | Notes |
|---|---|---:|---|---|---|
| Hubble Space Telescope (A) | `3D Models/Hubble Space Telescope (A)/Hubble Space Telescope (A).glb` | 1,694,988 | No | Yes | The variant already used in MissionVerse |
| Hubble Space Telescope (B) | `3D Models/Hubble Space Telescope (B)/Hubble Space Telescope (B).glb` | 5,140,096 | No | Yes | Detailed variant — 1,308 meshes |
| Chandra X-ray Observatory | `3D Models/Chandra X-ray Observatory/Chandra X-ray Observatory.glb` | 998,500 | No | Yes | |
| Fermi Gamma-ray Large Area Space Telescope | `3D Models/Fermi Gamma-ray Large Area Space Telescope/Fermi Gamma-ray Large Area Space Telescope.glb` | 1,379,016 | No | Yes | |
| Kepler (A) | `3D Models/Kepler (A)/Kepler (A).glb` | 2,003,276 | No | Yes | |
| Kepler (B) | `3D Models/Kepler (B)/Kepler (B).glb` | 9,656 | No | Yes | Minimal variant — under 10 KB |
| Nancy Grace Roman Space Telescope (A) | `3D Models/Nancy Grace Roman Space Telescope (A)/Nancy Grace Roman Space Telescope (A).glb` | 2,672,000 | No | Yes | |
| Nancy Grace Roman Space Telescope (B) | `3D Models/Nancy Grace Roman Space Telescope (B)/Nancy Grace Roman Space Telescope (B).glb` | 342,672 | No | Yes | |
| Spitzer Space Telescope | `3D Models/Spitzer Space Telescope/Spitzer Space Telescope.glb` | 251,388 | No | Yes | |
| Swift | `3D Models/Swift/Swift.glb` | 211,404 | No | Yes | |
| TESS (A) | `3D Models/Transiting Exoplanet Survey Satellite (TESS) (A)/Transiting Exoplanet Survey Satellite (TESS) (A).glb` | 206,576 | No | Yes | |
| TESS (B) | `3D Models/Transiting Exoplanet Survey Satellite (TESS) (B)/Transiting Exoplanet Survey Satellite (TESS) (B).glb` | 1,693,644 | No | Yes | |
| ATLAST (concept) | `3D Models/Advanced Technology Large-Aperture Space Telescope (ATLAST)/Advanced Technology Large-Aperture Space Telescope (ATLAST).glb` | 465,864 | No | Yes | Concept study, never flown |
| Cluster | `3D Models/Cluster/Cluster.glb` | 148,336 | No | Yes | ESA Cluster spacecraft — *not* a star cluster |
| Cluster II | `3D Models/Cluster II/Cluster II.glb` | 838,556 | No | Yes | ESA Cluster spacecraft — *not* a star cluster |
| Solar Dynamics Observatory (SDO) | `3D Models/Solar Dynamics Observatory/Solar Dynamics Observatory.glb` | 497,844 | No | Yes | Solar observatory |
| Parker Solar Probe | `3D Models/Parker Solar Probe/Parker Solar Probe.glb` | 443,572 | No | Yes | Solar probe |
| SORCE | `3D Models/Solar Radiation and Climate Experiment (SORCE)/Solar Radiation and Climate Experiment (SORCE).glb` | 366,492 | No | Yes | Solar irradiance |
| STEREO | `3D Models/Solar TErrestrial RElations Observatory (STEREO)/Solar TErrestrial RElations Observatory (STEREO).glb` | 354,212 | No | Yes | Solar observatory |
| Hinode (Solar-B) | `3D Models/Hinode (Solar-B)/Hinode (Solar-B).glb` | 276,248 | No | Yes | Solar observatory |
| SOHO | `3D Models/Solar and Heliospheric Observatory/Solar and Heliospheric Observatory.glb` | 83,268 | No | Yes | Solar observatory |

**Not in the repo at all:** WISE, NuSTAR and IXPE have no models anywhere in the collection
(zero hits in the full tree listing).

---

### Capture totals

- **Downloaded:** 8 GLBs (2 JWST variants + 6 nebula/supernova-remnant models)
- **Total downloaded size:** 46,923,260 bytes (≈ 46.9 MB)
- **Skipped for size (> 25 MB):** none — every in-scope model was under the cap
- **Verification:** all 8 files passed — `glTF` magic ✓, declared GLB length == file size ✓,
  Draco compression confirmed from each file's own JSON chunk ✓
