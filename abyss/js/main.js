// The Abyss — Deep-Sea Specimens. Original procedural Three.js scene:
// three glass specimen tanks in an abyss void — anglerfish, viperfish,
// and a dumbo octopus — with bioluminescent details and a specimen lab UI.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { SPECIMENS } from "./specimens.js";

const canvas = document.getElementById("scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  document.getElementById("webgl-fail").hidden = false;
  document.getElementById("loading").classList.add("done");
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// Intentionally dark scene: keep exposure near the original value, do not brighten.
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02070d);
scene.fog = new THREE.FogExp2(0x02070d, 0.045);

/* Environment reflections (low intensity, selective — NOT a global ambient lift).
   Generated once via PMREM + RoomEnvironment and assigned only to glass,
   wet skins, teeth and metals, so this intentionally dark scene stays dark. */
const _pmrem = new THREE.PMREMGenerator(renderer);
const ENV_TEX = _pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
_pmrem.dispose();
function withEnv(mat, intensity = 0.35) {
  mat.envMap = ENV_TEX;
  mat.envMapIntensity = intensity;
  return mat;
}

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 11.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.6;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.72;
controls.target.set(0, 0.1, 0);

/* ---------------- lighting ---------------- */
scene.add(new THREE.AmbientLight(0x24435c, 0.7));
const moonShaft = new THREE.DirectionalLight(0x4d7ea6, 0.55);
moonShaft.position.set(-4, 10, 3);
moonShaft.castShadow = true;
moonShaft.shadow.mapSize.set(1024, 1024);
moonShaft.shadow.camera.left = -9; moonShaft.shadow.camera.right = 9;
moonShaft.shadow.camera.top = 9; moonShaft.shadow.camera.bottom = -9;
moonShaft.shadow.camera.far = 30;
moonShaft.shadow.bias = -0.0004;
moonShaft.shadow.radius = 4;
scene.add(moonShaft);
const fill = new THREE.PointLight(0x1c4b66, 12, 30, 1.8);
fill.position.set(0, 3, 6);
scene.add(fill);

/* ---------------- abyss environment ---------------- */
// Seabed: big dim disc with a radial canvas gradient so it pools under the tanks.
function seabedTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, "#16303f"); grad.addColorStop(0.55, "#0a1a26"); grad.addColorStop(1, "#02070d");
  g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "rgba(180,220,235,0.05)";
  for (let i = 0; i < 900; i++) { const r = Math.random() * 2; g.beginPath(); g.arc(Math.random() * 512, Math.random() * 512, r, 0, 7); g.fill(); }
  return new THREE.CanvasTexture(c);
}
const seabed = new THREE.Mesh(
  new THREE.CircleGeometry(30, 48),
  new THREE.MeshStandardMaterial({ map: seabedTexture(), roughness: 1, metalness: 0 })
);
seabed.rotation.x = -Math.PI / 2;
seabed.position.y = -1.55;
seabed.receiveShadow = true;
if (seabed.material.map) seabed.material.map.colorSpace = THREE.SRGBColorSpace;
seabed.material.envMap = ENV_TEX;
seabed.material.envMapIntensity = 0.12;
scene.add(seabed);

// God rays: a few large translucent cones of light from far above.
const rayMat = new THREE.MeshBasicMaterial({ color: 0x3d7ea8, transparent: true, opacity: 0.045, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
for (const [x, z, tilt] of [[-5, -3, 0.16], [1.5, -5, -0.1], [6.5, -2, 0.08]]) {
  const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 22, 24, 1, true), rayMat);
  cone.position.set(x, 8.5, z); cone.rotation.z = tilt;
  scene.add(cone);
}

// Marine snow: two drifting particle fields.
function makeSnow(count, size, spread, yRange) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = Math.random() * yRange - 2;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xbfe6f2, size, transparent: true, opacity: 0.55, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  pts.userData = { yRange, speed: 0.05 + Math.random() * 0.05 };
  scene.add(pts);
  return pts;
}
const snowFields = [makeSnow(500, 0.045, 26, 14), makeSnow(260, 0.08, 20, 12)];

