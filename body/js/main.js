// BodyVerse — interactive 3D human body explorer.
// Original code: a stylised "glass mannequin" figure with procedurally
// modelled organs, built with Three.js primitives, curves and lathes.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ORGANS, SYSTEMS } from "./organs.js";

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

/* ---------------- organ builders ---------------- */
// BRAIN — two wrinkled hemispheres + cerebellum
{
  const g = new THREE.Group();
  // soft matte finish, slightly pink-grey realistic tone (wrinkles unchanged)
  const m = organMat("brain", {
    color: 0xd3a1a9, roughness: 0.85, clearcoat: 0.06, clearcoatRoughness: 0.9, envMapIntensity: 0.25,
  });
  for (const s of [-1, 1]) {
    const hemi = mesh(wrinkle(new THREE.SphereGeometry(1.02, 28, 20), 0.045, 8), m, s * 0.6, 0.12, 0);
    hemi.scale.set(0.88, 0.8, 1.18);
    g.add(hemi);
  }
  const cereb = mesh(wrinkle(new THREE.SphereGeometry(0.72, 20, 14), 0.03, 10), m, 0, -0.62, -0.72);
  cereb.scale.set(1.15, 0.6, 0.7);
  g.add(cereb);
  g.position.set(0, 19.75, 0.05);
  registerOrgan("brain", g, 8);
}
// SPINAL CORD — curved tube + vertebra hints
{
  const anchor = new THREE.Vector3(0, 12.2, -0.95);
  const pts = [[0, 6.4, 0.1], [0, 2.8, -0.05], [0, -1.2, -0.1], [0, -4.7, 0], [0, -6.4, 0.15]]
    .map((p) => [p[0], p[1], p[2]]);
  const g = new THREE.Group();
  g.add(tube(pts, 0.26, organMat("spinal-cord", { roughness: 0.5 })));
  const bone = std(0xe9e1cd, { transparent: true, opacity: 0.55, roughness: 0.65 });
  for (let i = 0; i < 8; i++) {
    g.add(mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.2, 14), bone, 0, 5.4 - i * 1.55, -0.32));
  }
  g.position.copy(anchor);
  registerOrgan("spinal-cord", g, 12);
}
// THYROID — two lobes + bridge
{
  const g = new THREE.Group();
  const m = organMat("thyroid");
  for (const s of [-1, 1]) {
    const lobe = mesh(new THREE.SphereGeometry(0.4, 18, 14), m, s * 0.38, 0, 0);
    lobe.scale.set(0.8, 1.15, 0.62);
    g.add(lobe);
  }
  const bridge = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.62, 10), m, 0, -0.05, 0.05);
  bridge.rotation.z = Math.PI / 2;
  g.add(bridge);
  g.position.set(0, 16.2, 1.0);
  registerOrgan("thyroid", g, 6);
}
// TRACHEA — ribbed tube splitting into bronchi
{
  const g = new THREE.Group();
  const m = organMat("trachea", { roughness: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(0.33, 0.33, 3.1, 16), m, 0, 0, 0));
  const ringM = std(0xd8eef7, { roughness: 0.5 });
  for (let i = 0; i < 7; i++) {
    const r = mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 20), ringM, 0, 1.3 - i * 0.43, 0);
    r.rotation.x = Math.PI / 2;
    g.add(r);
  }
  for (const s of [-1, 1]) {
    const b = mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.7, 12), m, s * 0.62, -2.05, 0);
    b.rotation.z = s * -0.6;
    g.add(b);
  }
  g.position.set(0, 14.3, 0.55);
  registerOrgan("trachea", g, 9);
}
// LUNGS — lathe-profiled pair, right larger than left
{
  const pts = [];
  [[0.01, 0], [0.82, 0.15], [1.12, 1.1], [1.08, 2.7], [0.78, 4.1], [0.34, 4.9], [0.01, 5.05]]
    .forEach((p) => pts.push(new THREE.Vector2(p[0], p[1])));
  const geo = new THREE.LatheGeometry(pts, 28);
  const g = new THREE.Group();
  const m = organMat("lungs", {
    transparent: true, opacity: 0.92, roughness: 0.55,
    bumpMap: spongeBump, bumpScale: 0.03, // spongy fine-noise surface
    clearcoat: 0.55, clearcoatRoughness: 0.35,
  });
  const right = mesh(geo, m, -2.0, 0, 0); right.scale.set(1.12, 1.02, 1.0);
  const left = mesh(geo, m, 2.0, 0, 0); left.scale.set(0.94, 0.96, 0.94);
  g.add(right, left);
  g.position.set(0, 10.15, -0.1);
  registerOrgan("lungs", g, 13);
}
// HEART — sphere + tilted cone apex, aorta stub on top
{
  const g = new THREE.Group();
  const m = organMat("heart", {
    roughness: 0.34, map: veinMap, bumpMap: veinBump, bumpScale: 0.02,
    clearcoat: 0.9, clearcoatRoughness: 0.28, // wet sheen
  });
  const bodyM = mesh(new THREE.SphereGeometry(1.08, 26, 20), m, 0, 0.35, 0);
  bodyM.scale.set(1.05, 1.05, 1.0);
  g.add(bodyM);
  const apex = mesh(new THREE.ConeGeometry(0.8, 1.7, 22), m, 0.38, -0.78, 0.05);
  apex.rotation.z = 2.72; // point the cone down-left
  apex.rotation.x = 0.15;
  g.add(apex);
  const stub = mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.85, 14), m, -0.18, 1.42, -0.1);
  stub.rotation.z = 0.25;
  g.add(stub);
  const venaStub = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.7, 12), std(0x3f6fd9), 0.62, 1.3, -0.15);
  g.add(venaStub);
  g.position.set(0.55, 11.95, 0.72);
  registerOrgan("heart", g, 8.5);
}
// AORTA & VENA CAVA — arching red tube + parallel blue return
{
  const anchor = new THREE.Vector3(0.1, 10.2, 0);
  const g = new THREE.Group();
  g.add(tube(
    [[0.45, 3.1, 0.6], [0.35, 4.4, 0.25], [-0.15, 4.85, -0.35], [-0.42, 4.2, -0.55],
     [-0.4, 1.8, -0.55], [-0.35, -1.8, -0.55], [-0.3, -5.0, -0.45]],
    0.29, organMat("aorta", { roughness: 0.35 })
  ));
  g.add(tube(
    [[0.85, -5.2, 0.25], [0.88, -1.8, 0.12], [0.85, 1.8, 0.3], [0.8, 2.9, 0.55]],
    0.31, std(0x3f6fd9, { roughness: 0.35 })
  ));
  g.position.copy(anchor);
  registerOrgan("aorta", g, 12);
}
// DIAPHRAGM — flattened dome under the lungs
{
  const g = new THREE.Group();
  const dome = mesh(
    new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    organMat("diaphragm", { side: THREE.DoubleSide, roughness: 0.55 }),
    0, 0, 0
  );
  dome.scale.set(3.55, 1.15, 2.6);
  g.add(dome);
  g.position.set(0, 10.55, -0.05);
  registerOrgan("diaphragm", g, 12);
}

