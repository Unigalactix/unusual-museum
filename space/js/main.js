// Cosmos — Interactive 3D Solar System & Stars.
// All models are procedural: canvas-painted textures, primitive geometry.
// Sizes and distances are stylised so the whole system fits on one screen
// (the "More realistic" preset narrows the cheat, it does not remove it).

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PLANETS, STARS, STAR_STAGE } from "./bodies.js";

/* ---------------- setup ---------------- */

const canvas = document.getElementById("scene");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  document.getElementById("loading").hidden = true;
  document.getElementById("webgl-fail").hidden = false;
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01020a);
scene.fog = new THREE.FogExp2(0x01020a, 0.00035);

// Subtle studio reflections for the planets only: a PMREM RoomEnvironment is
// bound as scene.environment, but every standard material below opts in with a
// low envMapIntensity, and the background stays pure black — space stays black.
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
} catch (e) {
  scene.environment = null; // env reflections are a garnish, never a blocker
}

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 6000);
camera.position.set(-30, 42, 118);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 900;

/* ---------------- responsive framing ----------------
   Three-column layout: the canvas fills only the centre column (and
   becomes a 56vh block in the mobile single-column layout), so sizing
   / projection math goes through the canvas rect, never the window.
   The side columns are real layout, not overlays, so the system is
   projected dead-centre in the stage — no view offset. */
function viewRect() { return canvas.getBoundingClientRect(); }
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

scene.add(new THREE.AmbientLight(0x8899bb, 0.75));
scene.add(new THREE.HemisphereLight(0xbdd0ff, 0x1a1408, 0.35));
const sunLight = new THREE.PointLight(0xfff2d8, 3.4, 0, 0.35);
scene.add(sunLight);

/* ---------------- canvas texture helpers ---------------- */

