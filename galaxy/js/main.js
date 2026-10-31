// GalaxyVerse — one exhibit at a time, large on a dark stage.
// Eight exhibits are real NASA 3D models (public domain, NASA 3D Resources).
// They are Draco-compressed and several are 8–16 MB, so each GLB is
// lazy-loaded on FIRST selection only and cached for the rest of the visit;
// a soft placeholder glow holds the stage while it downloads. Six galaxies
// are procedural THREE.Points spirals (NASA's archive holds no galaxy GLBs),
// generated on selection and disposed on switch. Sagittarius A* is procedural.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EXHIBITS } from './exhibits.js';

const stage = document.getElementById('stage');
const loadingEl = document.getElementById('loading');
const failEl = document.getElementById('webgl-fail');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- renderer / scene ---------------- */

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  failEl.hidden = false;
  loadingEl.classList.add('gone');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030409);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 800);
const HOME_POS = new THREE.Vector3(0, 3.0, 15.5);
const HOME_TGT = new THREE.Vector3(0, 0.1, 0);
camera.position.copy(HOME_POS);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TGT);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3;
controls.maxDistance = 60;

const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
keyLight.position.set(12, 18, 10);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x8f7fff, 1.2);
rimLight.position.set(-16, 5, -12);
scene.add(rimLight);
scene.add(new THREE.AmbientLight(0x2c3350, 0.8));

/* ---------------- backdrop: stars + nebula glows ---------------- */

function glowTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function makeStars(count, rMin, rMax, size, color) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size, sizeAttenuation: true, transparent: true, opacity: 0.85, depthWrite: false
  });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars(2600, 120, 300, 0.8, 0xcdd8ff));
scene.add(makeStars(1000, 90, 220, 1.3, 0xffffff));

[
  ['rgba(88, 70, 200, 0.5)', 'rgba(88, 70, 200, 0)'],
  ['rgba(40, 110, 180, 0.42)', 'rgba(40, 110, 180, 0)'],
  ['rgba(190, 110, 60, 0.26)', 'rgba(190, 110, 60, 0)']
].forEach(([inner, outer], i) => {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(inner, outer), transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  const a = (i / 3) * Math.PI * 2 + 0.9;
  sprite.position.set(Math.cos(a) * 130, 26 - i * 14, -110 - i * 30);
  sprite.scale.setScalar(150 + i * 30);
  scene.add(sprite);
});

/* ---------------- helpers ---------------- */

const randn = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.6667;

function disposeObject(root) {
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        for (const k in m) {
          if (m[k] && m[k].isTexture) m[k].dispose();
        }
        m.dispose();
      });
    }
  });
}

function makePlaceholder() {
  const g = new THREE.Group();
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(160, 150, 255, 0.85)', 'rgba(160, 150, 255, 0)'),
    transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  sprite.scale.setScalar(5.2);
  g.add(sprite);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.7, 1.78, 72),
    new THREE.MeshBasicMaterial({ color: 0x9d8cff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
  );
  g.add(ring);
  g.userData.pulse = sprite;
  g.userData.ring = ring;
  return g;
}

/* ---------------- procedural galaxies ---------------- */

let dotTexture = null;
function starDotTexture() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

