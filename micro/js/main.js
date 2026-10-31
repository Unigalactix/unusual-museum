/* MicroVerse — A Drop of Pond Water in 3D
 * Original code by Rajesh Kodaganti. Renders eight procedural microbes
 * drifting in a fluid chamber with Three.js: no models, no textures
 * loaded — every organism is built from geometry and canvas textures.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MICROBES, MICROBE_MAP } from "./microbes.js";

/* ------------------------------------------------------------------ */
/* Deterministic RNG so the chamber looks the same on every load       */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261031);
const randRange = (min, max) => min + rand() * (max - min);

/* ------------------------------------------------------------------ */
/* DOM refs                                                            */
/* ------------------------------------------------------------------ */
const canvas = document.getElementById("scene");
const loadingEl = document.getElementById("loading");
const failEl = document.getElementById("webgl-fail");
const tooltipEl = document.getElementById("tooltip");
const labelsEl = document.getElementById("labels");
const listEl = document.getElementById("microbe-list");
const noResultsEl = document.getElementById("no-results");
const motionBtn = document.getElementById("toggle-motion");
const resetBtn = document.getElementById("reset-view");
const infoPanel = document.getElementById("info-panel");
const infoName = document.getElementById("info-name");
const infoMeta = document.getElementById("info-meta");
const infoTagline = document.getElementById("info-tagline");
const infoDesc = document.getElementById("info-desc");
const infoFact = document.getElementById("info-fact");
const DEFAULT_INFO = {
  name: infoName.textContent, meta: infoMeta.textContent,
  tagline: infoTagline.textContent, desc: infoDesc.textContent, fact: infoFact.textContent,
};

/* ------------------------------------------------------------------ */
/* Renderer / scene / camera — with graceful WebGL failure             */
/* ------------------------------------------------------------------ */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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
scene.background = new THREE.Color(0x04100d);
scene.fog = new THREE.FogExp2(0x04100d, 0.026);

/* Image-based lighting: a neutral studio environment for soft, realistic
   reflections. Kept subtle via envMapIntensity (~0.35) on the materials. */
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
} catch (err) {
  /* Environment reflections are cosmetic — continue without them. */
}

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
const DEFAULT_CAM = new THREE.Vector3(3.2, 2.4, 16.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
camera.position.copy(DEFAULT_CAM);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 3.5;
controls.maxDistance = 36;

/* ------------------------------------------------------------------ */
/* Three-section layout framing: the canvas fills the centre stage    */
/* column (a 56vh block in the mobile stack), so all sizing /          */
/* projection math goes through the canvas rect, and the subject is    */
/* framed dead-centre — no view offset.                                */
/* ------------------------------------------------------------------ */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
function viewRect() { return canvas.getBoundingClientRect(); }
function viewShiftX() {
  /* Three-section layout: the stage is its own column, so the subject
     is framed dead-centre — no view offset at any width. */
  return 0;
}
function applyViewOffset() {
  camera.clearViewOffset();
}
function resizeView() {
  const r = viewRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  camera.aspect = w / h;
  applyViewOffset();
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
function setPointerFromClient(cx, cy) {
  const r = viewRect();
  pointer.x = ((cx - r.left) / Math.max(1, r.width)) * 2 - 1;
  pointer.y = -((cy - r.top) / Math.max(1, r.height)) * 2 + 1;
}
resizeView();

/* Lights */
scene.add(new THREE.AmbientLight(0x88bbaa, 0.7));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(10, 14, 12);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -12; keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 12; keyLight.shadow.camera.bottom = -12;
keyLight.shadow.camera.near = 2; keyLight.shadow.camera.far = 50;
keyLight.shadow.bias = -0.002;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x3fd9b6, 0.8);
rimLight.position.set(-14, -5, -10);
scene.add(rimLight);
const heartLight = new THREE.PointLight(0xa8d94e, 10, 34);
heartLight.position.set(0, 0, 2);
scene.add(heartLight);

/* ------------------------------------------------------------------ */
/* Canvas speckle texture — cheap organic skin detail, seeded per use  */
/* ------------------------------------------------------------------ */
function makeSpeckleTexture({ base = "#333333", speckles = ["#222222", "#444444"], size = 256, count = 2000 } = {}) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const trand = mulberry32(base.length * 7919 + count);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 60; i++) {
    const x = trand() * size, y = trand() * size, r = 12 + trand() * 46;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = speckles[i % speckles.length];
    g.addColorStop(0, col + "55"); g.addColorStop(1, col + "00");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = speckles[i % speckles.length];
    ctx.globalAlpha = 0.1 + trand() * 0.45;
    ctx.beginPath();
    ctx.arc(trand() * size, trand() * size, 0.5 + trand() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/* Translucent organic body material — the house style for soft microbes */
function bodyMaterial({ color, map = null, roughness = 0.42, transmission = 0.18, thickness = 0.9, emissiveIntensity = 0.16, opacity = 1 }) {
  return new THREE.MeshPhysicalMaterial({
    color, map, bumpMap: map, bumpScale: map ? 0.015 : 0,
    roughness, metalness: 0.02,
    transmission, thickness, ior: 1.35,
    clearcoat: 0.55, clearcoatRoughness: 0.45,
    sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(color),
    transparent: opacity < 1, opacity,
    emissive: new THREE.Color(color), emissiveIntensity,
    envMapIntensity: 0.35,
  });
}
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}
const UP = new THREE.Vector3(0, 1, 0);
/* Unit direction for the k-th of n fibonacci-sphere points */
function fibDir(k, n, out) {
  const y = 1 - (k / Math.max(1, n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = k * 2.399963;
  return out.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

/* ------------------------------------------------------------------ */
/* The chamber: a "world" group that sways gently, as if in a current  */
/* ------------------------------------------------------------------ */
const world = new THREE.Group();
scene.add(world);

/* Suspended particles — two drifting fields of pond detritus */
function makeParticles(count, size, opacity) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = randRange(-11, 11);
    pos[i * 3 + 1] = randRange(-7, 7);
    pos[i * 3 + 2] = randRange(-11, 11);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xcffce9, size, transparent: true, opacity, depthWrite: false,
  }));
  pts.userData.speed = randRange(0.05, 0.12);
  world.add(pts);
  return pts;
}
const particleFields = [makeParticles(420, 0.05, 0.5), makeParticles(180, 0.1, 0.35)];

