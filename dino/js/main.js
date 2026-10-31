/*
 * DinoVerse — the prehistoric hall of The Unusual Museum.
 * Eight dinosaurs (and one pterosaur) built procedurally from Three.js
 * primitives with canvas-generated hide textures, warm hall lighting,
 * and the museum's "life-like" treatment: ACES tone mapping, soft
 * shadows, environment reflections and clearcoat physical materials.
 * All modelling code and exhibit text are original to this gallery.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DINOS } from './dinos.js';

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const stageEl = document.getElementById('stage');
const loadingEl = document.getElementById('loading');
const failEl = document.getElementById('webgl-fail');
const tooltipEl = document.getElementById('tooltip');
const panelEl = document.getElementById('info-panel');
const eyebrowEl = document.getElementById('info-eyebrow');
const nameEl = document.getElementById('info-name');
const hookEl = document.getElementById('info-hook');
const descEl = document.getElementById('info-desc');
const statsEl = document.getElementById('info-stats');
const statLength = document.getElementById('stat-length');
const statDiet = document.getElementById('stat-diet');
const statPeriod = document.getElementById('stat-period');
const factWrap = document.getElementById('info-fact-wrap');
const factEl = document.getElementById('info-fact');
const listEl = document.getElementById('dino-list');
const searchEl = document.getElementById('search');

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
scene.background = new THREE.Color(0x140d08);
scene.fog = new THREE.Fog(0x140d08, 26, 58);

// Image-based lighting: a procedural room environment at low intensity,
// so hide, bone and bronze pick up reflections without flattening the
// warm hall lighting that does the real work.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 140);
camera.position.set(-4.4, 5.6, 17.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-1.4, 2.1, -0.6);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.0;
controls.maxDistance = 34;
controls.maxPolarAngle = 1.54;

function sizeRenderer() {
  const w = stageEl.clientWidth || window.innerWidth;
  const h = stageEl.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
sizeRenderer();
window.addEventListener('resize', sizeRenderer);
if (window.ResizeObserver) new ResizeObserver(sizeRenderer).observe(stageEl);

/* ------------------------------------------------------------------ */
/* Hall lighting — fixed warm "golden hour in a fossil hall" mood      */
/* ------------------------------------------------------------------ */

scene.add(new THREE.AmbientLight(0xffe3c0, 0.32));
const hemi = new THREE.HemisphereLight(0xffe0b8, 0x2a1a10, 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a8, 1.9);
sun.position.set(9, 15, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -18;
sun.shadow.bias = -0.0004;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xbfd4ff, 0.28);
fill.position.set(-10, 8, -6);
scene.add(fill);

/* ------------------------------------------------------------------ */
/* Material & texture helpers (house style, as in the other galleries) */
/* ------------------------------------------------------------------ */

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color, roughness: 0.62, metalness: 0.08, flatShading: true }, opts)
  );
}
function phys(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial(
    Object.assign(
      { color, roughness: 0.5, metalness: 0.05, flatShading: true, envMapIntensity: 0.35 },
      opts
    )
  );
}
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
/* Mottled hide: soft blotches + speckle over mid grey (multiplies colour). */
function hideTexture(rx = 3, ry = 2) {
  return makeCanvasTexture(256, (g, s) => {
    g.fillStyle = '#c9c9c9';
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * s, y = Math.random() * s, r = 16 + Math.random() * 40;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, Math.random() < 0.55 ? 'rgba(60,55,45,0.22)' : 'rgba(255,250,235,0.16)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 1300; i++) {
      const v = 95 + Math.floor(Math.random() * 145);
      g.fillStyle = `rgba(${v},${v},${v},${0.22 + Math.random() * 0.4})`;
      g.fillRect(Math.random() * s, Math.random() * s, 1.6, 1.6);
    }
  }, rx, ry);
}
/* Overlapping scale arcs. */
function scaleTexture(rx = 3, ry = 2) {
  return makeCanvasTexture(256, (g, s) => {
    g.fillStyle = '#a3a3a3';
    g.fillRect(0, 0, s, s);
    const r = 30, rowH = 24;
    for (let row = -1; row * rowH < s + rowH; row++) {
      const off = row % 2 === 0 ? 0 : r;
      for (let cx = -r + off; cx < s + r; cx += r * 2) {
        const v = 178 + Math.floor(Math.random() * 62);
        g.beginPath();
        g.arc(cx, row * rowH, r, 0, Math.PI);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fill();
        g.strokeStyle = 'rgba(35,30,22,0.5)';
        g.lineWidth = 3;
        g.stroke();
      }
    }
  }, rx, ry);
}
/* Feather streaks: soft barbs running one way. */
function featherTexture() {
  return makeCanvasTexture(256, (g, s) => {
    const grad = g.createLinearGradient(0, 0, s, 0);
    grad.addColorStop(0, '#8a8a8a');
    grad.addColorStop(0.5, '#c4c4c4');
    grad.addColorStop(1, '#ededed');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 130; i++) {
      const y = Math.random() * s;
      g.strokeStyle = Math.random() < 0.6 ? 'rgba(45,40,30,0.18)' : 'rgba(255,255,255,0.15)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(s, y + (Math.random() - 0.5) * 20);
      g.stroke();
    }
  }, 2, 2);
}
function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
/* A tail built from shrinking capsules along a gentle arc, hung on a
 * pivot at the body's rear so the animate loop can sway it. */
function buildTail(mat, { len = 2.4, r0 = 0.30, drop = 0.5, segs = 5 } = {}) {
  const pivot = new THREE.Group();
  let pz = 0, py = 0;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const r = r0 * (1 - t * 0.72);
    const segLen = len / segs + r * 1.1;
    const seg = mesh(new THREE.CapsuleGeometry(r, segLen, 4, 10), mat, 0, py, pz - segLen * 0.42);
    seg.rotation.x = Math.PI / 2 + 0.10 + t * (drop * 0.55);
    pivot.add(seg);
    pz -= Math.cos(0.10 + t * drop * 0.5) * (len / segs) * 0.92;
    py -= Math.sin(0.10 + t * drop * 0.5) * (len / segs) * 0.55;
  }
  return pivot;
}
function leg(mat, rTop, rBot, len, x, y, z) {
  return mesh(new THREE.CylinderGeometry(rTop, rBot, len, 10), mat, x, y, z);
}