function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}
let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function speckleTexture(base, spots) {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (const [col, n, smin, smax] of spots) {
      g.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const r = smin + rand() * (smax - smin);
        g.beginPath(); g.arc(rand() * w, rand() * h, r, 0, Math.PI * 2); g.fill();
      }
    }
  });
}
// Paint horizontal cloud bands in thin vertical slices so each band edge
// wobbles like real turbulent cloud tops instead of a ruler-straight stripe.
function paintBands(g, w, h, colors, soft = false) {
  const bandH = h / colors.length;
  const slice = 4;
  for (let x = 0; x < w; x += slice) {
    colors.forEach((col, i) => {
      const wob = Math.sin((x / w) * Math.PI * 6 + i * 1.7) * bandH * 0.09
                + Math.sin((x / w) * Math.PI * 19 + i * 0.6) * bandH * 0.035;
      g.fillStyle = col;
      g.fillRect(x, i * bandH + wob - 2, slice, bandH + 4);
    });
  }
  if (soft) { // horizontal smearing streaks
    g.globalAlpha = 0.12;
    for (let i = 0; i < 520; i++) {
      g.fillStyle = rand() > 0.5 ? "#ffffff" : "#7a6a4a";
      const y = rand() * h;
      g.fillRect(rand() * w, y, 30 + rand() * 160, 1.6);
    }
    g.globalAlpha = 1;
  }
}
function bandsTexture(colors, soft = false, w = 1024, h = 512) {
  return canvasTexture(w, h, (g) => paintBands(g, w, h, colors, soft));
}
const TEXTURES = {
  sun: () => canvasTexture(1024, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#ffdf7e"); grad.addColorStop(0.5, "#ffb340"); grad.addColorStop(1, "#ff8a2a");
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    // Fine granulation: thousands of small bright/dark convection cells…
    for (let i = 0; i < 6500; i++) {
      g.fillStyle = rand() > 0.5 ? "rgba(255,242,196,0.4)" : "rgba(216,112,22,0.38)";
      g.beginPath(); g.arc(rand() * w, rand() * h, 0.5 + rand() * 1.7, 0, Math.PI * 2); g.fill();
    }
    // …a mid-scale mottling layer…
    for (let i = 0; i < 1100; i++) {
      g.fillStyle = rand() > 0.5 ? "rgba(255,236,170,0.3)" : "rgba(198,96,16,0.3)";
      g.beginPath(); g.arc(rand() * w, rand() * h, 1.6 + rand() * 3.6, 0, Math.PI * 2); g.fill();
    }
    // …and a few darker sunspot clusters.
    for (let i = 0; i < 12; i++) {
      const cx = rand() * w, cy = h * 0.2 + rand() * h * 0.6;
      for (let j = 0; j < 5; j++) {
        g.fillStyle = "rgba(122,52,10,0.5)";
        g.beginPath(); g.arc(cx + (rand() - 0.5) * 16, cy + (rand() - 0.5) * 8, 2 + rand() * 4.5, 0, Math.PI * 2); g.fill();
      }
    }
  }),
  speckle: (base) => speckleTexture(base, [["rgba(0,0,0,0.18)", 300, 1, 5], ["rgba(255,255,255,0.14)", 200, 1, 4], ["rgba(60,50,45,0.35)", 90, 2, 8]]),
  "speckle-red": (base) => speckleTexture(base, [["rgba(90,30,10,0.4)", 260, 1, 7], ["rgba(255,200,160,0.2)", 160, 1, 4], ["rgba(40,15,5,0.35)", 80, 3, 10]]),
  earth: () => canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = "#1c4f9e"; g.fillRect(0, 0, w, h);
    const land = ["#3d7a3a", "#8a7a45", "#4c8a44", "#6b7f3c"];
    for (let i = 0; i < 30; i++) { // blobby continents
      g.fillStyle = land[i % land.length];
      const cx = rand() * w, cy = h * 0.18 + rand() * h * 0.64;
      for (let j = 0; j < 10; j++) {
        g.beginPath();
        g.ellipse(cx + (rand() - 0.5) * 120, cy + (rand() - 0.5) * 60, 14 + rand() * 48, 10 + rand() * 30, rand() * 3, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.fillRect(0, 0, w, Math.round(h * 0.05)); g.fillRect(0, h - Math.round(h * 0.06), w, Math.round(h * 0.06)); // polar caps
    g.globalAlpha = 0.35; g.fillStyle = "#ffffff";
    for (let i = 0; i < 200; i++) g.fillRect(rand() * w, rand() * h, 24 + rand() * 84, 3.4); // clouds
    g.globalAlpha = 1;
  }),
  "bands-jupiter": () => canvasTexture(1024, 512, (g, w, h) => {
    paintBands(g, w, h, ["#c8a37e", "#e8d3ac", "#b98a5e", "#a97c50", "#efe0bd", "#d9bd8d", "#b98a5e", "#e2c491", "#9c6b43", "#c8a37e", "#ecd9ae", "#c39a68", "#e8d3ac", "#a97c50", "#e2c491", "#c8a37e"], true);
    // Great Red Spot: a rusty oval storm in the southern hemisphere, with a
    // pale collar and a darker core, plus a small white oval nearby.
    const sx = w * 0.68, sy = h * 0.635, rx = w * 0.082, ry = h * 0.05;
    g.fillStyle = "rgba(238,220,190,0.75)";
    g.beginPath(); g.ellipse(sx, sy, rx * 1.22, ry * 1.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c2543a";
    g.beginPath(); g.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#a83f27";
    g.beginPath(); g.ellipse(sx, sy, rx * 0.62, ry * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(245,240,228,0.85)";
    g.beginPath(); g.ellipse(w * 0.3, h * 0.68, w * 0.02, h * 0.014, 0, 0, Math.PI * 2); g.fill();
  }),
  "bands-saturn": () => bandsTexture(["#d9c491", "#e9dcb2", "#cdb582", "#efe3c0", "#d9c491", "#c4ab74", "#e9dcb2", "#dcc99c", "#efe3c0", "#cdb582", "#e3d1a4", "#d9c491", "#efe3c0", "#c4ab74"], true),
  "bands-soft": (base, tint) => bandsTexture([tint, base, tint, base, tint, base], true),
  smooth: () => null
};
function glowTexture(inner, outer) {
  return canvasTexture(256, 256, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, inner); grad.addColorStop(0.35, outer); grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}
const sunGlowTex = glowTexture("rgba(255,225,160,0.95)", "rgba(255,150,50,0.35)");

function ringTexture() {
  return canvasTexture(1024, 32, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const t = x / w;
      const a = 0.25 + 0.75 * Math.abs(Math.sin(t * 22)) * (0.4 + 0.6 * Math.sin(t * 5 + 1));
      const shade = 200 + Math.floor(40 * Math.sin(t * 40));
      g.fillStyle = `rgba(${shade},${shade - 18},${shade - 60},${t < 0.04 ? 0 : a})`;
      g.fillRect(x, 0, 1, h);
    }
  });
}
// RingGeometry UVs run around the ring, not across it — remap u to radius.
function makeRing(inner, outer, tex, opacity = 0.95) {
  const geo = new THREE.RingGeometry(inner, outer, 128, 1);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 1);
  }
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, opacity });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/* ---------------- background starfield + Milky Way band ---------------- */