/* Rising micro-bubbles */
const bubbles = [];
{
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8fff2, roughness: 0.05, metalness: 0,
    transparent: true, opacity: 0.32, clearcoat: 1, clearcoatRoughness: 0.08,
    emissive: 0xd8fff2, emissiveIntensity: 0.05, envMapIntensity: 0.7, depthWrite: false,
  });
  const bubbleGeo = new THREE.SphereGeometry(1, 14, 10);
  for (let i = 0; i < 34; i++) {
    const b = new THREE.Mesh(bubbleGeo, bubbleMat);
    const r = randRange(0.035, 0.11);
    b.scale.setScalar(r);
    b.position.set(randRange(-9, 9), randRange(-7, 7), randRange(-9, 9));
    b.userData = { speed: randRange(0.25, 0.6), wobble: randRange(0, 6.28) };
    bubbles.push(b); world.add(b);
  }
}

/* A few dim detritus blobs far out — depth cues, not exhibits */
{
  const detMat = new THREE.MeshStandardMaterial({ color: 0x1d3325, roughness: 1, metalness: 0 });
  for (let i = 0; i < 9; i++) {
    const d = new THREE.Mesh(new THREE.IcosahedronGeometry(randRange(0.25, 0.6), 0), detMat);
    const a = randRange(0, Math.PI * 2);
    d.position.set(Math.cos(a) * randRange(8.5, 11), randRange(-5, 5), Math.sin(a) * randRange(8.5, 11));
    d.rotation.set(randRange(0, 3), randRange(0, 3), randRange(0, 3));
    world.add(d);
  }
}

/* ------------------------------------------------------------------ */
/* Microbe builders — each returns a Group; custom per-frame motion    */
/* is attached as root.userData.tick(t).                               */
/* ------------------------------------------------------------------ */
function buildPhage() {
  const g = new THREE.Group();
  const tex = makeSpeckleTexture({ base: "#8d78d8", speckles: ["#6d55bd", "#ab97ea", "#7c66cc"] });
  const shell = bodyMaterial({ color: 0xbdb0ee, map: tex, roughness: 0.35, transmission: 0.12, emissiveIntensity: 0.18 });
  const dark = bodyMaterial({ color: 0x5a48a8, roughness: 0.5, transmission: 0.05, emissiveIntensity: 0.12 });

  const head = mesh(new THREE.IcosahedronGeometry(0.55, 0), shell, 0, 0.55, 0);
  head.scale.set(1, 1.18, 1);
  head.castShadow = true;
  g.add(head);
  /* the DNA cargo, faintly glowing inside the head */
  const dna = mesh(new THREE.IcosahedronGeometry(0.3, 1),
    new THREE.MeshStandardMaterial({ color: 0x8ff5ff, roughness: 0.4, emissive: 0x54d8e8, emissiveIntensity: 0.55, envMapIntensity: 0.35 }),
    0, 0.55, 0);
  g.add(dna);
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.14, 12), dark, 0, -0.1, 0)); // collar
  g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.55, 12), shell, 0, -0.44, 0)); // tail sheath
  for (let i = 0; i < 5; i++) {
    const ring = mesh(new THREE.TorusGeometry(0.16, 0.028, 8, 18), dark, 0, -0.24 - i * 0.11, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 6), dark, 0, -0.76, 0)); // baseplate
  const spike = mesh(new THREE.ConeGeometry(0.05, 0.24, 8), dark, 0, -0.9, 0); // central spike
  spike.rotation.x = Math.PI;
  g.add(spike);
  /* six jointed tail fibres — the landing gear */
  const fibreMat = bodyMaterial({ color: 0x9a86e0, roughness: 0.55, transmission: 0.05, emissiveIntensity: 0.12 });
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.26;
    const ca = Math.cos(a), sa = Math.sin(a);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ca * 0.24, -0.76, sa * 0.24),
      new THREE.Vector3(ca * 0.55, -1.02, sa * 0.55),
      new THREE.Vector3(ca * 0.6, -1.3, sa * 0.6),
      new THREE.Vector3(ca * 0.5, -1.38, sa * 0.5),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.028, 6), fibreMat));
  }
  g.userData.tick = (t) => { dna.rotation.y = t * 0.4; dna.rotation.x = t * 0.23; };
  return g;
}

