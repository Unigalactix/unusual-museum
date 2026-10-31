// BodyVerse — interactive 3D human body explorer.
// Original code: a stylised "glass mannequin" figure with procedurally
// modelled organs, built with Three.js primitives, curves and lathes.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ORGANS, SYSTEMS, ORGAN_BUILDERS, ORGAN_PLACEMENTS, ORGAN_FOCUS_DISTS } from "./organs.js";

const organById = new Map(ORGANS.map((o) => [o.id, o]));
const BODY_CENTER = new THREE.Vector3(0, 11, 0);

/* ---------------- renderer / scene / camera ---------------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("scene"),
    antialias: true,
    alpha: true,
  });
} catch (e) {
  document.getElementById("webgl-error").hidden = false;
  document.getElementById("loader").classList.add("done");
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
// Life-like output: filmic tone mapping, sRGB output, soft shadows.
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070f, 0.0038);

// Soft studio reflections for the physical materials (kept subtle via
// envMapIntensity ~0.35 on the materials themselves).
{
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
}

const camera = new THREE.PerspectiveCamera(
  46,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.set(6, 13.5, 31);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 11.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI * 0.92;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;

/* ---------------- responsive framing ----------------
   Three-column layout: the canvas fills only the centre column (and
   becomes a 56vh block in the mobile single-column layout), so all
   sizing / projection math goes through the canvas rect, never the
   window. The side columns are real layout, not overlays, so the
   figure is projected dead-centre in the stage — no view offset. */
function viewRect() { return renderer.domElement.getBoundingClientRect(); }
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
resizeView();

/* ---------------- lights ---------------- */
scene.add(new THREE.AmbientLight(0xbcd2ff, 0.55));
const key = new THREE.DirectionalLight(0xfff1de, 1.6); // slightly warm key
key.position.set(8, 24, 12);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -12;
key.shadow.camera.right = 12;
key.shadow.camera.top = 14;
key.shadow.camera.bottom = -14;
key.shadow.camera.near = 2;
key.shadow.camera.far = 70;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.03;
key.target.position.set(0, 11, 0);
scene.add(key, key.target);
const rim = new THREE.PointLight(0x4db8ff, 60, 90);
rim.position.set(-14, 16, -12);
scene.add(rim);
const warm = new THREE.PointLight(0xff9a66, 32, 60); // warmer platform glow
warm.position.set(12, 7, -8);
scene.add(warm);

/* ---------------- helpers ---------------- */
// Procedural canvas textures — no external assets. A near-white vein/marble
// canvas (multiplies the organ colour, so hues stay true) for heart & liver,
// and a fine spongy noise canvas used as a bump map for the lungs.
function makeCanvas(size, draw) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  return c;
}
function texFrom(canvas, { srgb = false, repeat = 2 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const veinCanvas = makeCanvas(256, (ctx, s) => {
  ctx.fillStyle = "#f4ecec";
  ctx.fillRect(0, 0, s, s);
  // soft marble blotches
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * s, y = Math.random() * s, r = 20 + Math.random() * 60;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(190,150,150,0.16)");
    g.addColorStop(1, "rgba(190,150,150,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  // branching veins (random walks)
  ctx.strokeStyle = "rgba(150,80,90,0.35)";
  ctx.lineCap = "round";
  for (let i = 0; i < 22; i++) {
    let x = Math.random() * s, y = Math.random() * s, a = Math.random() * Math.PI * 2;
    ctx.lineWidth = 0.6 + Math.random() * 1.6;
    ctx.beginPath(); ctx.moveTo(x, y);
    const steps = 8 + Math.floor(Math.random() * 10);
    for (let j = 0; j < steps; j++) {
      a += (Math.random() - 0.5) * 0.9;
      x += Math.cos(a) * 9; y += Math.sin(a) * 9;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
});
const veinMap = texFrom(veinCanvas, { srgb: true });
const veinBump = texFrom(veinCanvas); // bump reads luminance — veins sit slightly in
const spongeCanvas = makeCanvas(256, (ctx, s) => {
  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 3200; i++) {
    const v = 110 + Math.floor(Math.random() * 90);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, 0.6 + Math.random() * 2.2, 0, 7);
    ctx.fill();
  }
  for (let i = 0; i < 160; i++) { // larger soft pores
    const x = Math.random() * s, y = Math.random() * s, r = 3 + Math.random() * 4;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(70,70,70,0.5)");
    g.addColorStop(1, "rgba(70,70,70,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
});
const spongeBump = texFrom(spongeCanvas, { repeat: 3 });

function std(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.42,
    metalness: 0.05,
    emissive: color,
    emissiveIntensity: 0,
    // subtle wet sheen + gentle studio reflections by default;
    // hero organs raise the clearcoat in their own options.
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.35,
    ...opts,
  });
}
function organMat(id, opts = {}) {
  return std(organById.get(id).color, opts);
}
// Slightly displace sphere vertices with trig "wrinkles" (brain folds, texture).
function wrinkle(geo, amp = 0.05, freq = 7) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const d =
      amp *
      (Math.sin(v.x * freq + v.y * 3.1) *
        Math.sin(v.y * freq * 0.9 + v.z * 2.3) *
        Math.sin(v.z * freq * 1.1 + v.x * 1.7));
    v.addScaledVector(n, d);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
function tube(points, radius, material, segments = 64) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p))
  );
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, segments, radius, 10, false),
    material
  );
}
function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  return m;
}