function starPoints(count, placer, size, color, opacity) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = placer(i);
    positions.set([p.x, p.y, p.z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, color, transparent: true, opacity, sizeAttenuation: false, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}
starPoints(2600, () => {
  const r = 1200 + rand() * 1600, th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
  return new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th));
}, 1.6, 0xcdd8ff, 0.85);
// Milky Way: a tilted band of much denser, fainter points
const bandNormal = new THREE.Vector3(0.35, 1, 0.2).normalize();
starPoints(2400, () => {
  const r = 1300 + rand() * 1200;
  const dir = new THREE.Vector3().randomDirection();
  const d = dir.dot(bandNormal);
  dir.addScaledVector(bandNormal, -d).normalize();           // flatten onto the band plane
  dir.addScaledVector(bandNormal, (rand() + rand() + rand() - 1.5) * 0.14); // soft thickness
  return dir.normalize().multiplyScalar(r);
}, 1.1, 0x9fb2e8, 0.4);

/* ---------------- build the solar system ---------------- */

// Real radius relative to Earth (=1), for the "More realistic" preset.
const REAL_R = { sun: 15, mercury: 0.33, venus: 0.81, earth: 0.85, moon: 0.28, mars: 0.45, jupiter: 9.5, saturn: 8.0, uranus: 3.4, neptune: 3.3, pluto: 0.28 };

const bodies = {};        // id -> record
const pickMeshes = [];
const orbitLines = new THREE.Group();
scene.add(orbitLines);

function bodyMaterial(data) {
  const hex = "#" + data.color.toString(16).padStart(6, "0");
  let mat;
  switch (data.texture) {
    case "sun":
      mat = new THREE.MeshBasicMaterial({ map: TEXTURES.sun() });
      break;
    case "speckle":
      mat = new THREE.MeshStandardMaterial({ map: TEXTURES.speckle(hex), roughness: 0.95 });
      break;
    case "speckle-red":
      mat = new THREE.MeshStandardMaterial({ map: TEXTURES["speckle-red"](hex), roughness: 0.95 });
      break;
    case "earth":
      mat = new THREE.MeshStandardMaterial({ map: TEXTURES.earth(), roughness: 0.7 });
      break;
    case "bands-jupiter":
      mat = new THREE.MeshStandardMaterial({ map: TEXTURES["bands-jupiter"](), roughness: 0.8 });
      break;
    case "bands-soft":
      mat = new THREE.MeshStandardMaterial({
        map: data.id === "saturn" ? TEXTURES["bands-saturn"]() : TEXTURES["bands-soft"](hex, "#f5ecd2"),
        roughness: 0.8
      });
      break;
    default:
      mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.65 });
  }
  // Slight environment reflections only — the night side of space stays dark.
  if (mat.isMeshStandardMaterial) mat.envMapIntensity = 0.3;
  return mat;
}

function buildBody(data) {
  const group = new THREE.Group();          // positioned on the orbit each frame
  const tiltG = new THREE.Group();          // axial tilt + display scale
  const spinG = new THREE.Group();          // axial spin
  tiltG.rotation.z = THREE.MathUtils.degToRad(data.axialTilt || 0);
  spinG.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), bodyMaterial(data)));
  const mesh = spinG.children[0];
  if (data.id === "earth") {
    // Atmosphere: a slightly larger BackSide shell whose fresnel falloff
    // renders as a soft blue limb glow around the planet.
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.22, 48, 32),
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(0.3, 0.55, 1.0, 1.0) * intensity * 1.35;
          }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      })
    );
    atmo.name = "earth-atmosphere";
    tiltG.add(atmo);
  }
  mesh.userData.bodyId = data.id;
  if (data.id === "sun") mesh.userData.noEmissive = true;
  else pickMeshes.push(mesh);
  tiltG.add(spinG);
  group.add(tiltG);
  scene.add(group);

  if (data.rings) {
    const ring = makeRing(data.rings.inner, data.rings.outer, ringTexture(), data.id === "uranus" ? 0.55 : 0.95);
    if (data.id === "uranus") ring.rotation.set(0, 0, 0), ring.rotation.x = 0.35, ring.rotation.y = Math.PI / 2.2; // near-vertical rings
    spinG.add(ring);
  }
  if (data.id === "sun") {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(46);
    group.add(glow);
    const n = 320, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const dir = new THREE.Vector3().randomDirection().multiplyScalar(10.5 + rand() * 6);
      pos.set([dir.x, dir.y, dir.z], i * 3);
    }
    const cg = new THREE.BufferGeometry();
    cg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const cm = new THREE.PointsMaterial({ size: 0.55, color: 0xffc46b, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const coronaPts = new THREE.Points(cg, cm);
    coronaPts.name = "corona";
    group.add(coronaPts);
    group.userData.glow = glow;
    group.userData.corona = coronaPts;
  }
  if (data.orbitRadius > 0) {
    const tilt = THREE.MathUtils.degToRad(data.orbitTilt || 0);
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), -Math.sin(a) * Math.sin(tilt), Math.sin(a) * Math.cos(tilt)));
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x54679f, transparent: true, opacity: data.id === "pluto" ? 0.35 : 0.5 })
    );
    line.userData.bodyId = data.id;
    orbitLines.add(line);
    bodies[data.id] = null; // placeholder replaced below
  }
  const rec = {
    data, group, tiltG, spinG, mesh,
    angle: rand() * Math.PI * 2,
    radius: data.radiusVisible,
    orbitR: data.orbitRadius,
    moonOrbit: 0, moonAngle: rand() * Math.PI * 2
  };
  bodies[data.id] = rec;
  return rec;
}
PLANETS.forEach(buildBody);

