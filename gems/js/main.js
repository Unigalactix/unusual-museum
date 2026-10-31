/*
 * GemVerse — a jeweller's vault of eight gemstones.
 * Every stone is built procedurally from Three.js geometry: faceted cuts
 * from cylinders, cones and rounded boxes, crystal clusters from hexagonal
 * prisms, and an opal cabochon with true iridescence. Materials are
 * MeshPhysicalMaterial throughout the gems — clearcoat and environment
 * reflections do the work that transmission would, at a fraction of the
 * cost — and each pedestal lamp warms when its stone is selected.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GEMS } from './gems.js';

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const stageEl = document.getElementById('stage');
const loadingEl = document.getElementById('loading');
const failEl = document.getElementById('webgl-fail');
const tooltipEl = document.getElementById('tooltip');
const panelEl = document.getElementById('panel');
const panelEyebrow = document.getElementById('panel-eyebrow');
const panelName = document.getElementById('panel-name');
const panelTagline = document.getElementById('panel-tagline');
const panelStats = document.getElementById('panel-stats');
const panelDesc = document.getElementById('panel-description');
const panelFact = document.getElementById('panel-fact');
const statMohs = document.getElementById('stat-mohs');
const statFormula = document.getElementById('stat-formula');
const statClass = document.getElementById('stat-class');
const statColor = document.getElementById('stat-color');
const nowViewingEl = document.getElementById('now-viewing');
const dotsEl = document.getElementById('dots');
const gemListEl = document.getElementById('gem-list');
const sparkleSlider = document.getElementById('sparkle-slider');
const rotateBtn = document.getElementById('rotate-toggle');

// Welcome copy, restored when the visitor returns to the whole vault.
const WELCOME = {
  eyebrow: panelEyebrow.textContent,
  name: panelName.textContent,
  tagline: panelTagline.textContent,
  description: panelDesc.textContent,
  fact: panelFact.textContent,
};

/* ------------------------------------------------------------------ */
/* Renderer / scene / camera                                           */
/* ------------------------------------------------------------------ */

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  loadingEl.hidden = true;
  failEl.hidden = false;
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stageEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0610);
scene.fog = new THREE.Fog(0x0a0610, 26, 58);

// Image-based lighting: the sparkle on every facet comes from here.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 140);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.6;
controls.maxDistance = 40;
controls.maxPolarAngle = 1.53;

/* Vault lighting: a cool ambient hush, one shadow-casting key light,
 * and two faint coloured washes at the ends of the row for "fire". */
scene.add(new THREE.AmbientLight(0x8d84b8, 0.35));
const hemi = new THREE.HemisphereLight(0xcfc4ff, 0x1c0f18, 0.5);
scene.add(hemi);
const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
keyLight.position.set(6, 13, 9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -15;
keyLight.shadow.camera.right = 15;
keyLight.shadow.camera.top = 12;
keyLight.shadow.camera.bottom = -8;
scene.add(keyLight);
const washL = new THREE.PointLight(0xb04dff, 14, 26, 1.9);
washL.position.set(-14, 3.4, 3.5);
scene.add(washL);
const washR = new THREE.PointLight(0x2fb9c9, 14, 26, 1.9);
washR.position.set(14, 3.4, 3.5);
scene.add(washR);

/* ------------------------------------------------------------------ */
/* Helpers (house style, shared with the other galleries)              */
/* ------------------------------------------------------------------ */

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color, roughness: 0.62, metalness: 0.08, flatShading: true }, opts)
  );
}

function phys(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial(
    Object.assign(
      { color, roughness: 0.4, metalness: 0.02, flatShading: true, envMapIntensity: 0.5 },
      opts
    )
  );
}

/* Gem material: low roughness, full clearcoat, strong environment
 * response — the facet fire comes from reflections, not transmission. */
function gemMat(color, opts = {}) {
  return phys(color, Object.assign({
    roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.25,
  }, opts));
}

function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* Four-point star sprite for sparkles. */
function starTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(32, 3); g.lineTo(32, 61);
  g.moveTo(3, 32); g.lineTo(61, 32);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const starTex = starTexture();

