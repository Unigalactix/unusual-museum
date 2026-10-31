// Elementum — the periodic table in 3D, plus a live atom viewer.
// Original code for The Unusual Museum. All 118 tiles are generated from the
// ELEMENTS data set; the atom stage is generated from each element's shells.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ELEMENTS, CATEGORIES } from './elements.js';

const stage = document.getElementById('stage');
const tooltip = document.getElementById('tooltip');
const loadingEl = document.getElementById('loading');

/* ---------------- renderer / scene ---------------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  document.getElementById('webgl-fail').hidden = false;
  loadingEl.hidden = true;
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070a12);
scene.fog = new THREE.Fog(0x070a12, 120, 240);

// Soft studio reflections for the physical materials (kept low-intensity:
// every standard/physical material below sets envMapIntensity ≈ 0.35).
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
}

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
const HOME_POS = new THREE.Vector3(0, 16, 86);
const HOME_TG = new THREE.Vector3(0, -3, 0);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TG);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 220;
controls.autoRotateSpeed = 0.7;

/* ---------------- responsive framing ----------------
   Three-column layout: the stage fills only the centre column (and
   becomes a 56vh block in the mobile single-column layout), so sizing
   uses the stage rect, never the window. The side columns are real
   layout, not overlays, so the table — and the atom in atom view — is
   projected dead-centre in the stage, never behind a card. */
function viewRect() { return stage.getBoundingClientRect(); }
function resizeView() {
  const r = viewRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  camera.aspect = w / h;
  camera.clearViewOffset();
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  // CSS owns the canvas box (centre column on desktop, 56vh block on
  // mobile) — drop any inline size left by the bootstrap setSize call.
  renderer.domElement.style.width = "";
  renderer.domElement.style.height = "";
}
function setPointerFromClient(cx, cy) {
  const r = viewRect();
  pointer.x = ((cx - r.left) / Math.max(1, r.width)) * 2 - 1;
  pointer.y = -((cy - r.top) / Math.max(1, r.height)) * 2 + 1;
}
resizeView();

scene.add(new THREE.AmbientLight(0xbfd4ff, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(30, 50, 60);
scene.add(key);
const rim = new THREE.PointLight(0x6ee7ff, 900, 260);
rim.position.set(-40, -10, 40);
scene.add(rim);

/* ---------------- floor glow ---------------- */
function makeGlowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, 'rgba(90,140,255,0.55)');
  grad.addColorStop(0.5, 'rgba(70,90,200,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
}
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(190, 120),
  new THREE.MeshBasicMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -27.5, -6);
scene.add(floor);

// a soft starfield of dust motes for depth
{
  const n = 900, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 260;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 160;
    pos[i * 3 + 2] = -30 - Math.random() * 90;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8fb7ff, size: 0.55, transparent: true, opacity: 0.65 })));
}

/* ---------------- tiles ---------------- */
const TILE_W = 3.35, TILE_H = 4.15, TILE_D = 0.85, GAP_X = 3.75, GAP_Y = 4.55;
const tiles = [];
const tileGroup = new THREE.Group();
scene.add(tileGroup);

