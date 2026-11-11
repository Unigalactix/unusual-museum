// Verdant — interactive 3D garden: lentils & legumes, vegetables, leafy greens.
// Original code. Rendering targets a warm, life-like look: ACES tone mapping,
// soft shadows, an image-based environment, clearcoat skins on glossy produce,
// and canvas-generated textures (wood grain, soil, leaf veins, potato speckle).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PRODUCE, ZONES } from './produce.js';

/* ---------------------------------- setup --------------------------------- */
const canvas = document.getElementById('scene');
const stage = document.getElementById('stage');
// Stage-relative size: the canvas is confined to the centre .stage column,
// so all sizing / picking / projection math uses the stage element's box,
// never the window.
function stageSize() {
  const r = (stage || canvas).getBoundingClientRect();
  return { width: Math.max(1, r.width), height: Math.max(1, r.height) };
}
const initialSize = stageSize();
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  document.getElementById('webgl-fail').hidden = false;
  document.getElementById('loading').style.display = 'none';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(initialSize.width, initialSize.height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8dcf2);
scene.fog = new THREE.Fog(0xcfead2, 55, 130);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(46, initialSize.width / initialSize.height, 0.1, 400);
camera.position.set(0, 17, 34);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3;
controls.maxDistance = 70;
controls.target.set(0, 1, 0);

/* ---------------------------------- lights -------------------------------- */
const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
sun.position.set(18, 30, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -34; sun.shadow.camera.right = 34;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0004;
sun.shadow.radius = 4;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x6d9a5f, 0.85));
const bounce = new THREE.DirectionalLight(0xd8f0ff, 0.35);
bounce.position.set(-14, 10, -18);
scene.add(bounce);

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
// Deterministic sprinkling so textures look the same on every load.
function sprinkle(ctx, n, w, h, colors, rMin, rMax, rng) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[(rng() * colors.length) | 0];
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, rMin + rng() * (rMax - rMin), rMin * 0.7 + rng() * rMax * 0.5, rng() * 3, 0, 7);
    ctx.fill();
  }
}
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const woodTex = canvasTexture(512, 256, (ctx, w, h) => {
  ctx.fillStyle = '#9a6b3f'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(7);
  for (let i = 0; i < 46; i++) {
    ctx.strokeStyle = `rgba(${60 + rng() * 40 | 0},${38 + rng() * 26 | 0},18,${0.12 + rng() * 0.22})`;
    ctx.lineWidth = 1 + rng() * 3;
    ctx.beginPath();
    const y = rng() * h; ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
    ctx.stroke();
  }
  sprinkle(ctx, 26, w, h, ['rgba(70,45,20,.35)', 'rgba(190,145,95,.3)'], 2, 6, rng);
}, [2, 1]);
const soilTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#4a3421'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(21);
  sprinkle(ctx, 2600, w, h, ['#3a2817', '#5d422a', '#6d5133', '#2e1f12', '#7d6242'], 1, 5, rng);
  sprinkle(ctx, 120, w, h, ['#8a7350', '#97835f'], 1, 2.5, rng);
}, [3, 3]);
const grassTex = canvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#79b657'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(4);
  sprinkle(ctx, 3200, w, h, ['#6aa84e', '#8cc46a', '#5d9c44', '#a4d184'], 1, 3, rng);
}, [10, 6]);
function leafTexture(base, vein) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    const rng = mulberry(base.length * 31 + 5);
    sprinkle(ctx, 500, w, h, ['rgba(255,255,255,.05)', 'rgba(0,60,0,.08)'], 2, 7, rng);
    ctx.strokeStyle = vein; ctx.lineWidth = 5; ctx.globalAlpha = 0.75;
    ctx.beginPath(); ctx.moveTo(w / 2, h); ctx.quadraticCurveTo(w / 2 + 6, h / 2, w / 2, 6); ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = 24 + i * 26;
      ctx.beginPath(); ctx.moveTo(w / 2, y + 22); ctx.quadraticCurveTo(w * 0.3, y + 8, 12, y - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w / 2, y + 22); ctx.quadraticCurveTo(w * 0.7, y + 8, w - 12, y - 14); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}
const potatoTex = canvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#c9a468'; ctx.fillRect(0, 0, w, h);
  const rng = mulberry(11);
  sprinkle(ctx, 700, w, h, ['rgba(160,125,80,.35)', 'rgba(220,185,130,.3)'], 1, 4, rng);
  sprinkle(ctx, 60, w, h, ['rgba(110,84,50,.55)'], 1.5, 3.5, rng); // eyes
});