/* ---------------- shared materials / helpers ---------------- */
// Canvas-generated mottled / speckle texture — cheap procedural skin detail,
// no external assets. Also reused as a subtle bump map for wet, uneven skin.
function makeSpeckleTexture({ base = "#222222", speckles = ["#111111", "#333333"], blotches = ["#1a1a1a"], size = 256, speckleCount = 2200, blotchCount = 46, repeat = 2 } = {}) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  // Large soft mottled blotches
  for (let i = 0; i < blotchCount; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = 14 + Math.random() * 52;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const col = blotches[i % blotches.length];
    grad.addColorStop(0, col + "cc"); grad.addColorStop(1, col + "00");
    g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  // Fine speckles
  for (let i = 0; i < speckleCount; i++) {
    g.fillStyle = speckles[i % speckles.length];
    g.globalAlpha = 0.12 + Math.random() * 0.5;
    const r = 0.5 + Math.random() * 1.9;
    g.beginPath(); g.arc(Math.random() * size, Math.random() * size, r, 0, 7); g.fill();
  }
  // Sparse pale flecks (scales / photophore-like dusting on predators)
  g.globalAlpha = 1;
  for (let i = 0; i < 260; i++) {
    g.fillStyle = "rgba(210,230,235,0.10)";
    g.beginPath(); g.arc(Math.random() * size, Math.random() * size, 0.4 + Math.random() * 0.9, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
const anglerTex = makeSpeckleTexture({ base: "#1c1a20", speckles: ["#0e0c12", "#2e2838", "#3a3246", "#141118"], blotches: ["#241f2e", "#100e14", "#2a2532"], repeat: 2 });
const anglerSoftTex = makeSpeckleTexture({ base: "#2a2530", speckles: ["#1a1620", "#3d3548", "#211c28"], blotches: ["#332b3e", "#1e1a26"], repeat: 2 });
const viperTex = makeSpeckleTexture({ base: "#39434e", speckles: ["#232e38", "#536473", "#6b8294", "#1e2830"], blotches: ["#2c3844", "#465766", "#222c36"], repeat: 3 });
const viperBellyTex = makeSpeckleTexture({ base: "#5a6a76", speckles: ["#42525e", "#718493", "#8aa0b0", "#36434e"], blotches: ["#4c5d6a", "#687b8a"], repeat: 3 });
const dumboTex = makeSpeckleTexture({ base: "#f2a97e", speckles: ["#e89a6c", "#f7bc92", "#dd8a5f"], blotches: ["#eda273", "#e8986a"], speckleCount: 900, blotchCount: 28, repeat: 2 });
const dumboDeepTex = makeSpeckleTexture({ base: "#dd8a5f", speckles: ["#c97a4e", "#eda273", "#b96f45"], blotches: ["#d07f52", "#c47448"], speckleCount: 900, blotchCount: 28, repeat: 2 });

const MAT = {
  // Tank glass: env reflection intensity up (main showcase for RoomEnvironment),
  // still very transparent so the dark tanks read the same.
  glass: withEnv(new THREE.MeshPhysicalMaterial({ color: 0x9fd4e8, transparent: true, opacity: 0.10, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, ior: 1.5, reflectivity: 0.6, specularIntensity: 1.0, side: THREE.DoubleSide, depthWrite: false }), 1.15),
  plinth: withEnv(new THREE.MeshStandardMaterial({ color: 0x11181d, roughness: 0.45, metalness: 0.7 }), 0.35),
  brass: withEnv(new THREE.MeshStandardMaterial({ color: 0xa8874f, roughness: 0.32, metalness: 0.9 }), 0.5),
  rimBase: withEnv(new THREE.MeshStandardMaterial({ color: 0x1d2c33, roughness: 0.4, metalness: 0.6, emissive: 0x000000 }), 0.35),
  // Teeth: glossy white physical material — low roughness + slight clearcoat.
  tooth: withEnv(new THREE.MeshPhysicalMaterial({ color: 0xf4f1e6, roughness: 0.12, metalness: 0, clearcoat: 0.65, clearcoatRoughness: 0.22, ior: 1.45, specularIntensity: 0.9 }), 0.45),
  eye: withEnv(new THREE.MeshPhysicalMaterial({ color: 0x0a0d08, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }), 0.6),
};
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}
const glowMats = []; // materials whose emissive responds to the glow slider + sonar
function glowMaterial(color, intensity = 2.2) {
  const m = new THREE.MeshStandardMaterial({ color: 0x0b1512, emissive: new THREE.Color(color), emissiveIntensity: intensity, roughness: 0.4 });
  m.userData.base = intensity;
  glowMats.push(m);
  return m;
}

/* ---------------- tank builder ---------------- */
const tanks = []; // { root, specimenGroup, data, rimMats, labelAnchor }
const TANK_X = [-5.4, 5.4, 0];
const TANK_Z = [-0.6, -0.6, 0.5];

function buildTank(i) {
  const data = SPECIMENS[i];
  const root = new THREE.Group();
  root.position.set(TANK_X[i], 0, TANK_Z[i]);

  // Plinth + plaque + tank glass (open-top cylinder) + water tint inside.
  const plinth = mesh(new THREE.CylinderGeometry(1.65, 1.85, 0.35, 36), MAT.plinth, 0, -1.37, 0);
  plinth.castShadow = true; plinth.receiveShadow = true;
  root.add(plinth);
  const plaque = mesh(new THREE.BoxGeometry(0.9, 0.42, 0.05), MAT.brass, 0, -1.15, 1.62);
  plaque.rotation.x = -0.28;
  root.add(plaque);
  const rimMat = MAT.rimBase.clone();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.045, 10, 48), rimMat);
  rim.rotation.x = Math.PI / 2; rim.position.y = 1.25;
  root.add(rim);
  const baseRim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 10, 48), rimMat);
  baseRim.rotation.x = Math.PI / 2; baseRim.position.y = -1.18;
  root.add(baseRim);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.45, 40, 1, true), MAT.glass);
  glass.position.y = 0.03;
  root.add(glass);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(1.44, 1.44, 2.35, 32),
    new THREE.MeshBasicMaterial({ color: data.id === "dumbo" ? 0x14343c : 0x0a2531, transparent: true, opacity: 0.16, depthWrite: false })
  );
  water.position.y = 0.03;
  root.add(water);

  // Tank spotlight from above + a soft uplight.
  const spot = new THREE.SpotLight(0xbfd9e8, 55, 12, 0.62, 0.55, 1.4);
  spot.position.set(0, 4.4, 0.6);
  spot.target.position.set(0, 0, 0);
  root.add(spot, spot.target);
  const up = new THREE.PointLight(0x2c6d84, 5, 5, 1.8);
  up.position.set(0, -1.1, 0);
  root.add(up);

  root.userData.specimenIndex = i;
  scene.add(root);
  const entry = { root, data, rimMat, glass, labelPos: new THREE.Vector3(TANK_X[i], 1.85, TANK_Z[i]), specimen: null, animated: {} };
  tanks.push(entry);
  return entry;
}