function tileTexture(el) {
  const cat = CATEGORIES[el.category];
  const c = document.createElement('canvas'); c.width = 268; c.height = 332;
  const g = c.getContext('2d');
  g.fillStyle = cat.color; g.fillRect(0, 0, 268, 332);
  const grad = g.createLinearGradient(0, 0, 0, 332);
  grad.addColorStop(0, 'rgba(255,255,255,0.20)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.22)');
  g.fillStyle = grad; g.fillRect(0, 0, 268, 332);
  g.strokeStyle = 'rgba(10,14,20,0.35)'; g.lineWidth = 6; g.strokeRect(3, 3, 262, 326);
  g.fillStyle = 'rgba(10,14,20,0.85)';
  g.font = '700 34px system-ui, sans-serif'; g.textAlign = 'left';
  g.fillText(String(el.number), 18, 44);
  g.font = '600 24px system-ui, sans-serif'; g.textAlign = 'right';
  g.fillText(el.synthetic ? '[' + el.mass + ']' : String(el.mass), 250, 44);
  g.font = '800 108px system-ui, sans-serif'; g.textAlign = 'center';
  g.fillText(el.symbol, 134, 190);
  g.font = '600 30px system-ui, sans-serif';
  g.fillText(el.name, 134, 252);
  g.font = '500 21px system-ui, sans-serif';
  g.fillStyle = 'rgba(10,14,20,0.65)';
  g.fillText(cat.label, 134, 292);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

{
  const geo = new THREE.BoxGeometry(TILE_W, TILE_H, TILE_D);
  // Raised front frame ("plate") shared by all tiles: a flat ring with a
  // rectangular hole, extruded slightly proud of the tile face so each tile
  // reads like a minted plaque with a beveled rim.
  const plateShape = new THREE.Shape();
  plateShape.moveTo(-TILE_W / 2, -TILE_H / 2);
  plateShape.lineTo(TILE_W / 2, -TILE_H / 2);
  plateShape.lineTo(TILE_W / 2, TILE_H / 2);
  plateShape.lineTo(-TILE_W / 2, TILE_H / 2);
  plateShape.closePath();
  const plateHole = new THREE.Path();
  const INSET = 0.24;
  plateHole.moveTo(-TILE_W / 2 + INSET, -TILE_H / 2 + INSET);
  plateHole.lineTo(TILE_W / 2 - INSET, -TILE_H / 2 + INSET);
  plateHole.lineTo(TILE_W / 2 - INSET, TILE_H / 2 - INSET);
  plateHole.lineTo(-TILE_W / 2 + INSET, TILE_H / 2 - INSET);
  plateHole.closePath();
  plateShape.holes.push(plateHole);
  const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.1, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.045, bevelSegments: 2, steps: 1,
  });
  for (const el of ELEMENTS) {
    const cat = CATEGORIES[el.category];
    const catColor = new THREE.Color(cat.color);
    const tex = tileTexture(el);
    const face = new THREE.MeshPhysicalMaterial({
      map: tex, roughness: 0.42, metalness: 0.05,
      clearcoat: 0.55, clearcoatRoughness: 0.35, envMapIntensity: 0.35, transparent: true,
    });
    const side = new THREE.MeshPhysicalMaterial({
      color: catColor.clone().multiplyScalar(0.55), roughness: 0.5, metalness: 0.1,
      clearcoat: 0.4, clearcoatRoughness: 0.4, envMapIntensity: 0.35, transparent: true,
    });
    const mesh = new THREE.Mesh(geo, [side, side, side, side, face, face]);
    mesh.position.set((el.xpos - 9.5) * GAP_X, (5.5 - el.ypos) * GAP_Y, 0);
    // Minted top plate: category-coloured rim with a faint emissive edge glow.
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: catColor.clone().multiplyScalar(0.85), roughness: 0.32, metalness: 0.25,
      clearcoat: 0.8, clearcoatRoughness: 0.25, envMapIntensity: 0.35,
      emissive: catColor, emissiveIntensity: 0.16, transparent: true,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.z = TILE_D / 2 - 0.02;
    mesh.add(plate);
    mesh.userData = { el, baseZ: 0, lift: 0, home: mesh.position.clone(), plateMat };
    tileGroup.add(mesh);
    tiles.push(mesh);
  }
}

/* ---------------- camera flights ---------------- */
let tween = null;
function flyTo(pos, tg, dur = 1400) {
  tween = {
    t0: performance.now(), dur,
    fromPos: camera.position.clone(), toPos: pos.clone(),
    fromTg: controls.target.clone(), toTg: tg.clone(),
  };
  controls.enabled = false;
}
function stepTween(now) {
  if (!tween) return;
  let t = Math.min(1, (now - tween.t0) / tween.dur);
  t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
  camera.position.lerpVectors(tween.fromPos, tween.toPos, t);
  controls.target.lerpVectors(tween.fromTg, tween.toTg, t);
  if (t >= 1) { tween = null; controls.enabled = true; }
}

/* ---------------- info panel ---------------- */
const $ = id => document.getElementById(id);
let selected = null;         // currently selected element object
let selectedTile = null;     // its mesh
let pulseMesh = null, pulseUntil = 0;

