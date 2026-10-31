/*
 * Mythos Museum — interactive 3D gallery of creatures that never existed.
 * Each creature is built procedurally from Three.js primitives and curves;
 * where a licensed real model exists (see ../CREDITS.md) it is loaded from
 * local GLB files and the procedural build remains as the fallback.
 * Lighting has two moods — Day and Dusk —
 * cross-faded by lerping every light, the fog and the floor tint.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CREATURES } from './creatures.js';

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
const panelOrigin = document.getElementById('panel-origin');
const panelTagline = document.getElementById('panel-tagline');
const panelDesc = document.getElementById('panel-description');
const panelFact = document.getElementById('panel-fact');
const nowViewingEl = document.getElementById('now-viewing');
const dotsEl = document.getElementById('dots');
const modeBtn = document.getElementById('mode-toggle');
const turntableBtn = document.getElementById('turntable-toggle');

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
function getStageSize() {
  const rect = stageEl.getBoundingClientRect();
  return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(getStageSize().width, getStageSize().height);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stageEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Image-based lighting from a procedural room environment, kept at low
// intensity (envMapIntensity 0.35, set per material below) so it adds
// reflections and surface life without lifting the Day/Dusk light
// levels — the mood is still driven entirely by the lerped lights.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
pmrem.dispose();
const camera = new THREE.PerspectiveCamera(46, getStageSize().width / getStageSize().height, 0.1, 120);
camera.position.set(0, 6.8, 18.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.2;
controls.maxDistance = 32;
controls.maxPolarAngle = 1.53;

/* ------------------------------------------------------------------ */
/* Day / Dusk environment (all values lerped toward a target)          */
/* ------------------------------------------------------------------ */

const ENV = {
  day: {
    bg: new THREE.Color(0xd9cfba), amb: 0.85, hemi: 0.95, dir: 1.7,
    spot: 0, accent: 0.55, floor: new THREE.Color(0xf2ead6), dusk: 0,
  },
  dusk: {
    bg: new THREE.Color(0x0a0f24), amb: 0.10, hemi: 0.16, dir: 0.30,
    spot: 200, accent: 2.0, floor: new THREE.Color(0x39405c), dusk: 1,
  },
};

const envCur = {
  bg: ENV.dusk.bg.clone(), amb: ENV.dusk.amb, hemi: ENV.dusk.hemi,
  dir: ENV.dusk.dir, spot: ENV.dusk.spot, accent: ENV.dusk.accent,
  floor: ENV.dusk.floor.clone(), dusk: 1,
};
let envTarget = ENV.dusk;
let mode = 'dusk';

scene.background = envCur.bg;
scene.fog = new THREE.Fog(envCur.bg, 20, 52);

const ambientLight = new THREE.AmbientLight(0xfff2dd, envCur.amb);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0xbdd0ff, 0x3a3128, envCur.hemi);
scene.add(hemiLight);
const sunLight = new THREE.DirectionalLight(0xfff1d6, envCur.dir);
sunLight.position.set(7, 13, 9);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -17;
sunLight.shadow.camera.right = 17;
sunLight.shadow.camera.top = 17;
sunLight.shadow.camera.bottom = -17;
scene.add(sunLight);

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color, roughness: 0.62, metalness: 0.08, flatShading: true }, opts)
  );
}

/* Physical-material shortcut: same house defaults as std(), plus
 * clearcoat / sheen support and a low environment intensity so the
 * room reflections never wash out the Day/Dusk mood. */
function phys(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial(
    Object.assign(
      { color, roughness: 0.5, metalness: 0.05, flatShading: true, envMapIntensity: 0.35 },
      opts
    )
  );
}

/* Canvas detail texture. The patterns below are grayscale on purpose:
 * they multiply the material colour, so every creature keeps its exact
 * palette while gaining surface detail (and a matching bump map). */
function makeCanvasTexture(size, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* Feather shading: darker root melting to a bright tip, with fine
 * barb streaks running along the feather's length. */
function featherTexture() {
  return makeCanvasTexture(256, (g, s) => {
    const grad = g.createLinearGradient(0, 0, s, 0);
    grad.addColorStop(0, '#6e6e6e');
    grad.addColorStop(0.45, '#b4b4b4');
    grad.addColorStop(0.8, '#e8e8e8');
    grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 110; i++) {
      const y = Math.random() * s;
      g.strokeStyle = Math.random() < 0.6 ? 'rgba(40,40,40,0.16)' : 'rgba(255,255,255,0.14)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(s, y + (Math.random() - 0.5) * 22);
      g.stroke();
    }
  });
}

/* Kraken skin: soft blotches plus fine speckle over a mid grey. */
function speckleTexture() {
  return makeCanvasTexture(256, (g, s) => {
    g.fillStyle = '#cfcfcf';
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) { // soft blotches
      const x = Math.random() * s, y = Math.random() * s, r = 14 + Math.random() * 34;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, Math.random() < 0.55 ? 'rgba(70,70,70,0.20)' : 'rgba(255,255,255,0.16)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 1500; i++) { // fine speckle
      const v = 90 + Math.floor(Math.random() * 150);
      g.fillStyle = `rgba(${v},${v},${v},${0.25 + Math.random() * 0.4})`;
      g.fillRect(Math.random() * s, Math.random() * s, 1.6, 1.6);
    }
  }, 4, 3);
}