/* ---------------- platform & backdrop ---------------- */
{
  const disc = mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({ color: 0x1c1512, roughness: 0.85, envMapIntensity: 0.3 }),
    0, 0, 0
  );
  disc.rotation.x = -Math.PI / 2;
  disc.receiveShadow = true; // grounds the figure with a soft contact shadow
  scene.add(disc);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(9, 9.35, 64),
    new THREE.MeshBasicMaterial({ color: 0x4db8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);
  const grid = new THREE.PolarGridHelper(9, 12, 6, 48, 0x2a4a7f, 0x1a2c4d);
  grid.position.y = 0.02;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);
  // distant dust particles for depth
  const n = 420, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 45 + Math.random() * 55, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    arr[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.7;
    arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x6f87b8, size: 0.35, transparent: true, opacity: 0.7 })));
}

/* ---------------- body shell (glass mannequin) ---------------- */
const shellMat = new THREE.MeshPhysicalMaterial({
  color: 0xbfd9ff,
  transparent: true,
  opacity: 0.32,
  roughness: 0.12,
  metalness: 0,
  clearcoat: 0.6,
  clearcoatRoughness: 0.25,
  // fresnel-ish skin sheen: sheen peaks at grazing angles, env adds the rim.
  // (Opacity is still driven solely by the X-ray slider in applyXray().)
  sheen: 0.6,
  sheenRoughness: 0.5,
  sheenColor: 0x9fc8ff,
  specularIntensity: 1.0,
  envMapIntensity: 0.55,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const shell = new THREE.Group();
{
  const profile = [
    [0.01, 4.4], [2.15, 4.7], [2.85, 6.4], [3.0, 9.0], [2.9, 11.5],
    [3.3, 13.4], [3.45, 15.1], [2.55, 16.1], [1.05, 16.6], [0.92, 17.5],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), shellMat);
  torso.scale.z = 0.76;
  shell.add(torso);
  const head = mesh(new THREE.SphereGeometry(2.25, 40, 28), shellMat, 0, 19.35, 0);
  head.scale.set(0.92, 1.06, 0.98);
  shell.add(head);
  shell.add(mesh(new THREE.CylinderGeometry(0.92, 1.02, 1.7, 24), shellMat, 0, 16.9, 0));
  // subtle upper-arm hints
  for (const s of [-1, 1]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.6, 2.4, 6, 14), shellMat, s * 3.75, 14.3, 0);
    arm.rotation.z = s * 0.42;
    shell.add(arm);
  }
  // ribcage hint: bone-white arcs around the chest
  const bone = new THREE.MeshStandardMaterial({
    color: 0xe9e1cd, roughness: 0.6, transparent: true, opacity: 0.34, emissive: 0xe9e1cd, emissiveIntensity: 0,
  });
  for (let i = 0; i < 5; i++) {
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(3.28 - i * 0.1, 0.07, 8, 48, Math.PI * 1.32),
      bone
    );
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = Math.PI * 0.84;
    rib.scale.set(1, 0.78, 1);
    rib.position.y = 12.5 + i * 0.78;
    shell.add(rib);
  }
}
scene.add(shell);