function buildSarsCov2() {
  const g = new THREE.Group();
  const tex = makeSpeckleTexture({ base: "#a34a44", speckles: ["#7e352f", "#c06a5e", "#8f4038"] });
  const body = mesh(new THREE.SphereGeometry(0.72, 36, 26), bodyMaterial({
    color: 0xd98d84, map: tex, roughness: 0.55, transmission: 0.1, emissiveIntensity: 0.14,
  }), 0, 0, 0);
  body.castShadow = true;
  g.add(body);
  /* club-shaped spike (S) proteins */
  const stalkGeo = new THREE.CylinderGeometry(0.026, 0.034, 0.2, 6);
  stalkGeo.translate(0, 0.1, 0);
  const clubGeo = new THREE.IcosahedronGeometry(0.088, 1);
  const stalkMat = bodyMaterial({ color: 0xd96a5a, roughness: 0.5, transmission: 0.05, emissiveIntensity: 0.15 });
  const clubMat = bodyMaterial({ color: 0xff9a86, roughness: 0.4, transmission: 0.08, emissiveIntensity: 0.3 });
  const dir = new THREE.Vector3();
  for (let k = 0; k < 26; k++) {
    fibDir(k, 26, dir);
    const spike = new THREE.Group();
    spike.position.copy(dir).multiplyScalar(0.7);
    spike.quaternion.setFromUnitVectors(UP, dir);
    spike.add(new THREE.Mesh(stalkGeo, stalkMat));
    spike.add(mesh(clubGeo, clubMat, 0, 0.26, 0));
    g.add(spike);
  }
  /* smaller membrane bumps */
  const bumpGeo = new THREE.SphereGeometry(0.045, 8, 6);
  const bumpMat = bodyMaterial({ color: 0x8f4038, roughness: 0.6, transmission: 0.04, emissiveIntensity: 0.1 });
  for (let k = 0; k < 44; k++) {
    fibDir(k + 7, 44, dir);
    g.add(mesh(bumpGeo, bumpMat, dir.x * 0.72, dir.y * 0.72, dir.z * 0.72));
  }
  return g;
}

function buildEcoli() {
  const g = new THREE.Group();
  const tex = makeSpeckleTexture({ base: "#79b34e", speckles: ["#5c8f38", "#97cc6e", "#6aa544"] });
  const bodyGeo = new THREE.CapsuleGeometry(0.34, 1.1, 6, 16);
  bodyGeo.rotateX(Math.PI / 2); // rod axis along Z
  const body = mesh(bodyGeo, bodyMaterial({
    color: 0xa8d97e, map: tex, roughness: 0.45, transmission: 0.12, emissiveIntensity: 0.15,
  }), 0, 0, 0);
  body.castShadow = true;
  g.add(body);
  /* pili: a fuzz of short hairs (instanced) */
  const pilusGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.11, 5);
  pilusGeo.translate(0, 0.055, 0);
  const pilusMat = bodyMaterial({ color: 0x97cc6e, roughness: 0.6, transmission: 0.04, emissiveIntensity: 0.1 });
  const pili = new THREE.InstancedMesh(pilusGeo, pilusMat, 80);
  {
    const dummy = new THREE.Object3D();
    const dir = new THREE.Vector3();
    const radii = new THREE.Vector3(0.35, 0.35, 0.9);
    for (let k = 0; k < 80; k++) {
      fibDir(k, 80, dir);
      dummy.position.set(dir.x * radii.x, dir.y * radii.y, dir.z * radii.z);
      dummy.quaternion.setFromUnitVectors(UP, dir);
      dummy.updateMatrix();
      pili.setMatrixAt(k, dummy.matrix);
    }
  }
  g.add(pili);
  /* flagella: long wavy tails that whip as a bundle */
  const flagGroup = new THREE.Group();
  const flagMat = bodyMaterial({ color: 0xb9e394, roughness: 0.5, transmission: 0.06, emissiveIntensity: 0.14 });
  for (let f = 0; f < 5; f++) {
    const a = (f / 5) * Math.PI * 2;
    const pts = [];
    for (let s = 0; s <= 6; s++) {
      const z = -0.85 - s * 0.34;
      pts.push(new THREE.Vector3(
        Math.cos(a) * 0.14 + Math.sin(s * 1.15 + f * 1.7) * 0.13,
        Math.sin(a) * 0.14 + Math.cos(s * 1.05 + f * 1.3) * 0.13,
        z
      ));
    }
    flagGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.024, 6), flagMat));
  }
  g.add(flagGroup);
  g.userData.tick = (t) => {
    flagGroup.rotation.z = Math.sin(t * 2.6) * 0.22;
    flagGroup.rotation.x = Math.cos(t * 2.1) * 0.16;
  };
  return g;
}