/* Dragon scales: rows of overlapping arcs with alternating offsets. */
function scaleTexture() {
  return makeCanvasTexture(256, (g, s) => {
    g.fillStyle = '#9a9a9a';
    g.fillRect(0, 0, s, s);
    const r = 32, rowH = 26;
    for (let row = -1; row * rowH < s + rowH; row++) {
      const off = row % 2 === 0 ? 0 : r;
      for (let cx = -r + off; cx < s + r; cx += r * 2) {
        const v = 185 + Math.floor(Math.random() * 60);
        g.beginPath();
        g.arc(cx, row * rowH, r, 0, Math.PI);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fill();
        g.strokeStyle = 'rgba(30,30,30,0.5)';
        g.lineWidth = 3;
        g.stroke();
      }
    }
  }, 3, 2);
}

function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* Rising-particle system (embers, bubbles, sparkles). */
const particleSystems = [];
function makeParticles({ count, color, size, spreadX, spreadZ, baseY, topY, speedMin, speedMax, opacity }) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const spd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * spreadX;
    pos[i * 3 + 1] = baseY + Math.random() * (topY - baseY);
    pos[i * 3 + 2] = (Math.random() * 2 - 1) * spreadZ;
    spd[i] = speedMin + Math.random() * (speedMax - speedMin);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.update = (dt) => {
    const a = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + spd[i] * dt;
      if (y > topY) y = baseY;
      a.setY(i, y);
    }
    a.needsUpdate = true;
    mat.opacity = opacity * (0.4 + 0.6 * envCur.dusk); // particles glow in the dusk
  };
  particleSystems.push(pts);
  return pts;
}

/* ------------------------------------------------------------------ */
/* The hall: floor, columns, back wall                                 */
/* ------------------------------------------------------------------ */

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 30, 256, 256, 256);
  grad.addColorStop(0, '#565e70');
  grad.addColorStop(0.55, '#333947');
  grad.addColorStop(1, '#14171f');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  // faint marble veins
  g.strokeStyle = 'rgba(255,255,255,0.05)';
  g.lineWidth = 1.4;
  for (let i = 0; i < 26; i++) {
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

const floorMat = new THREE.MeshPhysicalMaterial({
  map: floorTexture(), color: envCur.floor.clone(),
  roughness: 0.28, metalness: 0.2, // low roughness gives the polished sheen
  clearcoat: 0.55, clearcoatRoughness: 0.3, // polished-marble top layer
  envMapIntensity: 0.35,
});
const floor = new THREE.Mesh(new THREE.CircleGeometry(46, 64), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// A thin brass inlay ring circling the gallery.
const inlay = new THREE.Mesh(
  new THREE.RingGeometry(15.4, 15.55, 96),
  new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.85 })
);
inlay.rotation.x = -Math.PI / 2;
inlay.position.y = 0.012;
scene.add(inlay);

// Back wall the light can fall on.
const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(70, 18),
  std(0x2c3040, { roughness: 0.9, flatShading: false })
);
wall.position.set(0, 9, -10.5);
wall.receiveShadow = true;
scene.add(wall);

// Columns along the back and sides.
const columnMat = std(0x4a4f61, { roughness: 0.8 });
const capitalMat = std(0x5b6070, { roughness: 0.75 });
function addColumn(x, z) {
  const grp = new THREE.Group();
  grp.add(mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), capitalMat, 0, 0.25, 0));
  grp.add(mesh(new THREE.CylinderGeometry(0.52, 0.6, 8.6, 14), columnMat, 0, 4.8, 0));
  grp.add(mesh(new THREE.BoxGeometry(1.5, 0.55, 1.5), capitalMat, 0, 9.35, 0));
  grp.position.set(x, 0, z);
  scene.add(grp);
}
for (let x = -16.8; x <= 16.8; x += 5.6) addColumn(x, -8.6);
addColumn(-16.8, -1); addColumn(16.8, -1);
addColumn(-16.8, 6.5); addColumn(16.8, 6.5);

/* ------------------------------------------------------------------ */
/* Creature builders — each returns { model, lights }                  */
/* model is a Group whose origin is the turntable surface.             */
/* ------------------------------------------------------------------ */