/* ------------------------------- materials -------------------------------- */
const phys = (opts) => {
  const m = new THREE.MeshPhysicalMaterial(opts);
  m.envMapIntensity = 0.5;
  return m;
};
const std = (opts) => {
  const m = new THREE.MeshStandardMaterial(opts);
  m.envMapIntensity = 0.45;
  return m;
};
const woodMat = std({ map: woodTex, color: 0xb9925e, roughness: 0.85 });
const woodDark = std({ map: woodTex, color: 0x8a6238, roughness: 0.9 });
const soilMat = std({ map: soilTex, color: 0x9a7a58, roughness: 1 });

/* ------------------------------- leaf shapes ------------------------------ */
function leafGeometry(len = 1, wid = 0.42) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(wid, len * 0.3, wid * 0.8, len * 0.75, 0, len);
  s.bezierCurveTo(-wid * 0.8, len * 0.75, -wid, len * 0.3, 0, 0);
  const g = new THREE.ShapeGeometry(s, 10);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) { // gentle cup + midrib fold, and 0..1 UVs for the vein texture
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin((y / len) * Math.PI) * 0.1 - Math.abs(x) * 0.35);
    uv.setXY(i, (x + wid) / (2 * wid), y / len);
  }
  g.computeVertexNormals();
  return g;
}
function leafMesh(item, len, wid, tilt, yaw) {
  const base = '#' + new THREE.Color(item.color).getHexString();
  const vein = 'rgba(235,255,225,0.8)';
  const m = new THREE.Mesh(leafGeometry(len, wid),
    phys({ map: leafTexture(base, vein), color: 0xffffff, roughness: 0.55, clearcoat: 0.25,
      side: THREE.DoubleSide, transparent: true, opacity: 0.97, sheen: 0.4, sheenColor: new THREE.Color(0xcfffc8) }));
  m.rotation.set(tilt, yaw, 0, 'YXZ');
  m.castShadow = true;
  return m;
}
function leafyTop(item, n = 6, len = 0.85) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const leaf = leafMesh(item, len * (0.8 + (i % 3) * 0.15), 0.4, -0.5 - (i % 2) * 0.25, (i / n) * Math.PI * 2);
    leaf.position.y = 0.05;
    g.add(leaf);
  }
  return g;
}