// Moon ride-along: re-parent visual into Earth's group space via a carrier.
const moonRec = bodies.moon;
moonRec.group.removeFromParent();
const moonCarrier = new THREE.Group();
bodies.earth.group.add(moonCarrier);
moonCarrier.add(moonRec.group);
moonRec.moonOrbit = 3.1;

// Earth's own little orbit line for the Moon
{
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1));
  }
  const ml = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x54679f, transparent: true, opacity: 0.4 }));
  ml.name = "moon-orbit";
  moonCarrier.add(ml);
}

/* ---------------- asteroid belt ---------------- */

const BELT_N = 900;
const beltMat = new THREE.MeshStandardMaterial({ color: 0x8d8578, roughness: 1 });
beltMat.envMapIntensity = 0.2;
const belt = new THREE.InstancedMesh(
  new THREE.DodecahedronGeometry(0.16),
  beltMat,
  BELT_N
);
const beltData = [];
for (let i = 0; i < BELT_N; i++) {
  beltData.push({
    angle: rand() * Math.PI * 2,
    frac: Math.pow(rand(), 0.8),
    y: (rand() - 0.5) * 1.6,
    speed: 0.008 + rand() * 0.012,
    scale: 0.4 + rand() * 1.5,
    rot: rand() * Math.PI * 2
  });
}
scene.add(belt);
const dummy = new THREE.Object3D();

/* ---------------- star inspector stage ---------------- */

const stage = new THREE.Group();
stage.position.set(STAR_STAGE.x, STAR_STAGE.y, STAR_STAGE.z);
scene.add(stage);