function buildPhoenix() {
  const g = new THREE.Group();
  const lights = [];
  const featherTex = featherTexture();
  const bodyMat = phys(0xff7b2d, { emissive: 0xff5a00, emissiveIntensity: 0.18, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.5 });
  const goldMat = phys(0xffb300, { emissive: 0xff8c1a, emissiveIntensity: 0.22, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.45 });
  const darkMat = std(0x4a3220, { roughness: 0.9 });

  // Perch: a charred branch across the turntable.
  const branch = mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.3, 8), darkMat, 0, 0.34, 0.1);
  branch.rotation.z = Math.PI / 2;
  branch.rotation.y = 0.25;
  g.add(branch);
  const twig = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.8, 6), darkMat, 0.75, 0.55, -0.05);
  twig.rotation.z = -0.7;
  g.add(twig);

  // Legs gripping the branch.
  for (const sx of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.42, 8), darkMat, sx * 0.22, 0.55, 0.12));
  }

  // Body and chest.
  const body = mesh(new THREE.SphereGeometry(0.62, 24, 18), bodyMat, 0, 1.25, 0);
  body.scale.set(1, 0.92, 1.35);
  g.add(body);
  const chest = mesh(new THREE.SphereGeometry(0.42, 18, 14), goldMat, 0, 1.12, 0.42);
  chest.scale.set(0.9, 1, 0.8);
  g.add(chest);

  // Neck and head.
  const neck = mesh(new THREE.CapsuleGeometry(0.2, 0.34, 6, 12), bodyMat, 0, 1.82, 0.48);
  neck.rotation.x = 0.5;
  g.add(neck);
  const head = mesh(new THREE.SphereGeometry(0.32, 20, 16), goldMat, 0, 2.08, 0.72);
  head.scale.set(0.9, 0.95, 1.05);
  g.add(head);
  const beak = mesh(new THREE.ConeGeometry(0.13, 0.48, 12), std(0x333340, { roughness: 0.4 }), 0, 2.04, 1.12);
  beak.rotation.x = Math.PI / 2;
  g.add(beak);
  const eyeMat = std(0x14100c, { roughness: 0.25 });
  for (const sx of [-1, 1]) g.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeMat, sx * 0.17, 2.16, 0.95));

  // Crest feathers.
  const crestCols = [0xff3d00, 0xffb300, 0xff6d00];
  [-0.13, 0, 0.13].forEach((cx, i) => {
    const crest = mesh(new THREE.ConeGeometry(0.07, i === 1 ? 0.66 : 0.5, 8), std(crestCols[i], { emissive: 0xff5a00, emissiveIntensity: 0.25 }), cx, 2.42, 0.58);
    crest.rotation.x = -0.55;
    crest.rotation.z = -cx * 1.4;
    g.add(crest);
  });

  // Wings — one extruded silhouette, mirrored.
  const ws = new THREE.Shape();
  ws.moveTo(0, 0);
  ws.lineTo(0.25, 0.85); ws.lineTo(0.5, 0.5); ws.lineTo(0.85, 1.0);
  ws.lineTo(0.95, 0.45); ws.lineTo(1.3, 0.6); ws.lineTo(1.1, 0.0);
  ws.lineTo(0.65, 0.12); ws.lineTo(0.3, -0.08); ws.lineTo(0, 0);
  const wingGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.05, bevelEnabled: false });
  const wingTex = featherTex.clone();
  wingTex.repeat.set(0.7, 0.7);
  wingTex.needsUpdate = true;
  const wingMat = phys(0xff8c2e, { map: wingTex, emissive: 0xff5a00, emissiveIntensity: 0.15, side: THREE.DoubleSide, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.4 });
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.castShadow = true;
    wing.scale.set(sx * 1.45, 1.45, 1);
    wing.position.set(sx * 0.38, 1.5, -0.12);
    wing.rotation.set(-0.15, sx * 0.3, 0.5);
    g.add(wing);
  }

  // Flowing tail ribbons, flame colours, with ember tips.
  const tailCols = [0xff3d00, 0xff6d00, 0xff9100, 0xffb300, 0xffd54f];
  [-0.85, -0.45, 0, 0.45, 0.85].forEach((spread, i) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.05, -0.7),
      new THREE.Vector3(spread * 0.5, 0.55, -1.5),
      new THREE.Vector3(spread, 0.14, -1.9 - Math.abs(spread) * 0.25),
    ]);
    const ribbonMat = phys(tailCols[i], { map: featherTex, emissive: tailCols[i], emissiveIntensity: 0.28, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.4 });
    g.add(mesh(new THREE.TubeGeometry(curve, 24, 0.055, 8), ribbonMat));
    const tip = mesh(new THREE.ConeGeometry(0.09, 0.3, 8), ribbonMat, spread, 0.05, -1.9 - Math.abs(spread) * 0.25);
    tip.rotation.x = Math.PI;
    g.add(tip);
  });

  // Rising embers and a warm light.
  g.add(makeParticles({
    count: 110, color: 0xffa03c, size: 0.07, spreadX: 1.5, spreadZ: 1.5,
    baseY: 0.2, topY: 3.6, speedMin: 0.25, speedMax: 0.7, opacity: 0.85,
  }));
  const light = new THREE.PointLight(0xff8c3a, 6, 10, 1.6);
  light.position.set(0, 2, 0.6);
  light.userData.base = 6;
  g.add(light);
  lights.push(light);
  return { model: g, lights };
}