/* --------------------------------- builders ------------------------------- */
function glossySkin(item, extra = {}) {
  return phys({ color: item.color, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.25, ...extra });
}
function bowl(item) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    pts.push(new THREE.Vector2(0.12 + Math.sin(t * Math.PI * 0.62) * 0.85, t * 0.42));
  }
  const bowlMesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 40),
    phys({ color: 0xb5651d, roughness: 0.35, clearcoat: 0.7, side: THREE.DoubleSide }));
  bowlMesh.castShadow = bowlMesh.receiveShadow = true;
  g.add(bowlMesh);
  // Heaped grains: one InstancedMesh of flattened spheres per bowl.
  const grainGeo = new THREE.SphereGeometry(0.075, 10, 8);
  const grains = new THREE.InstancedMesh(grainGeo, phys({ color: item.color, roughness: 0.45, clearcoat: 0.3 }), 90);
  const rng = mulberry(item.id.length * 977 + 13);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const col = new THREE.Color();
  for (let i = 0; i < 90; i++) {
    const r = Math.sqrt(rng()) * 0.68, a = rng() * Math.PI * 2;
    const dome = 0.34 + (1 - (r / 0.75) ** 2) * 0.2 + rng() * 0.05;
    e.set(rng() * 3, rng() * 3, rng() * 3); q.setFromEuler(e);
    v.set(Math.cos(a) * r, dome, Math.sin(a) * r);
    sc.set(1.25, 0.55, 1);
    m4.compose(v, q, sc); grains.setMatrixAt(i, m4);
    col.set(item.color).offsetHSL(0, 0, (rng() - 0.5) * 0.09); grains.setColorAt(i, col);
  }
  grains.castShadow = true;
  g.add(grains);
  return g;
}
function stem(color = 0x3f7d2c, h = 0.28) {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, h, 10), std({ color, roughness: 0.7 }));
  s.position.y = h / 2; s.castShadow = true;
  return s;
}
function cluster(item, r, n, squash = 1) {
  const g = new THREE.Group();
  const rng = mulberry(item.id.length * 331 + 7);
  const geo = new THREE.SphereGeometry(r, 14, 12);
  const mat = phys({ color: item.color, roughness: 0.5, clearcoat: 0.2 });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, mat);
    const a = rng() * Math.PI * 2, rr = rng() * r * 1.5, y = rng() * r * 1.1;
    m.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
    m.scale.setScalar(0.8 + rng() * 0.5); m.scale.y *= squash;
    m.castShadow = true; g.add(m);
  }
  return g;
}
const BUILDERS = {
  bowl,
  tomato(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 48, 32), glossySkin(item));
    body.scale.y = 0.82; body.position.y = 0.45; body.castShadow = true; g.add(body);
    const top = new THREE.Group(); top.position.y = 0.85;
    top.add(stem(item.accent, 0.22));
    const star = leafyTop({ ...item, color: item.accent }, 5, 0.34); star.scale.setScalar(0.8); top.add(star);
    g.add(top);
    return g;
  },
  carrot(item) {
    const g = new THREE.Group();
    const root = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.15, 32, 6),
      phys({ color: item.color, roughness: 0.4, clearcoat: 0.4 }));
    root.rotation.x = Math.PI; root.position.y = 0.62; root.castShadow = true; g.add(root);
    const top = leafyTop(item, 6, 0.62); top.position.y = 1.18; g.add(top);
    g.rotation.z = 0.5; g.position.y = -0.18;
    return g;
  },
  potato(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 28),
      std({ map: potatoTex, color: 0xd8ba8a, roughness: 0.95 }));
    body.scale.set(1.25, 0.8, 0.9); body.position.y = 0.4; body.rotation.y = 0.7;
    body.castShadow = body.receiveShadow = true; g.add(body);
    return g;
  },
  onion(item) {
    const g = new THREE.Group();
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, a = t * Math.PI;
      pts.push(new THREE.Vector2(Math.sin(a) * 0.48 * (1 - t * 0.25), t * 0.95));
    }
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 40),
      phys({ color: item.color, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.3 }));
    body.position.y = 0.02; body.castShadow = true; g.add(body);
    const sprout = stem(0x7cb668, 0.3); sprout.position.y = 0.92; g.add(sprout);
    return g;
  },
  pepper(item) {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 24), glossySkin(item));
      const a = (i / 4) * Math.PI * 2;
      lobe.position.set(Math.cos(a) * 0.16, 0.46, Math.sin(a) * 0.16);
      lobe.scale.set(0.82, 1.05, 0.82); lobe.castShadow = true; g.add(lobe);
    }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.1, 20), std({ color: item.accent === 0xd93625 ? 0x2e7d32 : 0x2e7d32, roughness: 0.6 }));
    cap.position.y = 0.92; g.add(cap);
    const st = stem(0x2e7d32, 0.26); st.position.y = 0.95; st.rotation.z = 0.25; g.add(st);
    return g;
  },
  eggplant(item) {
    const g = new THREE.Group();
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push(new THREE.Vector2(Math.sin(Math.pow(t, 0.7) * Math.PI * 0.72) * 0.42, t * 1.15));
    }
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), glossySkin(item, { roughness: 0.16 }));
    body.rotation.z = 0.35; body.position.y = 0.08; body.castShadow = true; g.add(body);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), std({ color: 0x4d8f3a, roughness: 0.6 }));
    cap.scale.y = 0.55; cap.position.set(-0.38, 1.08, 0); g.add(cap);
    return g;
  },
  cauliflower(item) {
    const g = new THREE.Group();
    const head = cluster(item, 0.21, 26, 0.85); head.position.y = 0.42; g.add(head);
    const base = leafyTop({ ...item, color: item.accent }, 7, 0.6); base.scale.setScalar(1.15); g.add(base);
    return g;
  },
  broccoli(item) {
    const g = new THREE.Group();
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.55, 16), std({ color: 0x8fae6a, roughness: 0.8 }));
    stalk.position.y = 0.28; stalk.castShadow = true; g.add(stalk);
    const crown = cluster(item, 0.19, 24, 0.9); crown.position.y = 0.72; crown.scale.setScalar(1.25); g.add(crown);
    return g;
  },
  pumpkin(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 40),
      phys({ color: item.color, roughness: 0.42, clearcoat: 0.55 }));
    const pos = body.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { // ribbed pumpkin: pinch radius by angle
      const x = pos.getX(i), z = pos.getZ(i);
      const ang = Math.atan2(z, x);
      const f = 1 - 0.07 * Math.abs(Math.sin(ang * 5));
      pos.setX(i, x * f); pos.setZ(i, z * f);
    }
    body.geometry.computeVertexNormals();
    body.scale.y = 0.78; body.position.y = 0.48; body.castShadow = body.receiveShadow = true; g.add(body);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.3, 10), std({ color: 0x6b8f3a, roughness: 0.85 }));
    st.position.y = 1.0; st.rotation.z = 0.2; st.castShadow = true; g.add(st);
    return g;
  },
  cucumber(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.85, 10, 24),
      phys({ color: item.color, roughness: 0.3, clearcoat: 0.7 }));
    body.rotation.z = Math.PI / 2 - 0.18; body.position.y = 0.3; body.castShadow = true; g.add(body);
    return g;
  },
  beetroot(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.44, 40, 28),
      phys({ color: item.color, roughness: 0.35, clearcoat: 0.7 }));
    body.position.y = 0.46; body.castShadow = true; g.add(body);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 12), std({ color: item.color, roughness: 0.7 }));
    tail.rotation.x = Math.PI; tail.position.y = 0.08; g.add(tail);
    const top = leafyTop({ ...item, color: 0xb03060 }, 6, 0.55); top.position.y = 0.86; g.add(top);
    return g;
  },
  radish(item) {
    const g = new THREE.Group();
    const root = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 32),
      phys({ color: item.color, roughness: 0.35, clearcoat: 0.6 }));
    root.rotation.x = Math.PI; root.position.y = 0.55; root.castShadow = true; g.add(root);
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), phys({ color: item.accent, roughness: 0.4, clearcoat: 0.5 }));
    blush.scale.y = 0.6; blush.position.y = 1.0; g.add(blush);
    const top = leafyTop(item, 6, 0.55); top.position.y = 1.05; g.add(top);
    return g;
  },
  corn(item) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.23, 1.05, 20), std({ color: 0xf7e08a, roughness: 0.6 }));
    core.position.y = 0.62; core.rotation.z = 0.16; core.castShadow = true; g.add(core);
    // Kernels: instanced spheres in offset rows, with per-instance colour variation.
    const kGeo = new THREE.SphereGeometry(0.052, 10, 8);
    const kernels = new THREE.InstancedMesh(kGeo, phys({ roughness: 0.32, clearcoat: 0.65 }), 170);
    const m4 = new THREE.Matrix4(), col = new THREE.Color(); let idx = 0;
    for (let row = 0; row < 15 && idx < 170; row++) {
      const y = 0.16 + row * 0.066, r = 0.205 - row * 0.0022;
      const around = 11;
      for (let k = 0; k < around && idx < 170; k++) {
        const a = (k / around) * Math.PI * 2 + (row % 2) * 0.28;
        m4.makeTranslation(Math.cos(a) * r - (y - 0.62) * Math.tan(0.16), y, Math.sin(a) * r);
        kernels.setMatrixAt(idx, m4);
        col.set(0xf5c81e).offsetHSL((Math.random() - 0.5) * 0.012, 0, (Math.random() - 0.5) * 0.1);
        kernels.setColorAt(idx, col); idx++;
      }
    }
    kernels.count = idx; kernels.castShadow = true; g.add(kernels);
    for (let i = 0; i < 3; i++) { // husk leaves peeling back
      const husk = leafMesh({ ...item, color: 0x6da544 }, 0.95, 0.3, -1.9, i * 2.1);
      husk.position.y = 0.1; g.add(husk);
    }
    return g;
  },
  peas(item) {
    const g = new THREE.Group();
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.75, 8, 20),
      phys({ color: item.color, roughness: 0.3, clearcoat: 0.75 }));
    pod.rotation.z = Math.PI / 2 - 0.35; pod.position.y = 0.42; pod.castShadow = true; g.add(pod);
    for (let i = 0; i < 5; i++) { // pea bumps showing through the pod
      const bump = new THREE.Mesh(new THREE.SphereGeometry(0.155, 18, 14), phys({ color: item.accent, roughness: 0.35, clearcoat: 0.6 }));
      bump.position.set(-0.36 + i * 0.19, 0.42 + Math.sin(i * 0.6) * 0.02 + i * 0.045, 0.02);
      bump.scale.set(1, 1, 0.55); g.add(bump);
    }
    return g;
  },
  okra(item) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.15, 0.95, 10),
        phys({ color: item.color, roughness: 0.35, clearcoat: 0.6 }));
      pod.position.set((i - 1) * 0.17, 0.55, (i % 2) * 0.1);
      pod.rotation.z = (i - 1) * 0.16; pod.castShadow = true; g.add(pod);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.09, 10), std({ color: 0x9db38a, roughness: 0.8 }));
      cap.position.copy(pod.position); cap.position.y = 1.05; cap.rotation.z = pod.rotation.z; g.add(cap);
    }
    return g;
  },
  bittergourd(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24),
      phys({ color: item.color, roughness: 0.5, clearcoat: 0.3 }));
    body.scale.set(1, 0.75, 2.1); body.rotation.x = 0.25; body.position.y = 0.34; body.castShadow = true; g.add(body);
    const bumps = cluster({ ...item, color: item.accent }, 0.055, 42, 1);
    bumps.children.forEach(b => { // move the cluster onto the gourd surface, stretched along z
      b.position.z *= 2.0; b.position.y = b.position.y * 0.5 + 0.34; b.position.x *= 0.85;
    });
    g.add(bumps);
    return g;
  },
  bottlegourd(item) {
    const g = new THREE.Group();
    const pts = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      const r = 0.16 + Math.sin(Math.min(t * 1.7, 1) * Math.PI * 0.55) * 0.26 * (1 - t * 0.35);
      pts.push(new THREE.Vector2(Math.max(r, 0.05), t * 1.25));
    }
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 40),
      phys({ color: item.color, roughness: 0.32, clearcoat: 0.65 }));
    body.position.y = 0.03; body.castShadow = true; g.add(body);
    const st = stem(0x7ba05b, 0.16); st.position.y = 1.25; g.add(st);
    return g;
  },
  zucchini(item) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.9, 10, 24), glossySkin(item));
    body.rotation.z = Math.PI / 2 - 0.12; body.position.y = 0.28; body.castShadow = true; g.add(body);
    const blossom = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 10), std({ color: 0xf2b134, roughness: 0.6 }));
    blossom.rotation.z = -Math.PI / 2; blossom.position.set(0.62, 0.34, 0); g.add(blossom);
    return g;
  },
  // -------- leafy greens --------
  rosette(item) {
    const g = new THREE.Group();
    const outer = leafyTop(item, 9, 1.0); g.add(outer);
    const inner = leafyTop({ ...item, color: item.accent }, 6, 0.6); inner.position.y = 0.16; g.add(inner);
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), phys({ color: item.accent, roughness: 0.5 }));
    heart.scale.y = 0.8; heart.position.y = 0.22; g.add(heart);
    return g;
  },
  bunch(item) {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const leaf = leafMesh(item, 1.05, 0.4, -0.22 - (i % 3) * 0.1, (i / 8) * Math.PI * 2);
      leaf.position.set(Math.cos(i * 2.4) * 0.09, 0, Math.sin(i * 2.4) * 0.09);
      g.add(leaf);
    }
    const stems = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.4, 12),
      std({ color: item.id === 'swiss-chard' ? item.accent : 0xe6efdb, roughness: 0.6 }));
    stems.position.y = 0.16; g.add(stems);
    return g;
  },
  head(item) {
    const g = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 32),
      phys({ map: leafTexture('#' + new THREE.Color(item.color).getHexString(), 'rgba(240,255,235,.85)'), color: 0xffffff, roughness: 0.5, clearcoat: 0.3 }));
    headMesh.scale.y = 0.82; headMesh.position.y = 0.44; headMesh.castShadow = true; g.add(headMesh);
    const skirt = leafyTop(item, 8, 0.62); skirt.scale.setScalar(1.2); g.add(skirt);
    return g;
  },
  herb(item) {
    const g = new THREE.Group();
    const rng = mulberry(item.id.length * 53 + 3);
    for (let s = 0; s < 7; s++) {
      const sx = (rng() - 0.5) * 0.5, sz = (rng() - 0.5) * 0.5, h = 0.4 + rng() * 0.3;
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, h, 6), std({ color: 0x4d7d3a, roughness: 0.8 }));
      st.position.set(sx, h / 2, sz); g.add(st);
      for (let l = 0; l < 4; l++) {
        const leaf = leafMesh(item, 0.3, 0.2, -0.7, rng() * 6.3);
        leaf.position.set(sx, h * (0.5 + l * 0.15), sz); leaf.scale.setScalar(0.75);
        g.add(leaf);
      }
    }
    return g;
  },
};