function fmtMass(el) { return el.synthetic ? '[' + el.mass + ']' : String(el.mass); }
function stateLabel(s) { return s === 'unknown' ? 'Unknown (predicted solid)' : s[0].toUpperCase() + s.slice(1); }

function selectElement(el, fly = true) {
  selected = el;
  selectedTile = tiles[el.number - 1] || tiles.find(t => t.userData.el === el);
  $('info-empty').hidden = true;
  $('info-content').hidden = false;
  const cat = CATEGORIES[el.category];
  const sym = $('info-symbol');
  sym.textContent = el.symbol;
  sym.style.background = cat.color;
  $('info-name').textContent = el.name;
  $('info-meta').textContent = 'Atomic number ' + el.number + ' · ' + cat.label;
  $('info-mass').textContent = fmtMass(el) + ' u';
  $('info-group').textContent = (el.group ? 'Group ' + el.group : 'f-block') + ' · Period ' + el.period;
  $('info-state').textContent = stateLabel(el.state);
  $('info-shells').textContent = el.shells.join(' · ') + '  (' + el.shells.length + ' shells)';
  $('info-blurb').textContent = el.blurb;
  if (fly && mode === 'table') {
    const p = selectedTile.position;
    flyTo(new THREE.Vector3(p.x, p.y, 17), new THREE.Vector3(p.x, p.y, 0), 1200);
  }
}

/* ---------------- atom stage ---------------- */
const ATOM_X = 400;
const atomStage = new THREE.Group();
atomStage.position.set(ATOM_X, 0, 0);
scene.add(atomStage);
let atomSpins = [];   // {group, speed}
let atomElement = null;
let mode = 'table';   // 'table' | 'atom'

// Deterministic PRNG so a given element's nucleus packs the same way on
// every visit (mulberry32).
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build the nucleus as a true-count cluster of individual nucleons:
// `protons` red spheres (Z) and `neutrons` grey-blue spheres
// (round(mass) − Z), rendered as one InstancedMesh per particle type.
// Positions use a spherical Fibonacci volume distribution (even packing,
// radius growing with cbrt(count)); past Z = 40 the particle radius is
// scaled down by cbrt(48 / total) so even oganesson's 294 nucleons stay
// in a compact ball.
function buildNucleus(el) {
  const protons = el.number;
  const neutrons = Math.max(0, Math.round(el.mass) - el.number);
  const total = protons + neutrons;
  const particleR = total <= 48 ? 0.34 : 0.34 * Math.cbrt(48 / total);
  const clusterR = Math.max(particleR * 1.2, particleR * Math.cbrt(total) * 1.18);

  // Evenly distributed points through the cluster volume.
  const rand = seededRandom(el.number * 7919 + 13);
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < total; i++) {
    const t = total === 1 ? 0 : (i + 0.5) / total;
    const r = (clusterR - particleR) * Math.cbrt(t);
    const theta = golden * i + rand() * 0.6;
    const y = total === 1 ? 0 : 1 - 2 * t;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    points.push(new THREE.Vector3(Math.cos(theta) * ring * r, y * r, Math.sin(theta) * ring * r));
  }
  // Deterministically interleave protons and neutrons through the cluster.
  const order = points.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const protonPts = order.slice(0, protons).map(i => points[i]);
  const neutronPts = order.slice(protons).map(i => points[i]);

  const group = new THREE.Group();
  const sphereGeo = new THREE.SphereGeometry(1, 18, 14);
  const dummy = new THREE.Object3D();
  const fill = (pts, mat) => {
    if (!pts.length) return;
    const inst = new THREE.InstancedMesh(sphereGeo, mat, pts.length);
    pts.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(particleR);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    group.add(inst);
  };
  fill(protonPts, new THREE.MeshPhysicalMaterial({
    color: 0xe63946, roughness: 0.3, metalness: 0.05,
    clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.35, emissive: 0x2a0205,
  }));
  fill(neutronPts, new THREE.MeshPhysicalMaterial({
    color: 0x8fa8c8, roughness: 0.38, metalness: 0.05,
    clearcoat: 0.45, clearcoatRoughness: 0.35, envMapIntensity: 0.35, emissive: 0x0a1220,
  }));
  group.userData = { protons, neutrons, particleR, clusterR };
  return group;
}
function makeLabelSprite(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.font = '800 84px system-ui, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = 10;
  g.fillStyle = '#ffffff';
  g.fillText(text, 128, 64);
  const tex = new THREE.CanvasTexture(c);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  spr.scale.set(7, 3.5, 1);
  return spr;
}

