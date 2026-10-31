// FungiVerse — interactive 3D forest-floor wing: mushrooms & toadstools.
// Original code. Rendering targets a soft, life-like woodland: ACES tone
// mapping, soft shadows, an image-based environment, canvas-generated
// textures (moss, bark, morel honeycomb, turkey-tail zones, ink-cap
// shag), and a day/night cycle that wakes the glowcaps and mycelium.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FUNGI, EDIBILITY } from './fungi.js';

/* ---------------------------------- setup --------------------------------- */
const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  document.getElementById('webgl-fail').hidden = false;
  document.getElementById('loading').style.display = 'none';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const DAY_BG = new THREE.Color(0xb9dcab), NIGHT_BG = new THREE.Color(0x081a11);
const DAY_FOG = new THREE.Color(0xcfe6bd), NIGHT_FOG = new THREE.Color(0x0a2014);
scene.background = DAY_BG.clone();
scene.fog = new THREE.Fog(DAY_FOG.clone(), 46, 120);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);
camera.position.set(0, 12.5, 26);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3;
controls.maxDistance = 60;
controls.target.set(0, 1.1, 0);

/* ---------------------------------- lights -------------------------------- */
const sun = new THREE.DirectionalLight(0xfff0d0, 2.5);
sun.position.set(16, 28, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0004;
sun.shadow.radius = 4;
scene.add(sun);
const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x5d7d46, 0.85);
scene.add(hemi);
const bounce = new THREE.DirectionalLight(0xd8f0d0, 0.3);
bounce.position.set(-14, 10, -18);
scene.add(bounce);
// Night-only glow lights (intensities driven by the day/night blend).
const glowLight = new THREE.PointLight(0x46ff7e, 0, 11, 1.6);
const ambGlow = new THREE.PointLight(0x2bff70, 0, 26, 1.8);
ambGlow.position.set(0, 1.2, 0);
scene.add(glowLight, ambGlow);