/* ------------------------------ garden layout ----------------------------- */
const ZONE_CENTERS = { lentils: new THREE.Vector3(-16, 0, 0), vegetables: new THREE.Vector3(0, 0, 0), leafy: new THREE.Vector3(16, 0, 0) };

const ground = new THREE.Mesh(new THREE.CircleGeometry(46, 64), std({ map: grassTex, color: 0xa9d18a, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
scene.add(ground);
// Winding stone path through the zones
for (let i = 0; i < 15; i++) {
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.09, 9), std({ color: 0xcfc4ae, roughness: 0.95 }));
  stone.position.set(-21 + i * 3, 0.05, 5.6 + Math.sin(i * 0.9) * 0.7);
  stone.receiveShadow = true; scene.add(stone);
}
// Greenhouse ribs in the far background
for (let i = -2; i <= 2; i++) {
  const rib = new THREE.Mesh(new THREE.TorusGeometry(30, 0.14, 8, 40, Math.PI),
    std({ color: 0xdfe9e2, roughness: 0.4, metalness: 0.55 }));
  rib.position.set(i * 13, 0, -10); rib.rotation.y = Math.PI / 2;
  scene.add(rib);
}
// Pollen / light motes drifting in the sun
{
  const n = 260, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 56; p[i * 3 + 1] = 0.5 + Math.random() * 8; p[i * 3 + 2] = (Math.random() - 0.5) * 26; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: 0xfff6c8, size: 0.11, transparent: true, opacity: 0.65, depthWrite: false });
  const pts = new THREE.Points(g, m); pts.name = 'pollen'; scene.add(pts);
}