function buildKraken() {
  const g = new THREE.Group();
  const lights = [];
  const krakenTex = speckleTexture();
  const skinMat = phys(0x1f7a8c, { map: krakenTex, bumpMap: krakenTex, bumpScale: 0.15, roughness: 0.32, clearcoat: 0.85, clearcoatRoughness: 0.35 });
  const deepMat = phys(0x14586b, { map: krakenTex, bumpMap: krakenTex, bumpScale: 0.15, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.4 });
  const suckerMat = phys(0xd8efe6, { roughness: 0.22, flatShading: false, clearcoat: 0.7, clearcoatRoughness: 0.25 });
  const suckerGeo = new THREE.SphereGeometry(0.062, 10, 8);

  // Mantle: dome plus a soft pointed crown.
  const mantle = mesh(new THREE.SphereGeometry(0.82, 24, 18), skinMat, 0, 1.3, 0);
  mantle.scale.set(1, 1.18, 1);
  g.add(mantle);
  const crown = mesh(new THREE.ConeGeometry(0.52, 0.95, 20), deepMat, 0, 2.42, 0);
  g.add(crown);
  // Little side fins.
  for (const sx of [-1, 1]) {
    const fin = mesh(new THREE.ConeGeometry(0.2, 0.6, 8), deepMat, sx * 0.88, 1.72, 0);
    fin.rotation.z = sx * 1.9;
    g.add(fin);
  }

  // Big watchful eyes on the front of the mantle.
  const whiteMat = phys(0xf4fbfa, { roughness: 0.12, flatShading: false, clearcoat: 1, clearcoatRoughness: 0.1 });
  const pupilMat = phys(0x0a1420, { roughness: 0.1, flatShading: false, clearcoat: 1, clearcoatRoughness: 0.08 });
  for (const sx of [-1, 1]) {
    g.add(mesh(new THREE.SphereGeometry(0.17, 14, 12), whiteMat, sx * 0.36, 1.12, 0.68));
    g.add(mesh(new THREE.SphereGeometry(0.085, 10, 8), pupilMat, sx * 0.36, 1.12, 0.82));
  }

  // Eight arms coiling across the pedestal, suckers underneath.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const curlDir = i % 2 === 0 ? 1 : -1;
    const curl = (1.5 + (i % 3) * 0.35) * curlDir;
    const pts = [];
    for (let j = 0; j <= 5; j++) {
      const t = j / 5;
      const r = 0.45 + t * 1.35;
      const ang = a + t * curl * 0.55;
      pts.push(new THREE.Vector3(Math.cos(ang) * r, 0.62 * (1 - t) * (1 - t) + 0.15, Math.sin(ang) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(mesh(new THREE.TubeGeometry(curve, 36, 0.15, 10), i % 2 ? deepMat : skinMat));
    // Suckers: pale flattened discs sampled along the underside of the arm.
    for (const t of [0.22, 0.38, 0.54, 0.7, 0.84, 0.95]) {
      const p = curve.getPoint(t);
      const sucker = new THREE.Mesh(suckerGeo, suckerMat);
      sucker.scale.set(1, 0.45, 1);
      // Nudge down and slightly toward the body, so they read as underside.
      sucker.position.set(p.x * 0.96, Math.max(0.05, p.y - 0.13), p.z * 0.96);
      g.add(sucker);
    }
  }

  // Drifting bubbles and a cool wash of light.
  g.add(makeParticles({
    count: 80, color: 0xbfefff, size: 0.06, spreadX: 1.7, spreadZ: 1.7,
    baseY: 0.15, topY: 3.4, speedMin: 0.12, speedMax: 0.35, opacity: 0.7,
  }));
  const light = new THREE.PointLight(0x3fb6c9, 6, 10, 1.6);
  light.position.set(0, 2.1, 0.7);
  light.userData.base = 6;
  g.add(light);
  lights.push(light);
  return { model: g, lights };
}

function buildDragon() {
  const g = new THREE.Group();
  const lights = [];
  const dragonTex = scaleTexture();
  const bodyMat = phys(0x1e9e6a, { map: dragonTex, bumpMap: dragonTex, bumpScale: 0.2, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const bellyMat = phys(0x7fd6a4, { roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.55 });
  const wingMat = phys(0xb02040, { roughness: 0.42, side: THREE.DoubleSide, transparent: true, opacity: 0.96, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  const hornMat = std(0xe8e0cc, { roughness: 0.35 });
  const rockMat = std(0x555a66, { roughness: 0.95 });

  // The rock it perches on.
  const rock = mesh(new THREE.DodecahedronGeometry(1.2, 0), rockMat, 0, 0.32, 0);
  rock.scale.set(1.35, 0.68, 1.1);
  g.add(rock);
  const rock2 = mesh(new THREE.DodecahedronGeometry(0.55, 0), rockMat, 0.95, 0.18, 0.55);
  rock2.scale.set(1.2, 0.6, 1);
  g.add(rock2);

  // Body and chest, sitting tall on the rock.
  const body = mesh(new THREE.CapsuleGeometry(0.55, 0.85, 8, 14), bodyMat, 0, 1.35, -0.1);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const chest = mesh(new THREE.SphereGeometry(0.46, 16, 12), bellyMat, 0, 1.28, 0.52);
  chest.scale.set(0.85, 1, 0.7);
  g.add(chest);

  // Legs with claws, gripping the rock.
  const legMat = std(0x178554, { roughness: 0.55 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.85, 10), legMat, sx * 0.42, 0.82, sz * 0.5));
    for (let c = -1; c <= 1; c++) {
      const claw = mesh(new THREE.ConeGeometry(0.045, 0.18, 6), hornMat, sx * 0.42 + c * 0.09, 0.42, sz * 0.5 + 0.14);
      claw.rotation.x = Math.PI / 2.3;
      g.add(claw);
    }
  }

  // Neck and head.
  const neck = mesh(new THREE.CapsuleGeometry(0.3, 0.62, 8, 12), bodyMat, 0, 1.98, 0.82);
  neck.rotation.x = -0.6;
  g.add(neck);
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 2.5, 1.28);
  const skull = mesh(new THREE.SphereGeometry(0.4, 18, 14), bodyMat, 0, 0, 0);
  skull.scale.set(0.95, 0.85, 1.15);
  headGrp.add(skull);
  headGrp.add(mesh(new THREE.BoxGeometry(0.46, 0.26, 0.55), bodyMat, 0, -0.06, 0.5));
  const jaw = mesh(new THREE.BoxGeometry(0.4, 0.09, 0.5), bellyMat, 0, -0.24, 0.44);
  jaw.rotation.x = 0.16;
  headGrp.add(jaw);
  // Teeth: a row of tiny white cones under the snout.
  for (let tI = -2; tI <= 2; tI++) {
    const tooth = mesh(new THREE.ConeGeometry(0.03, 0.1, 6), hornMat, tI * 0.09, -0.2, 0.72);
    tooth.rotation.x = Math.PI;
    headGrp.add(tooth);
  }
  // Horns swept back, plus cheek fins.
  for (const sx of [-1, 1]) {
    const horn = mesh(new THREE.ConeGeometry(0.09, 0.58, 8), hornMat, sx * 0.27, 0.28, -0.22);
    horn.rotation.x = -1.85;
    horn.rotation.z = sx * 0.25;
    headGrp.add(horn);
    const fin = mesh(new THREE.ConeGeometry(0.1, 0.34, 6), wingMat, sx * 0.42, 0.02, -0.05);
    fin.rotation.z = sx * 2.4;
    headGrp.add(fin);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2222, emissiveIntensity: 1.5, roughness: 0.3 })
    );
    eye.position.set(sx * 0.21, 0.09, 0.32);
    headGrp.add(eye);
  }
  g.add(headGrp);

  // Spine spikes down the back.
  const spikeMat = std(0x0f7a4a, { roughness: 0.5 });
  [[0, 2.06, 0.45], [0, 2.0, 0.05], [0, 1.95, -0.35], [0, 1.86, -0.72]].forEach(([x, y, z]) => {
    g.add(mesh(new THREE.ConeGeometry(0.09, 0.32, 6), spikeMat, x, y, z));
  });

  // Bat wings: a scalloped membrane shape, extruded thin, mirrored.
  const ds = new THREE.Shape();
  ds.moveTo(0, 0);
  ds.lineTo(0.55, 0.8); ds.lineTo(1.05, 0.62); ds.lineTo(1.6, 0.95);
  ds.lineTo(1.45, 0.3);
  ds.quadraticCurveTo(1.2, 0.5, 1.02, 0.18);
  ds.quadraticCurveTo(0.8, 0.42, 0.58, 0.05);
  ds.quadraticCurveTo(0.35, 0.25, 0.12, -0.02);
  ds.lineTo(0, 0);
  const dWingGeo = new THREE.ExtrudeGeometry(ds, { depth: 0.04, bevelEnabled: false });
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(dWingGeo, wingMat);
    wing.castShadow = true;
    wing.scale.set(sx * 1.55, 1.55, 1);
    wing.position.set(sx * 0.34, 1.82, -0.25);
    wing.rotation.set(-0.2, sx * -0.35, 0.35);
    g.add(wing);
  }

  // Spiked tail curling off the rock.
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.25, -0.95),
    new THREE.Vector3(0.25, 0.9, -1.7),
    new THREE.Vector3(-0.3, 0.55, -2.2),
    new THREE.Vector3(-0.95, 0.52, -1.95),
  ]);
  g.add(mesh(new THREE.TubeGeometry(tailCurve, 32, 0.16, 10), bodyMat));
  for (const t of [0.25, 0.5, 0.75]) {
    const p = tailCurve.getPoint(t);
    g.add(mesh(new THREE.ConeGeometry(0.08, 0.26, 6), spikeMat, p.x, p.y + 0.18, p.z));
  }
  const tailEnd = tailCurve.getPoint(1);
  const spade = mesh(new THREE.ConeGeometry(0.16, 0.42, 4), wingMat, tailEnd.x - 0.12, tailEnd.y + 0.05, tailEnd.z + 0.1);
  spade.rotation.z = 1.9;
  spade.scale.set(1, 1, 0.35);
  g.add(spade);

  // A breath of embers drifting from the snout, and a ruby glow.
  const embers = makeParticles({
    count: 40, color: 0xff7733, size: 0.055, spreadX: 0.35, spreadZ: 0.5,
    baseY: 2.1, topY: 2.9, speedMin: 0.1, speedMax: 0.28, opacity: 0.75,
  });
  embers.position.set(0, 0, 1.9);
  g.add(embers);
  const light = new THREE.PointLight(0xe0393e, 5, 10, 1.6);
  light.position.set(0, 2.2, 1.2);
  light.userData.base = 5;
  g.add(light);
  lights.push(light);
  return { model: g, lights };
}

