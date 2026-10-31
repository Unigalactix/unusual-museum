/* CellVerse — Interactive 3D Cell Explorer
 * Original code by Rajesh Kodaganti. Renders a procedural animal cell with
 * Three.js: no models, no textures, every organelle is built from geometry.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ORGANELLES, ORGANELLE_MAP } from "./organelles.js";

/* ------------------------------------------------------------------ */
/* Small deterministic RNG so the cell looks the same on every load    */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261030);
const randRange = (min, max) => min + rand() * (max - min);

function randomPointInSphere(minR, maxR) {
  const v = new THREE.Vector3(
    randRange(-1, 1), randRange(-1, 1), randRange(-1, 1)
  );
  if (v.lengthSq() > 1 || v.lengthSq() < 0.0001) return randomPointInSphere(minR, maxR);
  v.normalize().multiplyScalar(randRange(minR, maxR));
  return v;
}

/* ------------------------------------------------------------------ */
/* DOM refs                                                            */
/* ------------------------------------------------------------------ */
const canvas = document.getElementById("scene");
const loadingEl = document.getElementById("loading");
const failEl = document.getElementById("webgl-fail");
const tooltipEl = document.getElementById("tooltip");
const labelsEl = document.getElementById("labels");
const listEl = document.getElementById("organelle-list");
const searchEl = document.getElementById("search");
const noResultsEl = document.getElementById("no-results");
const explodeEl = document.getElementById("explode");
const xrayEl = document.getElementById("xray");
const rotateBtn = document.getElementById("toggle-rotate");
const labelsBtn = document.getElementById("toggle-labels");
const resetBtn = document.getElementById("reset-view");
const infoName = document.getElementById("info-name");
const infoTagline = document.getElementById("info-tagline");
const infoDesc = document.getElementById("info-desc");
const infoFact = document.getElementById("info-fact");
const infoPanel = document.getElementById("info-panel");

const CELL_RADIUS = 10;

/* ------------------------------------------------------------------ */
/* Renderer / scene / camera — with graceful WebGL failure             */
/* ------------------------------------------------------------------ */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (err) {
  loadingEl.classList.add("done");
  failEl.hidden = false;
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
/* Life-like output: filmic tone mapping, sRGB output, soft shadows */
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

/* Image-based lighting: a neutral studio environment for soft, realistic
   reflections. Kept subtle via envMapIntensity (~0.35) on the materials. */
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
} catch (err) {
  /* Environment reflections are cosmetic — continue without them. */
}
const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 200
);
const DEFAULT_CAM = new THREE.Vector3(4, 5, 27);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
camera.position.copy(DEFAULT_CAM);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 12;
controls.maxDistance = 55;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;

/* Lights */
scene.add(new THREE.AmbientLight(0x8899bb, 0.75));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(14, 18, 20);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -14;
keyLight.shadow.camera.right = 14;
keyLight.shadow.camera.top = 14;
keyLight.shadow.camera.bottom = -14;
keyLight.shadow.camera.near = 2;
keyLight.shadow.camera.far = 60;
keyLight.shadow.bias = -0.002;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x5ec8e6, 0.9);
rimLight.position.set(-18, -6, -14);
scene.add(rimLight);
const nucleusLight = new THREE.PointLight(0x9b7ede, 12, 30);
nucleusLight.position.set(-3.4, 1.6, 0.5);
scene.add(nucleusLight);