function plank(w, h, d, x, y, z, mat = woodMat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  return m;
}
// --- Lentil stall: posts, two shelves, a little roof ---
{
  const stall = new THREE.Group();
  [[-5.6, -1.6], [5.6, -1.6], [-5.6, 1.6], [5.6, 1.6]].forEach(([x, z]) => stall.add(plank(0.28, 3.6, 0.28, x, 1.8, z, woodDark)));
  stall.add(plank(12, 0.16, 3.4, 0, 1.02, 0));
  stall.add(plank(12, 0.16, 3.4, 0, 2.32, 0));
  const roof = plank(12.6, 0.12, 4.4, 0, 3.75, 0, woodDark); roof.rotation.x = -0.1; stall.add(roof);
  stall.position.copy(ZONE_CENTERS.lentils).setZ(-2);
  scene.add(stall);
}
// --- Vegetable crates + leafy raised beds (frames; items bring their own topsoil) ---
function soilBox(w, d, x, y, z) {
  const grp = new THREE.Group();
  const frame = plank(w, 0.5, d, 0, 0, 0); grp.add(frame);
  const soil = new THREE.Mesh(new THREE.BoxGeometry(w - 0.25, 0.14, d - 0.25), soilMat);
  soil.position.y = 0.3; soil.receiveShadow = true; grp.add(soil);
  grp.position.set(x, y, z);
  return grp;
}

