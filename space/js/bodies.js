// Cosmos — catalogue data. All wording is original to this site;
// the numbers are standard published values (rounded), noted per entry.

export const PLANETS = [
  {
    id: "sun", name: "Sun", kind: "Star — G-type (G2V)", texture: "sun",
    color: 0xffb340, radiusVisible: 9, orbitRadius: 0, orbitRadiusReal: 0,
    orbitSpeed: 0, spinSpeed: 0.02,
    stats: {
      "Diameter": "1.39 million km — about 109 Earths across",
      "Surface temperature": "≈ 5,500 °C (core: ≈ 15 million °C)",
      "Rotation": "Roughly once every 27 days at its equator",
      "Distance from Earth": "149.6 million km (1 AU) — light takes 8 min 20 s"
    },
    tagline: "The 4.6-billion-year-old furnace that holds the whole system together.",
    description: "The Sun contains 99.86% of all the mass in the solar system. Deep inside, hydrogen nuclei are squeezed into helium, and the energy released takes a winding journey outward before escaping as light and heat. Every planet, comet and speck of dust in the system is in orbit around this one star.",
    fact: "About 1.3 million Earths would fit inside the Sun — and it still counts as a fairly ordinary, middle-aged star."
  },
  {
    id: "mercury", name: "Mercury", kind: "Planet — terrestrial", texture: "speckle",
    color: 0x9c8e84, radiusVisible: 0.9, orbitRadius: 16, orbitRadiusReal: 34,
    orbitSpeed: 0.48, spinSpeed: 0.004, axialTilt: 0.03,
    stats: {
      "Distance from Sun": "57.9 million km (0.39 AU)",
      "Diameter": "4,879 km — the smallest planet",
      "Day length": "One solar day lasts 176 Earth days",
      "Year length": "88 Earth days",
      "Moons": "0"
    },
    tagline: "The swift, cratered sprinter hugging the Sun.",
    description: "Mercury races around the Sun faster than any other planet, yet spins on its axis so slowly that a single day-night cycle takes two of its years. With almost no atmosphere to smooth things out, its surface swings from hotter than a pizza oven at noon to colder than dry ice at night.",
    fact: "Mercury is slowly shrinking: as its huge iron core cools, the whole planet contracts and wrinkles like a dried apple."
  },
  {
    id: "venus", name: "Venus", kind: "Planet — terrestrial", texture: "bands-soft",
    color: 0xe8c87a, radiusVisible: 1.5, orbitRadius: 22, orbitRadiusReal: 40,
    orbitSpeed: 0.35, spinSpeed: -0.002, axialTilt: 177.4,
    stats: {
      "Distance from Sun": "108.2 million km (0.72 AU)",
      "Diameter": "12,104 km — nearly Earth's twin in size",
      "Day length": "243 Earth days, spinning backwards",
      "Year length": "225 Earth days",
      "Moons": "0"
    },
    tagline: "A runaway-greenhouse world wrapped in acid cloud.",
    description: "Beneath Venus's creamy clouds sits the hottest surface of any planet, hot enough to melt lead, crushed by air pressure ninety times Earth's. It spins the 'wrong' way and so slowly that its day outlasts its year — possibly the scar of an ancient colossal collision.",
    fact: "On Venus the Sun rises in the west — and a Venusian day (243 Earth days) is longer than a Venusian year (225)."
  },
  {
    id: "earth", name: "Earth", kind: "Planet — terrestrial", texture: "earth",
    color: 0x4d7dd1, radiusVisible: 1.6, orbitRadius: 29, orbitRadiusReal: 44,
    orbitSpeed: 0.30, spinSpeed: 0.30, axialTilt: 23.4,
    stats: {
      "Distance from Sun": "149.6 million km (1 AU)",
      "Diameter": "12,742 km",
      "Day length": "23.9 hours",
      "Year length": "365.25 days",
      "Moons": "1 — the Moon (see its own entry)"
    },
    tagline: "The only known world with oceans, oxygen and life.",
    description: "Earth sits in the Sun's habitable zone, where liquid water can persist on the surface. A protective magnetic field, a breathable atmosphere and plate tectonics recycling the crust have kept conditions stable enough for life to flourish for nearly four billion years.",
    fact: "Earth is the densest planet in the solar system — and the only one not named after a god."
  },
  {
    id: "moon", name: "Moon", kind: "Moon — orbits Earth", texture: "speckle",
    color: 0xc9c4bb, radiusVisible: 0.45, orbitRadius: 0, orbitRadiusReal: 0,
    orbitSpeed: 0, spinSpeed: 0.02, parentId: "earth",
    stats: {
      "Distance from Earth": "384,400 km on average",
      "Diameter": "3,474 km — about a quarter of Earth's",
      "Day length": "29.5 Earth days (one full cycle of phases)",
      "Year length": "Orbits Earth every 27.3 days",
      "Moons": "— (it is one)"
    },
    tagline: "Earth's constant companion, born from a collision.",
    description: "The Moon likely formed when a Mars-sized world smashed into the young Earth and the debris clumped together. Ever since, its gravity has steadied Earth's tilt, driven the tides, and slowly pushed it away — about 3.8 cm farther every year.",
    fact: "The same side of the Moon always faces us, because its spin and its orbit take exactly the same time."
  },
  {
    id: "mars", name: "Mars", kind: "Planet — terrestrial", texture: "speckle-red",
    color: 0xc1612f, radiusVisible: 1.2, orbitRadius: 36, orbitRadiusReal: 51,
    orbitSpeed: 0.24, spinSpeed: 0.29, axialTilt: 25.2,
    stats: {
      "Distance from Sun": "227.9 million km (1.52 AU)",
      "Diameter": "6,779 km — about half of Earth",
      "Day length": "24.6 hours",
      "Year length": "687 Earth days",
      "Moons": "2 — Phobos and Deimos"
    },
    tagline: "The rust-red desert that once had rivers.",
    description: "Mars is a cold desert today, but its dried riverbeds, lake sediments and polar ice tell of a warmer, wetter past. It hosts Olympus Mons, a volcano nearly three times the height of Everest, and a canyon system that would stretch across the United States.",
    fact: "Sunsets on Mars are blue: fine dust scatters the red light away and lets a cool blue glow surround the setting Sun."
  },
  {
    id: "jupiter", name: "Jupiter", kind: "Planet — gas giant", texture: "bands-jupiter",
    color: 0xd8b08a, radiusVisible: 4.6, orbitRadius: 48, orbitRadiusReal: 82,
    orbitSpeed: 0.13, spinSpeed: 0.70, axialTilt: 3.1,
    stats: {
      "Distance from Sun": "778.5 million km (5.2 AU)",
      "Diameter": "139,820 km — 11 Earths across",
      "Day length": "9.9 hours — the fastest spin of any planet",
      "Year length": "11.9 Earth years",
      "Moons": "95 recognised (including Europa, Ganymede and Io)"
    },
    tagline: "The king of planets, with a storm wider than Earth.",
    description: "Jupiter is more massive than every other planet combined, and its gravity acts as a shield that flings away many comets and asteroids. Its Great Red Spot is a storm that has raged for centuries, and several of its moons may hide oceans beneath their ice.",
    fact: "If Jupiter had been about 80 times more massive, it would have ignited fusion and become a second star."
  },
  {
    id: "saturn", name: "Saturn", kind: "Planet — gas giant", texture: "bands-soft",
    color: 0xe3cf9e, radiusVisible: 3.9, orbitRadius: 62, orbitRadiusReal: 108,
    orbitSpeed: 0.10, spinSpeed: 0.65, axialTilt: 26.7, rings: { inner: 1.35, outer: 2.4 },
    stats: {
      "Distance from Sun": "1.43 billion km (9.6 AU)",
      "Diameter": "116,460 km — 9.5 Earths across",
      "Day length": "10.7 hours",
      "Year length": "29.4 Earth years",
      "Moons": "274 confirmed — the most of any planet"
    },
    tagline: "The ringed jewel, light enough to float in a big enough bath.",
    description: "Saturn's rings span about 280,000 km from edge to edge yet are only about ten metres thick in places — countless shards of nearly pure water ice, from grains of sand to house-sized chunks. The planet itself is a pale-gold world of hydrogen and helium with the lowest density of any planet.",
    fact: "Saturn's moon Enceladus sprays salty water from a hidden ocean into space — and that spray builds one of Saturn's outer rings."
  },
  {
    id: "uranus", name: "Uranus", kind: "Planet — ice giant", texture: "smooth",
    color: 0x9fe3e0, radiusVisible: 2.6, orbitRadius: 74, orbitRadiusReal: 150,
    orbitSpeed: 0.07, spinSpeed: -0.40, axialTilt: 97.8, rings: { inner: 1.6, outer: 2.0 },
    stats: {
      "Distance from Sun": "2.87 billion km (19.2 AU)",
      "Diameter": "50,724 km — 4 Earths across",
      "Day length": "17.2 hours, spinning on its side",
      "Year length": "84 Earth years",
      "Moons": "At least 28 known"
    },
    tagline: "The planet knocked onto its side, rolling around the Sun.",
    description: "Uranus is tilted by 98 degrees, so it orbits like a rolling barrel and each pole gets 21 years of sunlight followed by 21 years of darkness. Methane high in its atmosphere absorbs red light, giving the planet its serene pale-cyan face — the coldest atmosphere of any planet.",
    fact: "Uranus was the first planet discovered with a telescope (1781) — and for each of its years, Earth has circled the Sun 84 times."
  },
  {
    id: "neptune", name: "Neptune", kind: "Planet — ice giant", texture: "bands-soft",
    color: 0x3f66d4, radiusVisible: 2.5, orbitRadius: 84, orbitRadiusReal: 187,
    orbitSpeed: 0.055, spinSpeed: 0.42, axialTilt: 28.3,
    stats: {
      "Distance from Sun": "4.50 billion km (30.1 AU)",
      "Diameter": "49,244 km",
      "Day length": "16.1 hours",
      "Year length": "164.8 Earth years",
      "Moons": "16 known (largest: Triton)"
    },
    tagline: "The deep-blue world with the fastest winds in the system.",
    description: "Neptune was found by mathematics before telescopes: astronomers noticed Uranus being tugged and calculated where another planet must be. Despite receiving barely any sunlight, it radiates more heat than it receives and drives supersonic winds past 2,000 km/h.",
    fact: "Neptune has completed just one full orbit since its discovery in 1846 — its first 'birthday' was in 2011."
  },
  {
    id: "pluto", name: "Pluto", kind: "Dwarf planet — Kuiper belt", texture: "speckle",
    color: 0xd9bfa3, radiusVisible: 0.6, orbitRadius: 94, orbitRadiusReal: 214,
    orbitSpeed: 0.045, spinSpeed: 0.05, axialTilt: 122.5, orbitTilt: 17,
    stats: {
      "Distance from Sun": "5.9 billion km on average (39.5 AU), on a tilted, stretched orbit",
      "Diameter": "2,377 km — smaller than Earth's Moon",
      "Day length": "6.4 Earth days, spinning backwards",
      "Year length": "248 Earth years",
      "Moons": "5 — Charon is half Pluto's size"
    },
    tagline: "The beloved dwarf planet with a heart of ice.",
    description: "Pluto was the ninth planet until 2006, when it was reclassified as a dwarf planet — the best-known citizen of the Kuiper belt, a doughnut of icy worlds beyond Neptune. The New Horizons flyby in 2015 revealed nitrogen glaciers, a vast heart-shaped ice plain and mountains of water ice.",
    fact: "Pluto and its largest moon Charon both orbit a point in the space between them — a true double world."
  }
];