function buildAtom(el) {
  atomElement = el;
  // clear previous atom
  while (atomStage.children.length) {
    const child = atomStage.children.pop();
    child.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map) o.material.map.dispose(); if (o.material) o.material.dispose(); });
  }
  atomSpins = [];
  const cat = CATEGORIES[el.category];
  const nucleusR = 0.95 + Math.cbrt(el.mass) * 0.30;
  const nucleus = buildNucleus(el);
  atomStage.add(nucleus);
  atomSpins.push({ group: nucleus, speed: 0.12 }); // slow tumble for the cluster
  const label = makeLabelSprite(el.symbol);
  label.position.y = nucleusR + 2.4;
  atomStage.add(label);

  const electronGeo = new THREE.SphereGeometry(0.34, 14, 10);
  el.shells.forEach((count, i) => {
    const radius = nucleusR + 1.9 + i * 2.05;
    const tilt = new THREE.Group();
    tilt.rotation.set(Math.random() * 0.9 - 0.45, Math.random() * 0.6, Math.random() * 0.9 - 0.45);
    const spin = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.035, 8, 90),
      new THREE.MeshBasicMaterial({ color: 0x6ee7ff, transparent: true, opacity: 0.35 })
    );
    spin.add(ring);
    const eMat = new THREE.MeshStandardMaterial({ color: 0x9be8ff, emissive: 0x2b7ea6, roughness: 0.3, envMapIntensity: 0.35 });
    for (let j = 0; j < count; j++) {
      const a = (j / count) * Math.PI * 2;
      const e = new THREE.Mesh(electronGeo, eMat);
      e.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      spin.add(e);
    }
    tilt.add(spin);
    atomStage.add(tilt);
    atomSpins.push({ group: spin, speed: (0.9 / (i + 1)) * (i % 2 ? -1 : 1) });
  });
  // a soft glow disc under the atom
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 46),
    new THREE.MeshBasicMaterial({ map: makeGlowTexture(), transparent: true, depthWrite: false, color: new THREE.Color(cat.color) })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -(nucleusR + 1.9 + el.shells.length * 2.05) - 2.5;
  atomStage.add(glow);
}

$('atom-btn').addEventListener('click', () => {
  if (!selected) return;
  buildAtom(selected);
  mode = 'atom';
  $('back-btn').hidden = false;
  $('atom-caption').hidden = false;
  const neutronCount = Math.max(0, Math.round(selected.mass) - selected.number);
  $('atom-caption-text').textContent =
    selected.name + ' atom — ' + selected.number + ' protons, ' + neutronCount + ' neutrons, ' +
    selected.number + ' electrons in ' +
    selected.shells.length + ' shells (' + selected.shells.join(' · ') + ')';
  flyTo(new THREE.Vector3(ATOM_X, 3, 36), new THREE.Vector3(ATOM_X, 0, 0), 1600);
});
$('back-btn').addEventListener('click', () => {
  mode = 'table';
  $('back-btn').hidden = true;
  $('atom-caption').hidden = true;
  flyTo(HOME_POS, HOME_TG, 1500);
});