// LIVER — big flattened lobe + smaller left lobe
{
  const g = new THREE.Group();
  const m = organMat("liver", {
    roughness: 0.36, map: veinMap, bumpMap: veinBump, bumpScale: 0.02,
    clearcoat: 0.85, clearcoatRoughness: 0.3, // wet sheen + marbled veins
  });
  const main = mesh(new THREE.SphereGeometry(1.72, 28, 20), m, 0, 0, 0);
  main.scale.set(1.45, 0.6, 1.02);
  g.add(main);
  const lobe = mesh(new THREE.SphereGeometry(0.95, 22, 16), m, 2.15, 0.08, 0.05);
  lobe.scale.set(1.15, 0.5, 0.85);
  g.add(lobe);
  g.position.set(-1.7, 10.0, 0.25);
  registerOrgan("liver", g, 11);
}
// GALLBLADDER — small green pear under the liver
{
  const g = new THREE.Group();
  const pear = mesh(new THREE.SphereGeometry(0.42, 18, 14), organMat("gallbladder", { roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.3 }), 0, 0, 0);
  pear.scale.set(0.85, 1.25, 0.85);
  g.add(pear);
  g.position.set(-1.85, 9.3, 1.05);
  registerOrgan("gallbladder", g, 6);
}
// STOMACH — J-shaped tube
{
  const anchor = new THREE.Vector3(1.0, 9.85, 0.35);
  const g = new THREE.Group();
  g.add(tube(
    [[-0.15, 1.5, 0], [0.3, 1.05, 0], [0.52, 0.25, 0], [0.4, -0.6, 0], [-0.15, -1.0, 0], [-0.85, -0.85, 0], [-1.1, -0.3, 0]],
    0.5, organMat("stomach", { roughness: 0.45 }), 48
  ));
  g.position.copy(anchor);
  registerOrgan("stomach", g, 9);
}
// PANCREAS — soft elongated gland behind the stomach
{
  const g = new THREE.Group();
  const m = organMat("pancreas", { roughness: 0.55 });
  const bodyP = mesh(new THREE.SphereGeometry(0.8, 20, 14), m, 0, 0, 0);
  bodyP.scale.set(1.85, 0.42, 0.55);
  bodyP.rotation.z = -0.22;
  g.add(bodyP);
  g.add(mesh(new THREE.SphereGeometry(0.44, 16, 12), m, -1.35, -0.28, 0));
  g.position.set(0.4, 9.5, -0.5);
  registerOrgan("pancreas", g, 9);
}
// SPLEEN — small oval, upper left
{
  const g = new THREE.Group();
  const s = mesh(new THREE.SphereGeometry(0.72, 20, 14), organMat("spleen", { roughness: 0.45 }), 0, 0, 0);
  s.scale.set(0.62, 1.0, 0.42);
  s.rotation.z = 0.35;
  g.add(s);
  g.position.set(2.8, 10.1, -0.4);
  registerOrgan("spleen", g, 7);
}
// KIDNEYS — pair of beans + ureter tubes to the bladder
{
  const g = new THREE.Group();
  const m = organMat("kidneys", { roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.3 });
  const dark = std(0x6e1f38, { roughness: 0.5 });
  for (const s of [-1, 1]) {
    const bean = mesh(new THREE.SphereGeometry(0.85, 22, 16), m, s * 2.15, 0, 0);
    bean.scale.set(0.75, 1.05, 0.55);
    bean.rotation.z = s * -0.12;
    g.add(bean);
    g.add(mesh(new THREE.SphereGeometry(0.34, 14, 10), dark, s * 1.68, -0.05, 0.3)); // hilum indent
  }
  const ureterM = std(0xd98aa6, { roughness: 0.5 });
  g.add(tube([[-1.75, -0.75, 0.15], [-1.15, -2.0, 0.7], [-0.4, -3.35, 1.35]], 0.09, ureterM, 24));
  g.add(tube([[1.75, -0.75, 0.15], [1.15, -2.0, 0.7], [0.4, -3.35, 1.35]], 0.09, ureterM, 24));
  g.position.set(0, 8.85, -0.95);
  registerOrgan("kidneys", g, 10);
}
// SMALL INTESTINE — serpentine coil in the lower abdomen
{
  const pts = [];
  const turns = 64;
  for (let i = 0; i <= turns; i++) {
    const t = i / turns;
    pts.push([
      1.5 * Math.sin(t * Math.PI * 7),
      -1.05 + 2.1 * t,
      0.28 * Math.sin(t * Math.PI * 14),
    ]);
  }
  const g = new THREE.Group();
  g.add(tube(pts, 0.3, organMat("small-intestine", { roughness: 0.5 }), 220));
  g.position.set(0, 6.95, 0.3);
  registerOrgan("small-intestine", g, 10);
}
// LARGE INTESTINE — frame around the small intestine
{
  const g = new THREE.Group();
  g.add(tube(
    [[-2.1, -1.6, 0], [-2.15, 0.2, 0], [-2.05, 1.45, 0], [-0.6, 1.68, 0],
     [1.2, 1.62, 0], [2.05, 1.35, 0], [2.1, -0.4, 0], [2.0, -1.35, 0], [0.9, -1.8, -0.1], [0.05, -1.95, -0.1]],
    0.46, organMat("large-intestine", { roughness: 0.5 }), 120
  ));
  g.position.set(0, 7.05, 0.1);
  registerOrgan("large-intestine", g, 12);
}
// APPENDIX — tiny tube off the start of the large intestine
{
  const g = new THREE.Group();
  g.add(tube([[0, 0.35, 0], [0.12, -0.05, 0.05], [0.05, -0.45, 0.02]], 0.11, organMat("appendix"), 16));
  g.add(mesh(new THREE.SphereGeometry(0.13, 10, 8), organMat("appendix"), 0.05, -0.5, 0.02));
  g.position.set(-2.1, 5.15, 0.2);
  registerOrgan("appendix", g, 5);
}
// BLADDER — stretchy sac in the pelvis
{
  const g = new THREE.Group();
  const m = organMat("bladder", { roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.32 });
  const sac = mesh(new THREE.SphereGeometry(0.82, 22, 16), m, 0, 0.15, 0);
  sac.scale.set(0.95, 1.0, 0.85);
  g.add(sac);
  const neck = mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.55, 12), m, 0, -0.72, 0);
  g.add(neck);
  g.position.set(0, 5.05, 0.55);
  registerOrgan("bladder", g, 7);
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
function updateLabels() {
  if (!labelsOn) return;
  for (const [id, g] of organGroups) {
    const d = labelDivs.get(id);
    g.getWorldPosition(_v);
    const facing = _c.copy(_v).sub(BODY_CENTER).normalize()
      .dot(camera.position.clone().sub(BODY_CENTER).normalize());
    _v.y += 0.9;
    _v.project(camera);
    if (_v.z > 1 || _v.z < -1) { d.style.opacity = "0"; continue; }
    d.style.left = ((_v.x * 0.5 + 0.5) * window.innerWidth) + "px";
    d.style.top = ((-_v.y * 0.5 + 0.5) * window.innerHeight) + "px";
    d.style.opacity = String(THREE.MathUtils.clamp((facing + 0.45) / 0.9, 0.08, 1));
  }
}

/* ---------------- picking (hover + click) ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");
let downX = 0, downY = 0;

function pickAt(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderList();
animate();
requestAnimationFrame(() => document.getElementById("loader").classList.add("done"));