const stageStar = new THREE.Mesh(
  new THREE.SphereGeometry(1, 56, 36),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
stageStar.userData.isStageStar = true;
stage.add(stageStar);
pickMeshes.push(stageStar);

const stageGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
stage.add(stageGlow);
const stageLight = new THREE.PointLight(0xffffff, 2.2, 0, 0.3);
stage.add(stageLight);
const sunRefMat = new THREE.MeshStandardMaterial({ map: TEXTURES.sun(), emissive: 0xff9a2a, emissiveIntensity: 0.55 });
sunRefMat.envMapIntensity = 0.15;
const sunRef = new THREE.Mesh(
  new THREE.SphereGeometry(2.2, 40, 28),
  sunRefMat
);
sunRef.name = "sun-reference";
stage.add(sunRef);
const stageRing = new THREE.Mesh(
  new THREE.RingGeometry(38, 38.5, 96),
  new THREE.MeshBasicMaterial({ color: 0x3a4a7d, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
);
stageRing.rotation.x = -Math.PI / 2;
stageRing.position.y = -30;
stage.add(stageRing);

function spectralColor(spec) {
  const s = (spec || "").trim().charAt(0).toUpperCase();
  if (s === "O" || s === "B") return new THREE.Color(0xa9c2ff);
  if (s === "A") return new THREE.Color(0xe8efff);
  if (s === "F") return new THREE.Color(0xfff3cf);
  if (s === "G") return new THREE.Color(0xffe9a3);
  if (s === "K") return new THREE.Color(0xffb066);
  return new THREE.Color(0xff7043); // M
}
const starDisplayRadius = (rSolar) => Math.min(26, 2.2 * Math.pow(rSolar, 0.35));
function setStageStar(star) {
  const r = starDisplayRadius(star.radiusSolar);
  const col = spectralColor(star.spectral);
  stageStar.scale.setScalar(r);
  stageStar.material.color.copy(col);
  stageGlow.material.color.copy(col);
  stageGlow.scale.setScalar(r * 5.2);
  stageLight.color.copy(col);
  sunRef.position.set(-(r + 9), 0, 0);
  stage.userData.starId = star.id;
  stage.userData.starRadius = r;
}
// The stage idles with Sirius on display until a star is chosen.
setStageStar(STARS[0]);

/* ---------------- UI: lists, panel, labels ---------------- */

const $ = (id) => document.getElementById(id);
const bodyListEl = $("body-list"), starListEl = $("star-list");
const labelLayer = $("labels");
const tooltip = $("tooltip");

const dotColor = (hex) => "#" + hex.toString(16).padStart(6, "0");
for (const p of PLANETS) {
  const b = document.createElement("button");
  b.className = "item"; b.dataset.id = p.id; b.dataset.name = p.name.toLowerCase();
  b.innerHTML = `<span class="dot" style="background:${dotColor(p.color)}"></span>
    <span>${p.name}<span class="sub">${p.kind}</span></span>
    <span class="meta">${p.id === "sun" ? "1 AU from us" : (p.stats["Distance from Sun"] || p.stats["Distance from Earth"] || "").split("—")[0].split("(")[0].trim()}</span>`;
  b.addEventListener("click", () => selectBody(p.id, true));
  bodyListEl.appendChild(b);
}
for (const s of STARS) {
  const b = document.createElement("button");
  b.className = "item"; b.dataset.id = s.id; b.dataset.name = s.name.toLowerCase();
  const c = spectralColor(s.spectral);
  b.innerHTML = `<span class="dot" style="background:${dotColor(c.getHex())}"></span>
    <span>${s.name}<span class="sub">${s.constellation} · ${s.spectral}</span></span>
    <span class="meta">${s.distanceLy} ly</span>`;
  b.addEventListener("click", () => selectStar(s.id, true));
  starListEl.appendChild(b);
}

function markActive(listEl, id) {
  listEl.querySelectorAll(".item").forEach((el) => el.classList.toggle("active", el.dataset.id === id));
}

$("tab-bodies").addEventListener("click", () => switchTab("bodies"));
$("tab-stars").addEventListener("click", () => switchTab("stars"));
function switchTab(which) {
  $("tab-bodies").classList.toggle("active", which === "bodies");
  $("tab-stars").classList.toggle("active", which === "stars");
  bodyListEl.hidden = which !== "bodies";
  starListEl.hidden = which !== "stars";
}
$("search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll(".explorer .item").forEach((el) => {
    el.style.display = !q || el.dataset.name.includes(q) ? "" : "none";
  });
});

const labels = [];
function addLabel(text, getPos, opts = {}) {
  const el = document.createElement("div");
  el.className = "body-label";
  el.textContent = text;
  labelLayer.appendChild(el);
  const L = { el, getPos, ...opts };
  labels.push(L);
  return L;
}
for (const p of PLANETS) {
  if (p.id === "moon") continue;
  addLabel(p.name, () => {
    const rec = bodies[p.id];
    const wp = new THREE.Vector3();
    rec.group.getWorldPosition(wp);
    wp.y += rec.radius + 1.6;
    return wp;
  }, { systemOnly: true });
}
addLabel("Moon", () => {
  const wp = new THREE.Vector3();
  moonRec.group.getWorldPosition(wp);
  wp.y += 1.1;
  return wp;
}, { systemOnly: true });
const starLabel = addLabel("", () => {
  const wp = new THREE.Vector3(STAR_STAGE.x, (stage.userData.starRadius || 4) + 2.4, STAR_STAGE.z);
  return wp;
}, { starOnly: true });
addLabel("Sun — for scale", () => new THREE.Vector3(
  STAR_STAGE.x + sunRef.position.x, sunRef.position.y + 4.4, STAR_STAGE.z
), { starOnly: true });

/* ---------------- selection, panel, camera flights ---------------- */

let mode = "system";               // "system" | "star"
let selectedBody = null;           // record or null
let selectedStar = null;           // star data or null
let flight = null;                 // { t, dur, fromPos, toPos, fromTg, toTg, done }

function flyTo(toPos, toTg, dur = 1.5, done = null) {
  flight = { t: 0, dur, fromPos: camera.position.clone(), toPos: toPos.clone(), fromTg: controls.target.clone(), toTg: toTg.clone(), done };
}
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function fillPanel({ kicker, name, tagline, stats, desc, fact }) {
  $("p-kicker").textContent = kicker;
  $("p-name").textContent = name;
  $("p-tag").textContent = tagline;
  const dl = $("p-stats");
  dl.innerHTML = "";
  for (const [k, v] of Object.entries(stats)) {
    const div = document.createElement("div");
    div.innerHTML = `<dt>${k}</dt><dd>${v}</dd>`;
    dl.appendChild(div);
  }
  $("p-desc").textContent = desc;
  $("p-fact").textContent = fact;
  $("info-panel").hidden = false;
  const p = $("info-panel");
  p.classList.remove("panel-in"); void p.offsetWidth; p.classList.add("panel-in");
}