/* ------------------------------------------------------------------ */
/* Canvas-generated chromatin texture for the nucleus — tangled fibres */
/* and dense speckle grains, drawn once with its own seeded RNG so the */
/* organelle placement sequence is untouched.                          */
/* ------------------------------------------------------------------ */
function makeChromatinTexture() {
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const trand = mulberry32(1234567);
  ctx.fillStyle = "#ddd4f7";
  ctx.fillRect(0, 0, size, size);
  /* soft mottled patches */
  for (let i = 0; i < 260; i++) {
    const x = trand() * size, y = trand() * size;
    const r = 3 + trand() * 14;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, trand() > 0.45 ? "rgba(90,64,160,0.35)" : "rgba(255,255,255,0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  /* dense speckle grains */
  for (let i = 0; i < 2600; i++) {
    const x = trand() * size, y = trand() * size;
    const r = 0.6 + trand() * 1.7;
    ctx.fillStyle = trand() > 0.5 ? "rgba(70,48,140,0.5)" : "rgba(240,236,255,0.5)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  /* tangled chromatin fibres */
  ctx.strokeStyle = "rgba(80,58,150,0.4)";
  for (let i = 0; i < 46; i++) {
    ctx.lineWidth = 0.8 + trand() * 1.4;
    ctx.beginPath();
    let x = trand() * size, y = trand() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (trand() - 0.5) * 46; y += (trand() - 0.5) * 46;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
const chromatinTexture = makeChromatinTexture();

/* ------------------------------------------------------------------ */
/* Materials — one shared material per organelle type                  */
/* ------------------------------------------------------------------ */
const materials = {};
for (const o of ORGANELLES) {
  materials[o.id] = new THREE.MeshStandardMaterial({
    color: o.color,
    roughness: 0.45,
    metalness: 0.08,
    emissive: o.color,
    emissiveIntensity: 0.14,
  });
}
materials.membrane = new THREE.MeshPhysicalMaterial({
  color: ORGANELLE_MAP.membrane.color,
  roughness: 0.15,
  metalness: 0,
  transmission: 0.35,
  thickness: 1.2,
  /* wet, glossy lipid surface */
  clearcoat: 0.7,
  clearcoatRoughness: 0.35,
  transparent: true,
  opacity: 0.2,
  emissive: ORGANELLE_MAP.membrane.color,
  emissiveIntensity: 0.1,
  side: THREE.DoubleSide,
  depthWrite: false,
});
materials.nucleus = new THREE.MeshPhysicalMaterial({
  color: ORGANELLE_MAP.nucleus.color,
  roughness: 0.3,
  /* chromatin speckle on the envelope + a soft sheen */
  map: chromatinTexture,
  bumpMap: chromatinTexture,
  bumpScale: 0.02,
  sheen: 0.5,
  sheenRoughness: 0.6,
  sheenColor: ORGANELLE_MAP.nucleus.color,
  transparent: true,
  opacity: 0.55,
  emissive: ORGANELLE_MAP.nucleus.color,
  emissiveIntensity: 0.18,
  depthWrite: false,
});
materials.vacuole = new THREE.MeshPhysicalMaterial({
  color: ORGANELLE_MAP.vacuole.color,
  roughness: 0.2,
  /* fluid-filled, glossy surface */
  clearcoat: 0.5,
  clearcoatRoughness: 0.3,
  transparent: true,
  opacity: 0.4,
  emissive: ORGANELLE_MAP.vacuole.color,
  emissiveIntensity: 0.14,
  depthWrite: false,
});
materials.cytoplasm = new THREE.MeshBasicMaterial({
  color: ORGANELLE_MAP.cytoplasm.color,
  transparent: true,
  opacity: 0.05,
  depthWrite: false,
});

/* Subtle environment reflections on every lit material */
for (const mat of Object.values(materials)) {
  if ("envMapIntensity" in mat) mat.envMapIntensity = 0.35;
}

/* Hero upgrade: mitochondria get a wet, clear-coated physical shell */
materials.mitochondria = new THREE.MeshPhysicalMaterial({
  color: ORGANELLE_MAP.mitochondria.color,
  roughness: 0.38,
  metalness: 0.05,
  clearcoat: 0.45,
  clearcoatRoughness: 0.4,
  emissive: ORGANELLE_MAP.mitochondria.color,
  emissiveIntensity: 0.14,
  envMapIntensity: 0.35,
});

/* Per-instance colour variants (ribosomes, ER): cloned materials with a
   slight HSL shift, registered so hover/selection emissive still reaches
   every clone through setEmissive(). */
const emissiveVariants = {};
function variantMaterial(typeId) {
  const m = materials[typeId].clone();
  const c = new THREE.Color(ORGANELLE_MAP[typeId].color);
  c.offsetHSL(randRange(-0.015, 0.015), randRange(-0.04, 0.04), randRange(-0.05, 0.05));
  m.color.copy(c);
  if ("emissive" in m) m.emissive.copy(c);
  (emissiveVariants[typeId] ??= []).push(m);
  return m;
}

/* ------------------------------------------------------------------ */
/* Unit registry — a "unit" is one placed instance of an organelle     */
/* ------------------------------------------------------------------ */
const cellGroup = new THREE.Group();
scene.add(cellGroup);

const units = [];        // { typeId, root, basePos, explodeOffset, radius }
const pickMeshes = [];   // meshes the raycaster tests

const SHADOW_CASTERS = new Set([
  "mitochondria", "golgi", "rough-er", "lysosomes", "peroxisomes",
  "centrosome", "nucleolus",
]);

function registerUnit(typeId, root, radius) {
  root.traverse((child) => {
    if (child.isMesh) {
      child.userData.typeId = typeId;
      pickMeshes.push(child);
      if (SHADOW_CASTERS.has(typeId)) child.castShadow = true;
      if (typeId === "nucleus" || typeId === "mitochondria") child.receiveShadow = true;
    }
  });
  const unit = {
    typeId,
    root,
    basePos: root.position.clone(),
    radius,
    // Explode straight away from the centre, scaled to how far out it sits.
    explodeOffset: root.position.clone().multiplyScalar(0.55),
  };
  if (unit.explodeOffset.length() < 0.4) {
    unit.explodeOffset = randomPointInSphere(1.2, 2.0);
  }
  units.push(unit);
  cellGroup.add(root);
  return unit;
}

function materialFor(typeId) {
  return materials[typeId];
}

/* ------------------------------------------------------------------ */
/* Build the cell                                                      */
/* ------------------------------------------------------------------ */
/* Membrane + a faint, larger glow shell */
const membrane = new THREE.Mesh(
  new THREE.SphereGeometry(CELL_RADIUS, 64, 48),
  materials.membrane
);
registerUnit("membrane", membrane, CELL_RADIUS);

const glow = new THREE.Mesh(
  new THREE.SphereGeometry(CELL_RADIUS * 1.07, 48, 32),
  new THREE.MeshBasicMaterial({
    color: 0x5ec8e6, transparent: true, opacity: 0.045,
    side: THREE.BackSide, depthWrite: false,
  })
);
cellGroup.add(glow);

/* Cytoplasm body + drifting particles */
const cytoplasm = new THREE.Mesh(
  new THREE.SphereGeometry(CELL_RADIUS * 0.97, 48, 32),
  materials.cytoplasm
);
registerUnit("cytoplasm", cytoplasm, CELL_RADIUS * 0.97);

{
  const count = 350;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = randomPointInSphere(0.5, CELL_RADIUS * 0.94);
    pos.set([p.x, p.y, p.z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xa8c8ff, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false,
  }));
  particles.name = "cytoplasm-particles";
  cellGroup.add(particles);
  cellGroup.userData.particles = particles;
}

/* Nucleus + nucleolus */
const nucleusPos = new THREE.Vector3(-3.4, 1.6, 0.5);
{
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(3.1, 48, 32), materialFor("nucleus")
  );
  /* Inner chromatin mass — speckled, fibrous texture visible through the
     translucent envelope */
  const chromatin = new THREE.Mesh(
    new THREE.SphereGeometry(2.72, 32, 24),
    new THREE.MeshStandardMaterial({
      map: chromatinTexture, color: 0xb9a5ee, roughness: 0.95, metalness: 0,
      emissive: 0x6a4fb0, emissiveIntensity: 0.08, envMapIntensity: 0.35,
    })
  );
  chromatin.rotation.set(0.7, 1.9, 0.3);
  nucleus.add(chromatin);
  nucleus.position.copy(nucleusPos);
  registerUnit("nucleus", nucleus, 3.1);

  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 32, 24), materialFor("nucleolus")
  );
  nucleolus.position.copy(nucleusPos);
  registerUnit("nucleolus", nucleolus, 1.25);
}