function buildInfluenza() {
  const g = new THREE.Group();
  const tex = makeSpeckleTexture({ base: "#52789f", speckles: ["#3c5c7d", "#6d94ba", "#476b8f"] });
  const body = mesh(new THREE.SphereGeometry(0.68, 36, 26), bodyMaterial({
    color: 0x9db9d6, map: tex, roughness: 0.5, transmission: 0.1, emissiveIntensity: 0.14,
  }), 0, 0, 0);
  body.castShadow = true;
  g.add(body);
  const dir = new THREE.Vector3();
  /* HA spikes — the "keys": slim stalk, small round tip, ice blue */
  const haStalk = new THREE.CylinderGeometry(0.015, 0.02, 0.17, 5);
  haStalk.translate(0, 0.085, 0);
  const haTip = new THREE.SphereGeometry(0.038, 8, 6);
  const haMat = bodyMaterial({ color: 0x8fd0ff, roughness: 0.4, transmission: 0.06, emissiveIntensity: 0.28 });
  for (let k = 0; k < 24; k++) {
    fibDir(k, 24, dir);
    const spike = new THREE.Group();
    spike.position.copy(dir).multiplyScalar(0.66);
    spike.quaternion.setFromUnitVectors(UP, dir);
    spike.add(new THREE.Mesh(haStalk, haMat));
    spike.add(mesh(haTip, haMat, 0, 0.19, 0));
    g.add(spike);
  }
  /* NA spikes — the "scissors": taller, flat mushroom cap, orange */
  const naStalk = new THREE.CylinderGeometry(0.013, 0.017, 0.22, 5);
  naStalk.translate(0, 0.11, 0);
  const naCap = new THREE.SphereGeometry(0.07, 10, 8);
  const naMat = bodyMaterial({ color: 0xffb35c, roughness: 0.4, transmission: 0.06, emissiveIntensity: 0.3 });
  for (let k = 0; k < 11; k++) {
    fibDir(k + 13, 23, dir);
    const spike = new THREE.Group();
    spike.position.copy(dir).multiplyScalar(0.66);
    spike.quaternion.setFromUnitVectors(UP, dir);
    spike.add(new THREE.Mesh(naStalk, naMat));
    const cap = mesh(naCap, naMat, 0, 0.25, 0);
    cap.scale.set(1, 0.55, 1);
    spike.add(cap);
    g.add(spike);
  }
  return g;
}

function buildTardigrade() {
  const g = new THREE.Group();
  const tex = makeSpeckleTexture({ base: "#cf9250", speckles: ["#a96f36", "#e6b878", "#bd823f"] });
  const skin = bodyMaterial({ color: 0xeec088, map: tex, roughness: 0.5, transmission: 0.1, emissiveIntensity: 0.15 });
  const segments = [
    [0.34, 0, 0.02, 0.82], [0.46, 0, 0, 0.44], [0.53, 0, 0, 0.02],
    [0.51, 0, 0, -0.4], [0.42, 0, -0.02, -0.78],
  ];
  for (const [r, x, y, z] of segments) {
    const s = mesh(new THREE.SphereGeometry(r, 24, 18), skin, x, y, z);
    s.scale.set(1, 0.92, 1.05);
    s.castShadow = true;
    g.add(s);
  }
  /* eyes + piercing mouth on the head */
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0c, roughness: 0.35, envMapIntensity: 0.35 });
  for (const sd of [-1, 1]) g.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), darkMat, sd * 0.13, 0.13, 1.08));
  const mouth = mesh(new THREE.ConeGeometry(0.055, 0.18, 10), darkMat, 0, -0.03, 1.14);
  mouth.rotation.x = Math.PI / 2;
  g.add(mouth);
  /* eight stubby legs, four pairs, each with a tiny claw */
  const legMat = bodyMaterial({ color: 0xe2aa66, roughness: 0.55, transmission: 0.06, emissiveIntensity: 0.12 });
  const legGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.36, 10);
  legGeo.translate(0, -0.18, 0);
  const clawGeo = new THREE.ConeGeometry(0.035, 0.12, 8);
  clawGeo.translate(0, -0.05, 0);
  const legPivots = [];
  [0.48, 0.1, -0.28, -0.64].forEach((z, i) => {
    for (const sd of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(sd * 0.4, -0.3, z);
      pivot.rotation.z = sd * 0.55;
      pivot.add(new THREE.Mesh(legGeo, legMat));
      const claw = new THREE.Mesh(clawGeo, darkMat);
      claw.position.y = -0.36;
      claw.rotation.x = Math.PI;
      pivot.add(claw);
      pivot.userData.phase = i * 0.9 + (sd > 0 ? 0.45 : 0);
      legPivots.push(pivot);
      g.add(pivot);
    }
  });
  g.userData.tick = (t) => {
    for (const p of legPivots) p.rotation.x = Math.sin(t * 2.1 + p.userData.phase) * 0.28;
  };
  return g;
}