/* ---------------- organ registry ---------------- */
const organGroups = new Map(); // id -> group
function registerOrgan(id, group, focusDist = 11) {
  group.userData.organId = id;
  group.userData.basePos = group.position.clone();
  const dir = group.position.clone().sub(BODY_CENTER);
  group.userData.explodeDir = dir.lengthSq() > 0.01 ? dir.normalize() : new THREE.Vector3(0, 0, 1);
  group.userData.focusDist = focusDist;
  group.traverse((c) => {
    c.userData.organId = id;
    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
  });
  organGroups.set(id, group);
  scene.add(group);
  return group;
}

/* ---------------- organ builders (anatomy set lives in organs.js) ---------------- */
const builderCtx = { organMat, std, tube, mesh, wrinkle, veinMap, veinBump, spongeBump };
for (const o of ORGANS) {
  const g = ORGAN_BUILDERS[o.id](THREE, builderCtx);
  g.position.set(...ORGAN_PLACEMENTS[o.id]);
  registerOrgan(o.id, g, ORGAN_FOCUS_DISTS[o.id]);
}

/* ---------------- UI: explorer list, chips, search ---------------- */
const listEl = document.getElementById("organ-list");
const chipsEl = document.getElementById("system-chips");
const searchEl = document.getElementById("search");
let filterSystem = "All";
let filterQuery = "";

["All", ...SYSTEMS].forEach((sys) => {
  const b = document.createElement("button");
  b.className = "chip" + (sys === "All" ? " active" : "");
  b.textContent = sys;
  b.addEventListener("click", () => {
    filterSystem = sys;
    chipsEl.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    renderList();
  });
  chipsEl.appendChild(b);
});
searchEl.addEventListener("input", () => {
  filterQuery = searchEl.value.trim().toLowerCase();
  renderList();
});

function renderList() {
  listEl.innerHTML = "";
  let any = false;
  for (const sys of SYSTEMS) {
    if (filterSystem !== "All" && filterSystem !== sys) continue;
    const items = ORGANS.filter(
      (o) => o.system === sys && o.name.toLowerCase().includes(filterQuery)
    );
    if (!items.length) continue;
    any = true;
    const wrap = document.createElement("div");
    wrap.className = "system-group";
    const h = document.createElement("h3");
    h.textContent = sys + " system";
    wrap.appendChild(h);
    for (const o of items) {
      const btn = document.createElement("button");
      btn.className = "organ-item" + (selectedId === o.id ? " selected" : "");
      btn.dataset.id = o.id;
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = "#" + o.color.toString(16).padStart(6, "0");
      btn.append(dot, document.createTextNode(o.name));
      btn.addEventListener("click", () => selectOrgan(o.id, true));
      wrap.appendChild(btn);
    }
    listEl.appendChild(wrap);
  }
  if (!any) {
    const p = document.createElement("p");
    p.className = "empty-note";
    p.textContent = "No organs match your search.";
    listEl.appendChild(p);
  }
}

/* ---------------- selection & info panel ---------------- */
const infoEls = {
  system: document.getElementById("info-system"),
  name: document.getElementById("info-name"),
  tagline: document.getElementById("info-tagline"),
  desc: document.getElementById("info-desc"),
  factWrap: document.getElementById("info-fact-wrap"),
  fact: document.getElementById("info-fact"),
};
let selectedId = null;
let hoveredId = null;
let focusAnim = null; // { target: Vector3, camPos: Vector3 }

function setEmissive(id, intensity) {
  const g = organGroups.get(id);
  if (!g) return;
  g.traverse((c) => {
    if (c.isMesh && c.material && "emissiveIntensity" in c.material) {
      c.material.emissiveIntensity = intensity;
    }
  });
}
function refreshHighlights() {
  for (const id of organGroups.keys()) {
    setEmissive(id, id === selectedId ? 0.55 : id === hoveredId ? 0.3 : 0);
  }
}

