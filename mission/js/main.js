// MissionVerse — five real NASA spacecraft as interactive 3D models.
// Models are NASA's own public-domain GLBs from the NASA 3D Resources
// collection (GitHub mirror: nasa/NASA-3D-Resources). Most are
// Draco-compressed, so a DRACOLoader is wired into the GLTFLoader.
// If a model fails to load, a procedural placeholder silhouette stays
// on its pedestal and the info panel says so — the page never breaks.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CRAFT = [
  {
    id: 'iss',
    name: 'International Space Station',
    short: 'ISS',
    file: 'assets/models/iss.glb',
    kind: 'station',
    agency: 'NASA · Roscosmos · ESA · JAXA · CSA',
    launched: '1998',
    type: 'Space station',
    tagline: 'A football-field-sized laboratory that has not been empty for a single day since November 2000.',
    description: 'The ISS was assembled piece by piece in orbit, about 400 km overhead, and is the largest structure humans have ever built in space. It races around Earth at 28,000 km/h — one full orbit every 93 minutes — so its crew watches sixteen sunrises and sunsets every day.',
    fact: 'The station\u2019s solar wings stretch about 109 metres from tip to tip, wider than the wingspan of a Boeing 747.',
    position: [-8.8, 1.1, -2.6],
    targetSize: 4.0,
    spin: 0.05
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    short: 'Webb',
    file: 'assets/models/jwst.glb',
    kind: 'telescope',
    agency: 'NASA · ESA · CSA',
    launched: '2021',
    type: 'Infrared space telescope',
    tagline: 'A golden mirror the size of a house, parked 1.5 million km from Earth to see the first galaxies.',
    description: 'Webb\u2019s 6.5-metre mirror is made of eighteen gold-coated hexagonal segments that folded up inside its rocket and unfolded in space. A sunshield the size of a tennis court keeps the telescope colder than \u2212233 \u00b0C, cold enough to catch the faint infrared glow of stars born just after the Big Bang.',
    fact: 'The gold coating on Webb\u2019s mirror is only about 100 nanometres thick — all of it together weighs roughly as much as a golf ball.',
    position: [-4.5, 2.0, -5.4],
    targetSize: 3.6,
    spin: 0.07
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    short: 'Hubble',
    file: 'assets/models/hubble.glb',
    kind: 'telescope',
    agency: 'NASA · ESA',
    launched: '1990',
    type: 'Optical space telescope',
    tagline: 'The school-bus-sized eye that rewrote astronomy — and was repaired by astronauts in orbit.',
    description: 'Launched in 1990, Hubble peers at the universe from above Earth\u2019s blurry atmosphere. Its main mirror arrived with a flaw smaller than a hair\u2019s width, and in 1993 shuttle astronauts fitted it with corrective optics — the first of five servicing missions. It has since made more than a million and a half observations.',
    fact: 'Hubble\u2019s data archive is free to everyone, and astronomers have published more than 22,000 peer-reviewed papers from its observations.',
    position: [0, 1.3, -6.8],
    targetSize: 3.4,
    spin: 0.09
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover',
    short: 'Perseverance',
    file: 'assets/models/perseverance.glb',
    kind: 'rover',
    agency: 'NASA (Jet Propulsion Laboratory)',
    launched: '2020',
    type: 'Mars rover',
    tagline: 'A nuclear-powered, car-sized geologist hunting for signs of ancient life in a dried-up Martian lake.',
    description: 'Perseverance landed in Jezero Crater in February 2021, in the bed of a lake that held water billions of years ago. Built on the same chassis design as the Curiosity rover, it drills and seals rock samples for a future mission to bring home, and even carried a small helicopter, Ingenuity, beneath its belly.',
    fact: 'Ingenuity, the helicopter Perseverance carried to Mars, made the first powered flight on another planet — and went on to fly 72 times.',
    position: [4.5, 0.5, -5.4],
    targetSize: 3.1,
    spin: 0.06
  },
  {
    id: 'saturnv',
    name: 'Saturn V',
    short: 'Saturn V',
    file: 'assets/models/saturn-v.glb',
    kind: 'rocket',
    agency: 'NASA',
    launched: '1967',
    type: 'Super heavy-lift rocket',
    tagline: 'Still the tallest, heaviest and most powerful rocket ever flown — the Moon rocket.',
    description: 'At 110.6 metres, the Saturn V stood taller than the Statue of Liberty. Its five first-stage F-1 engines burned about thirteen tonnes of fuel per second to lift Apollo crews off the pad. Between 1967 and 1973 it flew thirteen times, carrying the first humans to the Moon and launching the Skylab space station.',
    fact: 'The Saturn V remains the only rocket ever to carry people beyond low Earth orbit — every Moon landing rode on one.',
    position: [8.8, 1.7, -2.6],
    targetSize: 4.6,
    spin: 0.04
  }
];