/* ---------------- specimen 01: humpback anglerfish ---------------- */
function buildAnglerfish(entry) {
  const g = new THREE.Group();
  // Wet clearcoat + canvas speckle/mottle — dark colours preserved, sheen added.
  const skin = withEnv(new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: anglerTex, bumpMap: anglerTex, bumpScale: 0.025, roughness: 0.34, metalness: 0.05, clearcoat: 0.85, clearcoatRoughness: 0.38, specularIntensity: 0.7 }), 0.35);
  const skinSoft = withEnv(new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: anglerSoftTex, bumpMap: anglerSoftTex, bumpScale: 0.018, roughness: 0.5, metalness: 0.02, clearcoat: 0.5, clearcoatRoughness: 0.5 }), 0.28);

  const body = mesh(new THREE.SphereGeometry(0.78, 36, 28), skin, 0, 0.05, 0);
  body.scale.set(1.05, 0.94, 1.3);
  body.castShadow = true;
  g.add(body);
  // Cavernous mouth: darker flattened sphere inset at the front.
  const mouth = mesh(new THREE.SphereGeometry(0.52, 28, 20), new THREE.MeshStandardMaterial({ color: 0x070405, roughness: 0.95 }), 0, -0.06, 0.82);
  mouth.scale.set(1.05, 0.62, 0.55);
  g.add(mouth);
  const jaw = mesh(new THREE.SphereGeometry(0.5, 24, 16), skinSoft, 0, -0.42, 0.72);
  jaw.scale.set(1.0, 0.34, 0.7);
  jaw.rotation.x = 0.35;
  g.add(jaw);
  // Rows of needle teeth along both jaws.
  const toothGeo = new THREE.ConeGeometry(0.022, 0.11, 6);
  for (let k = 0; k < 13; k++) {
    const t = k / 12, ang = Math.PI * (0.12 + 0.76 * t);
    const x = Math.cos(ang) * 0.47, y = Math.sin(ang) * 0.26;
    const upper = mesh(toothGeo, MAT.tooth, x, 0.16 - Math.abs(y) * 0.12, 0.98 - Math.abs(x) * 0.28);
    upper.rotation.x = Math.PI; upper.rotation.z = (x) * 0.7;
    g.add(upper);
    const lower = mesh(toothGeo, MAT.tooth, x * 0.92, -0.33 + Math.abs(y) * 0.05, 0.92 - Math.abs(x) * 0.3);
    lower.rotation.z = x * 0.6;
    g.add(lower);
  }
  // Small, dim eyes.
  for (const s of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.055, 14, 12), MAT.eye, s * 0.44, 0.36, 0.62);
    g.add(eye);
  }
  // Tail + fins (flattened cones/shapes).
  const finMat = withEnv(new THREE.MeshPhysicalMaterial({ color: 0x353040, bumpMap: anglerTex, bumpScale: 0.012, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }), 0.25);
  const tail = mesh(new THREE.ConeGeometry(0.34, 0.85, 4), finMat, 0, 0.05, -1.25);
  tail.rotation.x = -Math.PI / 2; tail.scale.set(1, 1, 0.22);
  g.add(tail);
  const fins = [];
  for (const s of [-1, 1]) {
    const fin = mesh(new THREE.ConeGeometry(0.2, 0.5, 4), finMat, s * 0.82, -0.15, 0.1);
    fin.rotation.z = s * Math.PI / 2.2; fin.scale.set(1, 1, 0.25);
    fin.userData.side = s;
    fins.push(fin); g.add(fin);
  }
  // The esca: curved stalk + glowing lure + real light.
  const stalkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.62, 0.55), new THREE.Vector3(0, 0.98, 0.8),
    new THREE.Vector3(0, 1.02, 1.12), new THREE.Vector3(0, 0.86, 1.34),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(stalkCurve, 20, 0.028, 8), skinSoft));
  const lureMat = glowMaterial(0x63ffd8, 3.2);
  const lure = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 14), lureMat);
  lure.position.set(0, 0.84, 1.38);
  g.add(lure);
  const lureLight = new THREE.PointLight(0x63ffd8, 6, 4.5, 1.6);
  lureLight.position.copy(lure.position);
  g.add(lureLight);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x63ffd8, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.position.copy(lure.position);
  g.add(halo);

  g.position.y = 0.12;
  entry.root.add(g);
  entry.specimen = g;
  entry.animated = { fins, tail, lureMat, lureLight, halo, baseY: 0.12, phase: 0.4 };
}