// Famous stars. radiusSolar = true radius in Suns (for the capped display scale).
// distanceLy, tempK are standard published values (rounded).
export const STARS = [
  {
    id: "sirius", name: "Sirius", constellation: "Canis Major", distanceLy: 8.6,
    spectral: "A1 V", radiusSolar: 1.71, tempK: 9940,
    tagline: "The brightest star in Earth's night sky.",
    description: "Sirius outshines every other night-time star mostly because it is close and genuinely luminous — about 25 times brighter than the Sun. It has a tiny companion, Sirius B, a white dwarf the size of Earth that packs roughly the Sun's mass into that small body.",
    fact: "Ancient Egyptians based a calendar on Sirius's return to the dawn sky, which heralded the Nile's yearly flood.",
    comparison: "About 1.7 Suns would fit across Sirius — modest in size, but it burns far hotter and brighter than the Sun."
  },
  {
    id: "proxima", name: "Proxima Centauri", constellation: "Centaurus", distanceLy: 4.25,
    spectral: "M5.5 Ve", radiusSolar: 0.15, tempK: 3042,
    tagline: "Our nearest stellar neighbour of all.",
    description: "Proxima is a small red dwarf just 4.25 light-years away — the closest star to the Sun, yet so dim it was only found in 1915 and can never be seen with the naked eye. It hosts at least one rocky planet, Proxima b, inside its habitable zone.",
    fact: "Even our fastest spacecraft would need tens of thousands of years to reach Proxima — interstellar really means it.",
    comparison: "Only about one-seventh the Sun's width: roughly 11 Jupiters side by side would span Proxima."
  },
  {
    id: "alphacen-a", name: "Alpha Centauri A", constellation: "Centaurus", distanceLy: 4.37,
    spectral: "G2 V", radiusSolar: 1.22, tempK: 5790,
    tagline: "The Sun's near-twin in the next system over.",
    description: "Alpha Centauri A is the same class of star as the Sun, a touch larger and brighter, and about the same age. It orbits with a slightly smaller companion, Alpha Centauri B, while distant Proxima completes the triple system.",
    fact: "Together, Alpha Centauri A and B appear as the third-brightest 'star' in our sky — two suns blended into one point of light.",
    comparison: "About 1.2 Suns across — stand it next to the Sun and the family resemblance is obvious."
  },
  {
    id: "betelgeuse", name: "Betelgeuse", constellation: "Orion", distanceLy: 548,
    spectral: "M1–M2 Ia", radiusSolar: 764, tempK: 3600,
    tagline: "The red supergiant on Orion's shoulder, living on borrowed time.",
    description: "Betelgeuse is a colossal, unstable red supergiant nearing the end of its life. Its size pulses and its brightness visibly varies; in 2019–20 it dimmed dramatically as it shrugged off a cloud of its own dust. Sometime in the next 100,000 years it will explode as a supernova.",
    fact: "When Betelgeuse does explode, it will shine about as brightly as the full Moon and be visible in daylight for weeks.",
    comparison: "Roughly 760 Suns would fit across Betelgeuse. Put in the Sun's place, it would swallow Mercury, Venus, Earth and Mars — and by some measures reach toward Jupiter."
  },
  {
    id: "rigel", name: "Rigel", constellation: "Orion", distanceLy: 863,
    spectral: "B8 Ia", radiusSolar: 79, tempK: 12100,
    tagline: "The blue supergiant at Orion's foot.",
    description: "Rigel is a hot blue supergiant pouring out well over 100,000 times the Sun's light, even though it sits hundreds of light-years away. It is actually a small family of stars, with several companions orbiting the brilliant primary.",
    fact: "Rigel's light left it around the time Viking longships were crossing the Atlantic — that's how long the journey took.",
    comparison: "About 79 Suns across — a sphere of Rigel in the Sun's place would stretch past the orbit of Mercury."
  },
  {
    id: "vega", name: "Vega", constellation: "Lyra", distanceLy: 25,
    spectral: "A0 Va", radiusSolar: 2.36, tempK: 9602,
    tagline: "The former — and future — North Star.",
    description: "Vega is a brilliant blue-white star spinning so fast it bulges at its equator, ringed by a disk of dusty debris left over from planet formation. For centuries it was astronomy's reference star, the yardstick against which other stars' brightness was defined.",
    fact: "Earth's axis slowly wobbles, so Vega was the pole star around 12,000 BCE — and will be again in about 12,000 years.",
    comparison: "About 2.4 Suns across, but shining with roughly 40 times the Sun's light."
  },
  {
    id: "polaris", name: "Polaris", constellation: "Ursa Minor", distanceLy: 447,
    spectral: "F7 Ib", radiusSolar: 40, tempK: 6015,
    tagline: "The North Star that guides by standing still.",
    description: "Polaris sits almost exactly above Earth's north pole, so while every other star wheels around it through the night, it barely moves. It is a yellow supergiant whose light output pulses gently — the closest and brightest of a class called Cepheid variables.",
    fact: "Polaris won't be the pole star forever: Earth's slow axial wobble means the pole will drift away from it over coming centuries.",
    comparison: "About 40 Suns would fit across Polaris — and it shines roughly 2,500 times brighter than the Sun."
  },
  {
    id: "antares", name: "Antares", constellation: "Scorpius", distanceLy: 554,
    spectral: "M1.5 Iab", radiusSolar: 680, tempK: 3660,
    tagline: "The rival of Mars, glowing red in the scorpion's heart.",
    description: "Antares takes its name from Greek for 'rival of Ares' (Mars), because its deep red glow so often gets mistaken for the planet. It is another enormous red supergiant — if it replaced the Sun, Earth would be inside it.",
    fact: "Antares has a hot blue companion star that is usually lost in its glare; during rare lunar occultations it peeks out for a few seconds.",
    comparison: "Around 680 Suns across — its outer layers are so thin, though, that its edge is more of a fog than a surface."
  },
  {
    id: "deneb", name: "Deneb", constellation: "Cygnus", distanceLy: 2615,
    spectral: "A2 Ia", radiusSolar: 203, tempK: 8525,
    tagline: "A lighthouse across 2,600 light-years.",
    description: "Deneb marks the tail of the swan and one corner of the Summer Triangle. Its exact distance is hard to pin down, but by any measure it is one of the most luminous stars known — a white supergiant whose light survives a journey of thousands of light-years to reach backyard telescopes.",
    fact: "If Deneb were as close as Sirius, it would shine brightly enough to cast shadows on a moonless night.",
    comparison: "About 200 Suns would fit across Deneb, and it radiates close to 200,000 times the Sun's light."
  },
  {
    id: "spica", name: "Spica", constellation: "Virgo", distanceLy: 250,
    spectral: "B1 III", radiusSolar: 7.4, tempK: 25300,
    tagline: "A furiously hot blue pair, almost touching.",
    description: "Spica looks like a single blue-white point, but it is two massive stars orbiting so closely that their gravity stretches each into an egg shape, finishing a loop every four days. Together they pour out more than 20,000 times the Sun's light.",
    fact: "Spica's wobble in ancient observations helped the Greek astronomer Hipparchus discover the precession of Earth's axis.",
    comparison: "The larger star is about 7.4 Suns across — compact for its power, because blue stars pack enormous energy into small bodies."
  },
  {
    id: "arcturus", name: "Arcturus", constellation: "Boötes", distanceLy: 36.7,
    spectral: "K1.5 III", radiusSolar: 25.4, tempK: 4286,
    tagline: "The orange giant whose light opened a world's fair.",
    description: "Arcturus is a red giant that has finished the hydrogen in its core and swollen as it burns helium instead. It is the brightest star in the northern celestial hemisphere, and it is rushing past the Sun at about 122 km per second — a visitor passing through our neighbourhood.",
    fact: "In 1933, light from Arcturus was used to switch on the opening of the Chicago World's Fair, timed so the light had left the star around the previous Chicago fair in 1893.",
    comparison: "About 25 Suns would fit across Arcturus — a glimpse of the size the Sun itself will reach as a red giant one day."
  },
  {
    id: "procyon", name: "Procyon", constellation: "Canis Minor", distanceLy: 11.5,
    spectral: "F5 IV", radiusSolar: 2.05, tempK: 6530,
    tagline: "The 'before the dog' star, with a dead companion.",
    description: "Procyon's Greek name means 'before the dog', because it rises just ahead of Sirius, the Dog Star. Like Sirius it has a white-dwarf companion — the burnt-out core of a star that once outshone it and has since died.",
    fact: "Procyon and Sirius bookend the celestial equator — for centuries, seeing Procyon rise told skywatchers that Sirius was moments behind it.",
    comparison: "About 2 Suns across and roughly 7 times as luminous — a star quietly beginning to swell off the main sequence."
  }
];

export const SYSTEM_CENTER = { x: 0, y: 0, z: 0 };
export const STAR_STAGE = { x: 600, y: 0, z: 0 };