/* Twinkling sparkle shell around a stone. */
const sparkleSystems = [];
function makeSparkles({ count = 26, radius = 0.95, cy = 0.55, rainbow = false, base = 0.85 }) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() * 2 - 1) * 0.55;
    const r = radius * (0.75 + Math.random() * 0.45) * Math.sqrt(Math.max(0.12, 1 - y * y));
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = cy + y * 0.75;
    pos[i * 3 + 2] = Math.sin(a) * r;
    if (rainbow) c.setHSL(Math.random(), 0.85, 0.72);
    else c.setHex(0xfff3cf);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', col);
  const mat = new THREE.PointsMaterial({
    size: 0.13, map: starTex, vertexColors: true, transparent: true, opacity: base,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.phase = Math.random() * Math.PI * 2;
  pts.userData.base = base;
  sparkleSystems.push(pts);
  return pts;
}

let sparkleLevel = (Number(sparkleSlider.value) / 100) * 1.3;

/* ------------------------------------------------------------------ */
/* The vault room: floor, back wall, brass line                        */
/* ------------------------------------------------------------------ */

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 30, 256, 256, 256);
  grad.addColorStop(0, '#3d2438');
  grad.addColorStop(0.55, '#211222');
  grad.addColorStop(1, '#0a0610');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(255,255,255,0.045)';
  g.lineWidth = 1.3;
  for (let i = 0; i < 22; i++) {
    g.beginPath();
    let x = Math.random() * 512, y = Math.random() * 512;
    g.moveTo(x, y);
    for (let j = 0; j < 4; j++) { x += (Math.random() - 0.5) * 90; y += (Math.random() - 0.5) * 90; g.lineTo(x, y); }
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(46, 64),
  new THREE.MeshPhysicalMaterial({
    map: floorTexture(), roughness: 0.3, metalness: 0.15,
    clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 0.4,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(76, 20),
  std(0x1d1224, { roughness: 0.95, flatShading: false })
);
wall.position.set(0, 10, -7);
wall.receiveShadow = true;
scene.add(wall);

// A thin brass line on the floor in front of the row — the "do not
// lean on the glass" line every vault has.
const brassLine = mesh(
  new THREE.BoxGeometry(25.4, 0.02, 0.09),
  std(0xc9a227, { roughness: 0.3, metalness: 0.85 }), 0, 0.011, 2.5
);
brassLine.castShadow = false;
scene.add(brassLine);

/* ------------------------------------------------------------------ */
/* Gem builders — each returns a Group with its base at y = 0,         */
/* roughly a unit tall, sitting on the cushion.                        */
/* ------------------------------------------------------------------ */

/* A six-sided crystal point: hexagonal prism + pyramid tip. */
function hexPoint(mat, r, h, tipH) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r, r * 1.06, h, 6), mat, 0, h / 2, 0));
  g.add(mesh(new THREE.ConeGeometry(r, tipH, 6), mat, 0, h + tipH / 2, 0));
  return g;
}

function buildAmethyst() {
  const g = new THREE.Group();
  const rockMat = std(0x6b5a4a, { roughness: 1 });
  const innerMat = phys(0x3a2350, { roughness: 0.35, envMapIntensity: 0.8 });
  const cryMat = gemMat(0x7d4fb5, { roughness: 0.16, envMapIntensity: 1.1 });
  const cryDark = gemMat(0x5b3494, { roughness: 0.2, envMapIntensity: 1.0 });

  // Geode half: a rocky bowl, amethyst-lined inside.
  const bowl = mesh(new THREE.SphereGeometry(0.66, 26, 13, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), rockMat, 0, 0.66, 0);
  bowl.material.side = THREE.DoubleSide;
  g.add(bowl);
  g.add(mesh(new THREE.SphereGeometry(0.6, 26, 13, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), innerMat, 0, 0.66, 0));
  // Crystal bed mound.
  const mound = mesh(new THREE.SphereGeometry(0.46, 18, 12), innerMat, 0, 0.5, 0);
  mound.scale.set(1, 0.5, 1);
  g.add(mound);
  // The cluster: points of mixed height leaning out of the bowl.
  const spots = [
    [0, 0, 0.62, 0], [0.28, 0.1, 0.44, 0.16], [-0.27, 0.14, 0.4, -0.15],
    [0.1, -0.26, 0.38, 0.2], [-0.16, -0.24, 0.34, -0.2], [0.34, -0.18, 0.3, 0.28],
    [-0.36, -0.06, 0.3, -0.28], [0.18, 0.3, 0.32, 0.1], [-0.05, 0.33, 0.28, -0.08],
  ];
  spots.forEach(([x, z, h, lean], i) => {
    const p = hexPoint(i % 2 ? cryDark : cryMat, 0.085 + (i % 3) * 0.016, h, h * 0.42);
    p.position.set(x, 0.52, z);
    p.rotation.set(z * lean * 2.2, 0, -x * lean * 2.2);
    g.add(p);
  });
  g.add(makeSparkles({ count: 22, radius: 0.8, cy: 0.85 }));
  return g;
}