/* ---------------- specimen 02: Pacific viperfish ---------------- */
function buildViperfish(entry) {
  const g = new THREE.Group();
  // Wet silvery clearcoat + speckle texture — keeps the dark sabre read, adds
  // realistic wet specular streaks instead of flat metalness.
  const skin = withEnv(new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: viperTex, bumpMap: viperTex, bumpScale: 0.015, roughness: 0.22, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.18, specularIntensity: 0.9 }), 0.45);
  const belly = withEnv(new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: viperBellyTex, bumpMap: viperBellyTex, bumpScale: 0.01, roughness: 0.3, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.25 }), 0.4);

  // Long tapered body: lathe profile, nose at +Z.
  const pts = [];
  const profile = [[0.0, -1.35], [0.09, -1.15], [0.15, -0.6], [0.185, -0.1], [0.17, 0.35], [0.13, 0.7], [0.10, 0.95], [0.0, 1.12]];
  for (const [r, y] of profile) pts.push(new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), skin);
  body.rotation.x = Math.PI / 2;
  body.scale.set(0.82, 1.15, 1); // slightly flattened vertically after rotation (local axes) — reads as a sabre
  body.castShadow = true;
  g.add(body);
  const bellyStrip = mesh(new THREE.SphereGeometry(0.16, 16, 12), belly, 0, -0.10, 0.1);
  bellyStrip.scale.set(0.8, 0.55, 4.4);
  g.add(bellyStrip);

  // Head: elongated skull + hinged lower jaw.
  const skull = mesh(new THREE.SphereGeometry(0.155, 20, 14), skin, 0, 0.02, 1.06);
  skull.scale.set(0.8, 0.85, 1.7);
  g.add(skull);
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.05, 0.98);
  const jawBone = mesh(new THREE.SphereGeometry(0.13, 16, 12), skin, 0, -0.02, 0.2);
  jawBone.scale.set(0.68, 0.5, 1.9);
  jaw.add(jawBone);
  // Signature fangs: far too long for the mouth, curving up outside it.
  const fangGeo = new THREE.ConeGeometry(0.016, 0.34, 6);
  const fangSpots = [[-0.07, 0.30], [0.07, 0.30], [-0.05, 0.42], [0.05, 0.42], [-0.085, 0.16], [0.085, 0.16], [0, 0.36]];
  for (const [x, z] of fangSpots) {
    const fang = mesh(fangGeo, MAT.tooth, x, 0.13, z);
    fang.rotation.x = -0.12;
    jaw.add(fang);
  }
  const upperToothGeo = new THREE.ConeGeometry(0.013, 0.16, 6);
  for (const [x, z] of [[-0.06, 0.26], [0.06, 0.26], [-0.04, 0.38], [0.04, 0.38]]) {
    const tooth = mesh(upperToothGeo, MAT.tooth, x, -0.10, z);
    tooth.rotation.x = Math.PI;
    jaw.add(tooth);
  }
  jaw.rotation.x = 0.38; // jaw hangs open, as it must — it cannot fully close over the fangs
  g.add(jaw);
  // One large eye.
  for (const s of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.062, 16, 12),
      withEnv(new THREE.MeshPhysicalMaterial({ color: 0xb9cdd6, roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06, emissive: 0x223544, emissiveIntensity: 0.6 }), 0.6),
      s * 0.115, 0.07, 1.12);
    g.add(eye);
  }
  // Fins: tail fan + small pectorals + a low anal fin.
  const finMat = withEnv(new THREE.MeshPhysicalMaterial({ color: 0x2c3844, bumpMap: viperTex, bumpScale: 0.01, roughness: 0.45, metalness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.4, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }), 0.3);
  const tail = mesh(new THREE.ConeGeometry(0.24, 0.55, 4), finMat, 0, 0, -1.58);
  tail.rotation.x = Math.PI / 2; tail.scale.set(1, 1, 0.2);
  g.add(tail);
  const fins = [];
  for (const s of [-1, 1]) {
    const fin = mesh(new THREE.ConeGeometry(0.11, 0.34, 4), finMat, s * 0.2, -0.08, 0.72);
    fin.rotation.z = s * Math.PI / 1.9; fin.scale.set(1, 1, 0.25); fin.userData.side = s;
    fins.push(fin); g.add(fin);
  }
  // Elongated first dorsal ray with a glowing lure tip.
  const rayCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.14, 0.55), new THREE.Vector3(0, 0.52, 0.85),
    new THREE.Vector3(0, 0.68, 1.12), new THREE.Vector3(0, 0.62, 1.38),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(rayCurve, 20, 0.014, 6), belly));
  const tipMat = glowMaterial(0x8fd0ff, 2.6);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), tipMat);
  tip.position.set(0, 0.62, 1.40);
  g.add(tip);
  const tipLight = new THREE.PointLight(0x8fd0ff, 2.4, 3, 1.7);
  tipLight.position.copy(tip.position);
  g.add(tipLight);
  // Photophores: two glowing dotted rows along the belly (counter-illumination).
  const photoMat = glowMaterial(0xa8e6ff, 2.0);
  const photoGeo = new THREE.SphereGeometry(0.02, 8, 6);
  const photophores = [];
  for (let k = 0; k < 15; k++) {
    const z = 0.85 - k * 0.15;
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(photoGeo, photoMat);
      p.position.set(s * 0.085, -0.155 + Math.abs(Math.sin(k)) * 0.012, z);
      photophores.push(p); g.add(p);
    }
  }
  g.position.y = 0.1;
  g.rotation.y = -0.5;
  entry.root.add(g);
  entry.specimen = g;
  entry.animated = { fins, tail, lureMat: tipMat, lureLight: tipLight, halo: null, jaw, photoMat, baseY: 0.1, phase: 2.1 };
}