const stage = document.getElementById('stage');
const tooltip = document.getElementById('tooltip');
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
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04060d);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 600);
const HOME_POS = new THREE.Vector3(0, 3.4, 16.5);
const HOME_TGT = new THREE.Vector3(0, 1.1, -4.2);
camera.position.copy(HOME_POS);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TGT);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.5;
controls.maxDistance = 42;

const keyLight = new THREE.DirectionalLight(0xfff2df, 2.4);
keyLight.position.set(14, 20, 10);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x6f9fff, 1.1);
rimLight.position.set(-18, 6, -14);
scene.add(rimLight);
scene.add(new THREE.AmbientLight(0x33415e, 0.7));

/* ---------------- backdrop: stars, nebula, Earth ---------------- */

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
    color, size, sizeAttenuation: true, transparent: true, opacity: 0.9,
    depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  points.userData.noPick = true;
  return points;
}
scene.add(makeStars(2400, 90, 220, 0.55, 0xcfdcff));
scene.add(makeStars(900, 70, 160, 0.9, 0xffffff));

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

const nebulaColors = [
  ['rgba(70, 90, 200, 0.55)', 'rgba(70, 90, 200, 0)'],
  ['rgba(140, 60, 190, 0.45)', 'rgba(140, 60, 190, 0)'],
  ['rgba(30, 130, 160, 0.4)', 'rgba(30, 130, 160, 0)'],
  ['rgba(220, 120, 50, 0.28)', 'rgba(220, 120, 50, 0)']
];
nebulaColors.forEach(([inner, outer], i) => {
  const mat = new THREE.SpriteMaterial({
    map: glowTexture(inner, outer), transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const sprite = new THREE.Sprite(mat);
  const a = (i / nebulaColors.length) * Math.PI * 2 + 0.6;
  sprite.position.set(Math.cos(a) * 95, 18 + (i % 2) * 26 - 8, -80 - (i % 3) * 25);
  sprite.scale.setScalar(120 + i * 22);
  sprite.userData.noPick = true;
  scene.add(sprite);
});

// Earth, far below-centre — a textured sphere made from a painted canvas.
(function addEarth() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  const ocean = ctx.createLinearGradient(0, 0, 0, 512);
  ocean.addColorStop(0, '#274f9e');
  ocean.addColorStop(0.5, '#2f66c4');
  ocean.addColorStop(1, '#22468a');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, 1024, 512);
  // continents — loose painterly blobs
  ctx.fillStyle = '#3d7a44';
  const blobs = [
    [190, 150, 90], [240, 230, 55], [480, 120, 70], [545, 190, 45],
    [520, 300, 40], [730, 170, 85], [790, 300, 48], [880, 130, 40]
  ];
  blobs.forEach(([x, y, r]) => {
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(x + (Math.random() - 0.5) * r, y + (Math.random() - 0.5) * r * 0.7,
        r * (0.3 + Math.random() * 0.45), 0, Math.PI * 2);
      ctx.fill();
    }
  });
  // polar caps + cloud swirls
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(0, 0, 1024, 26);
  ctx.fillRect(0, 486, 1024, 26);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 7;
  for (let i = 0; i < 26; i++) {
    ctx.beginPath();
    const y = Math.random() * 512;
    ctx.moveTo(Math.random() * 1024, y);
    ctx.bezierCurveTo(Math.random() * 1024, y - 24, Math.random() * 1024, y + 24, Math.random() * 1024, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(30, 48, 32),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0 })
  );
  earth.position.set(-6, -46, -26);
  earth.rotation.z = 0.41;
  earth.userData.noPick = true;
  earth.name = 'earth-decor';
  scene.add(earth);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(90, 140, 255, 0.5)', 'rgba(90, 140, 255, 0)'),
    transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.position.copy(earth.position);
  halo.scale.setScalar(88);
  halo.userData.noPick = true;
  scene.add(halo);
  scene.userData.earth = earth;
})();