function buildDiamond() {
  const g = new THREE.Group();
  const mat = gemMat(0xffffff, {
    roughness: 0.03, envMapIntensity: 1.7,
    iridescence: 0.55, iridescenceIOR: 1.9,
  });
  // Pavilion: the deep cone below the girdle.
  const pav = mesh(new THREE.ConeGeometry(0.52, 0.6, 8), mat, 0, 0.3, 0);
  pav.rotation.x = Math.PI;
  g.add(pav);
  // Crown: a frustum rising to the flat table.
  g.add(mesh(new THREE.CylinderGeometry(0.33, 0.52, 0.24, 8), mat, 0, 0.72, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.035, 8), mat, 0, 0.855, 0));
  g.add(makeSparkles({ count: 44, radius: 0.95, cy: 0.55, rainbow: true, base: 0.95 }));
  return g;
}

function buildEmerald() {
  const g = new THREE.Group();
  const mat = gemMat(0x0aa653, {
    roughness: 0.14, envMapIntensity: 1.15, transparent: true, opacity: 0.9,
  });
  // Step cut: three stacked boxes, each narrower than the last.
  g.add(mesh(new THREE.BoxGeometry(0.56, 0.6, 0.42), mat, 0, 0.3, 0));
  g.add(mesh(new THREE.BoxGeometry(0.47, 0.15, 0.35), mat, 0, 0.675, 0));
  g.add(mesh(new THREE.BoxGeometry(0.37, 0.11, 0.27), mat, 0, 0.8, 0));
  // The jardin: dark specks suspended inside the stone.
  const speckMat = std(0x053014, { roughness: 0.9, flatShading: false });
  for (let i = 0; i < 16; i++) {
    const s = mesh(
      new THREE.TetrahedronGeometry(0.02 + Math.random() * 0.02),
      speckMat,
      (Math.random() * 2 - 1) * 0.2, 0.08 + Math.random() * 0.45, (Math.random() * 2 - 1) * 0.13
    );
    s.castShadow = false;
    g.add(s);
  }
  g.add(makeSparkles({ count: 20, radius: 0.8, cy: 0.5 }));
  return g;
}

function buildRuby() {
  const g = new THREE.Group();
  const mat = gemMat(0xc01030, {
    roughness: 0.09, envMapIntensity: 1.35, transparent: true, opacity: 0.96, flatShading: false,
  });
  const cushion = mesh(new RoundedBoxGeometry(0.82, 0.48, 0.82, 2, 0.16), mat, 0, 0.28, 0);
  g.add(cushion);
  const table = mesh(new RoundedBoxGeometry(0.5, 0.16, 0.5, 2, 0.06), mat, 0, 0.56, 0);
  g.add(table);
  g.add(makeSparkles({ count: 24, radius: 0.85, cy: 0.45 }));
  return g;
}

function buildSapphire() {
  const g = new THREE.Group();
  const mat = gemMat(0x14409e, {
    roughness: 0.07, envMapIntensity: 1.45, transparent: true, opacity: 0.95,
  });
  // Round cut: many-sided pavilion cone and crown, flat-shaded so the
  // 24 faces still read as facets.
  const pav = mesh(new THREE.ConeGeometry(0.5, 0.58, 24), mat, 0, 0.29, 0);
  pav.rotation.x = Math.PI;
  g.add(pav);
  g.add(mesh(new THREE.CylinderGeometry(0.32, 0.5, 0.24, 24), mat, 0, 0.7, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), mat, 0, 0.84, 0));
  g.add(makeSparkles({ count: 24, radius: 0.9, cy: 0.55 }));
  return g;
}