function makeGalaxyPoints(p, radius) {
  const n = p.stars;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const scatter = p.scatter || 1;
  for (let i = 0; i < n; i++) {
    let x, y, z, warm, bright;
    if (Math.random() < p.bulgeFraction) {
      // central bulge — old, warm, roughly spherical but flattened
      const rr = p.bulgeRadius * Math.abs(randn()) * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      x = rr * Math.sin(phi) * Math.cos(theta);
      y = rr * Math.cos(phi) * 0.62;
      z = rr * Math.sin(phi) * Math.sin(theta);
      warm = 0.85 + Math.random() * 0.15;
      bright = 0.5 + Math.random() * 0.5;
    } else {
      const r = radius * Math.pow(Math.random(), 0.72);
      const arm = i % p.arms;
      let ang = arm * (Math.PI * 2 / p.arms) + r * p.twist
        + randn() * 0.3 * scatter * (1.15 - r / radius);
      if (p.bar && r < p.barLength) {
        // bar stars hug the bar axis (arms leave from its two ends)
        ang = (Math.cos(ang) >= 0 ? 0 : Math.PI) + randn() * 0.16;
      }
      x = Math.cos(ang) * r;
      z = Math.sin(ang) * r;
      y = randn() * p.thickness * (1.7 - r / radius);
      warm = Math.min(1, Math.max(0, (1 - r / radius) * 0.65 + Math.random() * 0.35));
      bright = 0.45 + Math.random() * 0.55;
      if (p.dustLane && Math.abs(y) < 0.09 && r > radius * 0.3 && r < radius * 0.98 && Math.random() < 0.65) {
        bright *= 0.16; // the Sombrero's lane swallows starlight
      }
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    col[i * 3] = (p.young[0] * (1 - warm) + p.old[0] * warm) * bright;
    col[i * 3 + 1] = (p.young[1] * (1 - warm) + p.old[1] * warm) * bright;
    col[i * 3 + 2] = (p.young[2] * (1 - warm) + p.old[2] * warm) * bright;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.085, map: starDotTexture(), vertexColors: true, transparent: true,
    opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  return new THREE.Points(geo, mat);
}

function buildGalaxy(ex) {
  const p = ex.galaxy;
  const g = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = p.tiltX;
  tilt.add(makeGalaxyPoints(p, 5));
  if (p.companion) {
    const cp = Object.assign({}, p, p.companion);
    const comp = makeGalaxyPoints(cp, p.companion.radius);
    comp.position.fromArray(p.companion.offset);
    tilt.add(comp);
  }
  g.add(tilt);
  return g;
}

/* ---------------- Sagittarius A* ---------------- */

function buildBlackHole() {
  const g = new THREE.Group();

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255, 166, 66, 0.55)', 'rgba(255, 166, 66, 0)'),
    transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  glow.scale.setScalar(11);
  g.add(glow);

  // accretion disc texture: concentric glowing streaks, brighter on one side
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  for (let i = 0; i < 900; i++) {
    const r = 108 + Math.pow(Math.random(), 0.7) * 142;
    const start = Math.random() * Math.PI * 2;
    const len = 0.15 + Math.random() * 0.9;
    const hot = r < 150 ? 1 : 0.55;
    const leftBoost = Math.cos(start) < 0 ? 1.5 : 0.75; // doppler-brightened side
    ctx.beginPath();
    ctx.arc(256, 256, r, start, start + len);
    ctx.strokeStyle = 'rgba(255,' + Math.round(150 + Math.random() * 80) + ','
      + Math.round(50 + Math.random() * 60) + ',' + (0.16 * hot * leftBoost) + ')';
    ctx.lineWidth = 1 + Math.random() * 2.4;
    ctx.stroke();
  }
  const discTex = new THREE.CanvasTexture(c);

  const discGroup = new THREE.Group();
  discGroup.rotation.set(-Math.PI / 2 + 0.42, 0, 0.18);
  const disc = new THREE.Mesh(
    new THREE.RingGeometry(1.45, 4.5, 160, 1),
    new THREE.MeshBasicMaterial({
      map: discTex, transparent: true, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  discGroup.add(disc);
  const photonRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.33, 0.035, 10, 128),
    new THREE.MeshBasicMaterial({ color: 0xffd9a8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  discGroup.add(photonRing);
  g.add(discGroup);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.14, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  g.add(core);

  // a sparse swarm of stars orbiting far out
  const n = 260;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 5.2 + Math.random() * 2.2;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = randn() * 0.5;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const orbit = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xbfd0ff, size: 0.09, map: starDotTexture(), transparent: true,
    opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  orbit.rotation.x = 0.5;
  g.add(orbit);

  g.userData.disc = disc;
  g.userData.orbit = orbit;
  return g;
}

/* ---------------- GLB lazy loading with cache ---------------- */

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const modelCache = new Map(); // id -> { status: 'loading'|'ready'|'error', scene }

function ensureModel(ex) {
  let entry = modelCache.get(ex.id);
  if (entry) return entry;
  entry = { status: 'loading', scene: null };
  modelCache.set(ex.id, entry);
  gltfLoader.load(ex.file,
    gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const s = ex.targetSize / maxDim;
      model.scale.setScalar(s);
      model.position.set(-center.x * s, -center.y * s, -center.z * s);
      const holder = new THREE.Group();
      holder.add(model);
      entry.scene = holder;
      entry.status = 'ready';
      if (selected >= 0 && EXHIBITS[selected].id === ex.id) attachModel(ex);
    },
    undefined,
    () => {
      entry.status = 'error';
      if (selected >= 0 && EXHIBITS[selected].id === ex.id) updatePanel();
    }
  );
  return entry;
}

/* ---------------- stage management ---------------- */

let selected = -1;
let currentWrapper = null;
let placeholder = null;

function clearStage() {
  if (!currentWrapper) return;
  const ex = EXHIBITS[selected];
  const entry = ex && ex.kind === 'glb' ? modelCache.get(ex.id) : null;
  [...currentWrapper.children].forEach(child => {
    currentWrapper.remove(child);
    if (entry && child === entry.scene) return; // cached NASA model — keep alive
    disposeObject(child);
  });
  scene.remove(currentWrapper);
  currentWrapper = null;
  placeholder = null;
}

function showPlaceholder() {
  placeholder = makePlaceholder();
  currentWrapper.add(placeholder);
}

function attachModel(ex) {
  if (!currentWrapper) return;
  const entry = modelCache.get(ex.id);
  if (!entry || entry.status !== 'ready') return;
  if (placeholder) {
    currentWrapper.remove(placeholder);
    disposeObject(placeholder);
    placeholder = null;
  }
  if (entry.scene.parent) entry.scene.parent.remove(entry.scene);
  currentWrapper.add(entry.scene);
  updatePanel();
}

/* ---------------- UI: grouped exhibit list ---------------- */

const listEl = document.getElementById('exhibit-list');
const listButtons = [];
{
  let lastGroup = null;
  EXHIBITS.forEach((ex, i) => {
    if (ex.group !== lastGroup) {
      lastGroup = ex.group;
      const h = document.createElement('p');
      h.className = 'group-heading';
      h.textContent = ex.group;
      listEl.appendChild(h);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'exhibit-item';
    btn.innerHTML = '<span class="ci-name"></span><span class="ci-meta"></span>';
    btn.querySelector('.ci-name').textContent = ex.name;
    btn.querySelector('.ci-meta').textContent =
      (ex.kind === 'glb' ? 'NASA GLB · ' : ex.kind === 'galaxy' ? 'Particles · ' : 'Procedural · ')
      + ex.distance.split('—')[0].trim();
    btn.addEventListener('click', () => select(i, true));
    listEl.appendChild(btn);
    listButtons.push(btn);
  });
}

/* ---------------- info panel ---------------- */

const panel = {
  eyebrow: document.getElementById('panel-eyebrow'),
  name: document.getElementById('panel-name'),
  origin: document.getElementById('panel-origin'),
  tagline: document.getElementById('panel-tagline'),
  type: document.getElementById('stat-type'),
  distance: document.getElementById('stat-distance'),
  size: document.getElementById('stat-size'),
  description: document.getElementById('panel-description'),
  factLabel: document.querySelector('#panel-fact-wrap .fact-label'),
  fact: document.getElementById('panel-fact')
};

function updatePanel() {
  if (selected < 0) return;
  const ex = EXHIBITS[selected];
  panel.eyebrow.textContent = ex.group + ' · Exhibit ' + (selected + 1) + ' of ' + EXHIBITS.length;
  panel.name.textContent = ex.name;
  panel.tagline.textContent = ex.hook;
  panel.type.textContent = ex.type;
  panel.distance.textContent = ex.distance;
  panel.size.textContent = ex.size;
  panel.description.textContent = ex.description;
  if (ex.kind === 'glb') {
    panel.origin.textContent = 'Model: NASA 3D Resources · public domain';
    const entry = modelCache.get(ex.id);
    if (entry && entry.status === 'loading') {
      panel.factLabel.textContent = 'Loading';
      panel.fact.textContent = 'Loading NASA model\u2026 (' + ex.fileMB + ' from NASA\u2019s public archive). The soft glow on stage is a placeholder — the real model takes its place automatically when it arrives.';
    } else if (entry && entry.status === 'error') {
      panel.factLabel.textContent = 'Model note';
      panel.fact.textContent = 'This NASA model could not be loaded just now, so a placeholder glow is standing in. The source file is catalogued in model-catalogue.md if you would like to fetch it directly from NASA.';
    } else {
      panel.factLabel.textContent = 'Did you know?';
      panel.fact.textContent = ex.fact;
    }
  } else if (ex.kind === 'galaxy') {
    panel.origin.textContent = 'Rendered live as a particle system — no photograph, no model file';
    panel.factLabel.textContent = 'Did you know?';
    panel.fact.textContent = ex.fact;
  } else {
    panel.origin.textContent = 'Rendered procedurally — the real one lets no light escape to be photographed up close';
    panel.factLabel.textContent = 'Did you know?';
    panel.fact.textContent = ex.fact;
  }
}

/* ---------------- camera easing + selection ---------------- */

let camAnim = null;
function easeCamera(toPos, toTgt) {
  camAnim = {
    t: 0,
    fromPos: camera.position.clone(), toPos: toPos.clone(),
    fromTgt: controls.target.clone(), toTgt: toTgt.clone()
  };
}
controls.addEventListener('start', () => { camAnim = null; });

function select(i, fly) {
  if (i === selected) return;
  clearStage();
  selected = i;
  listButtons.forEach((b, k) => b.classList.toggle('active', k === i));
  const ex = EXHIBITS[i];
  currentWrapper = new THREE.Group();
  scene.add(currentWrapper);

  if (ex.kind === 'glb') {
    const entry = ensureModel(ex);
    if (entry.status === 'ready') {
      if (entry.scene.parent) entry.scene.parent.remove(entry.scene);
      currentWrapper.add(entry.scene);
    } else {
      showPlaceholder(); // 'loading' — attachModel swaps it in; 'error' — stays, panel explains
    }
  } else if (ex.kind === 'galaxy') {
    currentWrapper.add(buildGalaxy(ex));
  } else {
    currentWrapper.add(buildBlackHole());
  }
  updatePanel();

  if (fly) {
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 0.001) dir.set(0, 0.35, 1);
    dir.normalize();
    dir.y = Math.max(dir.y, 0.22);
    dir.normalize();
    easeCamera(dir.multiplyScalar(ex.viewDist), HOME_TGT);
  }
}

/* ---------------- controls: rotate toggle, prev/next, keys ---------------- */

let autoRotate = !reduceMotion;
const rotateBtn = document.getElementById('rotate-toggle');
function syncRotateBtn() {
  rotateBtn.textContent = 'Rotation: ' + (autoRotate ? 'On' : 'Off');
  rotateBtn.setAttribute('aria-pressed', String(autoRotate));
}
rotateBtn.addEventListener('click', () => { autoRotate = !autoRotate; syncRotateBtn(); });
syncRotateBtn();

function step(d) {
  const n = EXHIBITS.length;
  select(((selected < 0 ? 0 : selected) + d + n) % n, true);
}
document.getElementById('prev-btn').addEventListener('click', () => step(-1));
document.getElementById('next-btn').addEventListener('click', () => step(1));
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
});

/* ---------------- resize ---------------- */

function resize() {
  const w = stage.clientWidth || window.innerWidth;
  const h = stage.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* ---------------- animation ---------------- */

const clock = new THREE.Clock();
let firstFrame = true;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (currentWrapper && selected >= 0) {
    const ex = EXHIBITS[selected];
    if (autoRotate && !reduceMotion) {
      currentWrapper.rotation.y += dt * ex.spin;
      const bh = currentWrapper.children[0];
      if (ex.kind === 'blackhole' && bh && bh.userData.disc) {
        bh.userData.disc.rotation.z -= dt * 0.55;
        bh.userData.orbit.rotation.y += dt * 0.06;
      }
    }
    if (placeholder) {
      const s = 5.2 * (1 + Math.sin(t * 2.1) * 0.09);
      placeholder.userData.pulse.scale.setScalar(s);
      placeholder.userData.ring.rotation.z += dt * 0.25;
      placeholder.userData.ring.lookAt(camera.position);
    }
  }

  if (camAnim) {
    camAnim.t += dt / 1.15;
    const k = camAnim.t >= 1 ? 1 : 1 - Math.pow(1 - camAnim.t, 3);
    camera.position.lerpVectors(camAnim.fromPos, camAnim.toPos, k);
    controls.target.lerpVectors(camAnim.fromTgt, camAnim.toTgt, k);
    if (camAnim.t >= 1) camAnim = null;
  }

  controls.update();
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    loadingEl.classList.add('gone');
  }
}
animate();

select(0, false);