/* Mitochondria — capsules with a smaller inner capsule */
{
  const outerGeo = new THREE.CapsuleGeometry(0.85, 1.5, 6, 14);
  const innerGeo = new THREE.CapsuleGeometry(0.55, 1.1, 6, 12);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xd96a1e, roughness: 0.6, emissive: 0xd96a1e, emissiveIntensity: 0.12,
    envMapIntensity: 0.35,
  });
  /* Cristae — flattened inner-fold ridges stacked inside the inner capsule */
  const ridgeGeo = new THREE.BoxGeometry(0.78, 0.07, 0.42);
  const ridgeMat = new THREE.MeshStandardMaterial({
    color: 0xe07f35, roughness: 0.55, emissive: 0xd96a1e, emissiveIntensity: 0.18,
    envMapIntensity: 0.35,
  });
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(outerGeo, materialFor("mitochondria"));
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.rotation.z = 0.5;
    const cristae = new THREE.Group();
    cristae.rotation.z = 0.5;
    for (let r = 0; r < 5; r++) {
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.position.y = -0.55 + r * 0.28;
      ridge.rotation.y = (r % 2 ? 1 : -1) * 0.18;
      cristae.add(ridge);
    }
    g.add(outer, inner, cristae);
    let p = randomPointInSphere(4.6, 7.6);
    if (p.distanceTo(nucleusPos) < 4.4) p = p.multiplyScalar(1.5);
    g.position.copy(p);
    g.rotation.set(randRange(0, Math.PI), randRange(0, Math.PI), randRange(0, Math.PI));
    registerUnit("mitochondria", g, 1.7);
  }
}