function buildOpal() {
  const g = new THREE.Group();
  // A shallow gold bezel cupping the cabochon.
  const bezel = mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 40),
    std(0xc9a227, { roughness: 0.28, metalness: 0.85, flatShading: false }), 0, 0.05, 0);
  bezel.rotation.x = Math.PI / 2;
  g.add(bezel);
  g.add(mesh(new THREE.CylinderGeometry(0.52, 0.46, 0.07, 32),
    std(0x8a6d1d, { roughness: 0.35, metalness: 0.8, flatShading: false }), 0, 0.035, 0));
  const dome = mesh(
    new THREE.SphereGeometry(0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    phys(0xf5efe4, {
      roughness: 0.16, flatShading: false, clearcoat: 1, clearcoatRoughness: 0.05,
      envMapIntensity: 1.1, iridescence: 1.0, iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 480],
    }),
    0, 0.06, 0
  );
  dome.scale.set(1, 0.72, 1);
  g.add(dome);
  g.add(makeSparkles({ count: 20, radius: 0.8, cy: 0.4, rainbow: true, base: 0.7 }));
  return g;
}

function buildQuartz() {
  const g = new THREE.Group();
  const rockMat = std(0x5c564e, { roughness: 1 });
  const base = mesh(new THREE.DodecahedronGeometry(0.55, 0), rockMat, 0, 0.1, 0);
  base.scale.set(1.25, 0.45, 1.1);
  g.add(base);
  const cryMat = gemMat(0xf4fbfc, {
    roughness: 0.05, envMapIntensity: 1.45, transparent: true, opacity: 0.52,
  });
  const spots = [
    [0, 0, 0.78, 0], [0.3, 0.08, 0.55, 0.22], [-0.3, 0.1, 0.5, -0.2],
    [0.12, -0.28, 0.44, 0.26], [-0.14, -0.27, 0.4, -0.24], [0.36, -0.2, 0.34, 0.34],
    [-0.38, -0.14, 0.3, -0.32],
  ];
  spots.forEach(([x, z, h, lean]) => {
    const p = hexPoint(cryMat, 0.1, h, h * 0.45);
    p.position.set(x, 0.22, z);
    p.rotation.set(z * lean * 2.4, Math.random() * 0.6, -x * lean * 2.4);
    g.add(p);
  });
  g.add(makeSparkles({ count: 22, radius: 0.85, cy: 0.6 }));
  return g;
}

function buildTopaz() {
  const g = new THREE.Group();
  const mat = gemMat(0xe39a17, {
    roughness: 0.1, envMapIntensity: 1.35, transparent: true, opacity: 0.93,
  });
  // An elongated eight-sided prism with a pyramid crown.
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.92, 8), mat, 0, 0.46, 0));
  g.add(mesh(new THREE.ConeGeometry(0.3, 0.36, 8), mat, 0, 1.1, 0));
  g.add(makeSparkles({ count: 22, radius: 0.8, cy: 0.65 }));
  return g;
}

/* ------------------------------------------------------------------ */
/* Pedestals: velvet column, cushion, glass case, lamp                 */
/* ------------------------------------------------------------------ */

const BUILDERS = [
  buildAmethyst, buildDiamond, buildEmerald, buildRuby,
  buildSapphire, buildOpal, buildQuartz, buildTopaz,
];
const ROW_SPACING = 3.1;

const velvetMat = std(0x35101f, { roughness: 1, flatShading: false });
const cushionMat = std(0x57162f, { roughness: 0.95, flatShading: false });
const stoneMat = std(0x2c2430, { roughness: 0.6, metalness: 0.15 });
const brassMat = std(0xc9a227, { roughness: 0.3, metalness: 0.85 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xdfeaf2, transparent: true, opacity: 0.055, roughness: 0.06,
  metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06,
  envMapIntensity: 0.9, depthWrite: false, flatShading: false,
});
const caseEdgeMat = new THREE.LineBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.45 });

const exhibits = [];