function buildUnicorn() {
  const g = new THREE.Group();
  const lights = [];
  const pearlMat = phys(0xf3eee8, { roughness: 0.34, metalness: 0.02, clearcoat: 0.3, clearcoatRoughness: 0.6, sheen: 0.55, sheenRoughness: 0.55, sheenColor: 0xfff1d6 });
  const goldMat = phys(0xd9a441, { roughness: 0.26, metalness: 0.6, clearcoat: 0.7, clearcoatRoughness: 0.25 });
  const hoofMat = std(0x6b5320, { roughness: 0.4, metalness: 0.4 });

  // Body.
  const body = mesh(new THREE.CapsuleGeometry(0.5, 1.0, 8, 16), pearlMat, 0, 1.38, 0);
  body.rotation.x = Math.PI / 2;
  g.add(body);

  // Legs and hooves.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(mesh(new THREE.CylinderGeometry(0.085, 0.075, 1.05, 10), pearlMat, sx * 0.3, 0.58, sz * 0.6));
    g.add(mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.13, 10), hoofMat, sx * 0.3, 0.065, sz * 0.6));
  }

  // Neck, head and muzzle.
  const neck = mesh(new THREE.CapsuleGeometry(0.26, 0.55, 8, 12), pearlMat, 0, 1.98, 0.88);
  neck.rotation.x = -0.65;
  g.add(neck);
  const head = mesh(new THREE.SphereGeometry(0.34, 18, 14), pearlMat, 0, 2.38, 1.3);
  head.scale.set(0.72, 0.85, 1.15);
  g.add(head);
  const muzzle = mesh(new THREE.SphereGeometry(0.2, 14, 10), std(0xe9ddd2, { roughness: 0.4 }), 0, 2.26, 1.68);
  muzzle.scale.set(0.8, 0.75, 1.1);
  g.add(muzzle);
  const eyeMat = std(0x1c1712, { roughness: 0.2 });
  for (const sx of [-1, 1]) {
    g.add(mesh(new THREE.SphereGeometry(0.04, 10, 8), eyeMat, sx * 0.19, 2.46, 1.48));
    const ear = mesh(new THREE.ConeGeometry(0.07, 0.24, 8), pearlMat, sx * 0.16, 2.68, 1.12);
    ear.rotation.x = -0.3;
    ear.rotation.z = sx * -0.25;
    g.add(ear);
  }

  // The horn: a gold cone wrapped in a spiral-striped canvas texture,
  // ringed at the base so the twist reads even from across the hall.
  const hc = document.createElement('canvas');
  hc.width = hc.height = 128;
  const hg = hc.getContext('2d');
  const grad = hg.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, '#e9bc58');
  grad.addColorStop(0.5, '#c9932e');
  grad.addColorStop(1, '#e9bc58');
  hg.fillStyle = grad;
  hg.fillRect(0, 0, 128, 128);
  hg.strokeStyle = '#7d5510';
  hg.lineWidth = 11;
  for (let i = -2; i < 7; i++) {
    hg.beginPath();
    hg.moveTo(i * 32 - 40, 140);
    hg.lineTo(i * 32 + 40, -12);
    hg.stroke();
  }
  const hornTex = new THREE.CanvasTexture(hc);
  hornTex.wrapS = hornTex.wrapT = THREE.RepeatWrapping;
  hornTex.repeat.set(2, 1.6);
  hornTex.colorSpace = THREE.SRGBColorSpace;
  const horn = new THREE.Mesh(
    new THREE.ConeGeometry(0.095, 0.9, 16),
    new THREE.MeshPhysicalMaterial({ map: hornTex, roughness: 0.28, metalness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.35 })
  );
  horn.castShadow = true;
  horn.position.set(0, 2.92, 1.42);
  horn.rotation.x = -0.28;
  g.add(horn);
  [2.56, 2.66, 2.76].forEach((ry, i) => {
    const ring = mesh(new THREE.TorusGeometry(0.085 - i * 0.014, 0.018, 8, 20), goldMat, 0, ry, 1.36 + i * 0.028);
    ring.rotation.x = Math.PI / 2 - 0.28;
    g.add(ring);
  });

  // Golden mane: a sweep of curved tubes down the neck.
  for (let k = 0; k < 4; k++) {
    const off = (k % 2 === 0 ? 1 : -1) * 0.05;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(off, 2.52 - k * 0.2, 1.02 - k * 0.13),
      new THREE.Vector3(off * 1.6, 2.2 - k * 0.2, 0.82 - k * 0.13),
      new THREE.Vector3(off, 1.92 - k * 0.2, 0.68 - k * 0.13),
    ]);
    g.add(mesh(new THREE.TubeGeometry(curve, 12, 0.05, 8), goldMat));
  }

  // Flowing golden tail.
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.62, -0.98),
    new THREE.Vector3(0.06, 1.2, -1.38),
    new THREE.Vector3(-0.05, 0.7, -1.48),
    new THREE.Vector3(0, 0.34, -1.32),
  ]);
  g.add(mesh(new THREE.TubeGeometry(tailCurve, 20, 0.075, 8), goldMat));

  // Sparkles and a soft warm light.
  g.add(makeParticles({
    count: 90, color: 0xffe9a8, size: 0.055, spreadX: 1.6, spreadZ: 1.6,
    baseY: 0.3, topY: 3.4, speedMin: 0.06, speedMax: 0.2, opacity: 0.8,
  }));
  const light = new THREE.PointLight(0xffe9a8, 5, 10, 1.6);
  light.position.set(0, 2.4, 0.8);
  light.userData.base = 5;
  g.add(light);
  lights.push(light);
  return { model: g, lights };
}