/* Rough ER — flattened stacked partial tori near the nucleus, plus ribosome dots */
{
  const g = new THREE.Group();
  const dotGeo = new THREE.SphereGeometry(0.09, 8, 8);
  [2.5, 2.0, 1.5].forEach((r, i) => {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.3, 10, 40, Math.PI * 1.35),
      variantMaterial("rough-er")
    );
    torus.scale.y = 0.55;
    torus.rotation.x = Math.PI / 2 + randRange(-0.2, 0.2);
    torus.rotation.z = randRange(0, Math.PI);
    torus.position.y = (i - 1) * 0.55;
    g.add(torus);
    for (let d = 0; d < 14; d++) {
      const dot = new THREE.Mesh(dotGeo, variantMaterial("ribosomes"));
      const a = randRange(0, Math.PI * 1.35);
      dot.position.set(
        Math.cos(a) * r, (i - 1) * 0.55 + randRange(-0.15, 0.15), Math.sin(a) * r * 0.55
      );
      g.add(dot);
    }
  });
  g.position.copy(nucleusPos).add(new THREE.Vector3(0.6, -0.4, 3.4));
  registerUnit("rough-er", g, 2.6);
}

/* Golgi — stacked curved flattened tori + nearby vesicles */
{
  const g = new THREE.Group();
  [1.9, 1.65, 1.4, 1.15, 0.9].forEach((r, i) => {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.22, 10, 40, Math.PI * 0.95),
      materialFor("golgi")
    );
    torus.scale.y = 0.5;
    torus.rotation.x = Math.PI / 2;
    torus.rotation.z = Math.PI * 0.1;
    torus.position.y = (i - 2) * 0.42;
    g.add(torus);
  });
  const vesGeo = new THREE.SphereGeometry(0.22, 10, 10);
  for (let i = 0; i < 6; i++) {
    const v = new THREE.Mesh(vesGeo, materialFor("golgi"));
    v.position.copy(randomPointInSphere(1.6, 2.5));
    v.position.y *= 0.5;
    g.add(v);
  }
  g.position.set(4.6, -2.2, 2.6);
  g.rotation.y = 0.7;
  registerUnit("golgi", g, 2.2);
}