/* ---------------- placeholders ---------------- */

const placeholderMat = new THREE.MeshStandardMaterial({
  color: 0x46587a, metalness: 0.65, roughness: 0.42
});
const placeholderAccent = new THREE.MeshStandardMaterial({
  color: 0x7fb2ff, metalness: 0.4, roughness: 0.35, emissive: 0x1c3a66, emissiveIntensity: 0.7
});

function panelPair(w) {
  const g = new THREE.Group();
  [-1, 1].forEach(s => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.42, 0.06), placeholderAccent);
    p.position.x = s * (w * 0.85);
    g.add(p);
  });
  return g;
}

function makePlaceholder(kind) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat || placeholderMat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };
  if (kind === 'station') {
    add(new THREE.CylinderGeometry(0.16, 0.16, 3.4, 12), placeholderMat, 0, 0, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 14), placeholderMat, -0.7, 0, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 14), placeholderMat, 0.8, 0, 0, 0, 0, Math.PI / 2);
    g.add(panelPair(1.15));
  } else if (kind === 'telescope') {
    add(new THREE.CylinderGeometry(0.5, 0.55, 1.9, 18), placeholderMat, 0, 0.1, 0, Math.PI / 2.4);
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 10), placeholderMat, 0, -0.75, 0);
    const dish = add(new THREE.SphereGeometry(0.55, 18, 10, 0, Math.PI * 2, 0, 0.9), placeholderAccent, 0, -1.05, 0.35, Math.PI / 2.6);
    dish.scale.z = 0.45;
    const wings = panelPair(0.95);
    wings.position.y = 0.35;
    g.add(wings);
  } else if (kind === 'rover') {
    add(new THREE.BoxGeometry(1.7, 0.55, 1.1), placeholderMat, 0, 0.45, 0);
    add(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 8), placeholderMat, -0.5, 1.15, 0);
    add(new THREE.BoxGeometry(0.45, 0.25, 0.3), placeholderAccent, -0.5, 1.7, 0);
    [-0.62, 0, 0.62].forEach(x => [-0.62, 0.62].forEach(z =>
      add(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 14), placeholderMat, x, 0, z, Math.PI / 2)
    ));
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), placeholderAccent, 0.6, 0.9, 0.3, 0, 0, -0.7);
  } else { // rocket
    add(new THREE.CylinderGeometry(0.42, 0.46, 2.6, 18), placeholderMat, 0, 0.2, 0);
    add(new THREE.CylinderGeometry(0.2, 0.42, 0.9, 18), placeholderMat, 0, 1.95, 0);
    add(new THREE.ConeGeometry(0.2, 0.55, 18), placeholderAccent, 0, 2.65, 0);
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(a => {
      const fin = add(new THREE.BoxGeometry(0.08, 0.8, 0.45), placeholderAccent,
        Math.cos(a) * 0.5, -0.95, Math.sin(a) * 0.5);
      fin.lookAt(new THREE.Vector3(Math.cos(a) * 4, -0.95, Math.sin(a) * 4));
    });
  }
  return g;
}

/* ---------------- craft rigs + model loading ---------------- */

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const pickMeshes = [];
const rigs = [];