/* ------------------------------------------------------------------ */
/* Exhibits: pedestal + turntable + creature + plaque + spotlight      */
/* ------------------------------------------------------------------ */

const BUILDERS = [buildPhoenix, buildKraken, buildDragon, buildUnicorn];
const EXHIBIT_POS = [
  { x: -10.8, z: 1.2 },
  { x: -3.6, z: -0.5 },
  { x: 3.6, z: -0.5 },
  { x: 10.8, z: 1.2 },
];

const exhibits = [];
const pedestalMat = std(0x353a48, { roughness: 0.55, metalness: 0.2 });
const trimMat = std(0xc9a227, { roughness: 0.3, metalness: 0.85 });
const plaqueMat = std(0xc9a227, { roughness: 0.28, metalness: 0.9 });
const ringGeo = new THREE.RingGeometry(2.3, 2.58, 48);

CREATURES.forEach((data, i) => {
  const { x, z } = EXHIBIT_POS[i];
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.userData.exhibitIndex = i;
  scene.add(root);

  // Pedestal: stepped stone base with a brass trim line.
  const base = mesh(new THREE.CylinderGeometry(2.05, 2.3, 0.28, 28), pedestalMat, 0, 0.14, 0);
  root.add(base);
  const column = mesh(new THREE.CylinderGeometry(1.72, 1.9, 0.82, 28), pedestalMat, 0, 0.69, 0);
  root.add(column);
  const trim = mesh(new THREE.TorusGeometry(1.78, 0.035, 8, 48), trimMat, 0, 1.08, 0);
  trim.rotation.x = Math.PI / 2;
  root.add(trim);

  // Hover/selection ring lying on the floor around the pedestal.
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc9a227, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  root.add(ring);

  // Turntable disc + the creature itself.
  const turntable = new THREE.Group();
  turntable.position.y = 1.1;
  turntable.userData.exhibitIndex = i;
  root.add(turntable);
  const disc = mesh(new THREE.CylinderGeometry(1.58, 1.58, 0.14, 32), std(0x2a2118, { roughness: 0.4, metalness: 0.5 }), 0, 0.07, 0);
  turntable.add(disc);
  const built = BUILDERS[i]();
  built.model.position.y = 0.14;
  built.model.userData.exhibitIndex = i;
  turntable.add(built.model);

  // Brass plaque on the front of the pedestal, tilted up to be read.
  const plaque = mesh(new THREE.BoxGeometry(0.95, 0.52, 0.06), plaqueMat, 0, 0.72, 1.87);
  plaque.rotation.x = -0.42;
  root.add(plaque);

  // Dusk spotlight from the ceiling, aimed at the creature.
  const spot = new THREE.SpotLight(0xffe6b0, 0, 34, 0.46, 0.65, 1.4);
  spot.position.set(x, 9.5, z + 1.6);
  spot.target.position.set(x, 1.6, z);
  scene.add(spot);
  scene.add(spot.target);

  exhibits.push({
    data, root, turntable, model: built.model, ringMat, spot,
    lights: built.lights, x, z,
  });
});