/* Free ribosomes scattered through the cytoplasm */
{
  const geo = new THREE.SphereGeometry(0.13, 8, 8);
  for (let i = 0; i < 120; i++) {
    const m = new THREE.Mesh(geo, variantMaterial("ribosomes"));
    let p = randomPointInSphere(3.6, 9.2);
    if (p.distanceTo(nucleusPos) < 3.6) p = p.multiplyScalar(1.35).clampLength(0, 9.2);
    m.position.copy(p);
    registerUnit("ribosomes", m, 0.13);
  }
}

/* Lysosomes & peroxisomes */
function scatterSpheres(typeId, count, radius, minR, maxR) {
  const geo = new THREE.SphereGeometry(radius, 20, 16);
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, materialFor(typeId));
    let p = randomPointInSphere(minR, maxR);
    if (p.distanceTo(nucleusPos) < 4.2) p = p.multiplyScalar(1.45);
    m.position.copy(p);
    registerUnit(typeId, m, radius);
  }
}
scatterSpheres("lysosomes", 4, 0.55, 4.5, 8.4);
scatterSpheres("peroxisomes", 3, 0.45, 4.5, 8.4);

/* Vacuole */
{
  const v = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 24), materialFor("vacuole")
  );
  v.position.set(3.2, 3.8, -3.6);
  registerUnit("vacuole", v, 1.5);
}

/* Vesicles drifting near the membrane */
{
  const geo = new THREE.SphereGeometry(0.3, 12, 10);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xbfe8ff, transparent: true, opacity: 0.45, roughness: 0.25,
    clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.35,
    emissive: 0xbfe8ff, emissiveIntensity: 0.08, depthWrite: false,
  });
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(randomPointInSphere(8.2, 9.3));
    m.userData.vesicle = true;
    cellGroup.add(m);
    // Vesicles borrow the membrane's identity when clicked.
    m.userData.typeId = "membrane";
    pickMeshes.push(m);
  }
}

/* Centrosome — two perpendicular cylinders near the nucleus */
{
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.28, 0.28, 1.1, 14);
  const a = new THREE.Mesh(geo, materialFor("centrosome"));
  const b = new THREE.Mesh(geo, materialFor("centrosome"));
  b.rotation.z = Math.PI / 2;
  b.position.x = 0.4;
  a.position.x = -0.2;
  g.add(a, b);
  g.position.copy(nucleusPos).add(new THREE.Vector3(3.4, 1.1, -0.8));
  registerUnit("centrosome", g, 0.9);
}

/* Cytoskeleton — curved tubes spanning the cell */
{
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const start = randomPointInSphere(7.5, 9.2);
    const end = randomPointInSphere(7.5, 9.2).multiplyScalar(-1);
    const mid1 = start.clone().lerp(end, 0.33).add(randomPointInSphere(0, 2.2));
    const mid2 = start.clone().lerp(end, 0.66).add(randomPointInSphere(0, 2.2));
    const curve = new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 40, 0.055, 6, false),
      materialFor("cytoskeleton")
    );
    g.add(tube);
  }
  registerUnit("cytoskeleton", g, 9);
}

/* ------------------------------------------------------------------ */
/* Sidebar list, search                                                */
/* ------------------------------------------------------------------ */
const counts = {};
for (const u of units) counts[u.typeId] = (counts[u.typeId] || 0) + 1;

