// GalaxyVerse — exhibit data.
// Eight exhibits are real NASA 3D models (public domain, NASA 3D Resources,
// Draco-compressed GLBs in ../assets/models/). Six galaxies are rendered
// live as particle systems — NASA's collection holds no galaxy GLBs — and
// Sagittarius A* is a procedural rendering. All copy is original.

export const EXHIBITS = [
  /* ---------------- Webb Observatory (real NASA GLBs) ---------------- */
  {
    id: 'jwst-a',
    name: 'James Webb — Detailed Model',
    group: 'Webb Observatory',
    kind: 'glb',
    file: 'assets/models/jwst-a.glb',
    fileMB: '4.7 MB',
    type: 'Infrared space telescope · NASA model A',
    distance: '1.5 million km — Sun–Earth L2 halo orbit',
    size: '6.5 m mirror · 21 m sunshield',
    hook: 'The full engineering assembly — some 1,600 separate parts, exactly as NASA models it.',
    description: 'Webb\u2019s primary mirror is eighteen gold-coated beryllium hexagons that had to fold like a drop-leaf table to fit inside its Ariane 5 rocket, then unfold 1.5 million kilometres from home. Launched on 25 December 2021, it now stares at the first galaxies ever formed, its optics chilled below \u2212223 \u00b0C behind a tennis-court-sized sunshield. This is NASA\u2019s detailed model A — the complete assembly, part by part.',
    fact: 'The gold on Webb\u2019s mirrors is real but vanishingly thin — about 100 nanometres per segment; all eighteen together carry roughly a golf ball\u2019s weight of gold.',
    targetSize: 5.4,
    spin: 0.06,
    viewDist: 11.5
  },
  {
    id: 'jwst-b',
    name: 'James Webb — Lightweight Model',
    group: 'Webb Observatory',
    kind: 'glb',
    file: 'assets/models/jwst-b.glb',
    fileMB: '1.0 MB',
    type: 'Infrared space telescope · NASA model B',
    distance: '1.5 million km — Sun–Earth L2 halo orbit',
    size: '6.5 m mirror · 21 m sunshield',
    hook: 'The same telescope as its neighbour — compressed into a single lightweight mesh.',
    description: 'NASA publishes Webb twice. Model A (the previous exhibit) is the 1,600-part engineering assembly; this model B is one single decimated mesh at less than a quarter of the file size, made for quick previews, classrooms and slower connections. The astronomy is identical — only the polygon budget changed. Spin both and compare: the silhouette, the mirror and the sunshield are all here, drawn with far fewer triangles.',
    fact: 'Model B loads in roughly a fifth of the data of model A — a fair trade of fidelity for speed, and the reason this gallery keeps both on the shelf.',
    targetSize: 5.4,
    spin: 0.06,
    viewDist: 11.5
  },

  /* ---------------- Supernova Remnants (real NASA GLBs) ---------------- */
  {
    id: 'cas-a',
    name: 'Cassiopeia A — Original Release',
    group: 'Supernova Remnants',
    kind: 'glb',
    file: 'assets/models/cassiopeia-a.glb',
    fileMB: '10.5 MB',
    type: 'Supernova remnant · NASA 3D model',
    distance: '11,000 light-years',
    size: '\u2248 10 light-years across',
    hook: 'The first 3D portrait of the youngest known remnant in our galaxy.',
    description: 'About 340 years ago a massive star in Cassiopeia tore itself apart; the expanding debris cloud is Cassiopeia A, mapped here from Chandra X-ray Observatory data in NASA\u2019s first 3D release of the remnant. The lumpy, asymmetric shell is the star\u2019s own guts — silicon, sulphur, iron — still flying outward at thousands of kilometres per second, with a neutron star buried at the centre.',
    fact: 'Almost nobody saw it explode. Dust between us and Cas A dimmed the flash so much that the nearest young remnant went unrecorded in the 1680s — radio telescopes only found it in 1947.',
    targetSize: 5.2,
    spin: 0.035,
    viewDist: 11.5
  },
  {
    id: 'cas-a-2023',
    name: 'Cassiopeia A — 2023 Release',
    group: 'Supernova Remnants',
    kind: 'glb',
    file: 'assets/models/cassiopeia-a-2023.glb',
    fileMB: '15.9 MB',
    type: 'Supernova remnant · NASA 3D model',
    distance: '11,000 light-years',
    size: '\u2248 10 light-years across',
    hook: 'Same remnant, second generation — a deeper stack of Chandra observations.',
    description: 'This is the middle sibling of the gallery\u2019s Cas A trio: the same exploded star, rebuilt as a new data release from a longer stack of Chandra observations and newer reconstruction work. Compare it with the original release beside it — the overall shell is unmistakably the same object, but filaments sharpen and the debris field resolves into finer structure. Astronomy is a living archive; even a 340-year-old explosion gets re-photographed.',
    fact: 'Chandra has watched Cas A for over two decades, and the remnant visibly changes between visits — its shock front is still expanding at up to about 6,000 kilometres per second.',
    targetSize: 5.2,
    spin: 0.035,
    viewDist: 11.5
  },
  {
    id: 'cas-a-2025',
    name: 'Cassiopeia A — 2025 Release',
    group: 'Supernova Remnants',
    kind: 'glb',
    file: 'assets/models/cassiopeia-a-2025.glb',
    fileMB: '8.5 MB',
    type: 'Supernova remnant · NASA 3D model',
    distance: '11,000 light-years',
    size: '\u2248 10 light-years across',
    hook: 'The newest portrait — three releases, one star, 340 years of flying debris.',
    description: 'The third and latest release in the trio. By now Cas A is one of the most re-modelled objects in the sky: each generation of data folds in more observing time and better physics, and each model can be spun, sliced and printed by anyone. Keep all three in mind as you turn this one — you are watching a single stellar corpse photographed across decades of telescope time, its debris moving measurably between portraits.',
    fact: 'Webb\u2019s infrared portrait of Cas A revealed a strange \u201cGreen Monster\u201d — loops of debris punched full of holes, probably carved by material the star shed before it exploded.',
    targetSize: 5.2,
    spin: 0.035,
    viewDist: 11.5
  },
  {
    id: 'cygnus-loop',
    name: 'Cygnus Loop — the Veil Nebula',
    group: 'Supernova Remnants',
    kind: 'glb',
    file: 'assets/models/cygnus-loop.glb',
    fileMB: '2.9 MB',
    type: 'Supernova remnant · NASA 3D model',
    distance: '\u2248 2,400 light-years',
    size: '\u2248 110 light-years across',
    hook: 'A bubble of shattered starlight so wide its pieces were catalogued as separate nebulae.',
    description: 'Some 10,000–20,000 years ago a star about twenty times the Sun\u2019s mass exploded in Cygnus. Its shock wave is still ploughing into interstellar gas, and the glowing filaments it raises form the Veil Nebula — a lace-work bubble more than a hundred light-years wide. This model gathers the whole loop, whose brightest arcs were named one by one before anyone realised they belonged together.',
    fact: 'The Witch\u2019s Broom, Pickering\u2019s Triangle and the Eastern Veil are not three nebulae — they are three bright edges of this one enormous bubble.',
    targetSize: 5.2,
    spin: 0.03,
    viewDist: 11.5
  },
  {
    id: 'g292',
    name: 'G292.0+1.8 — the Oxygen Rich',
    group: 'Supernova Remnants',
    kind: 'glb',
    file: 'assets/models/g292-supernova-remnant.glb',
    fileMB: '1.2 MB',
    type: 'Supernova remnant · NASA 3D model',
    distance: '\u2248 20,000 light-years',
    size: '\u2248 25 light-years across',
    hook: 'One of only three oxygen-rich remnants known in the Milky Way — with a pulsar at its heart.',
    description: 'Most supernova debris is a mix of everything the star ever made. G292.0+1.8 is different: its glowing filaments are dominated by nearly pure oxygen, neon and magnesium — the ashes of the star\u2019s core, unmixed. Deep inside sits a pulsar spinning once every 0.135 seconds, the crushed heart of the star that exploded roughly 3,000 years ago.',
    fact: 'The oxygen in this remnant was forged in the star\u2019s core in its final days — every breath you take contains atoms made the same way, in a star that died before you were born.',
    targetSize: 5.2,
    spin: 0.04,
    viewDist: 11.5
  },
  {
    id: 'crab',
    name: 'Crab Nebula',
    group: 'Supernova Remnants',
    kind: 'glb',
    file: 'assets/models/crab-nebula.glb',
    fileMB: '2.2 MB',
    type: 'Pulsar wind nebula · NASA 3D model',
    distance: '\u2248 6,500 light-years',
    size: '\u2248 11 light-years across',
    hook: 'The wreck of the \u201cguest star\u201d of 1054 — still powered by a spinning stellar ember.',
    description: 'On 4 July 1054, Chinese court astronomers recorded a new star so bright it was visible in daylight for 23 days. Its remnant is the Crab: a tangled cloud of filaments lit from within by the Crab Pulsar, a neutron star spinning thirty times a second whose beams of wind keep the whole nebula glowing nearly a thousand years after the explosion.',
    fact: 'The Crab Pulsar is very slowly braking — and the rotational energy it loses matches, almost exactly, the energy the nebula radiates away. The ember still runs the wreck.',
    targetSize: 5.2,
    spin: 0.04,
    viewDist: 11.5
  },

  /* ---------------- Galaxies (procedural particle systems) ---------------- */
  {
    id: 'milky-way',
    name: 'Milky Way',
    group: 'Galaxies',
    kind: 'galaxy',
    type: 'Barred spiral galaxy · particle rendering',
    distance: 'We are inside it',
    size: '\u2248 100,000 light-years across',
    hook: 'Home. Every star you have ever seen with your eyes lives in this disc.',
    description: 'Our galaxy is a barred spiral: a hundred billion stars or more arranged around a central bar, wrapped in two major arms — Scutum–Centaurus and Perseus — with fainter spurs between them. This rendering is built from that map: a warm old bulge, a blue-white star-forming disc, and the bar that gives the Milky Way its shape. We live about 26,000 light-years out, in a minor spur called the Orion Arm.',
    fact: 'From inside, the Milky Way\u2019s arms can never be photographed the way this model shows them — every \u201cportrait\u201d of our galaxy is a reconstruction from surveys, an artist-scientist\u2019s map of home.',
    spin: 0.02,
    viewDist: 15.5,
    galaxy: {
      stars: 30000, arms: 2, twist: 0.62, bar: true, barLength: 1.9,
      bulgeFraction: 0.30, bulgeRadius: 1.15, thickness: 0.14,
      tiltX: 0.42, young: [0.62, 0.74, 1.0], old: [1.0, 0.83, 0.58]
    }
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy · M31',
    group: 'Galaxies',
    kind: 'galaxy',
    type: 'Spiral galaxy · particle rendering',
    distance: '2.5 million light-years',
    size: '\u2248 150,000 light-years across',
    hook: 'Our big sister — twice our star count, tilted toward us, and coming this way.',
    description: 'Andromeda holds roughly a trillion stars in a disc noticeably larger than the Milky Way\u2019s, tipped at a steep angle to our line of sight. It is the most distant object visible to the naked eye: the light entering your eye tonight left before humans invented writing, farming, or the wheel. And it is approaching — in about 4.5 billion years the two galaxies will begin a slow gravitational merger.',
    fact: 'Andromeda is rushing toward us at about 110 kilometres per second. The eventual merger will not collide stars — space between them is too vast — but it will redraw both galaxies completely.',
    spin: 0.018,
    viewDist: 16.5,
    galaxy: {
      stars: 30000, arms: 2, twist: 0.5, bar: false,
      bulgeFraction: 0.34, bulgeRadius: 1.3, thickness: 0.12,
      tiltX: 1.05, young: [0.66, 0.76, 1.0], old: [1.0, 0.85, 0.62]
    }
  },
  {
    id: 'triangulum',
    name: 'Triangulum Galaxy · M33',
    group: 'Galaxies',
    kind: 'galaxy',
    type: 'Flocculent spiral galaxy · particle rendering',
    distance: '2.7 million light-years',
    size: '\u2248 60,000 light-years across',
    hook: 'The Local Group\u2019s third city — smaller, patchier, and quietly forming stars everywhere.',
    description: 'Triangulum is the third-largest member of our Local Group, after Andromeda and the Milky Way, but its spiral is loose and woolly — astronomers call the pattern \u201cflocculent\u201d, a disc of short, patchy arm segments rather than grand sweeping lanes. This rendering leans into that texture: more scatter, gentler arms, and a small, modest core.',
    fact: 'M33 hosts NGC 604, one of the largest known star nurseries — a glowing hydrogen cloud some 1,500 light-years wide, dwarfing the Orion Nebula in our own galaxy.',
    spin: 0.024,
    viewDist: 15,
    galaxy: {
      stars: 18000, arms: 2, twist: 0.44, bar: false,
      bulgeFraction: 0.16, bulgeRadius: 0.8, thickness: 0.16,
      tiltX: 0.62, young: [0.6, 0.74, 1.0], old: [0.98, 0.84, 0.62],
      scatter: 1.5
    }
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool Galaxy · M51',
    group: 'Galaxies',
    kind: 'galaxy',
    type: 'Grand-design spiral · particle rendering',
    distance: '23 million light-years',
    size: '\u2248 76,000 light-years across',
    hook: 'The textbook spiral — two perfect arms, sculpted by a companion passing behind.',
    description: 'M51 is the galaxy on the poster: a face-on grand-design spiral whose two crisp arms are thought to be density waves tightened by its small companion, NGC 5195, gliding behind the disc\u2019s edge (rendered here as the second, smaller swirl). Each pass squeezes gas along the arms and lights them with newborn blue stars — the spiral pattern is a traffic jam of star formation.',
    fact: 'Lord Rosse sketched M51\u2019s spiral by eye in 1845 — the first spiral structure ever recorded, decades before anyone knew what a galaxy was.',
    spin: 0.022,
    viewDist: 15.5,
    galaxy: {
      stars: 26000, arms: 2, twist: 0.72, bar: false,
      bulgeFraction: 0.24, bulgeRadius: 1.0, thickness: 0.11,
      tiltX: 0.3, young: [0.58, 0.72, 1.0], old: [1.0, 0.84, 0.6],
      companion: { stars: 4500, radius: 1.5, offset: [5.4, 0.7, -1.6], arms: 2, twist: 0.8 }
    }
  },
  {
    id: 'sombrero',
    name: 'Sombrero Galaxy · M104',
    group: 'Galaxies',
    kind: 'galaxy',
    type: 'Spiral galaxy with dust lane · particle rendering',
    distance: '29 million light-years',
    size: '\u2248 49,000 light-years across',
    hook: 'A brilliant core in a flat hat — with a dark lane of dust drawn across the brim.',
    description: 'Sombrero is mostly bulge: an enormous, luminous core that outshines its own disc, wrapped in a thin ring of stars cut by a famous dark dust lane (rendered here as a dimming band across the disc, the way the lane swallows starlight). Somewhere inside that glare sits a black hole of about a billion solar masses — one of the largest in the nearby universe.',
    fact: 'M104\u2019s core is so bright partly because it is crowded with old stars and about 2,000 globular clusters — ten times the Milky Way\u2019s count.',
    spin: 0.016,
    viewDist: 15.5,
    galaxy: {
      stars: 24000, arms: 2, twist: 0.34, bar: false,
      bulgeFraction: 0.55, bulgeRadius: 1.7, thickness: 0.09,
      tiltX: 1.25, young: [0.7, 0.78, 1.0], old: [1.0, 0.86, 0.64],
      dustLane: true
    }
  },
  {
    id: 'pinwheel',
    name: 'Pinwheel Galaxy · M101',
    group: 'Galaxies',
    kind: 'galaxy',
    type: 'Giant spiral galaxy · particle rendering',
    distance: '21 million light-years',
    size: '\u2248 170,000 light-years across',
    hook: 'Nearly twice the Milky Way\u2019s span — a giant made of loosely wound arms and star-forming knots.',
    description: 'The Pinwheel is one of the largest known disc galaxies, and one of the loosest: its arms unwind slowly and are studded with giant star-forming regions, some far bigger than anything in the Milky Way. Seen almost perfectly face-on, it is a favourite target for showing what a spiral looks like from directly above — this rendering keeps the arms open and the core small, just as the real M101 presents itself.',
    fact: 'M101 has hosted several recorded supernovae, including SN 2011fe — a Type Ia explosion so nearby and bright that it became one of the best-studied supernovae in history.',
    spin: 0.02,
    viewDist: 16.5,
    galaxy: {
      stars: 28000, arms: 2, twist: 0.4, bar: false,
      bulgeFraction: 0.18, bulgeRadius: 0.9, thickness: 0.13,
      tiltX: 0.36, young: [0.6, 0.73, 1.0], old: [0.99, 0.84, 0.6],
      scatter: 1.25
    }
  },

  /* ---------------- The Center (black hole) ---------------- */
  {
    id: 'sagittarius-a',
    name: 'Sagittarius A*',
    group: 'The Center',
    kind: 'blackhole',
    type: 'Supermassive black hole · procedural rendering',
    distance: '26,000 light-years — the Milky Way\u2019s core',
    size: '4.3 million solar masses · horizon \u2248 24 million km wide',
    hook: 'The dark heart of our galaxy, imaged by a telescope the size of Earth.',
    description: 'At the exact centre of the Milky Way sits a black hole of 4.3 million solar masses, small enough to fit inside Mercury\u2019s orbit. Gas spiralling into it heats to millions of degrees and glows — the bright disc in this rendering — while the black sphere at its heart is the event horizon itself, the surface past which nothing, not even light, returns. In 2022 the Event Horizon Telescope, a planet-wide array, photographed its shadow.',
    fact: 'The star S2 whips around Sgr A* once every 16 years, reaching 7,650 km/s at closest approach — so fast that Einstein\u2019s gravitational redshift has been measured directly in its light.',
    spin: 0.05,
    viewDist: 13
  }
];