/* --------------------------- place all the produce ------------------------ */
const registry = new Map();   // id -> { data, group, labelEl, labelY, baseY }
const pickables = [];
const sway = [];
const rngPos = mulberry(99);

function register(item, group, pos, labelY) {
  group.position.copy(pos);
  group.traverse(o => { o.userData.produceId = item.id; if (o.isMesh) { o.castShadow = true; } });
  scene.add(group);
  const el = document.createElement('div');
  el.className = 'label'; el.textContent = item.name;
  document.getElementById('labels').appendChild(el);
  registry.set(item.id, { data: item, group, labelEl: el, labelY, swayPhase: rngPos() * 6.28 });
  group.traverse(o => { if (o.isMesh) pickables.push(o); });
  if (item.zone === 'leafy') sway.push(registry.get(item.id));
}

const lentils = PRODUCE.filter(p => p.zone === 'lentils');
lentils.forEach((item, i) => {
  const row = Math.floor(i / 5), col = i % 5;
  const x = ZONE_CENTERS.lentils.x - 4.6 + col * 2.3;
  const y = row === 0 ? 1.1 : 2.4;
  register(item, BUILDERS[item.model](item), new THREE.Vector3(x, y, -2), 1.15);
});
const veg = PRODUCE.filter(p => p.zone === 'vegetables');
veg.forEach((item, i) => {
  const col = i % 6, row = Math.floor(i / 6);
  const x = -6.4 + col * 2.55, z = -4.4 + row * 4.4;
  scene.add(soilBox(2.2, 2.2, x, 0.28, z));
  register(item, BUILDERS[item.model](item), new THREE.Vector3(x, 0.86, z), 1.75);
});
const leafy = PRODUCE.filter(p => p.zone === 'leafy');
leafy.forEach((item, i) => {
  const bed = Math.floor(i / 6), col = i % 6;
  const x = ZONE_CENTERS.leafy.x - 5.6 + col * 2.25, z = bed === 0 ? -3.4 : 3.4;
  register(item, BUILDERS[item.model](item), new THREE.Vector3(x, 0.92, z), 1.6);
});
{ // the two long raised beds under the leafy rows
  const bedGeo = new THREE.Group();
  [-3.4, 3.4].forEach(z => bedGeo.add(soilBox(13.6, 2.6, ZONE_CENTERS.leafy.x, 0.32, z)));
  scene.add(bedGeo);
}