GEMS.forEach((data, i) => {
  const x = (i - (GEMS.length - 1) / 2) * ROW_SPACING;
  const root = new THREE.Group();
  root.position.set(x, 0, 0);
  root.userData.gemIndex = i;
  scene.add(root);

  // Stepped stone base + velvet column + cushion.
  root.add(mesh(new THREE.CylinderGeometry(1.02, 1.18, 0.26, 26), stoneMat, 0, 0.13, 0));
  root.add(mesh(new THREE.CylinderGeometry(0.82, 0.94, 0.8, 26), velvetMat, 0, 0.66, 0));
  const trim = mesh(new THREE.TorusGeometry(0.86, 0.03, 8, 44), brassMat, 0, 1.04, 0);
  trim.rotation.x = Math.PI / 2;
  root.add(trim);
  root.add(mesh(new THREE.CylinderGeometry(0.8, 0.86, 0.13, 26), cushionMat, 0, 1.12, 0));

  // Brass plaque on the front of the column.
  const plaque = mesh(new THREE.BoxGeometry(0.8, 0.42, 0.05), brassMat, 0, 0.68, 0.9);
  plaque.rotation.x = -0.42;
  root.add(plaque);

  // Hover/selection ring on the floor.
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc9a227, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.32, 1.58, 48), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  root.add(ring);

  // The stone itself, on a spinner above the cushion.
  const spinner = new THREE.Group();
  spinner.position.y = 1.19;
  spinner.userData.gemIndex = i;
  root.add(spinner);
  const gem = BUILDERS[i]();
  gem.userData.gemIndex = i;
  spinner.add(gem);

  // Glass case with brass edges.
  const caseGeo = new THREE.BoxGeometry(1.78, 1.95, 1.78);
  const glass = new THREE.Mesh(caseGeo, glassMat);
  glass.position.y = 2.16;
  root.add(glass);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(caseGeo), caseEdgeMat);
  edges.position.y = 2.16;
  root.add(edges);

  // Pedestal lamp above the stone; warms when selected.
  const lamp = new THREE.PointLight(0xcfd8ff, 2.4, 7.5, 1.7);
  lamp.position.set(0, 3.7, 0.9);
  root.add(lamp);

  exhibits.push({ data, root, spinner, gem, ringMat, lamp, x });
});

/* ------------------------------------------------------------------ */
/* Selection, panel, list and camera flights                           */
/* ------------------------------------------------------------------ */

let selectedIndex = -1; // -1 = the whole vault
let rotateOn = true;

const camAnim = {
  active: false, t: 0, dur: 1.5,
  fromP: new THREE.Vector3(), toP: new THREE.Vector3(),
  fromT: new THREE.Vector3(), toT: new THREE.Vector3(),
};
function flyTo(pos, tgt) {
  camAnim.fromP.copy(camera.position);
  camAnim.toP.copy(pos);
  camAnim.fromT.copy(controls.target);
  camAnim.toT.copy(tgt);
  camAnim.t = 0;
  camAnim.active = true;
}
controls.addEventListener('start', () => { camAnim.active = false; });

function homeView() {
  const w = stageEl.clientWidth || window.innerWidth;
  const h = stageEl.clientHeight || window.innerHeight;
  const aspect = w / h;
  const dist = aspect >= 1.5 ? 15.5 : aspect >= 1.15 ? 18.5 : aspect >= 0.8 ? 23 : 27;
  const tx = 0; // three-section layout: vault row centred in the stage column
  return { pos: new THREE.Vector3(tx, 4.9, dist), tgt: new THREE.Vector3(tx, 1.7, 0) };
}

function setEmissive(group, hex, intensity) {
  group.traverse((o) => {
    if (o.isMesh && o.material && 'emissive' in o.material) {
      const m = o.material;
      if (m.userData._origEmissive === undefined) {
        m.userData._origEmissive = m.emissive.getHex();
        m.userData._origEI = m.emissiveIntensity;
      }
      if (intensity > 0) { m.emissive.setHex(hex); m.emissiveIntensity = intensity; }
      else { m.emissive.setHex(m.userData._origEmissive); m.emissiveIntensity = m.userData._origEI; }
    }
  });
}