CRAFT.forEach((craft, i) => {
  const rig = new THREE.Group();
  rig.position.fromArray(craft.position);
  rig.userData.craftIndex = i;
  const spinner = new THREE.Group();
  rig.add(spinner);
  const placeholder = makePlaceholder(craft.kind);
  spinner.add(placeholder);
  // thin pedestal ring floating under each craft
  const pedestal = new THREE.Mesh(
    new THREE.TorusGeometry(craft.targetSize * 0.52, 0.035, 10, 64),
    new THREE.MeshBasicMaterial({ color: 0x39548c, transparent: true, opacity: 0.65 })
  );
  pedestal.rotation.x = Math.PI / 2;
  pedestal.position.y = -craft.targetSize * 0.62;
  pedestal.userData.noPick = true;
  rig.add(pedestal);
  scene.add(rig);

  const entry = {
    craft, rig, spinner, placeholder, pedestal,
    model: null, failed: false, bobPhase: Math.random() * Math.PI * 2
  };
  rigs.push(entry);
  placeholder.traverse(o => { if (o.isMesh) { o.userData.craftIndex = i; pickMeshes.push(o); } });

  gltfLoader.load(craft.file,
    gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const s = craft.targetSize / maxDim;
      model.scale.setScalar(s);
      model.position.set(-center.x * s, -center.y * s, -center.z * s);
      const holder = new THREE.Group();
      holder.add(model);
      spinner.remove(placeholder);
      placeholder.traverse(o => {
        if (o.isMesh) {
          const k = pickMeshes.indexOf(o);
          if (k >= 0) pickMeshes.splice(k, 1);
        }
      });
      spinner.add(holder);
      entry.model = holder;
      model.traverse(o => { if (o.isMesh) { o.userData.craftIndex = i; pickMeshes.push(o); } });
      if (selected === i) updatePanel();
    },
    undefined,
    () => {
      entry.failed = true;
      if (selected === i) updatePanel();
    }
  );
});

/* ---------------- selection ring ---------------- */

const ring = new THREE.Mesh(
  new THREE.RingGeometry(0.86, 1.0, 72),
  new THREE.MeshBasicMaterial({
    color: 0xffb35c, transparent: true, opacity: 0.9,
    side: THREE.DoubleSide, depthWrite: false
  })
);
ring.visible = false;
ring.userData.noPick = true;
scene.add(ring);

/* ---------------- UI: fleet list + info panel ---------------- */

const listEl = document.getElementById('craft-list');
CRAFT.forEach((craft, i) => {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'craft-item';
  btn.dataset.index = i;
  btn.innerHTML = '<span class="ci-name"></span><span class="ci-meta"></span>';
  btn.querySelector('.ci-name').textContent = craft.name;
  btn.querySelector('.ci-meta').textContent = craft.type + ' · ' + craft.launched;
  btn.addEventListener('click', () => select(i, true));
  li.appendChild(btn);
  listEl.appendChild(li);
});
const listButtons = listEl.querySelectorAll('.craft-item');

const panel = {
  eyebrow: document.getElementById('panel-eyebrow'),
  name: document.getElementById('panel-name'),
  origin: document.getElementById('panel-origin'),
  tagline: document.getElementById('panel-tagline'),
  stats: document.getElementById('panel-stats'),
  agency: document.getElementById('stat-agency'),
  launch: document.getElementById('stat-launch'),
  type: document.getElementById('stat-type'),
  description: document.getElementById('panel-description'),
  factWrap: document.getElementById('panel-fact-wrap'),
  factLabel: document.querySelector('#panel-fact-wrap .fact-label'),
  fact: document.getElementById('panel-fact')
};

let selected = -1;