function buildAmoeba() {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.95, 40, 28);
  const base = geo.attributes.position.array.slice();
  const body = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
    color: 0xbfeaf5, roughness: 0.22, metalness: 0,
    transmission: 0.55, thickness: 1.5, ior: 1.33,
    clearcoat: 0.6, clearcoatRoughness: 0.35,
    transparent: true, opacity: 0.82,
    emissive: 0x9fd8e8, emissiveIntensity: 0.1, envMapIntensity: 0.35,
  }));
  body.castShadow = true;
  g.add(body);
  /* nucleus, visible through the translucent jelly */
  const nucTex = makeSpeckleTexture({ base: "#7a5fc0", speckles: ["#5b43a0", "#967ed6"] });
  const nucleus = mesh(new THREE.SphereGeometry(0.3, 22, 16), bodyMaterial({
    color: 0xa68ae0, map: nucTex, roughness: 0.5, transmission: 0.1, emissiveIntensity: 0.22,
  }), 0.18, 0.1, 0.1);
  g.add(nucleus);
  /* contractile vacuole — a clear bubble that slowly swells and squeezes */
  const vacuole = mesh(new THREE.SphereGeometry(0.16, 18, 12), new THREE.MeshPhysicalMaterial({
    color: 0xeafcff, roughness: 0.08, transmission: 0.7, thickness: 0.4,
    transparent: true, opacity: 0.6, clearcoat: 0.8, envMapIntensity: 0.5,
  }), -0.34, -0.2, 0.3);
  g.add(vacuole);
  /* food granules drifting inside */
  const granMat = new THREE.MeshStandardMaterial({ color: 0xd8c890, roughness: 0.8, envMapIntensity: 0.25 });
  const granGeo = new THREE.SphereGeometry(0.05, 8, 6);
  for (let i = 0; i < 18; i++) {
    const a = randRange(0, Math.PI * 2), b = randRange(-1, 1), rr = randRange(0.3, 0.68);
    const y = b * rr, rxz = Math.sqrt(Math.max(0, rr * rr - y * y));
    g.add(mesh(granGeo, granMat, Math.cos(a) * rxz, y, Math.sin(a) * rxz));
  }
  const posAttr = geo.attributes.position;
  const n = new THREE.Vector3();
  const bulgeDir = new THREE.Vector3(0.6, 0.25, 0.75).normalize();
  g.userData.tick = (t) => {
    /* vertex wobble: layered sines + one slow pseudopod bulge that
       swells, drifts and subsides */
    const bulgePhase = (Math.sin(t * 0.45) * 0.5 + 0.5);
    for (let i = 0; i < posAttr.count; i++) {
      n.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]).normalize();
      let s = 1
        + 0.07 * Math.sin(3 * n.x + t * 1.1)
        + 0.07 * Math.sin(3 * n.y - t * 0.9)
        + 0.05 * Math.sin(4 * n.z + t * 0.7);
      const d = Math.max(0, n.dot(bulgeDir));
      s += 0.26 * d * d * d * bulgePhase;
      posAttr.setXYZ(i, n.x * 0.95 * s, n.y * 0.95 * s, n.z * 0.95 * s);
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    const v = 0.75 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.8));
    vacuole.scale.setScalar(v);
  };
  return g;
}

function buildParamecium() {
  const g = new THREE.Group();
  /* slipper body: a sphere tapered toward the front, flattened below */
  const geo = new THREE.SphereGeometry(0.8, 36, 24);
  {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const zN = z / 0.8;
      const front = THREE.MathUtils.smoothstep(zN, 0.1, 1.0);
      x *= 1 - 0.15 * front;
      x *= 1 + 0.08 * THREE.MathUtils.smoothstep(-zN, 0.3, 1.0);
      if (y < 0) y *= 0.94;
      p.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
  }
  const tex = makeSpeckleTexture({ base: "#3fae8c", speckles: ["#2d8a6e", "#5cc4a4", "#359478"] });
  const body = mesh(geo, new THREE.MeshPhysicalMaterial({
    color: 0x7fd8bc, map: tex, bumpMap: tex, bumpScale: 0.012,
    roughness: 0.3, metalness: 0, transmission: 0.35, thickness: 1.1, ior: 1.36,
    clearcoat: 0.5, clearcoatRoughness: 0.4,
    sheen: 0.4, sheenColor: new THREE.Color(0x4fc9a8),
    transparent: true, opacity: 0.94,
    emissive: 0x4fc9a8, emissiveIntensity: 0.14, envMapIntensity: 0.35,
  }), 0, 0, 0);
  body.scale.set(0.62, 0.56, 1.32);
  body.castShadow = true;
  g.add(body);
  const RADII = new THREE.Vector3(0.5, 0.45, 1.06);
  /* cilia: hundreds of short hairs over the whole surface (instanced) */
  const cilGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.1, 4);
  cilGeo.translate(0, 0.05, 0);
  const cilMat = new THREE.MeshStandardMaterial({ color: 0xa9ecd6, roughness: 0.6, emissive: 0x4fc9a8, emissiveIntensity: 0.18, envMapIntensity: 0.3 });
  const cilia = new THREE.InstancedMesh(cilGeo, cilMat, 320);
  {
    const dummy = new THREE.Object3D();
    const dir = new THREE.Vector3();
    const nrm = new THREE.Vector3();
    for (let k = 0; k < 320; k++) {
      fibDir(k, 320, dir);
      dummy.position.set(dir.x * RADII.x, dir.y * RADII.y, dir.z * RADII.z);
      nrm.set(dir.x / RADII.x, dir.y / RADII.y, dir.z / RADII.z).normalize();
      dummy.quaternion.setFromUnitVectors(UP, nrm);
      dummy.updateMatrix();
      cilia.setMatrixAt(k, dummy.matrix);
    }
  }
  g.add(cilia);
  /* oral groove: a darker curved channel along the lower side */
  const groove = mesh(new THREE.TorusGeometry(0.4, 0.065, 10, 24, 2.3),
    bodyMaterial({ color: 0x2d8a6e, roughness: 0.5, transmission: 0.15, emissiveIntensity: 0.12 }),
    0.1, -0.33, 0.32);
  groove.rotation.set(Math.PI / 2.4, 0.3, 0.8);
  g.add(groove);
  /* two nuclei inside: a big macronucleus + tiny micronucleus */
  const nucTex = makeSpeckleTexture({ base: "#6a55b8", speckles: ["#4e3c94", "#8771cc"] });
  const macro = mesh(new THREE.SphereGeometry(0.5, 20, 14), bodyMaterial({
    color: 0x9a86e0, map: nucTex, roughness: 0.5, transmission: 0.1, emissiveIntensity: 0.2,
  }), 0.02, 0.04, -0.18);
  macro.scale.set(0.5, 0.36, 0.85);
  g.add(macro);
  g.add(mesh(new THREE.SphereGeometry(0.12, 12, 10), macro.material, 0.24, 0.14, -0.42));
  g.userData.tick = (t) => {
    /* the shiver of beating cilia, suggested as a whole-body tremor */
    g.rotation.z = Math.sin(t * 7) * 0.012;
  };
  return g;
}