/* ------------------------------------------------------------------ */
/* The hall: sandstone floor, back wall, columns, ceiling beams        */
/* ------------------------------------------------------------------ */

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 30, 256, 256, 256);
  grad.addColorStop(0, '#6e5a41');
  grad.addColorStop(0.55, '#43331f');
  grad.addColorStop(1, '#1a120a');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(0,0,0,0.18)';
  g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { // big stone slabs
    g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.stroke();
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke();
  }
  for (let i = 0; i < 2200; i++) { // grit
    const v = 60 + Math.floor(Math.random() * 90);
    g.fillStyle = `rgba(${v + 40},${v + 15},${v - 10},0.25)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1.7, 1.7);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(48, 64),
  new THREE.MeshPhysicalMaterial({
    map: floorTexture(), roughness: 0.42, metalness: 0.08,
    clearcoat: 0.35, clearcoatRoughness: 0.5, envMapIntensity: 0.35,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const inlay = new THREE.Mesh(
  new THREE.RingGeometry(15.9, 16.05, 96),
  new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.35, metalness: 0.85 })
);
inlay.rotation.x = -Math.PI / 2;
inlay.position.y = 0.012;
scene.add(inlay);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(76, 20),
  std(0x3a2a1a, { roughness: 0.95, flatShading: false })
);
wall.position.set(0, 10, -11.5);
wall.receiveShadow = true;
scene.add(wall);

const stoneMat = std(0x6b5136, { roughness: 0.85 });
const stoneDark = std(0x54401f, { roughness: 0.9 });
function addColumn(x, z) {
  const grp = new THREE.Group();
  grp.add(mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), stoneDark, 0, 0.25, 0));
  grp.add(mesh(new THREE.CylinderGeometry(0.55, 0.64, 9.2, 14), stoneMat, 0, 5.1, 0));
  grp.add(mesh(new THREE.BoxGeometry(1.6, 0.55, 1.6), stoneDark, 0, 9.95, 0));
  grp.position.set(x, 0, z);
  scene.add(grp);
}
for (let x = -17.6; x <= 17.6; x += 5.85) addColumn(x, -9.4);
addColumn(-17.6, -1); addColumn(17.6, -1);
addColumn(-17.6, 7); addColumn(17.6, 7);

// Ceiling beams — and the wires the pteranodon hangs from.
const beamMat = std(0x2e2013, { roughness: 0.9 });
for (const bz of [-7.6, 0.5]) {
  const beam = mesh(new THREE.BoxGeometry(37, 0.55, 0.8), beamMat, 0, 10.1, bz);
  beam.castShadow = false;
  scene.add(beam);
}

/* Dust motes drifting in the spotlight shafts. */
const moteGeo = new THREE.BufferGeometry();
{
  const N = 170;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * 15;
    pos[i * 3 + 1] = 0.4 + Math.random() * 8.5;
    pos[i * 3 + 2] = (Math.random() * 2 - 1) * 9;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
}
const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
  color: 0xffd9a0, size: 0.055, transparent: true, opacity: 0.38,
  depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
}));
scene.add(motes);

/* ------------------------------------------------------------------ */
/* Dinosaur builders — each returns { model, animate(t, dt) }.         */
/* Model origin sits on the plinth top; every animal faces +Z.         */
/* ------------------------------------------------------------------ */

function buildTrex() {
  const g = new THREE.Group();
  const hide = hideTexture();
  const skin = phys(0x7a6a42, { map: hide, bumpMap: hide, bumpScale: 0.12, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.6 });
  const belly = phys(0xa08b5e, { map: hide, roughness: 0.6, clearcoat: 0.15 });
  const bone = std(0xe6dcc4, { roughness: 0.35 });
  const dark = std(0x2e2416, { roughness: 0.5 });

  const bodyG = new THREE.Group();
  g.add(bodyG);
  const body = mesh(new THREE.CapsuleGeometry(0.62, 1.05, 8, 16), skin, 0, 1.58, -0.30);
  body.rotation.x = Math.PI / 2 - 0.10;
  bodyG.add(body);
  const chest = mesh(new THREE.SphereGeometry(0.5, 16, 12), belly, 0, 1.42, 0.28);
  chest.scale.set(0.85, 0.95, 0.9);
  bodyG.add(chest);

  // Neck and the great head.
  const neck = mesh(new THREE.CapsuleGeometry(0.34, 0.4, 6, 12), skin, 0, 1.86, 0.72);
  neck.rotation.x = -0.7;
  bodyG.add(neck);
  const headG = new THREE.Group();
  headG.position.set(0, 2.14, 1.18);
  const skull = mesh(new THREE.SphereGeometry(0.46, 18, 14), skin, 0, 0.05, 0.05);
  skull.scale.set(0.82, 0.78, 1.2);
  headG.add(skull);
  headG.add(mesh(new THREE.BoxGeometry(0.5, 0.32, 0.78), skin, 0, -0.04, 0.62));
  const jaw = mesh(new THREE.BoxGeometry(0.42, 0.10, 0.72), belly, 0, -0.30, 0.55);
  jaw.rotation.x = 0.14;
  headG.add(jaw);
  for (const sx of [-1, 1]) { // brow ridges + eyes
    headG.add(mesh(new THREE.BoxGeometry(0.2, 0.09, 0.3), skin, sx * 0.18, 0.28, 0.28));
    const eye = mesh(new THREE.SphereGeometry(0.05, 10, 8), std(0x1c1206, { roughness: 0.2, emissive: 0xff9a1e, emissiveIntensity: 0.35 }), sx * 0.2, 0.16, 0.38);
    headG.add(eye);
  }
  for (let i = 0; i < 7; i++) { // upper teeth, pointing down
    const z = 0.42 + i * 0.11;
    for (const sx of [-1, 1]) {
      const tooth = mesh(new THREE.ConeGeometry(0.032, 0.13, 6), bone, sx * 0.19, -0.24, z);
      tooth.rotation.x = Math.PI;
      headG.add(tooth);
    }
  }
  bodyG.add(headG);

  // The famous two-fingered arms.
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.34, 8), skin, sx * 0.44, 1.28, 0.52);
    arm.rotation.x = 0.7; arm.rotation.z = sx * 0.3;
    bodyG.add(arm);
    for (const f of [-0.04, 0.05]) {
      const claw = mesh(new THREE.ConeGeometry(0.022, 0.09, 6), dark, sx * 0.5 + f, 1.12, 0.66);
      claw.rotation.x = 1.9;
      bodyG.add(claw);
    }
  }

  // Legs: heavy thighs, long shins, three-toed feet.
  for (const sx of [-1, 1]) {
    const thigh = mesh(new THREE.CylinderGeometry(0.26, 0.16, 0.95, 12), skin, sx * 0.38, 1.05, -0.28);
    thigh.rotation.x = 0.15;
    bodyG.add(thigh);
    bodyG.add(leg(skin, 0.13, 0.09, 0.8, sx * 0.38, 0.48, -0.18));
    bodyG.add(mesh(new THREE.BoxGeometry(0.3, 0.1, 0.52), skin, sx * 0.38, 0.05, -0.02));
    for (const tx of [-0.1, 0, 0.1]) {
      const toe = mesh(new THREE.ConeGeometry(0.045, 0.16, 6), bone, sx * 0.38 + tx, 0.05, 0.28);
      toe.rotation.x = Math.PI / 2;
      bodyG.add(toe);
    }
  }

  const tail = buildTail(skin, { len: 2.7, r0: 0.34, drop: 0.35 });
  tail.position.set(0, 1.62, -0.95);
  bodyG.add(tail);

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 0.7) * 0.08;
      headG.rotation.y = Math.sin(t * 0.45) * 0.10;
      bodyG.scale.y = 1 + 0.012 * Math.sin(t * 1.6);
    },
  };
}

function buildTriceratops() {
  const g = new THREE.Group();
  const hide = hideTexture();
  const skin = phys(0x6d7a52, { map: hide, bumpMap: hide, bumpScale: 0.12, roughness: 0.58, clearcoat: 0.2, clearcoatRoughness: 0.6 });
  const frillMat = phys(0x86936b, { map: hide, roughness: 0.55, clearcoat: 0.25 });
  const bone = std(0xe9dfc8, { roughness: 0.32 });
  const dark = std(0x33301f, { roughness: 0.5 });

  const body = mesh(new THREE.CapsuleGeometry(0.66, 1.0, 8, 16), skin, 0, 1.28, -0.1);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(leg(skin, 0.17, 0.14, 0.95, sx * 0.42, 0.5, sz * 0.55));
    g.add(mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.1, 10), dark, sx * 0.42, 0.05, sz * 0.55));
  }

  const headG = new THREE.Group();
  headG.position.set(0, 1.42, 1.05);
  // The frill: a flattened dome of bone swept back from the skull.
  const frill = mesh(new THREE.SphereGeometry(0.8, 22, 16), frillMat, 0, 0.22, -0.34);
  frill.scale.set(1.02, 1.18, 0.20);
  frill.rotation.x = 0.30;
  headG.add(frill);
  for (let i = 0; i < 11; i++) { // scalloped rim bumps
    const a = (i / 10) * Math.PI * 1.7 - Math.PI * 0.85;
    const bump = mesh(new THREE.SphereGeometry(0.07, 8, 6), frillMat,
      Math.sin(a) * 0.80, 0.22 + Math.cos(a) * 0.92, -0.40);
    headG.add(bump);
  }
  const skull = mesh(new THREE.SphereGeometry(0.42, 18, 14), skin, 0, 0, 0.1);
  skull.scale.set(0.85, 0.85, 1.05);
  headG.add(skull);
  const beak = mesh(new THREE.ConeGeometry(0.2, 0.42, 4), dark, 0, -0.16, 0.62);
  beak.rotation.x = Math.PI / 2 + 0.5;
  beak.scale.set(1, 1, 0.6);
  headG.add(beak);
  for (const sx of [-1, 1]) { // the two great brow horns
    const horn = mesh(new THREE.ConeGeometry(0.07, 0.88, 10), bone, sx * 0.2, 0.42, 0.28);
    horn.rotation.x = -0.45;
    horn.rotation.z = sx * -0.08;
    headG.add(horn);
    headG.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), std(0x141008, { roughness: 0.2 }), sx * 0.24, 0.12, 0.42));
  }
  const noseHorn = mesh(new THREE.ConeGeometry(0.06, 0.4, 8), bone, 0, 0.12, 0.62);
  noseHorn.rotation.x = -0.25;
  headG.add(noseHorn);
  g.add(headG);

  const tail = buildTail(skin, { len: 1.7, r0: 0.3, drop: 0.7 });
  tail.position.set(0, 1.3, -1.0);
  g.add(tail);

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 0.6 + 1) * 0.06;
      headG.rotation.y = Math.sin(t * 0.4) * 0.07;
      headG.rotation.x = Math.sin(t * 0.8) * 0.03;
    },
  };
}

function buildStegosaurus() {
  const g = new THREE.Group();
  const hide = scaleTexture();
  const skin = phys(0x7d7a4e, { map: hide, bumpMap: hide, bumpScale: 0.15, roughness: 0.6, clearcoat: 0.18, clearcoatRoughness: 0.6 });
  const plateMat = phys(0xa8623c, { roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const bone = std(0xe6dcc4, { roughness: 0.35 });

  const body = mesh(new THREE.CapsuleGeometry(0.6, 1.05, 8, 16), skin, 0, 1.38, 0);
  body.rotation.x = Math.PI / 2;
  body.scale.set(1, 1.05, 1);
  g.add(body);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(leg(skin, 0.15, 0.12, 1.0, sx * 0.4, 0.52, sz * 0.55));
  }

  // Small low head on a short neck, built for grazing.
  const headG = new THREE.Group();
  headG.position.set(0, 1.12, 1.28);
  const neck = mesh(new THREE.CapsuleGeometry(0.2, 0.3, 6, 10), skin, 0, 0.12, -0.2);
  neck.rotation.x = 0.8;
  headG.add(neck);
  const skull = mesh(new THREE.SphereGeometry(0.24, 14, 10), skin, 0, 0, 0.15);
  skull.scale.set(0.75, 0.7, 1.25);
  headG.add(skull);
  headG.add(mesh(new THREE.SphereGeometry(0.035, 8, 6), std(0x141008, { roughness: 0.2 }), 0.14, 0.06, 0.3));
  headG.add(mesh(new THREE.SphereGeometry(0.035, 8, 6), std(0x141008, { roughness: 0.2 }), -0.14, 0.06, 0.3));
  g.add(headG);

  // Two staggered rows of kite-shaped plates along the arched back.
  const plateGeo = new THREE.CylinderGeometry(0.03, 0.42, 0.85, 4);
  const plateAt = [[0.72, 0.52], [0.38, 0.78], [0.05, 0.95], [-0.3, 1.0], [-0.62, 0.9], [-0.9, 0.68]];
  plateAt.forEach(([pz, ps], i) => {
    for (const side of (i % 2 === 0 ? [1] : [-1])) {
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.castShadow = true; plate.receiveShadow = true;
      plate.scale.set(ps, ps, 0.22);
      plate.position.set(side * 0.13, 2.02 + Math.sin((i / (plateAt.length - 1)) * Math.PI) * 0.14, pz);
      plate.rotation.y = Math.PI / 4;
      plate.rotation.z = side * -0.10;
      g.add(plate);
    }
  });

  const tail = buildTail(skin, { len: 2.1, r0: 0.28, drop: 0.3 });
  tail.position.set(0, 1.42, -0.95);
  g.add(tail);
  // The thagomizer: two pairs of spikes riding on the tail itself,
  // so they sway with it.
  const spikePairs = [[0.14, -0.72], [0.05, -1.28]];
  spikePairs.forEach(([sy, sz]) => {
    for (const sx of [-1, 1]) {
      const spike = mesh(new THREE.ConeGeometry(0.06, 0.55, 8), bone, sx * 0.15, sy, sz);
      spike.rotation.z = sx * -0.75;
      spike.rotation.x = -0.25;
      tail.add(spike);
    }
  });

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 0.55) * 0.07;
      headG.rotation.x = 0.12 + Math.sin(t * 0.5) * 0.08; // slow grazing bob
    },
  };
}

function buildBrachiosaurus() {
  const g = new THREE.Group();
  const hide = hideTexture();
  const skin = phys(0x77805e, { map: hide, bumpMap: hide, bumpScale: 0.12, roughness: 0.6, clearcoat: 0.15, clearcoatRoughness: 0.65 });
  const dark = std(0x3a3826, { roughness: 0.6 });
  // Legs: fronts longer than hinds — the sloping shoulders are the point.
  for (const sx of [-1, 1]) {
    g.add(leg(skin, 0.19, 0.16, 1.9, sx * 0.48, 0.95, 0.62));
    g.add(leg(skin, 0.18, 0.15, 1.5, sx * 0.48, 0.75, -0.62));
    g.add(mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.12, 10), dark, sx * 0.48, 0.06, 0.62));
    g.add(mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.12, 10), dark, sx * 0.48, 0.06, -0.62));
  }
  const body = mesh(new THREE.CapsuleGeometry(0.7, 1.15, 8, 16), skin, 0, 2.62, 0);
  body.rotation.x = Math.PI / 2 + 0.16; // front end rides higher
  g.add(body);

  // The neck: a long capsule raked up at a giraffe angle, on a pivot.
  const neckG = new THREE.Group();
  neckG.position.set(0, 2.95, 0.82);
  const neck = mesh(new THREE.CapsuleGeometry(0.27, 1.85, 8, 12), skin, 0, 1.05, 0);
  neckG.add(neck);
  neckG.rotation.x = 0.62;
  const headG = new THREE.Group();
  headG.position.set(0, 2.15, 0);
  const skull = mesh(new THREE.SphereGeometry(0.26, 14, 10), skin, 0, 0, 0.05);
  skull.scale.set(0.72, 0.75, 1.2);
  headG.add(skull);
  headG.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), skin, 0, 0.16, 0.02)); // nostril crest
  headG.add(mesh(new THREE.BoxGeometry(0.2, 0.16, 0.34), skin, 0, -0.08, 0.28));
  neckG.add(headG);
  g.add(neckG);

  const tail = buildTail(skin, { len: 2.5, r0: 0.3, drop: 0.85 });
  tail.position.set(0, 2.5, -1.0);
  g.add(tail);

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 0.5 + 2) * 0.06;
      neckG.rotation.z = Math.sin(t * 0.35) * 0.035;
      neckG.rotation.x = 0.62 + Math.sin(t * 0.5) * 0.02;
    },
  };
}

function buildVelociraptor() {
  const g = new THREE.Group();
  const feather = featherTexture();
  const skin = phys(0x9a7d4f, { map: feather, bumpMap: feather, bumpScale: 0.06, roughness: 0.7, clearcoat: 0.1 });
  const darkSkin = phys(0x6e5638, { map: feather, roughness: 0.7 });
  const bone = std(0xe6dcc4, { roughness: 0.35 });
  const dark = std(0x201408, { roughness: 0.3 });

  const body = mesh(new THREE.CapsuleGeometry(0.26, 0.55, 8, 14), skin, 0, 0.62, -0.05);
  body.rotation.x = Math.PI / 2 - 0.08;
  g.add(body);

  // Head on a curved neck: long snout, sharp little teeth.
  const headG = new THREE.Group();
  headG.position.set(0, 0.86, 0.52);
  const neck = mesh(new THREE.CapsuleGeometry(0.11, 0.22, 6, 10), skin, 0, -0.08, -0.08);
  neck.rotation.x = 0.7;
  headG.add(neck);
  const skull = mesh(new THREE.SphereGeometry(0.16, 14, 10), skin, 0, 0.05, 0.08);
  skull.scale.set(0.72, 0.78, 1.3);
  headG.add(skull);
  headG.add(mesh(new THREE.BoxGeometry(0.15, 0.11, 0.34), skin, 0, 0.0, 0.36));
  headG.add(mesh(new THREE.BoxGeometry(0.13, 0.05, 0.3), darkSkin, 0, -0.09, 0.34));
  for (const sx of [-1, 1]) {
    headG.add(mesh(new THREE.SphereGeometry(0.032, 8, 6), dark, sx * 0.09, 0.09, 0.2));
    const crest = mesh(new THREE.ConeGeometry(0.03, 0.16, 6), darkSkin, sx * 0.05, 0.2, -0.08);
    crest.rotation.x = -0.7;
    headG.add(crest);
  }
  g.add(headG);

  // Arms with grasping claws; feather fans on the forearms.
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.3, 8), skin, sx * 0.2, 0.5, 0.3);
    arm.rotation.x = 0.9; arm.rotation.z = sx * 0.35;
    g.add(arm);
    for (const f of [-0.03, 0.03]) {
      const claw = mesh(new THREE.ConeGeometry(0.014, 0.06, 6), bone, sx * 0.24 + f, 0.38, 0.42);
      claw.rotation.x = 2.2;
      g.add(claw);
    }
    const fan = mesh(new THREE.ConeGeometry(0.09, 0.3, 4), darkSkin, sx * 0.22, 0.48, 0.22);
    fan.scale.set(1, 1, 0.25);
    fan.rotation.x = 1.2;
    g.add(fan);
  }

  // Legs — and the famous sickle claw, held up off the ground.
  for (const sx of [-1, 1]) {
    const thigh = mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.34, 8), skin, sx * 0.14, 0.48, -0.12);
    thigh.rotation.x = 0.5;
    g.add(thigh);
    g.add(leg(skin, 0.05, 0.035, 0.34, sx * 0.14, 0.22, -0.02));
    g.add(mesh(new THREE.BoxGeometry(0.09, 0.04, 0.22), skin, sx * 0.14, 0.02, 0.06));
    const sickle = mesh(new THREE.ConeGeometry(0.028, 0.17, 8), bone, sx * 0.14, 0.14, 0.1);
    sickle.rotation.x = -2.2; // curved up and back, switchblade-style
    g.add(sickle);
    for (const tx of [-0.035, 0.035]) {
      const toe = mesh(new THREE.ConeGeometry(0.016, 0.07, 6), bone, sx * 0.14 + tx, 0.02, 0.18);
      toe.rotation.x = Math.PI / 2;
      g.add(toe);
    }
  }

  // Long stiff tail with a feathered fan at the tip.
  const tail = buildTail(skin, { len: 1.7, r0: 0.11, drop: 0.12, segs: 6 });
  tail.position.set(0, 0.66, -0.5);
  g.add(tail);
  const fan = mesh(new THREE.ConeGeometry(0.14, 0.42, 4), darkSkin, 0, 0.6, -2.15);
  fan.scale.set(1.4, 1, 0.2);
  fan.rotation.x = Math.PI / 2 + 0.15;
  g.add(fan);

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 1.4) * 0.10; // quick, alert
      headG.rotation.y = Math.sin(t * 1.1) * 0.22;
      headG.rotation.x = Math.sin(t * 2.2) * 0.05;
    },
  };
}

function buildPteranodon() {
  const g = new THREE.Group(); // origin at the body; hung in the air by main.js
  const hide = hideTexture();
  const skin = phys(0x8a6f52, { map: hide, roughness: 0.6, clearcoat: 0.2, clearcoatRoughness: 0.55 });
  const membrane = phys(0xb08a5e, { map: hide, roughness: 0.55, side: THREE.DoubleSide, clearcoat: 0.3, clearcoatRoughness: 0.45 });
  const bone = std(0xd9cbaa, { roughness: 0.4 });

  const body = mesh(new THREE.CapsuleGeometry(0.3, 0.5, 8, 14), skin, 0, 0, 0);
  body.rotation.x = Math.PI / 2;
  g.add(body);

  // Head: long toothless beak forward, great crest sweeping back.
  const headG = new THREE.Group();
  headG.position.set(0, 0.14, 0.52);
  headG.add(mesh(new THREE.SphereGeometry(0.17, 14, 10), skin, 0, 0, 0));
  const beak = mesh(new THREE.ConeGeometry(0.09, 1.15, 10), bone, 0, -0.03, 0.62);
  beak.rotation.x = Math.PI / 2;
  beak.scale.set(0.75, 1, 0.55);
  headG.add(beak);
  const crest = mesh(new THREE.ConeGeometry(0.11, 0.95, 8), bone, 0, 0.22, -0.42);
  crest.rotation.x = -Math.PI / 2 + 0.45;
  crest.scale.set(0.4, 1, 1);
  headG.add(crest);
  for (const sx of [-1, 1]) {
    headG.add(mesh(new THREE.SphereGeometry(0.035, 8, 6), std(0x141008, { roughness: 0.2 }), sx * 0.11, 0.05, 0.1));
  }
  g.add(headG);

  // Wings: one scalloped membrane planform, mirrored. Six metres of it.
  const ws = new THREE.Shape();
  ws.moveTo(0, 0.28);
  ws.lineTo(1.5, 0.34); ws.lineTo(2.95, 0.10);           // leading edge to the tip
  ws.quadraticCurveTo(2.2, -0.28, 1.55, -0.30);          // trailing edge, scalloped
  ws.quadraticCurveTo(1.05, -0.52, 0.55, -0.34);
  ws.quadraticCurveTo(0.2, -0.42, 0, -0.30);
  ws.lineTo(0, 0.28);
  const wingGeo = new THREE.ExtrudeGeometry(ws, { depth: 0.03, bevelEnabled: false });
  for (const sx of [-1, 1]) {
    const wing = new THREE.Mesh(wingGeo, membrane);
    wing.castShadow = true;
    wing.scale.set(sx, 1, 1);
    wing.rotation.x = Math.PI / 2;       // lay the planform flat, leading edge forward
    wing.rotation.y = sx * 0.10;         // slight sweep
    wing.position.set(sx * 0.12, 0.08, 0.18);
    const holder = new THREE.Group();
    holder.add(wing);
    holder.rotation.z = sx * 0.10;       // gentle dihedral
    g.add(holder);
  }

  // Little dangling legs, and the stub of a tail.
  for (const sx of [-1, 1]) {
    const legM = mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.42, 8), skin, sx * 0.14, -0.36, -0.1);
    legM.rotation.x = 0.35;
    g.add(legM);
  }
  const stub = mesh(new THREE.ConeGeometry(0.07, 0.3, 8), skin, 0, -0.02, -0.55);
  stub.rotation.x = -Math.PI / 2;
  g.add(stub);

  // Suspension wires up to the ceiling beam (they bank with the model).
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x11100e });
  for (const sx of [-1, 1]) {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 3.9, 4), wireMat);
    wire.position.set(sx * 1.35, 1.95, 0);
    g.add(wire);
  }
  const bodyWire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 3.9, 4), wireMat);
  bodyWire.position.set(0, 1.95, -0.1);
  g.add(bodyWire);

  return {
    model: g,
    animate: (t, baseY) => {
      g.rotation.z = Math.sin(t * 0.5) * 0.13;        // slow banking
      g.rotation.y = Math.sin(t * 0.32) * 0.10;       // weathervaning
      g.position.y = baseY + Math.sin(t * 0.8) * 0.14; // riding a thermal
    },
  };
}

function buildAnkylosaurus() {
  const g = new THREE.Group();
  const scales = scaleTexture(4, 3);
  const skin = phys(0x6f6250, { map: scales, bumpMap: scales, bumpScale: 0.18, roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.6 });
  const scuteMat = phys(0x8a7a5c, { roughness: 0.55, clearcoat: 0.2 });
  const bone = std(0xd9cbaa, { roughness: 0.4 });

  // The dome: a wide, low shell of fused bone and skin.
  const dome = mesh(new THREE.SphereGeometry(0.88, 22, 16), skin, 0, 0.82, 0);
  dome.scale.set(1.06, 0.62, 1.38);
  g.add(dome);
  g.add(mesh(new THREE.CylinderGeometry(0.94, 1.02, 0.3, 18), skin, 0, 0.42, 0)); // armoured skirt

  // Scutes: bumps laid over the dome on its ellipsoid surface.
  const scuteGeo = new THREE.ConeGeometry(0.085, 0.13, 6);
  for (let row = -3; row <= 3; row++) {
    const z = row * 0.34;
    for (let col = -3; col <= 3; col++) {
      const x = col * 0.27 + (row % 2 ? 0.12 : 0);
      const q = (x / 0.94) ** 2 + (z / 1.22) ** 2;
      if (q > 0.92) continue;
      const y = 0.82 + 0.545 * Math.sqrt(1 - q);
      const scute = new THREE.Mesh(scuteGeo, scuteMat);
      scute.castShadow = true;
      scute.position.set(x, y, z);
      scute.rotation.x = z * 0.3;
      scute.rotation.z = -x * 0.3;
      g.add(scute);
    }
  }
  // A palisade of spikes around the flanks.
  for (let i = 0; i < 6; i++) {
    const z = 0.95 - i * 0.38;
    for (const sx of [-1, 1]) {
      const spike = mesh(new THREE.ConeGeometry(0.07, 0.3, 6), bone, sx * 0.98, 0.62, z);
      spike.rotation.z = sx * -1.25;
      g.add(spike);
    }
  }

  // Short legs, mostly lost under the armour.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    g.add(leg(skin, 0.13, 0.11, 0.42, sx * 0.55, 0.21, sz * 0.7));
  }

  // Wide flat head with little cheek horns.
  const headG = new THREE.Group();
  headG.position.set(0, 0.52, 1.32);
  const skull = mesh(new THREE.SphereGeometry(0.3, 16, 12), skin, 0, 0, 0);
  skull.scale.set(1.15, 0.62, 0.95);
  headG.add(skull);
  for (const sx of [-1, 1]) {
    const horn = mesh(new THREE.ConeGeometry(0.05, 0.2, 6), bone, sx * 0.3, 0.08, -0.14);
    horn.rotation.z = sx * -1.1;
    headG.add(horn);
    headG.add(mesh(new THREE.SphereGeometry(0.032, 8, 6), std(0x141008, { roughness: 0.2 }), sx * 0.17, 0.05, 0.22));
  }
  g.add(headG);

  // Tail ending in the great club.
  const tail = buildTail(skin, { len: 1.9, r0: 0.2, drop: 0.25 });
  tail.position.set(0, 0.78, -1.15);
  g.add(tail);
  const club = mesh(new THREE.SphereGeometry(0.3, 14, 10), scuteMat, 0, 0.62, -3.0);
  club.scale.set(1.05, 0.8, 1.25);
  g.add(club);

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 0.45) * 0.05; // heavy, slow
      club.position.x = Math.sin(t * 0.45) * -0.10;
      dome.scale.y = 0.62 + 0.006 * Math.sin(t * 1.3);
    },
  };
}

function buildSpinosaurus() {
  const g = new THREE.Group();
  const hide = hideTexture();
  const skin = phys(0x77644a, { map: hide, bumpMap: hide, bumpScale: 0.12, roughness: 0.58, clearcoat: 0.22, clearcoatRoughness: 0.6 });
  const sailMat = phys(0x9c5a38, { roughness: 0.5, side: THREE.DoubleSide, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const bone = std(0xe6dcc4, { roughness: 0.35 });
  const dark = std(0x2e2416, { roughness: 0.5 });

  const body = mesh(new THREE.CapsuleGeometry(0.56, 1.15, 8, 16), skin, 0, 1.52, -0.25);
  body.rotation.x = Math.PI / 2 - 0.06;
  g.add(body);

  // The sail: membrane stretched over a fan of tall neural spines.
  const sailShape = new THREE.Shape();
  sailShape.moveTo(-1.05, 0);
  sailShape.quadraticCurveTo(-0.7, 0.95, -0.25, 1.12);
  sailShape.quadraticCurveTo(0.25, 1.18, 0.55, 0.9);
  sailShape.quadraticCurveTo(0.8, 0.6, 0.95, 0);
  sailShape.lineTo(-1.05, 0);
  const sail = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sailShape, { depth: 0.05, bevelEnabled: false }),
    sailMat
  );
  sail.castShadow = true;
  sail.rotation.y = Math.PI / 2; // shape X becomes body Z
  sail.position.set(-0.025, 1.92, -0.45);
  g.add(sail);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const sz = 0.5 - t * 1.5;
    const sh = 1.95 + Math.sin(t * Math.PI) * 1.05;
    const spine = mesh(new THREE.CylinderGeometry(0.028, 0.038, sh - 1.85, 6), skin, 0, (sh + 1.85) / 2, sz);
    g.add(spine);
  }

  // Crocodile-snouted head, with the mid-snout crest.
  const headG = new THREE.Group();
  headG.position.set(0, 1.78, 0.85);
  const neck = mesh(new THREE.CapsuleGeometry(0.28, 0.35, 6, 12), skin, 0, -0.05, -0.25);
  neck.rotation.x = -0.8;
  headG.add(neck);
  const skull = mesh(new THREE.SphereGeometry(0.34, 16, 12), skin, 0, 0.08, 0.1);
  skull.scale.set(0.8, 0.75, 1.1);
  headG.add(skull);
  headG.add(mesh(new THREE.BoxGeometry(0.3, 0.2, 0.95), skin, 0, -0.02, 0.75)); // the long snout
  headG.add(mesh(new THREE.BoxGeometry(0.26, 0.07, 0.85), skin, 0, -0.16, 0.72)); // jaw
  const crest = mesh(new THREE.SphereGeometry(0.11, 10, 8), sailMat, 0, 0.12, 0.62);
  crest.scale.set(0.5, 0.9, 1.4);
  headG.add(crest);
  for (let i = 0; i < 6; i++) { // conical fish-gripping teeth
    for (const sx of [-1, 1]) {
      const tooth = mesh(new THREE.ConeGeometry(0.024, 0.1, 6), bone, sx * 0.11, -0.13, 0.45 + i * 0.14);
      tooth.rotation.x = Math.PI;
      headG.add(tooth);
    }
  }
  for (const sx of [-1, 1]) {
    headG.add(mesh(new THREE.SphereGeometry(0.042, 8, 6), dark, sx * 0.17, 0.16, 0.3));
  }
  g.add(headG);

  // Strong arms — the thumb claw was the biggest hand claw of any theropod.
  for (const sx of [-1, 1]) {
    const arm = mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.55, 8), skin, sx * 0.42, 1.22, 0.45);
    arm.rotation.x = 0.6; arm.rotation.z = sx * 0.25;
    g.add(arm);
    const claw = mesh(new THREE.ConeGeometry(0.05, 0.26, 8), bone, sx * 0.48, 0.98, 0.62);
    claw.rotation.x = 2.0;
    g.add(claw);
  }

  for (const sx of [-1, 1]) {
    const thigh = mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.9, 12), skin, sx * 0.34, 1.0, -0.35);
    thigh.rotation.x = 0.12;
    g.add(thigh);
    g.add(leg(skin, 0.11, 0.08, 0.75, sx * 0.34, 0.45, -0.26));
    g.add(mesh(new THREE.BoxGeometry(0.26, 0.09, 0.48), skin, sx * 0.34, 0.045, -0.1));
  }

  const tail = buildTail(skin, { len: 2.8, r0: 0.3, drop: 0.3 });
  tail.position.set(0, 1.55, -1.05);
  g.add(tail);

  return {
    model: g,
    animate: (t) => {
      tail.rotation.y = Math.sin(t * 0.65 + 0.6) * 0.08;
      headG.rotation.y = Math.sin(t * 0.5) * 0.08;
    },
  };
}

const BUILDERS = {
  trex: buildTrex,
  triceratops: buildTriceratops,
  stegosaurus: buildStegosaurus,
  brachiosaurus: buildBrachiosaurus,
  velociraptor: buildVelociraptor,
  pteranodon: buildPteranodon,
  ankylosaurus: buildAnkylosaurus,
  spinosaurus: buildSpinosaurus,
};

/* Hall positions and per-dino camera framings. The hall is centred a
 * little left of the screen so the explorer column never covers a
 * resident; fly-tos keep the same offset. */
const PLACEMENT = {
  trex:          { x: -10.4, z: 3.6,  ry: 0.28,  view: { dist: 8.6, ty: 2.0, lift: 1.6 } },
  triceratops:   { x: -3.5,  z: 3.9,  ry: -0.15, view: { dist: 8.0, ty: 1.7, lift: 1.4 } },
  stegosaurus:   { x: 3.5,   z: 3.9,  ry: 0.15,  view: { dist: 8.2, ty: 1.9, lift: 1.5 } },
  spinosaurus:   { x: 10.4,  z: 3.6,  ry: -0.28, view: { dist: 8.8, ty: 2.1, lift: 1.6 } },
  velociraptor:  { x: -7.6,  z: -3.8, ry: 0.35,  view: { dist: 5.2, ty: 0.9, lift: 1.0 } },
  brachiosaurus: { x: 0,     z: -4.0, ry: 0,     view: { dist: 12.5, ty: 3.6, lift: 2.2 } },
  ankylosaurus:  { x: 7.6,   z: -3.8, ry: -0.3,  view: { dist: 7.6, ty: 1.1, lift: 1.3 } },
  pteranodon:    { x: 0,     z: -7.8, ry: 0, flyY: 6.1, view: { dist: 9.5, ty: 6.0, lift: 0.8 } },
};

/* ------------------------------------------------------------------ */
/* Exhibits: plinth + ring + plaque + spotlight + the animal           */
/* ------------------------------------------------------------------ */

const exhibits = [];
const plinthMat = std(0x5c4630, { roughness: 0.7, metalness: 0.05 });
const plinthTop = std(0x6e5638, { roughness: 0.55, metalness: 0.08 });
const trimMat = std(0xd9a441, { roughness: 0.3, metalness: 0.85 });
const ringGeo = new THREE.RingGeometry(2.42, 2.72, 48);

DINOS.forEach((data, i) => {
  const P = PLACEMENT[data.id];
  const root = new THREE.Group();
  root.position.set(P.x, 0, P.z);
  root.rotation.y = P.ry || 0;
  root.userData.exhibitIndex = i;
  scene.add(root);

  const flying = data.id === 'pteranodon';

  // Stepped stone plinth (a low display disc for the flying exhibit).
  if (!flying) {
    root.add(mesh(new THREE.CylinderGeometry(2.15, 2.42, 0.28, 28), plinthMat, 0, 0.14, 0));
    root.add(mesh(new THREE.CylinderGeometry(1.85, 2.02, 0.82, 28), plinthMat, 0, 0.69, 0));
    const trim = mesh(new THREE.TorusGeometry(1.9, 0.035, 8, 48), trimMat, 0, 1.08, 0);
    trim.rotation.x = Math.PI / 2;
    root.add(trim);
    root.add(mesh(new THREE.CylinderGeometry(2.02, 2.02, 0.14, 32), plinthTop, 0, 1.14, 0));
  } else {
    root.add(mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.2, 28), plinthMat, 0, 0.1, 0));
    const trim = mesh(new THREE.TorusGeometry(1.62, 0.03, 8, 48), trimMat, 0, 0.2, 0);
    trim.rotation.x = Math.PI / 2;
    root.add(trim);
  }

  // Hover/selection ring on the floor.
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe09a4a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  root.add(ring);

  // Brass plaque, tilted up to be read.
  const plaque = mesh(new THREE.BoxGeometry(0.95, 0.52, 0.06), trimMat, 0, flying ? 0.16 : 0.72, flying ? 1.72 : 2.02);
  plaque.rotation.x = -0.42;
  root.add(plaque);

  // The animal itself.
  const built = BUILDERS[data.id]();
  const model = built.model;
  model.userData.exhibitIndex = i;
  if (flying) {
    model.position.y = P.flyY;
  } else {
    model.position.y = 1.21; // plinth top surface
  }
  root.add(model);

  // Warm spotlight from the beam line, aimed at the animal.
  const spotTargetY = flying ? P.flyY : 2.6;
  const spot = new THREE.SpotLight(0xffd9a0, 260, 36, 0.5, 0.7, 1.5);
  spot.position.set(P.x, 10.0, P.z + 2.2);
  spot.target.position.set(P.x, spotTargetY, P.z);
  scene.add(spot);
  scene.add(spot.target);

  exhibits.push({
    data, root, model, ringMat, spot,
    animate: built.animate,
    baseY: model.position.y,
    view: P.view, x: P.x, z: P.z,
  });
});

/* Keep environment reflections at the gallery's low house level. */
scene.traverse((o) => {
  if (o.isMesh && o.material && 'envMapIntensity' in o.material) {
    o.material.envMapIntensity = 0.35;
  }
});

/* ------------------------------------------------------------------ */
/* Explorer list, search and filters                                   */
/* ------------------------------------------------------------------ */

const DIET_COLORS = { Carnivore: '#e0654a', Herbivore: '#8fb573' };
const GROUP_ORDER = ['Theropod', 'Sauropod', 'Ceratopsian', 'Stegosaur', 'Ankylosaur', 'Pterosaur'];
const filters = { era: 'all', diet: 'all', q: '' };

function renderList() {
  listEl.innerHTML = '';
  let shown = 0;
  GROUP_ORDER.forEach((groupName) => {
    const members = DINOS.filter((d, idx) =>
      d.group === groupName &&
      (filters.era === 'all' || d.era === filters.era) &&
      (filters.diet === 'all' || d.diet === filters.diet) &&
      d.name.toLowerCase().includes(filters.q)
    );
    if (!members.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'dino-group';
    const h = document.createElement('h3');
    h.textContent = groupName + 's';
    wrap.appendChild(h);
    members.forEach((d) => {
      const idx = DINOS.indexOf(d);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dino-item' + (idx === selectedIndex ? ' selected' : '');
      b.innerHTML = '';
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = DIET_COLORS[d.diet] || '#ccc';
      const label = document.createElement('span');
      label.textContent = d.name;
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = d.period.replace('Late ', 'L. ');
      b.append(dot, label, meta);
      b.addEventListener('click', () => selectExhibit(idx));
      wrap.appendChild(b);
      shown++;
    });
    listEl.appendChild(wrap);
  });
  if (!shown) {
    const p = document.createElement('p');
    p.className = 'empty-note';
    p.textContent = 'No dinosaurs match — try clearing a filter.';
    listEl.appendChild(p);
  }
}

function bindChips(containerId, key) {
  const el = document.getElementById(containerId);
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    el.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === btn));
    filters[key] = btn.dataset.era || btn.dataset.diet;
    renderList();
  });
}
bindChips('era-chips', 'era');
bindChips('diet-chips', 'diet');
searchEl.addEventListener('input', () => {
  filters.q = searchEl.value.trim().toLowerCase();
  renderList();
});

/* ------------------------------------------------------------------ */
/* Selection, info panel and camera flights                            */
/* ------------------------------------------------------------------ */

let selectedIndex = -1;

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

function showInfo(data) {
  eyebrowEl.textContent = `${data.period} · ${data.age} · ${data.group}`;
  nameEl.textContent = data.name;
  hookEl.textContent = data.hook;
  descEl.textContent = data.description;
  statLength.textContent = data.length;
  statDiet.textContent = data.diet;
  statPeriod.textContent = data.period;
  statsEl.hidden = false;
  factEl.textContent = data.fact;
  factWrap.hidden = false;
  panelEl.classList.remove('closed');
}

function showWelcome() {
  eyebrowEl.textContent = 'Welcome to the hall';
  nameEl.textContent = 'Eight giants, one roof';
  hookEl.textContent = 'Real animals this time — and every one of them stranger than fiction.';
  descEl.textContent = 'Drag to walk the hall with your eyes, scroll to zoom, and click any dinosaur — or pick one from the explorer — to step up to its plinth. One resident hangs from the ceiling; look up at the back of the hall.';
  statsEl.hidden = true;
  factWrap.hidden = true;
  panelEl.classList.remove('closed');
}

function selectExhibit(i, fly = true) {
  if (selectedIndex >= 0 && selectedIndex !== i) setEmissive(exhibits[selectedIndex].model, 0x000000, 0);
  selectedIndex = i;
  const ex = exhibits[i];
  setEmissive(ex.model, 0xe09a4a, 0.16);
  showInfo(ex.data);
  renderList();
  if (fly) {
    const v = ex.view;
    flyTo(
      new THREE.Vector3(ex.x * 0.90, v.ty + v.lift, ex.z + v.dist),
      new THREE.Vector3(ex.x, v.ty, ex.z)
    );
  }
}

function showHall(fly = true) {
  if (selectedIndex >= 0) setEmissive(exhibits[selectedIndex].model, 0x000000, 0);
  selectedIndex = -1;
  showWelcome();
  renderList();
  if (fly) flyTo(new THREE.Vector3(-4.4, 5.6, 17.2), new THREE.Vector3(-1.4, 2.1, -0.6));
}

document.getElementById('prev-btn').addEventListener('click', () => {
  selectExhibit(selectedIndex < 0 ? DINOS.length - 1 : (selectedIndex - 1 + DINOS.length) % DINOS.length);
});
document.getElementById('next-btn').addEventListener('click', () => {
  selectExhibit(selectedIndex < 0 ? 0 : (selectedIndex + 1) % DINOS.length);
});
document.getElementById('hall-btn').addEventListener('click', () => showHall());
document.getElementById('info-close').addEventListener('click', () => panelEl.classList.add('closed'));
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'ArrowRight') document.getElementById('next-btn').click();
  else if (e.key === 'ArrowLeft') document.getElementById('prev-btn').click();
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
      if (o.userData && o.userData.exhibitIndex !== undefined) return o.userData.exhibitIndex;
      o = o.parent;
    }
  }
  return -1;
}

renderer.domElement.addEventListener('pointermove', (e) => {
  hoverIndex = pickAt(e.clientX, e.clientY);
  if (hoverIndex >= 0) {
    tooltipEl.textContent = DINOS[hoverIndex].name;
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
    if (idx >= 0) selectExhibit(idx);
  }
});

/* ------------------------------------------------------------------ */
/* Main loop                                                           */
/* ------------------------------------------------------------------ */

const clock = new THREE.Clock();
let firstFrame = true;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  exhibits.forEach((ex, i) => {
    ex.animate(t, ex.baseY);
    if (i === selectedIndex) ex.ringMat.opacity = 0.95;
    else if (i === hoverIndex) ex.ringMat.opacity = 0.45;
    else ex.ringMat.opacity = 0;
  });

  // Dust motes: a slow downward drift, recycled at the floor.
  const a = moteGeo.attributes.position;
  for (let i = 0; i < a.count; i++) {
    let y = a.getY(i) - dt * 0.07;
    if (y < 0.3) y = 8.8;
    a.setY(i, y);
    a.setX(i, a.getX(i) + Math.sin(t * 0.4 + i) * dt * 0.05);
  }
  a.needsUpdate = true;

  if (camAnim.active) {
    camAnim.t += dt / camAnim.dur;
    const tt = Math.min(camAnim.t, 1);
    const e = tt * tt * (3 - 2 * tt);
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

renderList();
animate();