/* ---------------- specimen 03: dumbo octopus ---------------- */
function buildDumbo(entry) {
  const g = new THREE.Group();
  // Soft translucent feel: low transmission + thickness + attenuation + sheen.
  // Opacity/transparent flags are preserved exactly (0.96) so visibility,
  // raycast picking and the ear-flap animation behave as before. Transmission
  // is kept deliberately low (0.16 / 0.10) — full transmission would wash out
  // or hide the body in this dark tank and costs a transmission render pass.
  const skin = withEnv(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map: dumboTex, bumpMap: dumboTex, bumpScale: 0.012,
    roughness: 0.48, metalness: 0.02,
    transparent: true, opacity: 0.96, emissive: 0x401d0d, emissiveIntensity: 0.25,
    transmission: 0.16, thickness: 0.75, ior: 1.32,
    attenuationColor: new THREE.Color(0xffc9a0), attenuationDistance: 1.6,
    clearcoat: 0.35, clearcoatRoughness: 0.55,
    sheen: 0.5, sheenColor: new THREE.Color(0xffc9a0), sheenRoughness: 0.6,
    specularIntensity: 0.55,
  }), 0.35);
  const skinDeep = withEnv(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map: dumboDeepTex, bumpMap: dumboDeepTex, bumpScale: 0.01, roughness: 0.58, metalness: 0.02,
    transparent: true, opacity: 0.96,
    transmission: 0.10, thickness: 0.55, ior: 1.32,
    attenuationColor: new THREE.Color(0xffb38a), attenuationDistance: 1.8,
    clearcoat: 0.25, clearcoatRoughness: 0.6,
    sheen: 0.4, sheenColor: new THREE.Color(0xffc9a0), sheenRoughness: 0.65,
  }), 0.3);

  // Soft rounded mantle.
  const mantle = mesh(new THREE.SphereGeometry(0.62, 36, 28), skin, 0, 0.38, 0);
  mantle.scale.set(1, 1.12, 0.94);
  mantle.castShadow = true;
  g.add(mantle);
  // Prominent eyes, low on the mantle.
  for (const s of [-1, 1]) {
    const eyeBall = mesh(new THREE.SphereGeometry(0.085, 18, 14),
      withEnv(new THREE.MeshPhysicalMaterial({ color: 0x201410, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }), 0.6), s * 0.40, 0.30, 0.44);
    g.add(eyeBall);
    const glint = mesh(new THREE.SphereGeometry(0.026, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff2df }), s * 0.43, 0.36, 0.51);
    g.add(glint);
  }
  // The ears: two big fins on top that flap (pivot groups at the mantle).
  const earPivots = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.34, 0.92, 0);
    const ear = mesh(new THREE.SphereGeometry(0.34, 22, 16), skinDeep, s * 0.26, 0.10, 0);
    ear.scale.set(1.15, 0.78, 0.30);
    ear.rotation.z = s * 0.35;
    pivot.add(ear);
    pivot.userData.side = s;
    earPivots.push(pivot);
    g.add(pivot);
  }
  // Webbed arms: a bell/skirt lathe + eight short arm bumps under the body.
  const bellPts = [];
  const bellProfile = [[0.10, 0.22], [0.34, 0.10], [0.52, -0.06], [0.60, -0.22], [0.58, -0.34]];
  for (const [r, y] of bellProfile) bellPts.push(new THREE.Vector2(r, y));
  const bell = new THREE.Mesh(new THREE.LatheGeometry(bellPts, 32), skinDeep);
  bell.position.y = 0.18;
  g.add(bell);
  const armTips = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const arm = mesh(new THREE.SphereGeometry(0.11, 12, 10), skin, Math.cos(a) * 0.44, -0.18, Math.sin(a) * 0.44);
    arm.scale.set(1, 1.5, 1);
    armTips.push(arm); g.add(arm);
  }
  // Soft warm light so the pale body reads against the dark tank.
  const warm = new THREE.PointLight(0xffc9a0, 3.2, 4.5, 1.8);
  warm.position.set(0, 0.7, 0.7);
  g.add(warm);

  g.position.y = 0.18;
  entry.root.add(g);
  entry.specimen = g;
  entry.animated = { earPivots, bell, armTips, fins: [], tail: null, lureMat: null, lureLight: null, halo: null, baseY: 0.18, phase: 4.0 };
}