function selectBody(id, fly = false) {
  const rec = bodies[id];
  if (!rec) return;
  mode = "system";
  selectedStar = null;
  selectedBody = rec;
  markActive(bodyListEl, id);
  markActive(starListEl, null);
  $("back-to-system").hidden = true;
  setEmissive(rec.mesh, 0.55);
  const d = rec.data;
  fillPanel({ kicker: d.kind, name: d.name, tagline: d.tagline, stats: d.stats, desc: d.description, fact: d.fact });
  if (fly && id !== "sun") {
    // glide towards the body; the follow logic finishes the framing
    const wp = new THREE.Vector3();
    rec.group.getWorldPosition(wp);
    const dir = camera.position.clone().sub(wp).normalize();
    const dist = Math.max(rec.radius * 7, 9);
    flyTo(wp.clone().addScaledVector(dir, dist).add(new THREE.Vector3(0, dist * 0.35, 0)), wp, 1.3);
  }
}

function selectStar(id, fly = true) {
  const star = STARS.find((s) => s.id === id);
  if (!star) return;
  mode = "star";
  selectedBody = null;
  selectedStar = star;
  setStageStar(star);
  starLabel.el.textContent = star.name;
  markActive(starListEl, id);
  markActive(bodyListEl, null);
  $("back-to-system").hidden = false;
  fillPanel({
    kicker: `Known Star — ${star.constellation}`,
    name: star.name,
    tagline: star.tagline,
    stats: {
      "Constellation": star.constellation,
      "Distance": `${star.distanceLy} light-years`,
      "Spectral type": star.spectral,
      "Size vs Sun": `${star.radiusSolar}× the Sun's radius`,
      "Temperature": `${star.tempK.toLocaleString("en-US")} K surface`
    },
    desc: star.description + " " + star.fact,
    fact: "Size check — " + star.comparison + " (On this stage the star's size is drawn on a compressed scale so the smallest and largest can share a screen; the little Sun beside it is the honest yardstick.)"
  });
  if (fly) {
    const r = stage.userData.starRadius || 5;
    flyTo(new THREE.Vector3(STAR_STAGE.x - r * 0.4, r * 0.9 + 4, r * 3.4 + 22),
          new THREE.Vector3(STAR_STAGE.x - 3, 0, STAR_STAGE.z), 1.6);
  }
}

function resetView() {
  selectedBody = null;
  selectedStar = null;
  mode = "system";
  markActive(bodyListEl, null);
  markActive(starListEl, null);
  $("back-to-system").hidden = true;
  $("info-panel").hidden = true;
  flyTo(new THREE.Vector3(-30, 42, 118), new THREE.Vector3(0, 0, 0), 1.5);
}
$("back-to-system").addEventListener("click", resetView);
$("release-btn").addEventListener("click", resetView);
$("panel-close").addEventListener("click", () => {
  selectedBody = null; selectedStar = null;
  markActive(bodyListEl, null); markActive(starListEl, null);
  $("info-panel").hidden = true;
});

function setEmissive(mesh, v) {
  pickMeshes.forEach((m) => {
    if (m.material && m.material.emissive) m.material.emissiveIntensity = 0;
  });
  if (mesh && mesh.material && mesh.material.emissive && !mesh.userData.noEmissive) {
    mesh.material.emissive.copy(mesh.material.color || new THREE.Color(0xffffff));
    mesh.material.emissiveIntensity = v;
  }
}

/* ---------------- controls wiring ---------------- */

let speedFactor = 1, orbitsPaused = false;
let labelsOn = true, modeTarget = 0, modeT = 0; // modeT: 0 = visible, 1 = more realistic

$("speed-slider").addEventListener("input", (e) => { speedFactor = e.target.value / 100; });
$("pause-btn").addEventListener("click", (e) => {
  orbitsPaused = !orbitsPaused;
  e.currentTarget.textContent = orbitsPaused ? "▶ Resume orbits" : "⏸ Pause orbits";
  e.currentTarget.classList.toggle("active", orbitsPaused);
});
$("labels-btn").addEventListener("click", (e) => {
  labelsOn = !labelsOn;
  e.currentTarget.classList.toggle("active", labelsOn);
  labelLayer.style.display = labelsOn ? "" : "none";
});
$("orbits-btn").addEventListener("click", (e) => {
  orbitLines.visible = !orbitLines.visible;
  moonCarrier.children.forEach((c) => { if (c.name === "moon-orbit") c.visible = orbitLines.visible; });
  e.currentTarget.classList.toggle("active", orbitLines.visible);
});
$("size-visible").addEventListener("click", () => setSizeMode(0));
$("size-real").addEventListener("click", () => setSizeMode(1));
function setSizeMode(m) {
  modeTarget = m;
  $("size-visible").classList.toggle("active", m === 0);
  $("size-real").classList.toggle("active", m === 1);
}