/* Keep every material's environment reflection at the same low level,
 * so the RoomEnvironment adds life to brass, stone and scales alike
 * without lifting the Day/Dusk lighting mood. */
scene.traverse((o) => {
  if (o.isMesh && o.material && 'envMapIntensity' in o.material) {
    o.material.envMapIntensity = 0.35;
  }
});

/* ------------------------------------------------------------------ */
/* Real licensed GLB models (Poly Pizza — see ../CREDITS.md).         */
/* Loaded async per exhibit: on success the GLB replaces the          */
/* procedural meshes, while the exhibit's particles and point light   */
/* (embers, bubbles, sparkles — not meshes) keep running. On any      */
/* load error the procedural build simply stays: the hall never       */
/* shows an empty pedestal.                                           */
/* ------------------------------------------------------------------ */

const glbMixers = [];
const gltfLoader = new GLTFLoader();

function fitModel(obj, target) {
  // Normalise: largest dimension -> target, centred on x/z, grounded at y=0.
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const s = target / maxDim;
  obj.scale.setScalar(s);
  obj.position.set(-center.x * s, -box.min.y * s, -center.z * s);
}

function swapExhibitWithGLB(index, url, { target = 3, clip = null, tint = null, emissive = null } = {}) {
  gltfLoader.load(url, (gltf) => {
    const ex = exhibits[index];
    if (!ex) return;
    const holder = new THREE.Group();
    holder.userData.exhibitIndex = index;
    const inner = gltf.scene;
    fitModel(inner, target);
    holder.add(inner);
    inner.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          if ('envMapIntensity' in m) m.envMapIntensity = 0.35;
          if (tint && m.color) m.color.multiply(tint);
          if (emissive && 'emissive' in m) { m.emissive.setHex(emissive.hex); m.emissiveIntensity = emissive.intensity; }
        });
      }
    });
    // Hide the procedural meshes (Points particles and PointLights survive).
    ex.model.traverse((o) => { if (o.isMesh) o.visible = false; });
    ex.model.add(holder);
    ex.glbHolder = holder;
    if (gltf.animations && gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(inner);
      const chosen = (clip && gltf.animations.find((a) => a.name.includes(clip))) || gltf.animations[0];
      mixer.clipAction(chosen).play();
      glbMixers.push(mixer);
    }
  }, undefined, () => { /* GLB failed — procedural fallback stays on the pedestal */ });
}

// Phoenix — built on an eagle model (CC BY, Poly by Google), flame-tinted
// with a warm emissive so it reads as the firebird; embers keep rising.
swapExhibitWithGLB(0, 'assets/models/eagle.glb', {
  target: 2.9, tint: new THREE.Color(1.0, 0.60, 0.28), emissive: { hex: 0xff5a00, intensity: 0.14 },
});
// Kraken — an octopus model (CC BY, Poly by Google) scaled large and
// teal-tinted; the plaque still tells the suckers story.
swapExhibitWithGLB(1, 'assets/models/octopus.glb', {
  target: 3.1, tint: new THREE.Color(0.78, 1.0, 1.02),
});
// Dragon — Quaternius (CC0), animated; the Flying clip idles on the rock.
swapExhibitWithGLB(2, 'assets/models/dragon.glb', { target: 3.1, clip: 'Flying' });
// Unicorn — Thomas DR (CC BY).
swapExhibitWithGLB(3, 'assets/models/unicorn.glb', { target: 3.0 });

/* ------------------------------------------------------------------ */
/* Selection, panel and camera flights                                 */
/* ------------------------------------------------------------------ */

let selectedIndex = -1; // -1 = the whole hall
let turntableOn = true;

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

// Build the navigation dots.
const dotEls = CREATURES.map((c, i) => {
  const b = document.createElement('button');
  b.className = 'dot';
  b.type = 'button';
  b.title = c.name;
  b.setAttribute('aria-label', `View ${c.name}`);
  b.addEventListener('click', () => selectExhibit(i));
  dotsEl.appendChild(b);
  return b;
});

function refreshChrome() {
  dotEls.forEach((d, i) => d.classList.toggle('active', i === selectedIndex));
  nowViewingEl.textContent = selectedIndex < 0 ? 'The Whole Hall' : CREATURES[selectedIndex].name;
  exhibits.forEach((ex, i) => {
    ex.ringMat.opacity = i === selectedIndex ? 0.95 : 0;
    if (i !== selectedIndex) setEmissive(ex.model, 0x000000, 0);
  });
}

function showPanel(data) {
  panelEyebrow.textContent = 'Now exhibiting';
  panelName.textContent = data.name;
  panelOrigin.textContent = data.origin;
  panelTagline.textContent = data.tagline;
  panelDesc.textContent = data.description;
  panelFact.textContent = data.fact;
  panelEl.classList.remove('closed');
}