/* ---------------- build all tanks ---------------- */
buildTank(0); buildTank(1); buildTank(2);
buildAnglerfish(tanks[0]);
buildViperfish(tanks[1]);
buildDumbo(tanks[2]);
tanks.forEach((t) => { t.specimen.userData.tankIndex = t.data ? SPECIMENS.indexOf(t.data) : 0; });
tanks.forEach((t, i) => { t.specimen.traverse((o) => { o.userData.tankIndex = i; }); t.glass.userData.tankIndex = i; t.root.traverse((o) => { if (o.userData.tankIndex === undefined) o.userData.tankIndex = i; }); });

/* ---------------- sonar rings ---------------- */
const sonarRings = [];
const ringGeo = new THREE.RingGeometry(0.96, 1.0, 64);
function fireSonar() {
  for (const t of tanks) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x63ffd8, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(t.root.position.x, -1.1, t.root.position.z);
    ring.userData.age = 0;
    scene.add(ring);
    sonarRings.push(ring);
  }
  sonarBoost = 1.0; // photophores flare briefly (decays in the loop)
}
let sonarBoost = 0;

/* ---------------- camera flights ---------------- */
const HOME = { pos: new THREE.Vector3(0, 1.6, 11.5), target: new THREE.Vector3(0, 0.1, 0) };
let flight = null;
function flyTo(pos, target, dur = 1500) {
  flight = {
    t: 0, dur,
    fromPos: camera.position.clone(), toPos: pos.clone(),
    fromTg: controls.target.clone(), toTg: target.clone(),
  };
}
const easeInOut = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

/* ---------------- UI: specimen files ---------------- */
const panel = document.getElementById("info-panel");
const el = (id) => document.getElementById(id);
let selected = -1;

function setActiveButtons() {
  tanks.forEach((_, i) => el(`tank-${i}-btn`).classList.toggle("active", i === selected));
}
function showSpecimen(i, fly = true) {
  selected = i;
  const d = SPECIMENS[i];
  el("p-index").textContent = d.index;
  el("p-name").textContent = d.name;
  el("p-sci").textContent = d.scientificName;
  el("p-tag").textContent = d.tagline;
  el("p-depth").textContent = d.depth;
  el("p-size").textContent = d.size;
  el("p-desc").textContent = d.description;
  el("p-fact").textContent = d.fact;
  panel.hidden = false;
  setActiveButtons();
  if (fly) flyTo(new THREE.Vector3(...d.camera.pos), new THREE.Vector3(...d.camera.target));
}
function showAll() {
  selected = -1;
  panel.hidden = true;
  setActiveButtons();
  flyTo(HOME.pos, HOME.target, 1400);
}
el("prev-btn").addEventListener("click", () => showSpecimen(((selected < 0 ? 0 : selected) + SPECIMENS.length - 1) % SPECIMENS.length));
el("next-btn").addEventListener("click", () => showSpecimen(((selected < 0 ? -1 : selected) + 1) % SPECIMENS.length));
tanks.forEach((_, i) => el(`tank-${i}-btn`).addEventListener("click", () => showSpecimen(i)));
el("both-btn").addEventListener("click", showAll);
el("panel-close").addEventListener("click", showAll);
el("sonar-btn").addEventListener("click", fireSonar);
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") el("next-btn").click();
  if (e.key === "ArrowLeft") el("prev-btn").click();
  if (e.key === "Escape") showAll();
});