/* ---------------- picking ---------------- */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function castAt(cx, cy) {
  const r = viewRect();
  pointer.x = ((cx - r.left) / Math.max(1, r.width)) * 2 - 1;
  pointer.y = -((cy - r.top) / Math.max(1, r.height)) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickMeshes, false);
  return hits.length ? hits[0].object : null;
}
renderer.domElement.addEventListener("pointermove", (e) => {
  const obj = castAt(e.clientX, e.clientY);
  hovered = obj;
  if (obj) {
    const name = obj.userData.isStageStar
      ? (selectedStar ? selectedStar.name : "Star stage")
      : (bodies[obj.userData.bodyId]?.data.name || "");
    tooltip.textContent = name;
    tooltip.hidden = false;
    tooltip.style.left = (e.clientX + 14) + "px";
    tooltip.style.top = (e.clientY + 10) + "px";
    canvas.style.cursor = "pointer";
    if (!selectedBody || selectedBody.mesh !== obj) setEmissive(obj, 0.3);
  } else {
    tooltip.hidden = true;
    canvas.style.cursor = "";
    if (selectedBody) setEmissive(selectedBody.mesh, 0.55); else setEmissive(null, 0);
  }
});
let downAt = null;
renderer.domElement.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; flight = null; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return; // it was a drag, not a click
  const obj = castAt(e.clientX, e.clientY);
  if (!obj) return;
  if (obj.userData.isStageStar) { if (selectedStar) fillPanelStarAgain(); return; }
  if (mode === "star") resetViewSoft();
  selectBody(obj.userData.bodyId, false);
});
function resetViewSoft() { mode = "system"; $("back-to-system").hidden = true; }
function fillPanelStarAgain() { if (selectedStar) selectStar(selectedStar.id, false); }

/* ---------------- animation ---------------- */

const clock = new THREE.Clock();
const tmpV = new THREE.Vector3();