function selectOrgan(id, focus = false) {
  selectedId = id;
  refreshHighlights();
  document.querySelectorAll(".organ-item").forEach((el) =>
    el.classList.toggle("selected", el.dataset.id === id)
  );
  if (!id) return;
  const o = organById.get(id);
  infoEls.system.textContent = o.system + " system";
  infoEls.name.textContent = o.name;
  infoEls.tagline.textContent = o.tagline;
  infoEls.desc.textContent = o.description;
  infoEls.fact.textContent = o.fact;
  infoEls.factWrap.hidden = false;
  if (focus) {
    const g = organGroups.get(id);
    const wp = new THREE.Vector3();
    g.getWorldPosition(wp);
    const dir = camera.position.clone().sub(wp).normalize();
    if (dir.lengthSq() < 0.01) dir.set(0, 0.3, 1).normalize();
    const camPos = wp.clone().addScaledVector(dir, g.userData.focusDist);
    camPos.y = Math.max(camPos.y, wp.y + 1.2);
    focusAnim = { target: wp, camPos };
  }
}
document.getElementById("info-close").addEventListener("click", () => {
  selectOrgan(null);
  infoEls.system.textContent = "Welcome";
  infoEls.name.textContent = "Explore the body";
  infoEls.tagline.textContent = "Click any organ — or pick one from the explorer — to see what it does.";
  infoEls.desc.textContent = "Drag to rotate the figure and scroll to zoom. The heart beats and the lungs breathe on their own; use the controls below to pull the organs apart, make the body transparent, or pause the motion.";
  infoEls.factWrap.hidden = true;
});

/* ---------------- controls: sliders & toggles ---------------- */
let explodeFactor = 0;
let motionOn = true;
document.getElementById("explode").addEventListener("input", (e) => {
  explodeFactor = (Number(e.target.value) / 100) * 3.0;
});
const xrayInput = document.getElementById("xray");
function applyXray() {
  shellMat.opacity = 0.55 - (Number(xrayInput.value) / 100) * 0.52;
}
xrayInput.addEventListener("input", applyXray);
applyXray();

const labelsToggle = document.getElementById("labels-toggle");
let labelsOn = true;
labelsToggle.addEventListener("click", () => {
  labelsOn = !labelsOn;
  labelsToggle.classList.toggle("active", labelsOn);
  document.getElementById("labels").style.display = labelsOn ? "block" : "none";
});
const rotateToggle = document.getElementById("rotate-toggle");
rotateToggle.addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  rotateToggle.classList.toggle("active", controls.autoRotate);
});
controls.addEventListener("start", () => {
  if (controls.autoRotate) {
    controls.autoRotate = false;
    rotateToggle.classList.remove("active");
  }
  focusAnim = null;
});
const motionToggle = document.getElementById("motion-toggle");
motionToggle.addEventListener("click", () => {
  motionOn = !motionOn;
  motionToggle.classList.toggle("active", motionOn);
});
document.getElementById("reset-view").addEventListener("click", () => {
  selectOrgan(null);
  focusAnim = {
    target: new THREE.Vector3(0, 11.5, 0),
    camPos: new THREE.Vector3(6, 13.5, 31),
  };
});

/* ---------------- labels ---------------- */
const labelsEl = document.getElementById("labels");
const labelDivs = new Map();
for (const o of ORGANS) {
  const d = document.createElement("div");
  d.className = "label";
  d.textContent = o.name;
  labelsEl.appendChild(d);
  labelDivs.set(o.id, d);
}
const _v = new THREE.Vector3();
const _c = new THREE.Vector3();
/* Label declutter: labels are placed greedily in screen space, highest
   priority first (selected organ, hovered organ, primary organs, then
   the rest); any label whose pill would overlap an already-placed pill
   is hidden, so the torso can never pile labels on top of each other.
   Zoom rule: at the default far view (camera > 26 units from the body
   centre) and with no system filter active, only the primary organs
   compete — Brain, Heart, Lungs, Liver, Stomach, Kidneys and the two
   Intestines. Zoom closer, pick a system chip, or select an organ and
   every label competes (still collision-resolved). */