function selectExhibit(i, fly = true) {
  if (selectedIndex >= 0 && selectedIndex !== i) setEmissive(exhibits[selectedIndex].model, 0x000000, 0);
  selectedIndex = i;
  const ex = exhibits[i];
  setEmissive(ex.model, 0xc9a227, 0.22);
  showPanel(ex.data);
  refreshChrome();
  if (fly) {
    flyTo(
      new THREE.Vector3(ex.x * 0.86, 3.2, ex.z + 8.4),
      new THREE.Vector3(ex.x, 2.45, ex.z)
    );
  }
}

function showHall(fly = true) {
  if (selectedIndex >= 0) setEmissive(exhibits[selectedIndex].model, 0x000000, 0);
  selectedIndex = -1;
  refreshChrome();
  if (fly) flyTo(new THREE.Vector3(0, 6.8, 18.5), new THREE.Vector3(0, 1.8, 0));
}

document.getElementById('prev-btn').addEventListener('click', () => {
  selectExhibit(selectedIndex < 0 ? CREATURES.length - 1 : (selectedIndex - 1 + CREATURES.length) % CREATURES.length);
});
document.getElementById('next-btn').addEventListener('click', () => {
  selectExhibit(selectedIndex < 0 ? 0 : (selectedIndex + 1) % CREATURES.length);
});
document.getElementById('hall-btn').addEventListener('click', () => showHall());
document.getElementById('panel-close').addEventListener('click', () => panelEl.classList.add('closed'));
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') document.getElementById('next-btn').click();
  else if (e.key === 'ArrowLeft') document.getElementById('prev-btn').click();
});

/* Day / Dusk and turntable toggles */
modeBtn.addEventListener('click', () => {
  mode = mode === 'dusk' ? 'day' : 'dusk';
  envTarget = ENV[mode];
  modeBtn.innerHTML = mode === 'dusk' ? '&#9789; Dusk' : '&#9728; Day';
  modeBtn.setAttribute('aria-pressed', String(mode === 'dusk'));
});
turntableBtn.addEventListener('click', () => {
  turntableOn = !turntableOn;
  turntableBtn.textContent = turntableOn ? 'Turntable: On' : 'Turntable: Off';
  turntableBtn.setAttribute('aria-pressed', String(turntableOn));
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
  pointer.x = ((cx - rect.left) / Math.max(1, rect.width)) * 2 - 1;
  pointer.y = -(((cy - rect.top) / Math.max(1, rect.height)) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) {
    let o = hit.object;
    while (o) {
      if (o.userData && o.userData.exhibitIndex !== undefined) return o.userData.exhibitIndex;
      o = o.parent;
    }
  }
  return -1;
}

renderer.domElement.addEventListener('pointermove', (e) => {
  hoverIndex = pickAt(e.clientX, e.clientY);
  if (hoverIndex >= 0) {
    tooltipEl.textContent = CREATURES[hoverIndex].name;
    const stageRect = stageEl.getBoundingClientRect();
    tooltipEl.style.left = (e.clientX - stageRect.left) + 'px';
    tooltipEl.style.top = (e.clientY - stageRect.top) + 'px';
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
    if (idx >= 0) selectExhibit(idx);
  }
});

/* ------------------------------------------------------------------ */
/* Resize + main loop                                                  */
/* ------------------------------------------------------------------ */

function resizeRenderer() {
  const { width, height } = getStageSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(resizeRenderer).observe(stageEl);
}
window.addEventListener('resize', resizeRenderer);

const clock = new THREE.Clock();
let firstFrame = true;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // Cross-fade the environment toward the Day/Dusk target.
  const k = 1 - Math.exp(-dt * 3.2);
  envCur.amb += (envTarget.amb - envCur.amb) * k;
  envCur.hemi += (envTarget.hemi - envCur.hemi) * k;
  envCur.dir += (envTarget.dir - envCur.dir) * k;
  envCur.spot += (envTarget.spot - envCur.spot) * k;
  envCur.accent += (envTarget.accent - envCur.accent) * k;
  envCur.dusk += (envTarget.dusk - envCur.dusk) * k;
  envCur.bg.lerp(envTarget.bg, k);
  envCur.floor.lerp(envTarget.floor, k);
  ambientLight.intensity = envCur.amb;
  hemiLight.intensity = envCur.hemi;
  sunLight.intensity = envCur.dir;
  floorMat.color.copy(envCur.floor);
  scene.fog.color.copy(envCur.bg); // fog was constructed with a copy, keep it in sync
  exhibits.forEach((ex) => {
    ex.spot.intensity = envCur.spot;
    ex.lights.forEach((L) => { L.intensity = L.userData.base * envCur.accent; });
  });

  // Hover ring (selection ring wins in refreshChrome; hover is additive here).
  exhibits.forEach((ex, i) => {
    if (i === selectedIndex) ex.ringMat.opacity = 0.95;
    else if (i === hoverIndex) ex.ringMat.opacity = 0.45;
    else ex.ringMat.opacity = 0;
  });

  // Turntable: only the focused creature turns; selected model breathes.
  exhibits.forEach((ex, i) => {
    if (i === selectedIndex && turntableOn) ex.turntable.rotation.y += dt * 0.45;
    const s = i === selectedIndex ? 1 + 0.018 * Math.sin(t * 2.4) : 1;
    ex.model.scale.setScalar(s);
  });

  // Particles.
  for (const p of particleSystems) p.userData.update(dt);

  // GLB animation clips (e.g. the dragon's idle flight).
  for (const mx of glbMixers) mx.update(dt);

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