// Navigation dots.
const dotEls = GEMS.map((g, i) => {
  const b = document.createElement('button');
  b.className = 'dot';
  b.type = 'button';
  b.title = g.name;
  b.setAttribute('aria-label', `View ${g.name}`);
  b.addEventListener('click', () => selectGem(i));
  dotsEl.appendChild(b);
  return b;
});

// Vault list buttons.
const listEls = GEMS.map((g, i) => {
  const b = document.createElement('button');
  b.className = 'gem-item';
  b.type = 'button';
  const dot = document.createElement('span');
  dot.className = 'gem-dot';
  dot.style.background = '#' + g.accent.toString(16).padStart(6, '0');
  const nm = document.createElement('span');
  nm.className = 'gem-name';
  nm.textContent = g.name;
  const mh = document.createElement('span');
  mh.className = 'gem-mohs';
  mh.textContent = 'Mohs ' + g.mohs;
  b.append(dot, nm, mh);
  b.addEventListener('click', () => selectGem(i));
  gemListEl.appendChild(b);
  return b;
});

function refreshChrome() {
  dotEls.forEach((d, i) => d.classList.toggle('active', i === selectedIndex));
  listEls.forEach((el, i) => el.classList.toggle('active', i === selectedIndex));
  nowViewingEl.textContent = selectedIndex < 0 ? 'The Whole Vault' : GEMS[selectedIndex].name;
  exhibits.forEach((ex, i) => {
    if (i !== selectedIndex) setEmissive(ex.gem, 0x000000, 0);
  });
}

function showPanel(data) {
  panelEyebrow.textContent = 'Now viewing';
  panelName.textContent = data.name;
  panelTagline.textContent = data.hook;
  statMohs.textContent = data.mohs;
  statFormula.innerHTML = data.formula;
  statClass.textContent = data.mineralClass;
  statColor.textContent = data.colorNote;
  panelStats.hidden = false;
  panelDesc.textContent = data.description;
  panelFact.textContent = data.fact;
  panelEl.classList.remove('closed');
}

function selectGem(i, fly = true) {
  if (selectedIndex >= 0 && selectedIndex !== i) setEmissive(exhibits[selectedIndex].gem, 0x000000, 0);
  selectedIndex = i;
  const ex = exhibits[i];
  setEmissive(ex.gem, 0xc9a227, 0.16);
  showPanel(ex.data);
  refreshChrome();
  if (fly) {
    const off = 0; // three-section layout: selected gem centred in the stage
    flyTo(
      new THREE.Vector3(ex.x + off, 3.1, 6.9),
      new THREE.Vector3(ex.x + off * 0.5, 1.95, 0)
    );
  }
}

function showVault(fly = true) {
  if (selectedIndex >= 0) setEmissive(exhibits[selectedIndex].gem, 0x000000, 0);
  selectedIndex = -1;
  panelEyebrow.textContent = WELCOME.eyebrow;
  panelName.textContent = WELCOME.name;
  panelTagline.textContent = WELCOME.tagline;
  panelStats.hidden = true;
  panelDesc.textContent = WELCOME.description;
  panelFact.textContent = WELCOME.fact;
  panelEl.classList.remove('closed');
  refreshChrome();
  if (fly) {
    const home = homeView();
    flyTo(home.pos, home.tgt);
  }
}

document.getElementById('prev-btn').addEventListener('click', () => {
  selectGem(selectedIndex < 0 ? GEMS.length - 1 : (selectedIndex - 1 + GEMS.length) % GEMS.length);
});
document.getElementById('next-btn').addEventListener('click', () => {
  selectGem(selectedIndex < 0 ? 0 : (selectedIndex + 1) % GEMS.length);
});
document.getElementById('hall-btn').addEventListener('click', () => showVault());
document.getElementById('panel-close').addEventListener('click', () => panelEl.classList.add('closed'));
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') document.getElementById('next-btn').click();
  else if (e.key === 'ArrowLeft') document.getElementById('prev-btn').click();
});