function buildYeast() {
  const g = new THREE.Group();
  const tex = makeSpeckleTexture({ base: "#d3af52", speckles: ["#b08d38", "#e8cb7c", "#c29f45"] });
  const skin = bodyMaterial({ color: 0xeed38a, map: tex, roughness: 0.45, transmission: 0.1, emissiveIntensity: 0.15 });
  const mother = mesh(new THREE.SphereGeometry(0.62, 30, 22), skin, 0, 0, 0);
  mother.scale.set(1, 1.15, 1);
  mother.castShadow = true;
  g.add(mother);
  /* bud scars: pale flat rings left on the mother wall */
  const scarMat = new THREE.MeshStandardMaterial({ color: 0xf7e3a1, roughness: 0.7, envMapIntensity: 0.25, polygonOffset: true, polygonOffsetFactor: -1 });
  const scarGeo = new THREE.CircleGeometry(0.055, 12);
  const dir = new THREE.Vector3();
  for (let k = 0; k < 6; k++) {
    fibDir(k + 3, 11, dir);
    if (dir.y > 0.55) dir.y = 0.4; // keep scars off the bud site
    dir.normalize();
    const scar = new THREE.Mesh(scarGeo, scarMat);
    scar.position.set(dir.x * 0.64, dir.y * 0.73, dir.z * 0.64);
    scar.lookAt(dir.clone().multiplyScalar(3).setY(dir.y * 3 * 1.15));
    g.add(scar);
  }
  /* the bud: a daughter cell swelling out of the mother's top shoulder */
  const bud = mesh(new THREE.SphereGeometry(0.34, 22, 16), skin, 0.34, 0.52, 0.1);
  g.add(bud);
  /* and a recently separated daughter drifting alongside */
  const daughter = mesh(new THREE.SphereGeometry(0.4, 24, 18), skin, 0.85, -0.42, 0.25);
  daughter.scale.set(1, 1.12, 1);
  g.add(daughter);
  g.userData.tick = (t) => {
    /* the bud slowly swells and relaxes, as if on a budding cycle */
    bud.scale.setScalar(0.82 + 0.26 * (0.5 + 0.5 * Math.sin(t * 0.55)));
  };
  return g;
}

const BUILDERS = {
  phage: buildPhage, sarscov2: buildSarsCov2, ecoli: buildEcoli, influenza: buildInfluenza,
  tardigrade: buildTardigrade, amoeba: buildAmoeba, paramecium: buildParamecium, yeast: buildYeast,
};

/* ------------------------------------------------------------------ */
/* Unit registry                                                       */
/* ------------------------------------------------------------------ */
const units = [];
const pickMeshes = [];
function registerUnit(data) {
  const root = BUILDERS[data.id]();
  root.position.set(...data.position);
  const mats = new Set();
  root.traverse((child) => {
    if (child.isMesh) {
      child.userData.microbeId = data.id;
      pickMeshes.push(child);
      const list = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of list) if (m && "emissiveIntensity" in m) mats.add(m);
    }
  });
  for (const m of mats) m.userData.baseEmissive = m.emissiveIntensity;
  const unit = {
    data, root, mats: [...mats],
    basePos: new THREE.Vector3(...data.position),
    phase: randRange(0, Math.PI * 2),
    spin: randRange(0.04, 0.13) * (rand() > 0.5 ? 1 : -1),
    baseRotY: randRange(0, Math.PI * 2),
    tick: root.userData.tick || null,
  };
  root.rotation.y = unit.baseRotY;
  units.push(unit);
  world.add(root);
  return unit;
}
for (const m of MICROBES) registerUnit(m);
const unitById = Object.fromEntries(units.map((u) => [u.data.id, u]));