/* ------------- real licensed GLB models (see ../CREDITS.md) -------------
   Carrot, broccoli and eggplant load real models from Poly Pizza (CC BY /
   CC0). Each is normalised into the item's existing registered group, so
   labels, picking, search and the selection pulse all keep working; the
   new meshes join `pickables` under the same produce id. On any load
   error the procedural vegetable stays in its crate. */
const gltfLoader = new GLTFLoader();
function swapProduceWithGLB(id, url, target) {
  const rec = registry.get(id);
  if (!rec) return;
  gltfLoader.load(url, (gltf) => {
    const inner = gltf.scene;
    const box = new THREE.Box3().setFromObject(inner);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = target / maxDim;
    inner.scale.setScalar(s);
    inner.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    inner.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.userData.produceId = id;
        pickables.push(o);
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => { if (m && 'envMapIntensity' in m) m.envMapIntensity = 0.5; });
      }
    });
    rec.group.traverse(o => { if (o.isMesh) o.visible = false; }); // hide procedural first
    rec.group.add(inner);
  }, undefined, () => { /* GLB failed — procedural fallback stays */ });
}
swapProduceWithGLB('carrot', 'assets/models/carrot.glb', 1.25);
swapProduceWithGLB('broccoli', 'assets/models/broccoli.glb', 1.05);
swapProduceWithGLB('eggplant', 'assets/models/eggplant.glb', 1.15);

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
  const dir = new THREE.Vector3(c.x * 0.25, 0.35, 1).normalize();
  const dist = rec.data.zone === 'lentils' ? 3.4 : 4.2;
  flyTo(c.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, 0.8, 0)), c.clone().add(new THREE.Vector3(0, 0.35, 0)));
}
function select(id, fly = true) {
  selected = id;
  document.querySelectorAll('#item-list button').forEach(b => b.classList.toggle('selected', b.dataset.id === id));
  const info = document.getElementById('info');
  if (!id) { info.hidden = true; return; }
  const rec = registry.get(id), d = rec.data;
  document.getElementById('info-zone').textContent = (ZONES[d.zone].icon ? ZONES[d.zone].icon + ' ' : '') + ZONES[d.zone].label;
  document.getElementById('info-name').textContent = d.name;
  document.getElementById('info-alt').textContent = d.altName || '';
  document.getElementById('info-tagline').textContent = d.tagline;
  document.getElementById('info-nutrition').textContent = d.nutrition;
  document.getElementById('info-uses').textContent = d.uses;
  document.getElementById('info-fact').textContent = d.fact;
  info.hidden = false;
  info.classList.remove('panel-in'); void info.offsetWidth; info.classList.add('panel-in');
  if (fly) focusItem(rec);
}
document.getElementById('info-close').addEventListener('click', () => select(null));

function pickAt(cx, cy) {
  const r = canvas.getBoundingClientRect();
  pointer.x = ((cx - r.left) / Math.max(1, r.width)) * 2 - 1;
  pointer.y = -((cy - r.top) / Math.max(1, r.height)) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  return hits.length ? hits[0].object.userData.produceId : null;
}
let downAt = null;
canvas.addEventListener('pointermove', ev => {
  const id = pickAt(ev.clientX, ev.clientY);
  hovered = id;
  canvas.style.cursor = id ? 'pointer' : 'grab';
  if (id) {
    const d = registry.get(id).data;
    tooltip.hidden = false;
    tooltip.textContent = d.name + (d.altName ? ` · ${d.altName}` : '');
    const stageRect = canvas.getBoundingClientRect();
    tooltip.style.left = (ev.clientX - stageRect.left) + 'px'; tooltip.style.top = (ev.clientY - stageRect.top) + 'px';
  } else tooltip.hidden = true;
});
canvas.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; });
canvas.addEventListener('pointerup', ev => {
  if (!downAt) return;
  const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return; // it was a drag, not a click
  const id = pickAt(ev.clientX, ev.clientY);
  if (id) select(id);
});