/* ----------------------------- canvas textures ---------------------------- */
function canvasTexture(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function speckle(ctx, n, w, h, colors, rMin, rMax, rng) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[(rng() * colors.length) | 0];
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, rMin + rng() * (rMax - rMin), rMin * 0.7 + rng() * rMax * 0.5, rng() * 3, 0, 7);
    ctx.fill();
  }
}
const groundTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#5d8a48'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(31);
  speckle(ctx, 3200, w, h, ['#527c3e', '#6c9c52', '#4a7038', '#7fae62'], 1, 3.5, rng);
  speckle(ctx, 260, w, h, ['#7a5c33', '#8f6f3d', '#64482a'], 1.5, 5, rng); // leaf litter
  speckle(ctx, 60, w, h, ['#a8844e', '#5c4125'], 2, 6, rng);
}, [9, 9]);
const mossTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#4e7d3a'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(17);
  speckle(ctx, 2200, w, h, ['#5d9046', '#6fa855', '#406b2f', '#83bd68', '#3a612b'], 1, 3, rng);
  speckle(ctx, 120, w, h, ['#8a6a3a', '#75552c'], 1, 3, rng); // litter flecks
}, [2, 2]);
const barkTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#6b4e33'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(9);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(${40 + rng() * 30 | 0},${28 + rng() * 20 | 0},14,${0.25 + rng() * 0.3})`;
    ctx.lineWidth = 1 + rng() * 4;
    ctx.beginPath();
    const x = rng() * w; ctx.moveTo(x, 0);
    for (let y = 0; y <= h; y += 32) ctx.lineTo(x + Math.sin(y * 0.03 + i) * 4, y);
    ctx.stroke();
  }
  speckle(ctx, 200, w, h, ['rgba(140,110,70,.3)', 'rgba(50,36,20,.35)'], 1, 4, rng);
}, [2, 1]);
const logEndTex = canvasTexture(128, 128, (ctx, w, h) => {
  ctx.fillStyle = '#c8a877'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(3);
  for (let r = 56; r > 4; r -= 4 + rng() * 5) {
    ctx.strokeStyle = `rgba(120,90,50,${0.3 + rng() * 0.3})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, 7); ctx.stroke();
  }
});
const morelTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#c49a5e'; ctx.fillRect(0, 0, w, h); // pale ridges
  const rng = mulberry(23);
  const rows = 9, cols = 9;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + (r % 2) * 0.5) * (w / cols) + (w / cols) / 2;
      const y = r * (h / rows) + (h / rows) / 2;
      const grad = ctx.createRadialGradient(x, y, 1, x, y, w / cols * 0.42);
      grad.addColorStop(0, '#2e1f0e');
      grad.addColorStop(0.7, '#4a3319');
      grad.addColorStop(1, 'rgba(196,154,94,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(x, y, w / cols * 0.44, h / rows * 0.46, 0, 0, 7); ctx.fill();
    }
  }
  speckle(ctx, 200, w, h, ['rgba(90,64,30,.25)'], 1, 3, rng);
});
const turkeyTex = canvasTexture(256, 128, (ctx, w, h) => {
  const zones = ['#d9c49a', '#5d4630', '#a9805a', '#7d8a96', '#8a5a34', '#c8a06a', '#4e3a28', '#e3d3ac'];
  const rng = mulberry(13);
  let r = 150;
  ctx.fillStyle = zones[0]; ctx.fillRect(0, 0, w, h);
  for (let i = 0; r > 6; i++) {
    ctx.fillStyle = zones[i % zones.length];
    ctx.beginPath(); ctx.arc(w / 2, h * 1.02, r, Math.PI, 2 * Math.PI); ctx.fill();
    r -= 6 + rng() * 9;
  }
  ctx.strokeStyle = 'rgba(240,235,210,.85)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(w / 2, h * 1.02, 148, Math.PI, 2 * Math.PI); ctx.stroke(); // pale growing edge
});
const inkTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#efe9da'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(29);
  for (let i = 0; i < 90; i++) { // shaggy vertical scales
    const x = rng() * w, y = rng() * h, len = 8 + rng() * 22;
    ctx.strokeStyle = `rgba(${120 + rng() * 60 | 0},${95 + rng() * 45 | 0},${60 + rng() * 30 | 0},${0.35 + rng() * 0.4})`;
    ctx.lineWidth = 2 + rng() * 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 3, y + len / 2, x + (rng() - 0.5) * 6, y + len); ctx.stroke();
  }
});
const puffTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#f3efe3'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(41);
  speckle(ctx, 500, w, h, ['rgba(200,192,168,.4)', 'rgba(225,218,198,.5)'], 1, 4, rng);
  ctx.strokeStyle = 'rgba(170,160,138,.4)'; ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) { // faint warts / cracks
    const x = rng() * w, y = rng() * h;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rng() - 0.5) * 22, y + (rng() - 0.5) * 22); ctx.stroke();
  }
}, [2, 1]);

/* ------------------------------- materials -------------------------------- */
const phys = (opts) => { const m = new THREE.MeshPhysicalMaterial(opts); m.envMapIntensity = 0.5; return m; };
const std = (opts) => { const m = new THREE.MeshStandardMaterial(opts); m.envMapIntensity = 0.45; return m; };
const mossMat = std({ map: mossTex, color: 0xaec79b, roughness: 1 });
const groundMat = std({ map: groundTex, color: 0xb8d3a2, roughness: 1 });
const barkMat = std({ map: barkTex, color: 0xa8845e, roughness: 0.95 });
const logEndMat = std({ map: logEndTex, color: 0xd8bd92, roughness: 0.9 });
const stemMat = phys({ color: 0xf2ecdc, roughness: 0.55, clearcoat: 0.2 });
const gillMat = std({ color: 0xf6efdd, roughness: 0.85, side: THREE.DoubleSide });

/* ------------------------------ world group ------------------------------- */
// Everything sits in `world`, nudged left on wide screens so the clearing
// is framed in the free space beside the right-hand list panel.
const world = new THREE.Group();
scene.add(world);

const ground = new THREE.Mesh(new THREE.CircleGeometry(70, 64), groundMat);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
world.add(ground);

// Backdrop conifers + rocks around the clearing
{
  const rng = mulberry(77);
  const trunkMat = std({ color: 0x5c4630, roughness: 1 });
  const pineMats = [0x2f5d33, 0x38663a, 0x2a5230].map(c => std({ color: c, roughness: 1 }));
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + rng() * 0.3;
    const r = 30 + rng() * 14, h = 9 + rng() * 7;
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, h * 0.3, 8), trunkMat);
    trunk.position.y = h * 0.15; tree.add(trunk);
    for (let k = 0; k < 3; k++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(h * (0.24 - k * 0.05), h * 0.42, 10), pineMats[(i + k) % 3]);
      cone.position.y = h * (0.38 + k * 0.2); cone.castShadow = true; tree.add(cone);
    }
    tree.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    world.add(tree);
  }
  const rockMat = std({ color: 0x8d8d84, roughness: 0.95, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const a = rng() * Math.PI * 2, r = 13 + rng() * 9;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + rng() * 0.7, 0), rockMat);
    rock.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r);
    rock.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    rock.castShadow = rock.receiveShadow = true;
    world.add(rock);
  }
}
// Drifting spores (always) — soft motes in the light
let sporePts;
{
  const n = 300, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 44; p[i * 3 + 1] = 0.4 + Math.random() * 9; p[i * 3 + 2] = (Math.random() - 0.5) * 34; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  sporePts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfffbe0, size: 0.13, transparent: true, opacity: 0.55, depthWrite: false }));
  world.add(sporePts);
}
// Fireflies (night only) — positions updated per-frame from seeds
const FLIES = 36;
const flySeeds = [];
let flyPts, flyPos;
{
  flyPos = new Float32Array(FLIES * 3);
  for (let i = 0; i < FLIES; i++) flySeeds.push({ a: Math.random() * 6.28, r: 3 + Math.random() * 11, h: 0.6 + Math.random() * 2.6, s: 0.4 + Math.random() * 0.9, p: Math.random() * 6.28 });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  flyPts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xd8ff9a, size: 0.22, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  world.add(flyPts);
}

/* ------------------------------ mound plots ------------------------------- */
function makeMound(radius) {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 20), mossMat);
  dome.scale.y = 0.32; dome.position.y = -radius * 0.06;
  dome.receiveShadow = true; dome.castShadow = true;
  g.add(dome);
  // Leaf litter scattered on the dome
  const rng = mulberry((radius * 1000) | 0);
  const litterMat = std({ color: 0x8a6a3a, roughness: 1, side: THREE.DoubleSide });
  const litterMat2 = std({ color: 0x6e5230, roughness: 1, side: THREE.DoubleSide });
  for (let i = 0; i < 12; i++) {
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.09 + rng() * 0.08, 7), rng() > 0.5 ? litterMat : litterMat2);
    const a = rng() * Math.PI * 2, rr = rng() * radius * 0.85;
    leaf.position.set(Math.cos(a) * rr, radius * 0.32 * Math.sqrt(Math.max(0, 1 - (rr / radius) ** 2)) + 0.015, Math.sin(a) * rr);
    leaf.rotation.set(-Math.PI / 2 + (rng() - 0.5) * 0.7, 0, rng() * 3);
    leaf.receiveShadow = true;
    g.add(leaf);
  }
  // Selection ring — glows when this plot is chosen
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x9fd08a, emissive: 0x51ff7a, emissiveIntensity: 0.12, roughness: 0.6 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.28, 0.045, 10, 48), ringMat);
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
  g.add(ring);
  // Mycelium threads in the soil — near-invisible by day, glowing at night
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rng() * 0.4;
    const steps = 3 + (rng() * 2 | 0);
    let x = 0, z = 0;
    for (let s = 0; s < steps; s++) {
      const nx = x + Math.cos(a + (rng() - 0.5) * 0.8) * (0.4 + rng() * 0.3);
      const nz = z + Math.sin(a + (rng() - 0.5) * 0.8) * (0.4 + rng() * 0.3);
      pts.push(x, 0.045, z, nx, 0.045, nz);
      x = nx; z = nz;
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
  const mycelium = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x8dffb0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(mycelium);
  return { group: g, ring, ringMat, mycelium };
}

/* ------------------------------ log helper -------------------------------- */
function makeLog(len, rad) {
  const g = new THREE.Group();
  const log = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 1.05, len, 20), barkMat);
  log.rotation.z = Math.PI / 2; log.position.y = rad * 0.92;
  log.castShadow = log.receiveShadow = true;
  g.add(log);
  for (const s of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(rad * 1.02, 20), logEndMat);
    cap.position.set(s * len / 2 + s * 0.001, rad * 0.92, 0);
    cap.rotation.y = s * Math.PI / 2;
    g.add(cap);
  }
  return g;
}

/* ------------------------------ the builders ------------------------------ */
const glowMats = []; // materials whose emissive wakes up at night
const BUILDERS = {
  agaric() {
    const g = new THREE.Group();
    function one(s, x, z) {
      const m = new THREE.Group();
      const stemPts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; stemPts.push(new THREE.Vector2(0.16 - t * 0.05 + Math.sin(t * Math.PI) * 0.015 + (1 - t) * (1 - t) * 0.07, t * 0.78)); }
      const stem = new THREE.Mesh(new THREE.LatheGeometry(stemPts, 24), stemMat);
      stem.castShadow = true; m.add(stem);
      // skirt ring on the upper stem
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 0.12, 20, 1, true), gillMat);
      skirt.position.y = 0.52; m.add(skirt);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.52),
        phys({ color: 0xc9341d, roughness: 0.38, clearcoat: 0.65, clearcoatRoughness: 0.35 }));
      cap.scale.y = 0.78; cap.position.y = 0.72; cap.castShadow = true; m.add(cap);
      const gills = new THREE.Mesh(new THREE.CircleGeometry(0.56, 28), gillMat);
      gills.rotation.x = Math.PI / 2; gills.position.y = 0.74; m.add(gills);
      // white warts — torn veil remnants scattered over the cap
      const rng = mulberry(5);
      const wartMat = std({ color: 0xf7f2e4, roughness: 0.9 });
      for (let i = 0; i < 16; i++) {
        const th = 0.15 + rng() * 1.1, ph = rng() * Math.PI * 2;
        const wart = new THREE.Mesh(new THREE.SphereGeometry(0.035 + rng() * 0.045, 8, 6), wartMat);
        wart.position.set(Math.sin(th) * Math.cos(ph) * 0.63, 0.72 + Math.cos(th) * 0.63 * 0.78, Math.sin(th) * Math.sin(ph) * 0.63);
        wart.scale.y = 0.35;
        m.add(wart);
      }
      m.scale.setScalar(s); m.position.set(x, 0.18, z);
      m.rotation.y = rng() * 3;
      return m;
    }
    g.add(one(1, 0, 0), one(0.55, 0.85, 0.45), one(0.38, -0.7, 0.6));
    return g;
  },
  glowcap() {
    const g = new THREE.Group();
    const log = makeLog(3.4, 0.42); log.position.y = 0.1; g.add(log);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0xd9cba4, roughness: 0.8, side: THREE.DoubleSide, emissive: 0x2bff62, emissiveIntensity: 0 });
    glowMats.push(shelfMat);
    const rng = mulberry(19);
    for (let i = 0; i < 17; i++) {
      const shelf = new THREE.Mesh(new THREE.CircleGeometry(0.16 + rng() * 0.13, 14, 0, Math.PI), shelfMat);
      const t = i / 16, x = -1.5 + t * 3.0 + (rng() - 0.5) * 0.15;
      const side = i % 3 === 2 ? 0 : (i % 2 ? 1 : -1); // some on top, some on each flank
      if (side === 0) { shelf.position.set(x, 0.92, 0); shelf.rotation.x = -Math.PI / 2 + 0.5; }
      else { shelf.position.set(x, 0.45 + rng() * 0.2, side * 0.4); shelf.rotation.set(side > 0 ? 0.5 : Math.PI - 0.5, 0, side > 0 ? 0 : Math.PI); }
      shelf.castShadow = true;
      g.add(shelf);
    }
    glowLight.position.set(0, 0.8, 0); // local green halo at night (moved to mound later)
    g.userData.hasGlowLight = true;
    return g;
  },
  morel() {
    const g = new THREE.Group();
    function one(s, x, z) {
      const m = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.5, 14), phys({ color: 0xe9dfc8, roughness: 0.7 }));
      stem.position.y = 0.25; stem.castShadow = true; m.add(stem);
      const pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(Math.sin(Math.min(t * 1.25, 1) * Math.PI * 0.62) * 0.34 * (1 - t * 0.25), t * 0.85)); }
      const capMat = new THREE.MeshStandardMaterial({ map: morelTex, bumpMap: morelTex, bumpScale: 0.8, roughness: 0.85 });
      capMat.envMapIntensity = 0.35;
      const cap = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), capMat);
      cap.position.y = 0.42; cap.castShadow = true; m.add(cap);
      m.scale.setScalar(s); m.position.set(x, 0.18, z); m.rotation.y = s * 2.1;
      return m;
    }
    g.add(one(1, 0.1, 0), one(0.7, -0.6, 0.4), one(0.55, 0.75, 0.5));
    return g;
  },
  chanterelle() {
    const g = new THREE.Group();
    function one(s, x, z) {
      const m = new THREE.Group();
      const gold = phys({ color: 0xeaa93b, roughness: 0.45, clearcoat: 0.35 });
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        pts.push(new THREE.Vector2(0.09 + Math.pow(t, 1.8) * 0.45, t * 0.62));
      }
      const funnel = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), gold);
      const pos = funnel.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { // wavy, lobed rim
        const y = pos.getY(i);
        if (y > 0.5) { const a = Math.atan2(pos.getZ(i), pos.getX(i)); pos.setY(i, y + Math.sin(a * 5) * 0.045); }
      }
      funnel.geometry.computeVertexNormals();
      funnel.castShadow = true; m.add(funnel);
      // blunt forked ridges running down the underside
      const ridgeMat = std({ color: 0xd18f2a, roughness: 0.7 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.3, 0.05), ridgeMat);
        ridge.position.set(Math.cos(a) * 0.2, 0.42, Math.sin(a) * 0.2);
        ridge.rotation.set(Math.sin(a) * 0.85, 0, -Math.cos(a) * 0.85);
        m.add(ridge);
      }
      m.scale.setScalar(s); m.position.set(x, 0.16, z); m.rotation.y = s * 1.7;
      return m;
    }
    g.add(one(1, 0, 0), one(0.75, 0.8, 0.35), one(0.6, -0.65, 0.55), one(0.5, 0.35, -0.6));
    return g;
  },
  deathcap() {
    const g = new THREE.Group();
    function one(s, x, z) {
      const m = new THREE.Group();
      // volva — the papery sac cupping the base
      const vpts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8; vpts.push(new THREE.Vector2(0.05 + Math.sin(t * Math.PI * 0.55) * 0.17, t * 0.2)); }
      const volva = new THREE.Mesh(new THREE.LatheGeometry(vpts, 20), phys({ color: 0xf4f1e4, roughness: 0.6, side: THREE.DoubleSide }));
      volva.position.y = 0.16; m.add(volva);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.85, 14), stemMat);
      stem.position.y = 0.55; stem.castShadow = true; m.add(stem);
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, 0.11, 18, 1, true), gillMat);
      skirt.position.y = 0.78; m.add(skirt);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.5),
        phys({ color: 0xcfd2a8, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
      cap.scale.y = 0.72; cap.position.y = 0.95; cap.castShadow = true; m.add(cap);
      const gills = new THREE.Mesh(new THREE.CircleGeometry(0.46, 26), gillMat);
      gills.rotation.x = Math.PI / 2; gills.position.y = 0.96; m.add(gills);
      m.scale.setScalar(s); m.position.set(x, 0, z); m.rotation.y = s * 2.4;
      return m;
    }
    g.add(one(1, 0, 0.1), one(0.6, -0.8, 0.5));
    return g;
  },
  puffball() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ map: puffTex, bumpMap: puffTex, bumpScale: 0.25, roughness: 0.92 });
    mat.envMapIntensity = 0.3;
    const big = new THREE.Mesh(new THREE.SphereGeometry(1.02, 44, 30), mat);
    big.scale.y = 0.88; big.position.y = 0.95; big.castShadow = big.receiveShadow = true; g.add(big);
    const small = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), mat);
    small.scale.y = 0.85; small.position.set(1.25, 0.42, 0.55); small.castShadow = true; g.add(small);
    return g;
  },
  turkeytail() {
    const g = new THREE.Group();
    const log = makeLog(3.0, 0.38); log.position.y = 0.08; g.add(log);
    const fanMat = new THREE.MeshStandardMaterial({ map: turkeyTex, roughness: 0.85, side: THREE.DoubleSide });
    fanMat.envMapIntensity = 0.3;
    const rng = mulberry(37);
    for (let i = 0; i < 13; i++) {
      const fan = new THREE.Mesh(new THREE.CircleGeometry(0.3 + rng() * 0.2, 20, 0, Math.PI), fanMat);
      const x = -1.3 + (i / 12) * 2.6 + (rng() - 0.5) * 0.2;
      const side = i % 2 ? 1 : -1;
      if (i % 3 === 0) { fan.position.set(x, 0.82, 0); fan.rotation.x = -Math.PI / 2 + 0.45; }
      else { fan.position.set(x, 0.42 + rng() * 0.15, side * 0.36); fan.rotation.set(0, side > 0 ? 0 : Math.PI, 0); fan.rotateX(-0.5); }
      fan.castShadow = true;
      g.add(fan);
    }
    return g;
  },
  inkcap() {
    const g = new THREE.Group();
    function one(s, x, z) {
      const m = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.95, 12), stemMat);
      stem.position.y = 0.48; stem.castShadow = true; m.add(stem);
      const pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(0.3 * Math.sin(Math.min(0.25 + t * 0.95, 1) * Math.PI * 0.58) * (1 - t * 0.3), t * 1.0)); }
      const capMat = new THREE.MeshStandardMaterial({ map: inkTex, bumpMap: inkTex, bumpScale: 0.4, roughness: 0.8 });
      capMat.envMapIntensity = 0.35;
      const cap = new THREE.Mesh(new THREE.LatheGeometry(pts, 26), capMat);
      cap.position.y = 0.42; cap.castShadow = true; m.add(cap);
      // shaggy scale flakes lifting off the cap
      const rng = mulberry(53);
      const flakeMat = std({ color: 0x8a7358, roughness: 1 });
      for (let i = 0; i < 18; i++) {
        const t = rng() * 0.85, a = rng() * Math.PI * 2;
        const r = 0.3 * Math.sin(Math.min(0.25 + t * 0.95, 1) * Math.PI * 0.58) * (1 - t * 0.3);
        const flake = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 6), flakeMat);
        flake.position.set(Math.cos(a) * r, 0.45 + t * 0.95, Math.sin(a) * r);
        flake.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
        m.add(flake);
      }
      m.scale.setScalar(s); m.position.set(x, 0.14, z); m.rotation.y = s * 1.3;
      return m;
    }
    g.add(one(1, -0.2, 0), one(0.7, 0.75, 0.4));
    // deliquescence — dark glossy drips and a puddle at the base
    const inkMat = phys({ color: 0x17120e, roughness: 0.12, clearcoat: 1 });
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.62, 24), inkMat);
    puddle.rotation.x = -Math.PI / 2; puddle.position.set(-0.2, 0.2, 0); puddle.receiveShadow = true; g.add(puddle);
    const rng = mulberry(61);
    for (let i = 0; i < 6; i++) {
      const drip = new THREE.Mesh(new THREE.SphereGeometry(0.05 + rng() * 0.05, 10, 8), inkMat);
      const a = rng() * Math.PI * 2;
      drip.position.set(-0.2 + Math.cos(a) * (0.3 + rng() * 0.25), 0.2, Math.sin(a) * (0.3 + rng() * 0.25));
      drip.scale.y = 0.45;
      g.add(drip);
    }
    return g;
  },
};

/* --------------------------- place all the fungi -------------------------- */
const SPOTS = {
  'fly-agaric': [-7.5, -3.5, 2.0],
  'glowcap': [0.5, -8.0, 2.2],
  'morel': [7.5, -3.5, 1.9],
  'chanterelle': [-8.5, 3.0, 2.1],
  'death-cap': [-3.2, 7.6, 1.9],
  'giant-puffball': [3.6, 7.2, 2.3],
  'turkey-tail': [8.5, 3.2, 2.1],
  'ink-cap': [0.2, 1.2, 2.0],
};
const registry = new Map();
const pickables = [];
const rngPos = mulberry(99);

for (const item of FUNGI) {
  const [x, z, r] = SPOTS[item.id];
  const mound = makeMound(r);
  mound.group.position.set(x, 0, z);
  const built = BUILDERS[item.model](item);
  built.position.y = r * 0.22;
  mound.group.add(built);
  mound.group.traverse(o => { o.userData.fungusId = item.id; if (o.isMesh) pickables.push(o); });
  world.add(mound.group);
  if (built.userData.hasGlowLight) {
    glowLight.position.set(x, 1.1, z).add(world.position); // corrected in layoutShift below
    glowLight.userData.moundPos = new THREE.Vector3(x, 1.1, z);
  }
  const el = document.createElement('div');
  el.className = 'label'; el.textContent = item.name;
  document.getElementById('labels').appendChild(el);
  registry.set(item.id, { data: item, group: mound.group, ring: mound.ring, ringMat: mound.ringMat, mycelium: mound.mycelium, labelEl: el, labelY: 2.5, swayPhase: rngPos() * 6.28 });
}

/* --------------------- framing: clearing centred in stage ---------------- */
function layoutShift() {
  const w = stage.clientWidth;
  world.position.x = 0; // three-section layout: clearing centred in the stage column
  if (glowLight.userData.moundPos) glowLight.position.copy(glowLight.userData.moundPos).add(world.position);
}
function resize() {
  const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  layoutShift();
}
addEventListener('resize', resize);

/* ------------------------------- day / night ------------------------------ */
let nightTarget = 0, nightT = 0;
const SUN_DAY = new THREE.Color(0xfff0d0), SUN_NIGHT = new THREE.Color(0x8fb7ff);
const tmpC = new THREE.Color();
document.getElementById('daynight').addEventListener('click', (ev) => {
  nightTarget = nightTarget ? 0 : 1;
  ev.currentTarget.setAttribute('aria-pressed', String(!!nightTarget));
  ev.currentTarget.textContent = nightTarget ? '☀️ Day' : '🌙 Night';
  document.body.classList.toggle('night', !!nightTarget);
});
function applyDayNight() {
  const t = nightT;
  scene.background.copy(tmpC.lerpColors(DAY_BG, NIGHT_BG, t));
  scene.fog.color.lerpColors(DAY_FOG, NIGHT_FOG, t);
  sun.intensity = THREE.MathUtils.lerp(2.5, 0.35, t);
  sun.color.lerpColors(SUN_DAY, SUN_NIGHT, t);
  hemi.intensity = THREE.MathUtils.lerp(0.85, 0.18, t);
  bounce.intensity = THREE.MathUtils.lerp(0.3, 0.05, t);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.1, 0.95, t);
  for (const m of glowMats) m.emissiveIntensity = t * 2.4;
  for (const rec of registry.values()) rec.mycelium.material.opacity = t * 0.8;
  glowLight.intensity = t * 7;
  ambGlow.intensity = t * 2.2;
  flyPts.material.opacity = t * (0.65 + Math.sin(perfT * 2.2) * 0.3);
  sporePts.material.opacity = THREE.MathUtils.lerp(0.55, 0.2, t);
}

/* -------------------------------- interaction ----------------------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');
let hovered = null, selected = null;
let flight = null;
function flyTo(pos, target, dur = 1300) {
  flight = { p0: camera.position.clone(), p1: pos, t0: controls.target.clone(), t1: target, start: performance.now(), dur };
}
controls.addEventListener('start', () => { flight = null; });
function focusItem(rec) {
  const c = new THREE.Vector3(); rec.group.getWorldPosition(c);
  const dir = new THREE.Vector3(c.x * 0.2, 0.3, 1).normalize();
  flyTo(c.clone().add(dir.multiplyScalar(5.2)).add(new THREE.Vector3(0, 1.4, 0)), c.clone().add(new THREE.Vector3(0, 0.8, 0)));
}
function select(id, fly = true) {
  selected = id;
  document.querySelectorAll('#fungus-list button').forEach(b => b.classList.toggle('selected', b.dataset.id === id));
  const info = document.getElementById('info');
  if (!id) { info.hidden = true; return; }
  const rec = registry.get(id), d = rec.data;
  const ed = EDIBILITY[d.edibility];
  const chip = document.getElementById('info-edibility');
  chip.textContent = d.edibilityLabel;
  chip.className = 'chip ' + ed.cls;
  document.getElementById('info-name').textContent = d.name;
  document.getElementById('info-latin').textContent = d.latin;
  document.getElementById('info-tagline').textContent = d.tagline;
  document.getElementById('info-habitat').textContent = d.habitat;
  document.getElementById('info-desc').textContent = d.description;
  document.getElementById('info-fact').textContent = d.fact;
  info.hidden = false;
  info.classList.remove('panel-in');
  void info.offsetWidth;
  info.classList.add('panel-in');
  if (fly) focusItem(rec);
}
document.getElementById('info-close').addEventListener('click', () => select(null));

function pickAt(cx, cy) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  return hits.length ? hits[0].object.userData.fungusId : null;
}
let downAt = null;
canvas.addEventListener('pointermove', ev => {
  const id = pickAt(ev.clientX, ev.clientY);
  hovered = id;
  canvas.style.cursor = id ? 'pointer' : 'grab';
  if (id) {
    const d = registry.get(id).data;
    const rect = stage.getBoundingClientRect();
    tooltip.hidden = false;
    tooltip.textContent = d.name + ' · ' + d.latin;
    tooltip.style.left = (ev.clientX - rect.left) + 'px'; tooltip.style.top = (ev.clientY - rect.top) + 'px';
  } else tooltip.hidden = true;
});
canvas.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; });
canvas.addEventListener('pointerup', ev => {
  if (!downAt) return;
  const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return;
  const id = pickAt(ev.clientX, ev.clientY);
  if (id) select(id);
});

/* ------------------------------- panel list ------------------------------- */
const listEl = document.getElementById('fungus-list');
function buildList(filter = '') {
  listEl.innerHTML = '';
  const f = filter.trim().toLowerCase();
  const items = FUNGI.filter(d => !f || (d.name + ' ' + d.latin + ' ' + d.habitat + ' ' + d.edibilityLabel).toLowerCase().includes(f));
  for (const item of items) {
    const b = document.createElement('button');
    b.dataset.id = item.id;
    if (item.id === selected) b.classList.add('selected');
    const ed = EDIBILITY[item.edibility];
    b.innerHTML = `<span class="dot" style="background:#${new THREE.Color(item.color).getHexString()}"></span><span>${item.name} <span class="alt">${item.latin}</span></span><span class="ed-mini ${ed.cls}">${item.edibility === 'deadly' ? 'Deadly' : item.edibility === 'toxic' ? 'Toxic' : item.edibility === 'none' ? 'Not edible' : 'Edible'}</span>`;
    b.addEventListener('click', () => select(item.id));
    listEl.appendChild(b);
  }
  if (!items.length) listEl.innerHTML = '<div class="empty">Nothing sprouted for that search — try another word.</div>';
}
buildList();
document.getElementById('search').addEventListener('input', e => buildList(e.target.value));
document.getElementById('reset-view').addEventListener('click', () => {
  flyTo(new THREE.Vector3(world.position.x * -0.2, 12.5, 26), new THREE.Vector3(0, 1.1, 0), 1400);
  select(null);
});
const labelsToggle = document.getElementById('labels-toggle');

/* --------------------------------- loop ----------------------------------- */
const clock = new THREE.Clock();
const projV = new THREE.Vector3();
let perfT = 0;
function updateLabels() {
  const show = labelsToggle.checked;
  const rect = stage.getBoundingClientRect();
  for (const rec of registry.values()) {
    if (!show) { rec.labelEl.style.display = 'none'; continue; }
    rec.group.getWorldPosition(projV); projV.y += rec.labelY;
    projV.project(camera);
    if (projV.z > 1 || projV.z < -1) { rec.labelEl.style.display = 'none'; continue; }
    rec.labelEl.style.display = 'block';
    rec.labelEl.style.left = ((projV.x * 0.5 + 0.5) * rect.width) + 'px';
    rec.labelEl.style.top = ((-projV.y * 0.5 + 0.5) * rect.height) + 'px';
    rec.labelEl.style.opacity = selected && selected !== rec.data.id ? 0.45 : 1;
  }
}
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  perfT = clock.elapsedTime;
  const t = perfT;
  nightT += (nightTarget - nightT) * Math.min(1, dt * 2.4);
  if (Math.abs(nightTarget - nightT) < 0.002) nightT = nightTarget;
  applyDayNight();
  sporePts.rotation.y = t * 0.011;
  sporePts.position.y = Math.sin(t * 0.25) * 0.3;
  if (nightT > 0.03) { // fireflies drift on lazy sine paths
    for (let i = 0; i < FLIES; i++) {
      const s = flySeeds[i];
      flyPos[i * 3] = Math.cos(s.a + t * 0.11 * s.s) * s.r + Math.sin(t * 0.7 * s.s + s.p) * 0.8;
      flyPos[i * 3 + 1] = s.h + Math.sin(t * s.s + s.p) * 0.45;
      flyPos[i * 3 + 2] = Math.sin(s.a + t * 0.11 * s.s) * s.r + Math.cos(t * 0.6 * s.s + s.p) * 0.8;
    }
    flyPts.geometry.attributes.position.needsUpdate = true;
  }
  for (const rec of registry.values()) {
    const active = selected === rec.data.id;
    rec.ringMat.emissiveIntensity = active ? 1.6 + Math.sin(t * 3) * 0.5 : (hovered === rec.data.id ? 0.5 : 0.12 + nightT * 0.25);
  }
  if (flight) {
    const k = Math.min((performance.now() - flight.start) / flight.dur, 1);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camera.position.lerpVectors(flight.p0, flight.p1, e);
    controls.target.lerpVectors(flight.t0, flight.t1, e);
    if (k >= 1) flight = null;
  }
  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}
resize();
animate();
requestAnimationFrame(() => {
  const l = document.getElementById('loading');
  l.style.opacity = '0';
  setTimeout(() => l.style.display = 'none', 650);
});