function bodyWorldPos(rec, out) {
  return rec.group.getWorldPosition(out);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // size-mode easing
  modeT += (modeTarget - modeT) * Math.min(1, dt * 3.5);
  if (Math.abs(modeTarget - modeT) < 0.001) modeT = modeTarget;

  const orbitFactor = orbitsPaused ? 0 : speedFactor;

  // --- solar system motion ---
  for (const id of Object.keys(bodies)) {
    const rec = bodies[id];
    const d = rec.data;
    rec.radius = THREE.MathUtils.lerp(d.radiusVisible, REAL_R[id] || d.radiusVisible, modeT);
    rec.tiltG.scale.setScalar(rec.radius);
    rec.spinG.rotation.y += (d.spinSpeed || 0.1) * dt * Math.max(speedFactor, 0.15);

    if (id === "moon") {
      rec.moonAngle += 1.1 * dt * orbitFactor + 0.0;
      const mr = rec.moonOrbit + bodies.earth.radius * 0.9;
      rec.group.position.set(Math.cos(rec.moonAngle) * mr, 0.35, Math.sin(rec.moonAngle) * mr);
      continue;
    }
    if (d.orbitRadius > 0) {
      rec.angle += d.orbitSpeed * 0.22 * dt * orbitFactor;
      rec.orbitR = THREE.MathUtils.lerp(d.orbitRadius, d.orbitRadiusReal, modeT);
      const tilt = THREE.MathUtils.degToRad(d.orbitTilt || 0);
      rec.group.position.set(
        Math.cos(rec.angle) * rec.orbitR,
        -Math.sin(rec.angle) * Math.sin(tilt) * rec.orbitR,
        Math.sin(rec.angle) * Math.cos(tilt) * rec.orbitR
      );
      const line = orbitLines.children.find((l) => l.userData.bodyId === id);
      if (line) line.scale.setScalar(rec.orbitR);
    }
    if (id === "sun") {
      const pulse = 1 + Math.sin(t * 1.4) * 0.012;
      rec.group.userData.glow.scale.setScalar(46 * (rec.radius / 9) * pulse);
      rec.group.userData.corona.rotation.y += dt * 0.02;
      rec.group.userData.corona.rotation.x += dt * 0.006;
      sunLight.position.copy(rec.group.position);
    }
  }
  // moon orbit ring follows Earth's display radius
  moonCarrier.children.forEach((c) => {
    if (c.name === "moon-orbit") {
      const mr = moonRec.moonOrbit + bodies.earth.radius * 0.9;
      c.scale.setScalar(mr / moonRec.moonOrbit);
    }
  });

  // --- asteroid belt ---
  const beltIn = THREE.MathUtils.lerp(40.5, 59, modeT);
  const beltOut = THREE.MathUtils.lerp(45, 76, modeT);
  for (let i = 0; i < BELT_N; i++) {
    const b = beltData[i];
    b.angle += b.speed * dt * orbitFactor * 8;
    const r = THREE.MathUtils.lerp(beltIn, beltOut, b.frac);
    dummy.position.set(Math.cos(b.angle) * r, b.y, Math.sin(b.angle) * r);
    dummy.rotation.set(b.rot, b.rot * 1.7, b.rot * 0.6);
    dummy.scale.setScalar(b.scale);
    dummy.updateMatrix();
    belt.setMatrixAt(i, dummy.matrix);
  }
  belt.instanceMatrix.needsUpdate = true;

  // --- star stage idle motion ---
  stageStar.rotation.y += dt * 0.05;
  if (mode === "star" && selectedStar) {
    const r = stage.userData.starRadius || 5;
    stageGlow.material.opacity = 0.85 + Math.sin(t * 1.8) * 0.1;
    stageGlow.scale.setScalar(r * 5.2 * (1 + Math.sin(t * 1.8) * 0.03));
  }

  // --- camera flight ---
  if (flight) {
    flight.t += dt;
    const k = easeInOut(Math.min(flight.t / flight.dur, 1));
    camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
    controls.target.lerpVectors(flight.fromTg, flight.toTg, k);
    if (flight.t >= flight.dur) { const dn = flight.done; flight = null; if (dn) dn(); }
  } else if (selectedBody && mode === "system") {
    // follow: shift camera & target by the body's movement, ease the framing in
    bodyWorldPos(selectedBody, tmpV);
    const delta = tmpV.clone().sub(controls.target).multiplyScalar(0.14);
    controls.target.add(delta);
    camera.position.add(delta);
    const desired = Math.max(selectedBody.radius * 6.5, 8);
    const dir = camera.position.clone().sub(controls.target);
    const cur = dir.length();
    const newLen = THREE.MathUtils.lerp(cur, desired, 0.045);
    camera.position.copy(controls.target).addScaledVector(dir.normalize(), newLen);
  }

  controls.update();

  // --- labels (with screen-space declutter: greedy placement, the
  // followed/selected body first; overlapping labels are hidden) ---
  if (labelsOn) {
    const rect = viewRect();
    const candidates = [];
    for (const L of labels) {
      const show = (mode === "system" && L.systemOnly) || (mode === "star" && L.starOnly);
      if (!show || (L.starOnly && !selectedStar)) { L.el.style.display = "none"; continue; }
      const wp = L.getPos();
      const dist = camera.position.distanceTo(wp);
      const proj = wp.clone().project(camera);
      if (proj.z > 1 || proj.z < -1) { L.el.style.display = "none"; continue; }
      L.el.style.display = "";
      const x = rect.left + (proj.x * 0.5 + 0.5) * rect.width;
      const y = rect.top + (-proj.y * 0.5 + 0.5) * rect.height;
      L.el.style.left = x + "px";
      L.el.style.top = y + "px";
      let priority = 100;
      if (L.starOnly) priority = 900;
      if (selectedBody && L.el.textContent === selectedBody.data.name) priority = 1000;
      candidates.push({
        el: L.el, x, y, priority,
        w: L.el.offsetWidth || 70, h: L.el.offsetHeight || 16,
        baseOpacity: THREE.MathUtils.clamp(1.6 - dist / 260, 0.25, 1),
      });
    }
    candidates.sort((a, b) => b.priority - a.priority);
    const placed = [];
    for (const c of candidates) {
      // The label is drawn above its anchor (translate -50%, -150%).
      const box = { l: c.x - c.w / 2 - 4, r: c.x + c.w / 2 + 4, t: c.y - c.h * 1.7 - 4, b: c.y + 4 };
      if (placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) {
        c.el.style.opacity = "0";
        continue;
      }
      placed.push(box);
      c.el.style.opacity = String(c.baseOpacity);
    }
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", resizeView);

// First frame rendered — lift the loading veil.
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.getElementById("loading").classList.add("done");
}));