/* ------------------------------ panel and nav ----------------------------- */
const listEl = document.getElementById('item-list');
function buildList(filter = '') {
  listEl.innerHTML = '';
  const f = filter.trim().toLowerCase();
  let any = false;
  for (const zone of Object.keys(ZONES)) {
    const items = PRODUCE.filter(p => p.zone === zone &&
      (!f || (p.name + ' ' + (p.altName || '') + ' ' + p.uses).toLowerCase().includes(f)));
    if (!items.length) continue;
    any = true;
    const h = document.createElement('h4'); h.textContent = (ZONES[zone].icon ? ZONES[zone].icon + ' ' : '') + ZONES[zone].label; listEl.appendChild(h);
    for (const item of items) {
      const b = document.createElement('button');
      b.dataset.id = item.id;
      if (item.id === selected) b.classList.add('selected');
      b.innerHTML = `<span class="dot" style="background:#${new THREE.Color(item.color).getHexString()}"></span><span>${item.name} <span class="alt">${item.altName || ''}</span></span>`;
      b.addEventListener('click', () => select(item.id));
      listEl.appendChild(b);
    }
  }
  if (!any) listEl.innerHTML = '<div class="empty">Nothing sprouted for that search — try another word.</div>';
}
buildList();
document.getElementById('search').addEventListener('input', e => buildList(e.target.value));

const ZONE_VIEWS = {
  lentils: [new THREE.Vector3(-16, 4.5, 9), new THREE.Vector3(-16, 1.6, -2)],
  vegetables: [new THREE.Vector3(0, 6, 13), new THREE.Vector3(0, 0.8, 0)],
  leafy: [new THREE.Vector3(16, 5, 11), new THREE.Vector3(16, 0.8, 0)],
  all: [new THREE.Vector3(0, 17, 34), new THREE.Vector3(0, 1, 0)],
};
document.querySelectorAll('#zone-nav button').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#zone-nav button').forEach(x => x.classList.toggle('active', x === b));
    const [p, t] = ZONE_VIEWS[b.dataset.zone];
    flyTo(p, t, 1500);
  });
});
const labelsToggle = document.getElementById('labels-toggle');

/* --------------------------------- loop ----------------------------------- */
const clock = new THREE.Clock();
const projV = new THREE.Vector3();
function updateLabels() {
  const show = labelsToggle.checked;
  const { width: stageW, height: stageH } = stageSize();
  for (const rec of registry.values()) {
    if (!show) { rec.labelEl.style.display = 'none'; continue; }
    rec.group.getWorldPosition(projV); projV.y += rec.labelY;
    projV.project(camera);
    if (projV.z > 1 || projV.z < -1) { rec.labelEl.style.display = 'none'; continue; }
    rec.labelEl.style.display = 'block';
    rec.labelEl.style.left = ((projV.x * 0.5 + 0.5) * stageW) + 'px';
    rec.labelEl.style.top = ((-projV.y * 0.5 + 0.5) * stageH) + 'px';
    rec.labelEl.style.opacity = selected && selected !== rec.data.id ? 0.45 : 1;
  }
}
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  // Leafy sway in the greenhouse breeze
  for (const rec of sway) {
    rec.group.rotation.z = Math.sin(t * 1.3 + rec.swayPhase) * 0.045;
    rec.group.rotation.x = Math.cos(t * 1.05 + rec.swayPhase) * 0.03;
  }
  const pollen = scene.getObjectByName('pollen');
  if (pollen) { pollen.rotation.y = t * 0.012; pollen.position.y = Math.sin(t * 0.3) * 0.25; }
  if (selected) { // gentle hero pulse on the selected item
    const rec = registry.get(selected);
    const s = 1 + Math.sin(t * 2.4) * 0.018;
    rec.group.scale.setScalar(s);
  }
  if (flight) {
    const k = Math.min((performance.now() - flight.start) / flight.dur, 1);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
    camera.position.lerpVectors(flight.p0, flight.p1, e);
    controls.target.lerpVectors(flight.t0, flight.t1, e);
    if (k >= 1) flight = null;
  }
  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}
animate();
requestAnimationFrame(() => {
  const l = document.getElementById('loading');
  l.style.opacity = '0';
  setTimeout(() => l.style.display = 'none', 650);
});

function onStageResize() {
  const { width, height } = stageSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
addEventListener('resize', onStageResize);
if (typeof ResizeObserver !== 'undefined' && stage) new ResizeObserver(onStageResize).observe(stage);