/* ------------------------------------------------------------------ */
/* Sidebar list + type filter chips                                    */
/* ------------------------------------------------------------------ */
const listItems = {};
for (const m of MICROBES) {
  const li = document.createElement("li");
  li.dataset.microbeId = m.id;
  const dot = document.createElement("span");
  dot.className = "dot";
  dot.style.background = m.color;
  dot.style.color = m.color;
  const name = document.createElement("span");
  name.textContent = m.name;
  const size = document.createElement("span");
  size.className = "size";
  size.textContent = m.size.split("—")[0].split("(")[0].trim();
  li.append(dot, name, size);
  li.addEventListener("click", () => selectUnit(unitById[m.id], true));
  listEl.appendChild(li);
  listItems[m.id] = li;
}
let activeFilter = "all";
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => {
      const on = c === chip;
      c.classList.toggle("active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    let visible = 0;
    for (const m of MICROBES) {
      const show = activeFilter === "all" || m.group === activeFilter;
      listItems[m.id].style.display = show ? "" : "none";
      if (show) visible++;
    }
    noResultsEl.hidden = visible > 0;
  });
});

/* ------------------------------------------------------------------ */
/* Selection, hover, camera focus                                      */
/* ------------------------------------------------------------------ */
let selectedUnit = null;
let hoveredUnit = null;
let camAnim = null;

function setGlow(unit, multiplier) {
  for (const m of unit.mats) m.emissiveIntensity = m.userData.baseEmissive * multiplier;
}
function flyTo(worldPos, distance) {
  const dir = camera.position.clone().sub(controls.target);
  if (dir.lengthSq() < 0.001) dir.set(0.3, 0.3, 1);
  dir.normalize().multiplyScalar(distance);
  camAnim = {
    t: 0, dur: 1.1,
    fromTarget: controls.target.clone(), toTarget: worldPos.clone(),
    fromCam: camera.position.clone(), toCam: worldPos.clone().add(dir),
  };
}
function updateInfo(m) {
  infoName.textContent = m.name;
  infoMeta.textContent = `${m.type} · ${m.size}`;
  infoTagline.textContent = m.hook;
  infoTagline.style.color = m.color;
  infoDesc.textContent = m.description;
  infoFact.textContent = m.fact;
}
function selectUnit(unit, fly = true) {
  if (selectedUnit) setGlow(selectedUnit, 1);
  selectedUnit = unit;
  setGlow(unit, 3.0);
  for (const m of MICROBES) listItems[m.id].classList.toggle("active", m.id === unit.data.id);
  updateInfo(unit.data);
  infoPanel.classList.add("expanded");
  if (fly) {
    const wp = unit.root.getWorldPosition(new THREE.Vector3());
    flyTo(wp, Math.max(unit.data.radius * 4.0, 6));
  }
}
function deselect(fly = true) {
  if (selectedUnit) setGlow(selectedUnit, 1);
  selectedUnit = null;
  for (const m of MICROBES) listItems[m.id].classList.remove("active");
  infoName.textContent = DEFAULT_INFO.name;
  infoMeta.textContent = DEFAULT_INFO.meta;
  infoTagline.textContent = DEFAULT_INFO.tagline;
  infoTagline.style.color = "";
  infoDesc.textContent = DEFAULT_INFO.desc;
  infoFact.textContent = DEFAULT_INFO.fact;
  if (fly) {
    camAnim = {
      t: 0, dur: 1.1,
      fromTarget: controls.target.clone(), toTarget: DEFAULT_TARGET.clone(),
      fromCam: camera.position.clone(), toCam: DEFAULT_CAM.clone(),
    };
  }
}
resetBtn.addEventListener("click", () => deselect(true));
infoPanel.addEventListener("click", () => infoPanel.classList.toggle("expanded"));

/* Motion toggle: freezes drift, spins and the microbes' own animations */
let motionOn = true;
motionBtn.addEventListener("click", () => {
  motionOn = !motionOn;
  motionBtn.textContent = `Motion: ${motionOn ? "On" : "Off"}`;
  motionBtn.setAttribute("aria-pressed", String(motionOn));
});