const listItems = {};
for (const o of ORGANELLES) {
  const li = document.createElement("li");
  li.dataset.typeId = o.id;
  const dot = document.createElement("span");
  dot.className = "dot";
  dot.style.background = o.color;
  dot.style.color = o.color;
  const name = document.createElement("span");
  name.textContent = o.label;
  const count = document.createElement("span");
  count.className = "count";
  const n = counts[o.id] || 0;
  count.textContent = n > 1 ? `× ${n}` : "";
  li.append(dot, name, count);
  li.addEventListener("click", () => selectType(o.id, true));
  listEl.appendChild(li);
  listItems[o.id] = li;
}

searchEl.addEventListener("input", () => {
  const q = searchEl.value.trim().toLowerCase();
  let visible = 0;
  for (const o of ORGANELLES) {
    const show = o.name.toLowerCase().includes(q) || o.label.toLowerCase().includes(q);
    listItems[o.id].style.display = show ? "" : "none";
    if (show) visible++;
  }
  noResultsEl.hidden = visible > 0;
});

/* ------------------------------------------------------------------ */
/* Selection, hover, camera focus                                      */
/* ------------------------------------------------------------------ */
let selectedType = null;
let selectedUnit = null;
let hoveredType = null;
let camAnim = null;

function setEmissive(typeId, intensity) {
  const mat = materials[typeId];
  if (mat && "emissiveIntensity" in mat) mat.emissiveIntensity = intensity;
  const extras = emissiveVariants[typeId];
  if (extras) for (const m of extras) m.emissiveIntensity = intensity;
}
const BASE_EMISSIVE = 0.14;

function nearestUnitOfType(typeId) {
  let best = null, bestDist = Infinity;
  for (const u of units) {
    if (u.typeId !== typeId) continue;
    const d = u.root.getWorldPosition(new THREE.Vector3()).distanceTo(camera.position);
    if (d < bestDist) { bestDist = d; best = u; }
  }
  return best;
}

function flyTo(worldPos, distance) {
  const dir = camera.position.clone().sub(controls.target);
  if (dir.lengthSq() < 0.001) dir.set(0.3, 0.3, 1);
  dir.normalize().multiplyScalar(distance);
  camAnim = {
    t: 0,
    dur: 1.1,
    fromTarget: controls.target.clone(),
    toTarget: worldPos.clone(),
    fromCam: camera.position.clone(),
    toCam: worldPos.clone().add(dir),
  };
}

function updateInfo(o) {
  infoName.textContent = o.name;
  infoTagline.textContent = o.tagline;
  infoTagline.style.color = o.color;
  infoDesc.textContent = o.description;
  infoFact.textContent = o.fact;
}

function selectUnit(unit, fly = true) {
  if (selectedType) setEmissive(selectedType, BASE_EMISSIVE);
  if (selectedUnit && selectedType === "ribosomes") { /* scale handled in loop */ }
  selectedType = unit.typeId;
  selectedUnit = unit;
  setEmissive(selectedType, 0.85);
  for (const o of ORGANELLES) listItems[o.id].classList.toggle("active", o.id === selectedType);
  updateInfo(ORGANELLE_MAP[selectedType]);
  infoPanel.classList.add("expanded");
  if (fly) {
    const wp = unit.root.getWorldPosition(new THREE.Vector3());
    flyTo(wp, Math.max(unit.radius * 4.2, 6.5));
  }
}

function selectType(typeId, fly = true) {
  const unit = nearestUnitOfType(typeId);
  if (unit) selectUnit(unit, fly);
}

function deselect(fly = true) {
  if (selectedType) setEmissive(selectedType, BASE_EMISSIVE);
  selectedType = null;
  selectedUnit = null;
  for (const o of ORGANELLES) listItems[o.id].classList.remove("active");
  infoName.textContent = "The whole cell";
  infoTagline.textContent = "One cell, a dozen tiny machines working together.";
  infoTagline.style.color = "";
  infoDesc.textContent =
    "Every structure inside this cell has a job — making energy, building proteins, recycling waste and protecting the DNA. Click any organelle in the model, or pick one from the list, to explore it up close.";
  infoFact.textContent =
    "Your body contains roughly 37 trillion cells, and almost every one of them carries a full copy of your DNA.";
  if (fly) {
    camAnim = {
      t: 0, dur: 1.1,
      fromTarget: controls.target.clone(), toTarget: DEFAULT_TARGET.clone(),
      fromCam: camera.position.clone(), toCam: DEFAULT_CAM.clone(),
    };
  }
}