/* ---------------- glow slider ---------------- */
let glowLevel = 1.0;
el("glow-slider").addEventListener("input", (e) => { glowLevel = e.target.value / 100; });

/* ---------------- picking / hover ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");
let hoveredTank = -1;
const pickTargets = [];
tanks.forEach((t, i) => { pickTargets.push(t.glass); t.specimen.traverse((o) => { if (o.isMesh) pickTargets.push(o); }); });

function tankFromEvent(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickTargets, false);
  return hits.length ? hits[0].object.userData.tankIndex : -1;
}
canvas.addEventListener("pointermove", (e) => {
  hoveredTank = tankFromEvent(e);
  if (hoveredTank >= 0) {
    tooltip.hidden = false;
    tooltip.textContent = `Specimen ${SPECIMENS[hoveredTank].index} — ${SPECIMENS[hoveredTank].name}`;
    tooltip.style.left = (e.clientX + 14) + "px";
    tooltip.style.top = (e.clientY + 12) + "px";
    canvas.style.cursor = "pointer";
  } else {
    tooltip.hidden = true;
    canvas.style.cursor = "grab";
  }
});
let downPos = null;
canvas.addEventListener("pointerdown", (e) => { downPos = [e.clientX, e.clientY]; });
canvas.addEventListener("pointerup", (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
  downPos = null;
  if (moved > 6) return; // it was a drag, not a click
  const i = tankFromEvent(e);
  if (i >= 0) showSpecimen(i);
});

/* ---------------- real licensed GLB: anglerfish (see ../CREDITS.md) ----------------
   Tank 01 loads a real anglerfish model (CC BY, via Poly Pizza). On success
   it replaces the procedural fish inside the same specimen group (so bobbing,
   sway and picking behave identically); the procedural lure light + halo are
   kept and re-seated at the model's head for the glow ambience, driven by the
   same glow slider / sonar system. On any load error the procedural
   anglerfish simply stays — Tank 01 is never empty. */
{
  const entry = tanks[0];
  new GLTFLoader().load("assets/models/anglerfish.glb", (gltf) => {
    const inner = gltf.scene;
    const box = new THREE.Box3().setFromObject(inner);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 2.1 / maxDim;
    inner.scale.setScalar(s);
    inner.position.set(-center.x * s, -center.y * s, -center.z * s);
    inner.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.userData.tankIndex = 0;
        pickTargets.push(o); // keep click/hover picking working on the real model
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m) { m.envMap = ENV_TEX; m.envMapIntensity = 0.35; } });
      }
    });
    // Hide the procedural fish — except the glow halo, which is re-seated below.
    const halo = entry.animated.halo;
    entry.specimen.traverse((o) => { if (o.isMesh && o !== halo) o.visible = false; });
    entry.specimen.add(inner);
    // Glow lure: a bright core + the kept halo, placed at the model's
    // top-front where its esca belongs; they pulse with the tank's glow.
    const lurePos = new THREE.Vector3(0, size.y * s * 0.30, size.z * s * 0.55);
    const glowCore = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), glowMaterial(0x63ffd8, 3.2));
    glowCore.position.copy(lurePos);
    entry.specimen.add(glowCore);
    if (halo) halo.position.copy(lurePos);
    if (entry.animated.lureLight) entry.animated.lureLight.position.copy(lurePos);
  }, undefined, () => { /* GLB failed — procedural anglerfish stays */ });
}

/* ---------------- HTML labels ---------------- */
const labelsRoot = document.getElementById("labels");
const labelEls = tanks.map((t) => {
  const d = document.createElement("div");
  d.className = "spec-label";
  d.textContent = `${t.data.name}`;
  labelsRoot.appendChild(d);
  return d;
});
const projV = new THREE.Vector3();
function updateLabels() {
  tanks.forEach((t, i) => {
    projV.copy(t.labelPos).project(camera);
    const elx = labelEls[i];
    if (projV.z > 1 || projV.z < -1) { elx.style.display = "none"; return; }
    elx.style.display = "block";
    elx.style.left = ((projV.x * 0.5 + 0.5) * window.innerWidth) + "px";
    elx.style.top = ((-projV.y * 0.5 + 0.5) * window.innerHeight) + "px";
    elx.style.opacity = selected === -1 || selected === i ? "0.95" : "0.35";
  });
}