/* Raycasting — click (not drag) to select, hover for glow + tooltip */
let pointerDirty = false;
let pointerClient = { x: 0, y: 0 };
canvas.addEventListener("pointermove", (e) => {
  setPointerFromClient(e.clientX, e.clientY);
  pointerClient = { x: e.clientX, y: e.clientY };
  pointerDirty = true;
});
function pickAtPointer() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickMeshes, false);
  return hits.length ? unitById[hits[0].object.userData.microbeId] : null;
}
let downPos = null;
canvas.addEventListener("pointerdown", (e) => { downPos = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener("pointerup", (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  downPos = null;
  if (moved > 6) return;
  setPointerFromClient(e.clientX, e.clientY);
  const unit = pickAtPointer();
  if (unit) selectUnit(unit, true);
  else deselect(true);
});

/* ------------------------------------------------------------------ */
/* Labels — projected, priority-placed, collision-free                 */
/* ------------------------------------------------------------------ */
const labelDivs = {};
for (const m of MICROBES) {
  const div = document.createElement("div");
  div.className = "label3d";
  div.textContent = m.name;
  div.style.color = m.color;
  labelsEl.appendChild(div);
  labelDivs[m.id] = div;
}
function updateLabels() {
  const rect = viewRect();
  const candidates = [];
  for (const u of units) {
    const div = labelDivs[u.data.id];
    const wp = u.root.getWorldPosition(new THREE.Vector3());
    const projected = wp.clone().project(camera);
    const behind = projected.z > 1;
    /* #labels lives inside #stage, so project into stage-relative px */
    const x = (projected.x * 0.5 + 0.5) * rect.width;
    const y = (-projected.y * 0.5 + 0.5) * rect.height;
    div.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -160%)`;
    let priority = 10;
    if (u === selectedUnit) priority = 1000;
    else if (u === hoveredUnit) priority = 500;
    candidates.push({
      div, x, y, priority,
      w: div.offsetWidth || 70, h: div.offsetHeight || 16,
      eligible: !behind,
    });
  }
  candidates.sort((a, b) => b.priority - a.priority);
  const placed = [];
  for (const c of candidates) {
    if (!c.eligible) { c.div.style.opacity = "0"; continue; }
    const box = { l: c.x - c.w / 2 - 4, r: c.x + c.w / 2 + 4, t: c.y - c.h * 1.8 - 4, b: c.y };
    if (placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) {
      c.div.style.opacity = "0";
      continue;
    }
    placed.push(box);
    c.div.style.opacity = "1";
  }
}

/* ------------------------------------------------------------------ */
/* Main loop                                                           */
/* ------------------------------------------------------------------ */
const clock = new THREE.Clock();
let simT = 0;
let firstFrame = true;
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (motionOn) simT += delta;
  const t = simT;

  /* the whole chamber sways gently, as if a current were passing */
  world.rotation.z = Math.sin(t * 0.07) * 0.02;
  world.rotation.x = Math.sin(t * 0.05) * 0.012;
  world.position.x = Math.sin(t * 0.045) * 0.3;

  if (motionOn) {
    /* suspended particles sink slowly and wrap */
    for (const f of particleFields) {
      const pos = f.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - f.userData.speed * delta;
        if (y < -7) y += 14;
        pos.setY(i, y);
        pos.setX(i, pos.getX(i) + Math.sin(t * 0.4 + i) * 0.0012);
      }
      pos.needsUpdate = true;
    }
    /* bubbles rise and wrap */
    for (const b of bubbles) {
      b.position.y += b.userData.speed * delta;
      b.position.x += Math.sin(t * 1.3 + b.userData.wobble) * 0.0018;
      if (b.position.y > 7.5) b.position.y = -7.5;
    }
    /* microbes drift, bob and slowly turn; each runs its own tick */
    for (const u of units) {
      u.root.position.set(
        u.basePos.x + Math.sin(t * 0.11 + u.phase) * 0.35,
        u.basePos.y + Math.sin(t * 0.16 + u.phase * 1.7) * 0.3,
        u.basePos.z + Math.cos(t * 0.09 + u.phase) * 0.35
      );
      u.root.rotation.y = u.baseRotY + t * u.spin;
      u.root.rotation.z = Math.sin(t * 0.13 + u.phase) * 0.05;
      if (u.tick) u.tick(t);
      const s = u === selectedUnit ? 1 + Math.sin(t * 4) * 0.04 : 1;
      u.root.scale.setScalar(s);
    }
  }

  /* camera fly-to animation */
  if (camAnim) {
    camAnim.t += delta / camAnim.dur;
    const k = easeInOut(Math.min(camAnim.t, 1));
    controls.target.lerpVectors(camAnim.fromTarget, camAnim.toTarget, k);
    camera.position.lerpVectors(camAnim.fromCam, camAnim.toCam, k);
    if (camAnim.t >= 1) camAnim = null;
  }

  /* hover highlight + tooltip (checked once per frame) */
  if (pointerDirty && !camAnim) {
    pointerDirty = false;
    const unit = pickAtPointer();
    if (unit !== hoveredUnit) {
      if (hoveredUnit && hoveredUnit !== selectedUnit) setGlow(hoveredUnit, 1);
      hoveredUnit = unit;
      if (hoveredUnit && hoveredUnit !== selectedUnit) setGlow(hoveredUnit, 1.8);
      canvas.style.cursor = hoveredUnit ? "pointer" : "";
      if (hoveredUnit) {
        tooltipEl.textContent = hoveredUnit.data.name;
        tooltipEl.style.opacity = "1";
      } else {
        tooltipEl.style.opacity = "0";
      }
    }
    if (hoveredUnit) {
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

window.addEventListener("resize", resizeView);