/* Vault controls: sparkle intensity + rotation toggle */
sparkleSlider.addEventListener('input', () => {
  sparkleLevel = (Number(sparkleSlider.value) / 100) * 1.3;
});
rotateBtn.addEventListener('click', () => {
  rotateOn = !rotateOn;
  rotateBtn.textContent = rotateOn ? 'Rotation: On' : 'Rotation: Off';
  rotateBtn.setAttribute('aria-pressed', String(rotateOn));
});

/* ------------------------------------------------------------------ */
/* Picking: hover tooltip + ring, click to visit                       */
/* ------------------------------------------------------------------ */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoverIndex = -1;
let downX = 0, downY = 0, downT = 0;

function pickAt(cx, cy) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) {
    let o = hit.object;
    while (o) {
      if (o.userData && o.userData.gemIndex !== undefined) return o.userData.gemIndex;
      o = o.parent;
    }
  }
  return -1;
}

renderer.domElement.addEventListener('pointermove', (e) => {
  hoverIndex = pickAt(e.clientX, e.clientY);
  if (hoverIndex >= 0) {
    tooltipEl.textContent = GEMS[hoverIndex].name;
    tooltipEl.style.left = e.clientX + 'px';
    tooltipEl.style.top = e.clientY + 'px';
    tooltipEl.classList.add('show');
    renderer.domElement.style.cursor = 'pointer';
  } else {
    tooltipEl.classList.remove('show');
    renderer.domElement.style.cursor = '';
  }
});
renderer.domElement.addEventListener('pointerdown', (e) => {
  downX = e.clientX; downY = e.clientY; downT = performance.now();
});
renderer.domElement.addEventListener('pointerup', (e) => {
  const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moved < 6 && performance.now() - downT < 450) {
    const idx = pickAt(e.clientX, e.clientY);
    if (idx >= 0) selectGem(idx);
  }
});

/* ------------------------------------------------------------------ */
/* Resize + main loop                                                  */
/* ------------------------------------------------------------------ */

function fit() {
  const w = stageEl.clientWidth || window.innerWidth;
  const h = stageEl.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', fit);
fit();
{
  const home = homeView();
  camera.position.copy(home.pos);
  controls.target.copy(home.tgt);
}

const clock = new THREE.Clock();
let firstFrame = true;
const lampCool = new THREE.Color(0xcfd8ff);
const lampWarm = new THREE.Color(0xffd9a0);
const lampTargetColor = new THREE.Color();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const k = 1 - Math.exp(-dt * 4);

  exhibits.forEach((ex, i) => {
    const selected = i === selectedIndex;
    // Slow display rotation; the selected stone turns a touch faster.
    if (rotateOn) ex.spinner.rotation.y += dt * (selected ? 0.85 : 0.45);
    // Selection ring (hover gets a fainter ring).
    ex.ringMat.opacity = selected ? 0.95 : i === hoverIndex ? 0.45 : 0;
    // Lamp: cool white at rest, warm jeweller's light when selected.
    const targetI = selected ? 8 : 2.4;
    ex.lamp.intensity += (targetI - ex.lamp.intensity) * k;
    lampTargetColor.copy(selected ? lampWarm : lampCool);
    ex.lamp.color.lerp(lampTargetColor, k);
    // A gentle breathing scale on the selected stone.
    const s = selected ? 1 + 0.015 * Math.sin(t * 2.4) : 1;
    ex.gem.scale.setScalar(s);
  });

  // Sparkles twinkle and drift around their stones.
  for (const pts of sparkleSystems) {
    pts.rotation.y += dt * 0.25;
    const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.8 + pts.userData.phase));
    pts.material.opacity = Math.min(1, pts.userData.base * sparkleLevel * tw + 0.08 * sparkleLevel);
  }

  // Camera flight.
  if (camAnim.active) {
    camAnim.t += dt / camAnim.dur;
    const tt = Math.min(camAnim.t, 1);
    const e = tt * tt * (3 - 2 * tt); // smoothstep
    camera.position.lerpVectors(camAnim.fromP, camAnim.toP, e);
    controls.target.lerpVectors(camAnim.fromT, camAnim.toT, e);
    if (tt >= 1) camAnim.active = false;
  }

  controls.update();
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    loadingEl.classList.add('gone');
    setTimeout(() => { loadingEl.hidden = true; }, 600);
  }
}

refreshChrome();
animate();