const LABEL_PRIMARY = new Set([
  "brain", "heart", "lungs", "liver", "stomach", "kidneys",
  "small-intestine", "large-intestine",
]);
function updateLabels() {
  if (!labelsOn) return;
  const rect = viewRect();
  const farZoom = camera.position.distanceTo(BODY_CENTER) > 26 && filterSystem === "All";
  const candidates = [];
  for (const [id, g] of organGroups) {
    const d = labelDivs.get(id);
    g.getWorldPosition(_v);
    const facing = _c.copy(_v).sub(BODY_CENTER).normalize()
      .dot(camera.position.clone().sub(BODY_CENTER).normalize());
    _v.y += 0.9;
    _v.project(camera);
    if (_v.z > 1 || _v.z < -1) { d.style.opacity = "0"; continue; }
    const baseOpacity = THREE.MathUtils.clamp((facing + 0.45) / 0.9, 0.08, 1);
    const x = rect.left + (_v.x * 0.5 + 0.5) * rect.width;
    const y = rect.top + (-_v.y * 0.5 + 0.5) * rect.height;
    d.style.left = x + "px";
    d.style.top = y + "px";
    let priority = 10;
    if (LABEL_PRIMARY.has(id)) priority = 100;
    if (id === hoveredId) priority = 500;
    if (id === selectedId) priority = 1000;
    candidates.push({
      d, x, y, baseOpacity, priority,
      w: d.offsetWidth || 60, h: d.offsetHeight || 18,
      eligible: baseOpacity > 0.25 && (!farZoom || priority >= 100),
    });
  }
  candidates.sort((a, b) => b.priority - a.priority);
  const placed = [];
  for (const c of candidates) {
    if (!c.eligible) { c.d.style.opacity = "0"; continue; }
    // The pill is drawn above its anchor (translate -50%, -140%).
    const box = { l: c.x - c.w / 2 - 4, r: c.x + c.w / 2 + 4, t: c.y - c.h * 1.6 - 4, b: c.y + 4 };
    if (placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) {
      c.d.style.opacity = "0";
      continue;
    }
    placed.push(box);
    c.d.style.opacity = String(c.baseOpacity);
  }
}

/* ---------------- picking (hover + click) ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");
let downX = 0, downY = 0;

function pickAt(clientX, clientY) {
  const r = viewRect();
  pointer.x = ((clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
  pointer.y = -((clientY - r.top) / Math.max(1, r.height)) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...organGroups.values()], true);
  return hits.length ? hits[0].object.userData.organId : null;
}
renderer.domElement.addEventListener("pointermove", (e) => {
  const id = pickAt(e.clientX, e.clientY);
  if (id !== hoveredId) {
    hoveredId = id;
    refreshHighlights();
    renderer.domElement.style.cursor = id ? "pointer" : "grab";
  }
  if (id) {
    tooltip.style.display = "block";
    tooltip.style.left = e.clientX + "px";
    tooltip.style.top = e.clientY + "px";
    tooltip.textContent = organById.get(id).name;
  } else {
    tooltip.style.display = "none";
  }
});
renderer.domElement.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // it was a drag
  const id = pickAt(e.clientX, e.clientY);
  if (id) selectOrgan(id, true);
});

/* ---------------- animation loop ---------------- */
const clock = new THREE.Clock();
const heartGroup = organGroups.get("heart");
const lungsGroup = organGroups.get("lungs");

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // explode: ease every organ toward base + dir * factor
  for (const g of organGroups.values()) {
    const base = g.userData.basePos;
    const dir = g.userData.explodeDir;
    _v.copy(base).addScaledVector(dir, explodeFactor);
    g.position.lerp(_v, 0.12);
  }

  // physiology: heartbeat (lub-dub) + breathing, unless paused
  if (motionOn) {
    const cyc = t % 0.9;
    const pulse = Math.exp(-cyc * 9) + 0.55 * Math.exp(-Math.pow(cyc - 0.24, 2) / 0.004);
    const hs = 1 + 0.055 * pulse;
    heartGroup.scale.setScalar(hs * (selectedId === "heart" ? 1.05 : 1));
    const br = 1 + 0.035 * Math.sin(t * 1.35);
    lungsGroup.scale.set(br, 1 + 0.05 * Math.sin(t * 1.35), br);
  } else {
    heartGroup.scale.setScalar(selectedId === "heart" ? 1.05 : 1);
    lungsGroup.scale.set(1, 1, 1);
  }
  // gentle selection pulse on other organs
  for (const [id, g] of organGroups) {
    if (id === "heart" || id === "lungs") continue;
    const s = id === selectedId ? 1.04 + 0.012 * Math.sin(t * 4) : 1;
    g.scale.setScalar(s);
  }

  // camera focus animation
  if (focusAnim) {
    controls.target.lerp(focusAnim.target, 0.075);
    camera.position.lerp(focusAnim.camPos, 0.075);
    if (camera.position.distanceTo(focusAnim.camPos) < 0.08) focusAnim = null;
  }

  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}

window.addEventListener("resize", resizeView);

renderList();
animate();
requestAnimationFrame(() => document.getElementById("loader").classList.add("done"));
