/*
 * GemVerse — exhibit data.
 * All text below is original copy written for this gallery. Gemological
 * facts (hardness, chemistry, colour causes) are standard reference data.
 * `formula` may contain <sub> markup — it is rendered as HTML.
 */

export const GEMS = [
  {
    id: 'amethyst',
    name: 'Amethyst',
    accent: 0x8e5fc0,
    mohs: '7',
    formula: 'SiO<sub>2</sub>',
    mineralClass: 'Quartz — silicon dioxide',
    colorNote: 'Violet to deep purple, coloured by trace iron shifted by natural irradiation',
    hook: 'The violet quartz that grows like a skyline inside hollow rock.',
    description:
      'Amethyst is the purple variety of quartz, grown as six-sided crystals tipped ' +
      'with pyramids inside hollow volcanic rock. Its colour comes from trace iron ' +
      'in the crystal lattice, its energy levels nudged by natural irradiation over ' +
      'millions of years. Split a geode open and you find a whole skyline of points, ' +
      'each one a single crystal that grew inward from the walls.',
    fact:
      'The name comes from the Greek amethystos — “not drunk”. The stone was once ' +
      'believed to protect its wearer from intoxication, and wine goblets were ' +
      'sometimes carved from it, just in case.',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    accent: 0xe8ecf4,
    mohs: '10',
    formula: 'C',
    mineralClass: 'Native element — crystallised carbon',
    colorNote: 'Colourless; prized for brilliance and the rainbow flashes called “fire”',
    hook: 'Pure carbon, cut into a hall of tiny mirrors.',
    description:
      'A diamond is carbon crystallised under crushing pressure more than a hundred ' +
      'kilometres inside the Earth, then cut into dozens of facets arranged like ' +
      'tiny mirrors. A well-cut stone traps incoming light, bounces it around ' +
      'inside, and returns it to the eye split into flashes of spectral colour — ' +
      'the “fire” jewellers talk about. Nothing else natural is harder.',
    fact:
      'Diamond conducts heat better than any other natural material, which is why a ' +
      'real diamond feels cool against the skin — and why gem testers can identify ' +
      'one by how quickly it pulls heat away.',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    accent: 0x1fae62,
    mohs: '7.5 – 8',
    formula: 'Be<sub>3</sub>Al<sub>2</sub>(SiO<sub>3</sub>)<sub>6</sub>',
    mineralClass: 'Beryl — beryllium aluminium silicate',
    colorNote: 'Saturated green from trace chromium and vanadium',
    hook: 'Beryl’s green heart, garden and all.',
    description:
      'Emerald is the green variety of the mineral beryl, coloured by trace chromium ' +
      'and vanadium. It grows in hexagonal crystals, but almost always under violent ' +
      'geological conditions, so flawless stones are rarer than diamonds. Most ' +
      'emeralds carry a mossy web of tiny inclusions — far from ruining the stone, ' +
      'they are the signature that it grew in the earth and not in a laboratory.',
    fact:
      'Gem dealers call an emerald’s internal inclusions its jardin — French for ' +
      '“garden” — because the little fractures and trapped crystals inside look ' +
      'like foliage when you peer in with a loupe.',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    accent: 0xd21f3c,
    mohs: '9',
    formula: 'Al<sub>2</sub>O<sub>3</sub>',
    mineralClass: 'Corundum — aluminium oxide',
    colorNote: 'Red from chromium; the finest shade is a pure, glowing scarlet',
    hook: 'Corundum set alight by a pinch of chromium.',
    description:
      'Ruby is corundum — plain aluminium oxide — tinted red by chromium atoms ' +
      'standing in for some of the aluminium. It is exactly the same mineral as ' +
      'sapphire; only the colour earns a different name. The most prized stones ' +
      'hold a pure, slightly bluish red, and the chromium in them fluoresces, so ' +
      'a fine ruby seems to light up from within in strong sunlight.',
    fact:
      'Shine ultraviolet light on a ruby and it fluoresces bright red: the same ' +
      'chromium atoms that colour the stone absorb the UV and re-emit it as ' +
      'visible red light.',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    accent: 0x2b52c4,
    mohs: '9',
    formula: 'Al<sub>2</sub>O<sub>3</sub>',
    mineralClass: 'Corundum — aluminium oxide',
    colorNote: 'Velvety cornflower to deep midnight blue, from iron and titanium',
    hook: 'The same mineral as ruby — wearing blue.',
    description:
      'Blue sapphire is corundum coloured by trace iron and titanium trading ' +
      'electrons deep inside the crystal. The most celebrated stones, from Kashmir ' +
      'and Burma, show a soft, velvety blue caused by microscopic inclusions that ' +
      'scatter light like silk. The stone on this cushion is cut round, the shape ' +
      'that best shows off that depth of colour as it turns.',
    fact:
      'Sapphire is corundum in any colour except red — it also grows pink, yellow, ' +
      'green and entirely colourless. Only the red version gets its own name: ruby.',
  },
  {
    id: 'opal',
    name: 'Opal',
    accent: 0xf2e9dc,
    mohs: '5.5 – 6.5',
    formula: 'SiO<sub>2</sub>·nH<sub>2</sub>O',
    mineralClass: 'Hydrated silica — a mineraloid, not a crystal',
    colorNote: 'Milky white, with patches of rainbow that drift as the stone moves',
    hook: 'Not a crystal at all — a stack of glassy spheres playing with light.',
    description:
      'Opal never crystallises. It is a tidy stack of microscopic silica spheres, ' +
      'settled grain by grain from ancient groundwater and cemented into a solid. ' +
      'The regular gaps between the spheres split white light into colours — the ' +
      'play-of-color that drifts across this cabochon as it turns, each patch ' +
      'diffracted by spheres of a slightly different size.',
    fact:
      'Opal can hold a surprising amount of water — up to about a fifth of its ' +
      'weight, locked inside the silica — and its colours come from spheres just ' +
      'a few hundred nanometres wide, smaller than a wavelength of light is long.',
  },
  {
    id: 'quartz',
    name: 'Quartz',
    accent: 0xdfe8ea,
    mohs: '7',
    formula: 'SiO<sub>2</sub>',
    mineralClass: 'Quartz — silicon dioxide (“rock crystal”)',
    colorNote: 'Water-clear, like ice that never melts',
    hook: 'Six-sided points of clear crystal, common as dirt and lovely as glass.',
    description:
      'Clear quartz — the old “rock crystal” — is silicon dioxide grown into ' +
      'six-sided prisms with pyramidal points. It is one of the commonest minerals ' +
      'on Earth, yet flawless points like these formed slowly, from hot silica-rich ' +
      'water moving through cracks deep underground. The ancient Greeks believed ' +
      'it was ice frozen so hard by the gods that it could never melt again.',
    fact:
      'Quartz is piezoelectric: squeeze a crystal and it produces a tiny electric ' +
      'voltage, and feed it a current and it vibrates at a perfectly steady rate. ' +
      'That electrical heartbeat is what keeps time inside a quartz watch.',
  },
  {
    id: 'topaz',
    name: 'Topaz',
    accent: 0xe8a41c,
    mohs: '8',
    formula: 'Al<sub>2</sub>SiO<sub>4</sub>(F,OH)<sub>2</sub>',
    mineralClass: 'Nesosilicate — aluminium fluorosilicate',
    colorNote: 'Warm gold to pink-tinged amber — the “imperial” shades',
    hook: 'A golden prism with a hidden seam.',
    description:
      'Topaz is an aluminium silicate that grows into long, elegant prisms inside ' +
      'cooling granite and volcanic rhyolite. The golden stones called imperial ' +
      'topaz shade from honey to a pink-tinged amber, and big flawless crystals ' +
      'can grow to the size of a brick. Topaz cleaves perfectly along one hidden ' +
      'plane, so cutters must orient every stone with care or it may split along ' +
      'that seam with a single knock.',
    fact:
      'Topaz defines hardness 8 on the Mohs scale — the standard scratch-test ' +
      'reference that sits between quartz (7) and corundum (9) in every geology ' +
      'classroom.',
  },
];