function updatePanel() {
  if (selected < 0) return;
  const { craft, failed, model } = rigs[selected];
  panel.eyebrow.textContent = 'Now viewing · ' + craft.type;
  panel.name.textContent = craft.name;
  panel.origin.textContent = 'Model: NASA 3D Resources · public domain';
  panel.tagline.textContent = craft.tagline;
  panel.stats.hidden = false;
  panel.agency.textContent = craft.agency;
  panel.launch.textContent = craft.launched;
  panel.type.textContent = craft.type;
  panel.description.textContent = craft.description;
  if (failed) {
    panel.factLabel.textContent = 'Model note';
    panel.fact.textContent = 'Model unavailable — see model-sources.txt for the NASA source file. You are looking at a placeholder silhouette of the ' + craft.name + '.';
  } else {
    panel.factLabel.textContent = 'Did you know?';
    panel.fact.textContent = craft.fact;
    if (!model) panel.fact.textContent = 'The real NASA model is still downloading — a placeholder silhouette is holding its place. ' + craft.fact;
  }
}

/* ---------------- camera easing ---------------- */

let camAnim = null;
function easeCamera(toPos, toTgt) {
  camAnim = {
    t: 0,
    fromPos: camera.position.clone(), toPos: toPos.clone(),
    fromTgt: controls.target.clone(), toTgt: toTgt.clone()
  };
}

function select(i, fly) {
  selected = i;
  listButtons.forEach((b, k) => b.classList.toggle('active', k === i));
  if (i < 0) {
    ring.visible = false;
    if (fly) easeCamera(HOME_POS, HOME_TGT);
    return;
  }
  updatePanel();
  if (fly) {
    const { craft, rig } = rigs[i];
    const wide = window.innerWidth > 1023;
    // aim a touch right of the craft so it sits left-of-centre, clear of the fleet panel
    const tgt = rig.position.clone();
    if (wide) tgt.x += craft.targetSize * 0.55;
    const dir = camera.position.clone().sub(controls.target).normalize();
    dir.y = Math.max(dir.y, 0.25);
    dir.normalize();
    const dist = craft.targetSize * 2.7 + 2.2;
    easeCamera(rig.position.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, 0.6, 0)), tgt);
  }
}

/* ---------------- picking + tooltip ---------------- */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;

function castAt(x, y) {
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
  // stage may be an inset block on mobile; use its rect instead of the window
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickMeshes, false);
  return hits.length ? hits[0].object.userData.craftIndex : -1;
}

renderer.domElement.addEventListener('pointerdown', e => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener('pointerup', e => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // it was a drag
  select(castAt(e.clientX, e.clientY), true);
});
renderer.domElement.addEventListener('pointermove', e => {
  const hit = castAt(e.clientX, e.clientY);
  if (hit >= 0) {
    tooltip.textContent = CRAFT[hit].name;
    tooltip.style.left = e.clientX + 'px';
    tooltip.style.top = e.clientY + 'px';
    tooltip.classList.add('show');
    renderer.domElement.style.cursor = 'pointer';
  } else {
    tooltip.classList.remove('show');
    renderer.domElement.style.cursor = '';
  }
});
window.addEventListener('keydown', e => { if (e.key === 'Escape') select(-1, true); });

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

  rigs.forEach((entry, i) => {
    if (!reduceMotion) {
      entry.spinner.rotation.y += dt * entry.craft.spin * (selected === i ? 1.6 : 1);
      entry.rig.position.y = entry.craft.position[1] + Math.sin(t * 0.55 + entry.bobPhase) * 0.14;
    }
  });
  if (scene.userData.earth) scene.userData.earth.rotation.y += dt * 0.004;

  if (selected >= 0) {
    const entry = rigs[selected];
    ring.visible = true;
    ring.position.copy(entry.rig.position);
    ring.lookAt(camera.position);
    const base = entry.craft.targetSize * 0.78;
    const pulse = reduceMotion ? 1 : 1 + Math.sin(t * 2.4) * 0.045;
    ring.scale.setScalar(base * pulse);
    ring.material.opacity = 0.65 + (reduceMotion ? 0.2 : Math.sin(t * 2.4) * 0.2);
  } else {
    ring.visible = false;
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