/* ---------------- picking ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
let pointerPx = { x: 0, y: 0 };
let hovered = null;
let downPos = null;

renderer.domElement.addEventListener('pointermove', ev => {
  pointerPx = { x: ev.clientX, y: ev.clientY };
  setPointerFromClient(ev.clientX, ev.clientY);
});
renderer.domElement.addEventListener('pointerdown', ev => { downPos = { x: ev.clientX, y: ev.clientY }; });
renderer.domElement.addEventListener('pointerup', ev => {
  if (!downPos) return;
  const moved = Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y);
  downPos = null;
  if (moved > 6 || mode !== 'table') return;
  setPointerFromClient(ev.clientX, ev.clientY);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(tiles, false);
  if (hits.length) selectElement(hits[0].object.userData.el);
});

/* ---------------- filters & search ---------------- */
let activeCategory = null;
function applyFilter() {
  for (const t of tiles) {
    const dim = activeCategory && t.userData.el.category !== activeCategory;
    t.userData.dim = dim;
    for (const m of t.material) m.opacity = dim ? 0.13 : 1;
    if (t.userData.plateMat) t.userData.plateMat.opacity = dim ? 0.13 : 1;
  }
}
{
  const chipsEl = $('chips');
  const mk = (keyName, label, color) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip' + (keyName === null ? ' active' : '');
    b.innerHTML = (color ? '<span class="dot" style="background:' + color + '"></span>' : '') + label;
    b.addEventListener('click', () => {
      activeCategory = keyName;
      chipsEl.querySelectorAll('.chip').forEach(ch => ch.classList.remove('active'));
      b.classList.add('active');
      applyFilter();
    });
    chipsEl.appendChild(b);
  };
  mk(null, 'All 118', null);
  for (const [k, v] of Object.entries(CATEGORIES)) {
    const n = ELEMENTS.filter(e => e.category === k).length;
    mk(k, v.label + ' (' + n + ')', v.color);
  }
}
$('search').addEventListener('input', ev => {
  const q = ev.target.value.trim().toLowerCase();
  if (!q) return;
  const el =
    ELEMENTS.find(e => e.symbol.toLowerCase() === q) ||
    ELEMENTS.find(e => String(e.number) === q) ||
    ELEMENTS.find(e => e.name.toLowerCase().startsWith(q)) ||
    ELEMENTS.find(e => e.name.toLowerCase().includes(q));
  if (el) {
    if (activeCategory && el.category !== activeCategory) {
      activeCategory = null; applyFilter();
      document.querySelectorAll('#chips .chip').forEach((ch, i) => ch.classList.toggle('active', i === 0));
    }
    selectElement(el);
    pulseMesh = selectedTile; pulseUntil = performance.now() + 1800;
  }
});
$('autorotate-toggle').addEventListener('change', ev => { controls.autoRotate = ev.target.checked; });

/* ---------------- animation ---------------- */
const clock = new THREE.Clock();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  stepTween(now || performance.now());

  // hover pick (once per frame)
  if (mode === 'table' && !tween) {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(tiles, false);
    const hit = hits.length ? hits[0].object : null;
    if (hit !== hovered) {
      hovered = hit;
      if (hit) {
        const el = hit.userData.el;
        tooltip.innerHTML = '<span class="tt-sym">' + el.symbol + ' · ' + el.name + '</span><br>' +
          '<span class="tt-sub">No. ' + el.number + ' · ' + fmtMass(el) + ' u · ' + CATEGORIES[el.category].label + '</span>';
        tooltip.hidden = false;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        tooltip.hidden = true;
        renderer.domElement.style.cursor = '';
      }
    }
    if (hit) { tooltip.style.left = (pointerPx.x + 16) + 'px'; tooltip.style.top = (pointerPx.y + 14) + 'px'; }
  } else if (mode !== 'table') {
    tooltip.hidden = true;
  }

  // tile lift + selection emphasis
  for (const t of tiles) {
    const target = (t === hovered ? 1.1 : 0) + (t === selectedTile ? 0.7 : 0);
    t.userData.lift += (target - t.userData.lift) * 0.18;
    t.position.z = t.userData.baseZ + t.userData.lift;
    let s = 1;
    if (t === selectedTile) s = 1.07;
    if (t === pulseMesh && performance.now() < pulseUntil) s = 1.12 + Math.sin(performance.now() * 0.02) * 0.05;
    t.scale.setScalar(s);
  }

  // atom electrons
  for (const s of atomSpins) s.group.rotation.z += s.speed * dt;
  atomStage.rotation.y += dt * 0.05;

  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

window.addEventListener('resize', resizeView);

/* ---------------- ready ---------------- */
window.__elementumReady = true;
clearTimeout(window.__elementumTimer);
loadingEl.hidden = true;
selectElement(ELEMENTS[25], false); // Iron, as a friendly starting point