resetBtn.addEventListener("click", () => deselect(true));

/* Raycasting */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
let pointerClient = { x: 0, y: 0 };
let pointerDirty = false;

canvas.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  pointerClient = { x: e.clientX, y: e.clientY };
  pointerDirty = true;
});

/* Prefer a "real" organelle hit over the membrane / cytoplasm shells,
   so inner organelles stay clickable through the cell's outer layers. */
function pickAtPointer() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickMeshes, false);
  if (!hits.length) return null;
  const inner = hits.find(
    (h) => h.object.userData.typeId !== "membrane" && h.object.userData.typeId !== "cytoplasm"
  );
  return inner || hits[0];
}

let downPos = null;
canvas.addEventListener("pointerdown", (e) => { downPos = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener("pointerup", (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  downPos = null;
  if (moved > 6) return; // it was a drag, not a click
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  const hit = pickAtPointer();
  if (!hit) { deselect(true); return; }
  const unit = units.find((u) => u.typeId === hit.object.userData.typeId &&
    u.root.getWorldPosition(new THREE.Vector3()).distanceTo(
      hit.object.getWorldPosition(new THREE.Vector3())) < 0.01) ||
    units.find((u) => {
      let found = false;
      u.root.traverse((c) => { if (c === hit.object) found = true; });
      return found;
    });
  if (unit) selectUnit(unit, true);
  else selectType(hit.object.userData.typeId, true); // e.g. free vesicles act as membrane
});

/* Auto-rotate: on at first, stops the moment the user grabs the cell */
function setAutoRotate(on) {
  controls.autoRotate = on;
  rotateBtn.textContent = `Auto-rotate: ${on ? "On" : "Off"}`;
  rotateBtn.setAttribute("aria-pressed", String(on));
}
rotateBtn.addEventListener("click", () => setAutoRotate(!controls.autoRotate));
controls.addEventListener("start", () => { if (controls.autoRotate) setAutoRotate(false); });

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */
const labelDivs = {};
let labelsOn = true;
for (const o of ORGANELLES) {
  const div = document.createElement("div");
  div.className = "label3d";
  div.textContent = o.label;
  div.style.color = o.color;
  labelsEl.appendChild(div);
  labelDivs[o.id] = div;
}
labelsBtn.addEventListener("click", () => {
  labelsOn = !labelsOn;
  labelsBtn.textContent = `Labels: ${labelsOn ? "On" : "Off"}`;
  labelsBtn.setAttribute("aria-pressed", String(labelsOn));
  labelsEl.style.display = labelsOn ? "" : "none";
});

function firstUnitOfType(typeId) {
  return units.find((u) => u.typeId === typeId);
}
const labelAnchorLocal = new THREE.Vector3();
function updateLabels() {
  if (!labelsOn) return;
  const camDir = camera.position.clone().normalize();
  for (const o of ORGANELLES) {
    const div = labelDivs[o.id];
    const unit = firstUnitOfType(o.id);
    if (!unit) { div.style.opacity = "0"; continue; }
    const wp = unit.root.getWorldPosition(new THREE.Vector3());
    // Fade labels whose anchor sits on the far side of the cell.
    labelAnchorLocal.copy(wp).normalize();
    const facing = labelAnchorLocal.dot(camDir);
    const projected = wp.clone().project(camera);
    const behind = projected.z > 1;
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    div.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -160%)`;
    div.style.opacity = behind ? "0" : String(THREE.MathUtils.clamp((facing - 0.05) * 2.2, 0, 1));
  }
}

/* ------------------------------------------------------------------ */
/* Explode + X-ray                                                     */
/* ------------------------------------------------------------------ */
let explodeTarget = 0;
let explodeCurrent = 0;
explodeEl.addEventListener("input", () => {
  explodeTarget = explodeEl.value / 100;
});
const NON_EXPLODING = new Set(["membrane", "cytoplasm", "cytoskeleton"]);
function applyExplode(f) {
  for (const u of units) {
    if (NON_EXPLODING.has(u.typeId)) continue;
    u.root.position.copy(u.basePos).addScaledVector(u.explodeOffset, f);
  }
}
let membraneOpacityTarget = 0.2;
xrayEl.addEventListener("change", () => {
  membraneOpacityTarget = xrayEl.checked ? 0.03 : 0.2;
  glow.visible = !xrayEl.checked;
});

/* Info panel expands on tap (mobile bottom-sheet behaviour) */
infoPanel.addEventListener("click", () => infoPanel.classList.toggle("expanded"));

/* ------------------------------------------------------------------ */
/* Main loop                                                           */
/* ------------------------------------------------------------------ */
const clock = new THREE.Clock();
let firstFrame = true;

function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  /* gentle life: particles drift, glow breathes */
  const particles = cellGroup.userData.particles;
  if (particles) particles.rotation.y = t * 0.02;
  glow.material.opacity = 0.04 + Math.sin(t * 0.8) * 0.012;
  cellGroup.rotation.y = Math.sin(t * 0.05) * 0.03;

  /* explode easing */
  if (Math.abs(explodeTarget - explodeCurrent) > 0.0005) {
    explodeCurrent += (explodeTarget - explodeCurrent) * Math.min(1, delta * 6);
    applyExplode(explodeCurrent);
  }

  /* membrane X-ray fade */
  const mo = materials.membrane.opacity;
  if (Math.abs(mo - membraneOpacityTarget) > 0.002) {
    materials.membrane.opacity = mo + (membraneOpacityTarget - mo) * Math.min(1, delta * 8);
  }

  /* selected pulse */
  for (const u of units) {
    const s = u === selectedUnit ? 1 + Math.sin(t * 4) * 0.045 : 1;
    u.root.scale.setScalar(s);
  }

  /* camera fly-to animation */
  if (camAnim) {
    camAnim.t += delta / camAnim.dur;
    const k = easeInOut(Math.min(camAnim.t, 1));
    controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, k);
    camera.position.lerpVectors(camAnim.fromCam, camAnim.toCam, k);
    if (camAnim.t >= 1) camAnim = null;
  }

  /* hover highlight + tooltip (checked once per frame, not per event) */
  if (pointerDirty && !camAnim) {
    pointerDirty = false;
    const hit = pickAtPointer();
    const typeId = hit ? hit.object.userData.typeId : null;
    if (typeId !== hoveredType) {
      if (hoveredType && hoveredType !== selectedType) setEmissive(hoveredType, BASE_EMISSIVE);
      hoveredType = typeId;
      if (hoveredType && hoveredType !== selectedType) setEmissive(hoveredType, 0.5);
      canvas.style.cursor = hoveredType ? "pointer" : "";
      if (hoveredType) {
        tooltipEl.textContent = ORGANELLE_MAP[hoveredType].name;
        tooltipEl.style.opacity = "1";
      } else {
        tooltipEl.style.opacity = "0";
      }
    }
    if (hoveredType) {
      tooltipEl.style.left = pointerClient.x + "px";
      tooltipEl.style.top = pointerClient.y + "px";
    }
  }

  controls.update();
  renderer.render(scene, camera);
  updateLabels();

  if (firstFrame) {
    firstFrame = false;
    loadingEl.classList.add("done");
    setTimeout(() => loadingEl.remove(), 700);
  }
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