/* ---------------- animation ---------------- */
const clock = new THREE.Clock();
const depthEl = document.getElementById("depth-value");
let flicker = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // Camera flight
  if (flight) {
    flight.t += dt * 1000;
    const k = easeInOut(Math.min(flight.t / flight.dur, 1));
    camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
    controls.target.lerpVectors(flight.fromTg, flight.toTg, k);
    if (flight.t >= flight.dur) flight = null;
  }

  // Marine snow falls and wraps.
  for (const f of snowFields) {
    const pos = f.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - f.userData.speed * dt * 3;
      if (y < -2) y += f.userData.yRange;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.4 + i) * 0.0006);
    }
    pos.needsUpdate = true;
  }

  // Bioluminescence: gentle self-pulse + slider + sonar flare.
  sonarBoost = Math.max(0, sonarBoost - dt * 0.5);
  const pulse = 0.82 + 0.18 * Math.sin(t * 1.7);
  const glowNow = glowLevel * pulse * (1 + sonarBoost * 1.6);
  for (const m of glowMats) m.emissiveIntensity = m.userData.base * glowNow;
  for (const tnk of tanks) {
    if (tnk.animated.lureLight) tnk.animated.lureLight.intensity = 6 * glowNow * (tnk.data.id === "viperfish" ? 0.45 : 1);
    if (tnk.animated.halo) {
      tnk.animated.halo.material.opacity = 0.10 + 0.10 * glowNow;
      const s = 1 + 0.15 * Math.sin(t * 1.7);
      tnk.animated.halo.scale.setScalar(s);
    }
  }

  // Specimen motion: bobbing, sway, fin work — and the Dumbo's ear-flap.
  for (const tnk of tanks) {
    const a = tnk.animated, s = tnk.specimen;
    if (!s) continue;
    s.position.y = a.baseY + Math.sin(t * 0.7 + a.phase) * 0.055;
    s.rotation.y = Math.sin(t * 0.22 + a.phase) * 0.16;
    s.rotation.z = Math.sin(t * 0.5 + a.phase) * 0.03;
    for (const fin of a.fins || []) fin.rotation.y = Math.sin(t * 2.1 + a.phase) * 0.35 * (fin.userData.side || 1);
    if (a.tail) a.tail.rotation.y = Math.sin(t * 1.6 + a.phase) * 0.3;
    if (a.jaw) a.jaw.rotation.x = 0.38 + Math.sin(t * 0.6 + a.phase) * 0.05;
    if (a.earPivots) {
      // Signature dumbo flight: slow, alternating-then-together ear rows.
      const flap = Math.sin(t * 1.35 + a.phase);
      for (const pivot of a.earPivots) pivot.rotation.z = pivot.userData.side * (-0.12 - flap * 0.42);
      a.bell.scale.setScalar(1 + Math.sin(t * 1.35 + a.phase + 0.6) * 0.035); // bell pulse, offset from the flap
      for (let k = 0; k < a.armTips.length; k++) a.armTips[k].position.y = -0.18 + Math.sin(t * 1.35 + a.phase + k * 0.35) * 0.016;
    }
  }

  // Tank rims: hovered/selected tanks glow; occasional tasteful flicker on one rim.
  flicker -= dt;
  if (flicker < -6 - Math.random() * 6) flicker = 0.12;
  tanks.forEach((tnk, i) => {
    let e = 0x06181d;
    if (i === hoveredTank || i === selected) e = 0x1d5c50;
    tnk.rimMat.emissive.setHex(e);
    if (flicker > 0 && i === 1) tnk.rimMat.emissiveIntensity = 0.5 + Math.random() * 0.8;
    else tnk.rimMat.emissiveIntensity = 1;
  });

  // Sonar rings expand and fade.
  for (let i = sonarRings.length - 1; i >= 0; i--) {
    const r = sonarRings[i];
    r.userData.age += dt;
    const k = r.userData.age / 2.4;
    r.scale.setScalar(0.4 + k * 5.2);
    r.material.opacity = 0.55 * (1 - k);
    if (k >= 1) { scene.remove(r); r.material.dispose(); sonarRings.splice(i, 1); }
  }

  // Depth gauge drifts like a slow dive computer.
  const depth = 1842 + Math.round(Math.sin(t * 0.05) * 26 + Math.sin(t * 0.013) * 11);
  depthEl.textContent = `−${depth.toLocaleString("en-US")} m`;

  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
requestAnimationFrame(() => document.getElementById("loading").classList.add("done"));
