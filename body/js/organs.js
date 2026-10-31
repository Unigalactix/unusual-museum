// BodyVerse — organ data.
// All names, descriptions and facts here are original text written for this
// project, summarising well-established basic anatomy.

// Body systems, in explorer display order.
export const SYSTEMS = [
  "Nervous",
  "Respiratory",
  "Cardiovascular",
  "Digestive",
  "Urinary",
  "Other",
];

export const ORGANS = [
  {
    id: "brain",
    name: "Brain",
    system: "Nervous",
    color: 0xf2a7bb,
    tagline: "The control centre of the body",
    description:
      "The brain is a soft, folded mass of nerve tissue that sits protected inside the skull. Its two hemispheres process sensation, movement, memory, language and thought, and it directs the rest of the body through the spinal cord and nerves.",
    fact: "Your brain runs on roughly 20 watts of electrical power — about enough to power a dim light bulb.",
  },
  {
    id: "spinal-cord",
    name: "Spinal Cord",
    system: "Nervous",
    color: 0xf7c873,
    tagline: "The information highway to the brain",
    description:
      "The spinal cord is a long bundle of nerves running from the base of the brain down the back, protected by the vertebrae. It carries signals between the brain and the body and coordinates quick reflex actions on its own.",
    fact: "If you stretched out all the nerves connected to your spinal cord, they would circle the Earth more than once.",
  },
  {
    id: "thyroid",
    name: "Thyroid",
    system: "Other",
    color: 0xd98cb3,
    tagline: "The butterfly gland that sets your pace",
    description:
      "The thyroid is a small butterfly-shaped gland wrapped around the front of the windpipe in the neck. It releases hormones that control how fast your body uses energy, affecting temperature, heart rate and growth.",
    fact: "The thyroid's hormones influence virtually every cell in the body — even a small imbalance can change how you feel day to day.",
  },
  {
    id: "trachea",
    name: "Trachea",
    system: "Respiratory",
    color: 0x9fd8e8,
    tagline: "The windpipe",
    description:
      "The trachea is a sturdy tube, held open by C-shaped rings of cartilage, that carries air from the throat down into the chest. At its base it splits into two bronchi, one entering each lung.",
    fact: "The cartilage rings of the trachea are open at the back, which lets the nearby oesophagus expand when you swallow a large bite.",
  },
  {
    id: "lungs",
    name: "Lungs",
    system: "Respiratory",
    color: 0x7fc4e8,
    tagline: "Two spongy air sacs that trade gases",
    description:
      "The lungs are a pair of light, spongy organs filling most of the chest. Inside them, millions of tiny air sacs called alveoli pass oxygen into the blood and take carbon dioxide out. The right lung has three lobes; the slightly smaller left lung has two, leaving room for the heart.",
    fact: "Spread flat, the inner surface of your lungs would cover roughly the area of a tennis court.",
  },
  {
    id: "heart",
    name: "Heart",
    system: "Cardiovascular",
    color: 0xd93636,
    tagline: "A fist-sized pump that never rests",
    description:
      "The heart is a muscular pump, about the size of your fist, sitting between the lungs and tilted slightly to the left. Its four chambers work in a steady rhythm: the right side sends blood to the lungs, and the stronger left side pushes it out to the whole body.",
    fact: "Your heart beats around 100,000 times a day and can keep beating outside the body for a short time because it generates its own electrical impulses.",
  },
  {
    id: "aorta",
    name: "Aorta & Vena Cava",
    system: "Cardiovascular",
    color: 0xe05252,
    tagline: "The body's main highway for blood",
    description:
      "The aorta is the largest artery in the body. It arches out of the top of the heart and runs down through the chest and abdomen, branching off to supply every organ. Beside it, the inferior vena cava — the largest vein — returns blood from the lower body to the heart.",
    fact: "The aorta is about as wide as a garden hose, and blood leaves the heart through it at roughly 30 centimetres per second.",
  },
  {
    id: "diaphragm",
    name: "Diaphragm",
    system: "Respiratory",
    color: 0xe8a87c,
    tagline: "The dome that powers breathing",
    description:
      "The diaphragm is a broad, dome-shaped sheet of muscle separating the chest from the abdomen. When it contracts and flattens, it draws air into the lungs; when it relaxes, air is pushed out. It does most of the work of quiet breathing.",
    fact: "Hiccups are sudden, involuntary contractions of the diaphragm — the sharp intake of air is what makes the sound.",
  },
  {
    id: "liver",
    name: "Liver",
    system: "Digestive",
    color: 0xa63d2e,
    tagline: "The body's chemical factory",
    description:
      "The liver is the largest internal organ, tucked under the right side of the diaphragm. It filters blood from the digestive system, breaks down toxins and old cells, stores energy as glycogen, and makes bile to help digest fats.",
    fact: "The liver can regrow itself — it can lose up to two-thirds of its mass and grow back to full size within months.",
  },
  {
    id: "gallbladder",
    name: "Gallbladder",
    system: "Digestive",
    color: 0x7cb342,
    tagline: "A small green storehouse for bile",
    description:
      "The gallbladder is a small pear-shaped pouch nestled under the liver. It stores and concentrates bile made by the liver, then squeezes it into the small intestine when fatty food arrives.",
    fact: "The gallbladder is not essential — people who have it removed digest food almost normally, because bile still drips directly from the liver.",
  },
  {
    id: "stomach",
    name: "Stomach",
    system: "Digestive",
    color: 0xe88ca0,
    tagline: "A muscular mixing bag",
    description:
      "The stomach is a J-shaped, muscular sac in the upper abdomen. It churns food together with acid and digestive enzymes, turning a meal into a soupy mixture called chyme before passing it into the small intestine.",
    fact: "Your stomach gets a new lining every few days — otherwise its own acid would digest it.",
  },
  {
    id: "pancreas",
    name: "Pancreas",
    system: "Digestive",
    color: 0xf0d48a,
    tagline: "Two jobs: digestion and blood sugar",
    description:
      "The pancreas is a soft, elongated gland lying behind the stomach. It pours powerful digestive juices into the small intestine, and it also releases the hormones insulin and glucagon, which keep blood sugar in balance.",
    fact: "Pancreatic juice is so potent it can digest fats, proteins and carbohydrates — the pancreas protects itself by releasing the enzymes in an inactive form.",
  },
  {
    id: "spleen",
    name: "Spleen",
    system: "Other",
    color: 0x8e5ba6,
    tagline: "The blood's quality inspector",
    description:
      "The spleen is a soft, fist-sized organ on the left side, tucked under the ribs near the stomach. It filters the blood, removes worn-out red blood cells, stores platelets and white blood cells, and helps the immune system spot infections.",
    fact: "The spleen holds a reserve of blood that the body can release in an emergency, such as after heavy bleeding.",
  },
  {
    id: "kidneys",
    name: "Kidneys",
    system: "Urinary",
    color: 0xb03050,
    tagline: "Twin filters for your blood",
    description:
      "The kidneys are two bean-shaped organs at the back of the abdomen, one on each side of the spine. They filter waste and excess water from the blood to make urine, while carefully holding on to what the body still needs.",
    fact: "Your kidneys filter about 180 litres of fluid every day — yet only one or two litres leave the body as urine.",
  },
  {
    id: "small-intestine",
    name: "Small Intestine",
    system: "Digestive",
    color: 0xf0a868,
    tagline: "Where most digestion and absorption happen",
    description:
      "The small intestine is a long, tightly coiled tube filling the centre of the abdomen. Its inner wall is covered in millions of tiny finger-like villi that absorb nutrients from digested food into the bloodstream.",
    fact: "Despite its name, the small intestine is about six metres long — roughly four times your height.",
  },
  {
    id: "large-intestine",
    name: "Large Intestine",
    system: "Digestive",
    color: 0xc97b4a,
    tagline: "Reclaiming water, framing the abdomen",
    description:
      "The large intestine is a wider tube that frames the small intestine, running up one side of the abdomen, across the top, and down the other side. It absorbs water and salts from what is left of digestion and prepares the remainder to leave the body.",
    fact: "The large intestine is home to trillions of microbes — roughly as many as there are human cells in your entire body.",
  },
  {
    id: "appendix",
    name: "Appendix",
    system: "Digestive",
    color: 0xd98c5f,
    tagline: "A tiny tube with a debated job",
    description:
      "The appendix is a slender, finger-sized pouch branching off the first part of the large intestine in the lower right abdomen. Long dismissed as useless, it is now thought to act as a safe house for helpful gut bacteria.",
    fact: "About 7% of people will have their appendix removed at some point in their lives.",
  },
  {
    id: "bladder",
    name: "Urinary Bladder",
    system: "Urinary",
    color: 0xf2cf6b,
    tagline: "A stretchy storage sac",
    description:
      "The bladder is a hollow, muscular sac in the pelvis. Thin tubes called ureters deliver urine to it drop by drop from the kidneys, and its walls stretch as it fills until signals tell you it is time to empty it.",
    fact: "A full bladder can hold about half a litre of urine — and it can stretch to nearly twice its resting size.",
  },
];

/* =====================================================================
   ANATOMY UPGRADE — procedural organ builders (v2)
   ---------------------------------------------------------------------
   The original inline builders live in main.js; these upgraded builders
   live here so main.js only needs a tiny wiring change (geometry was
   kept out of main.js while its label logic is edited separately).

   WIRING (replace the whole "organ builders" section of main.js with):

     import { ORGANS, SYSTEMS, ORGAN_BUILDERS, ORGAN_PLACEMENTS,
              ORGAN_FOCUS_DISTS } from "./organs.js";
     const builderCtx = { organMat, std, tube, mesh, wrinkle,
                          veinMap, veinBump, spongeBump };
     for (const o of ORGANS) {
       const g = ORGAN_BUILDERS[o.id](THREE, builderCtx);
       g.position.set(...ORGAN_PLACEMENTS[o.id]);
       registerOrgan(o.id, g, ORGAN_FOCUS_DISTS[o.id]);
     }

   Contract: each builder returns a THREE.Group built around its local
   origin, with the same overall extents and pivot behaviour as before
   (heart pivot = centre of mass for the beat scale; lungs pivot = base
   for the breathing scale). No positions are set inside the builders —
   placement comes from ORGAN_PLACEMENTS so anatomy tweaks never need
   main.js edits. All 18 ids match ORGANS exactly.
   ===================================================================== */

// Group positions — identical to the positions the current inline
// builders use, so wiring this in is behaviour-preserving.
export const ORGAN_PLACEMENTS = {
  "brain": [0, 19.75, 0.05],
  "spinal-cord": [0, 12.2, -0.95],
  "thyroid": [0, 16.2, 1.0],
  "trachea": [0, 14.3, 0.55],
  "lungs": [0, 10.15, -0.1],
  "heart": [0.55, 11.95, 0.72],
  "aorta": [0.1, 10.2, 0],
  "diaphragm": [0, 10.55, -0.05],
  "liver": [-1.7, 10.0, 0.25],
  "gallbladder": [-1.7, 9.35, 0.9],
  "stomach": [1.0, 9.85, 0.35],
  "pancreas": [0.4, 9.5, -0.5],
  "spleen": [2.8, 10.1, -0.4],
  "kidneys": [0, 9.05, -1.15],
  "small-intestine": [0, 6.95, 0.3],
  "large-intestine": [0, 7.05, 0.1],
  "appendix": [-2.1, 5.35, 0.2],
  "bladder": [0, 5.05, 0.55],
};

// Camera focus distances — same values registerOrgan() receives today.
export const ORGAN_FOCUS_DISTS = {
  "brain": 8, "spinal-cord": 12, "thyroid": 6, "trachea": 9, "lungs": 13,
  "heart": 8.5, "aorta": 12, "diaphragm": 12, "liver": 11, "gallbladder": 6,
  "stomach": 9, "pancreas": 9, "spleen": 7, "kidneys": 10,
  "small-intestine": 10, "large-intestine": 12, "appendix": 5, "bladder": 7,
};

export const ORGAN_BUILDERS = {
  // BRAIN — deep longitudinal fissure, stronger gyri, two-lobed
  // cerebellum with folia lines, brainstem.
  brain(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("brain", {
      color: 0xd3a1a9, roughness: 0.85, clearcoat: 0.06,
      clearcoatRoughness: 0.9, envMapIntensity: 0.25,
    });
    for (const s of [-1, 1]) {
      const hemi = ctx.mesh(ctx.wrinkle(new THREE.SphereGeometry(1.02, 32, 24), 0.055, 9), m, s * 0.62, 0.12, 0);
      hemi.scale.set(0.86, 0.8, 1.18);
      g.add(hemi);
    }
    // shadowed fissure strip down the midline
    const fissure = ctx.mesh(new THREE.BoxGeometry(0.1, 1.15, 2.15),
      ctx.std(0x9c6d76, { roughness: 0.95 }), 0, 0.28, 0);
    g.add(fissure);
    // cerebellum: two lobes + fine horizontal folia rings + brainstem
    const cm = ctx.organMat("brain", { color: 0xc48f99, roughness: 0.9, clearcoat: 0.04 });
    for (const s of [-1, 1]) {
      const lobe = ctx.mesh(ctx.wrinkle(new THREE.SphereGeometry(0.46, 20, 14), 0.02, 14), cm, s * 0.4, -0.58, -0.74);
      lobe.scale.set(1.0, 0.72, 0.78);
      g.add(lobe);
      for (let i = 0; i < 3; i++) {
        const folium = ctx.mesh(new THREE.TorusGeometry(0.4 - i * 0.05, 0.013, 6, 24),
          ctx.std(0xa87a84, { roughness: 0.95 }), s * 0.4, -0.72 + i * 0.15, -0.74);
        folium.rotation.x = Math.PI / 2;
        folium.scale.set(1, 0.8, 1);
        g.add(folium);
      }
    }
    const stem = ctx.mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.75, 12), cm, 0, -0.85, -0.42);
    stem.rotation.x = 0.35;
    g.add(stem);
    return g;
  },

  // SPINAL CORD — cord + blockier vertebrae with spinous processes,
  // fine cauda-equina strands at the lower end.
  "spinal-cord"(THREE, ctx) {
    const g = new THREE.Group();
    const pts = [[0, 6.4, 0.1], [0, 2.8, -0.05], [0, -1.2, -0.1], [0, -4.7, 0], [0, -6.4, 0.15]];
    g.add(ctx.tube(pts, 0.26, ctx.organMat("spinal-cord", { roughness: 0.5 })));
    const bone = ctx.std(0xe9e1cd, { transparent: true, opacity: 0.55, roughness: 0.65 });
    for (let i = 0; i < 8; i++) {
      const y = 5.4 - i * 1.55;
      const vert = ctx.mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.34, 12), bone, 0, y, -0.34);
      vert.scale.z = 0.82;
      g.add(vert);
      const proc = ctx.mesh(new THREE.BoxGeometry(0.16, 0.14, 0.5), bone, 0, y, -0.78);
      proc.rotation.x = 0.5;
      g.add(proc);
    }
    const strandM = ctx.organMat("spinal-cord", { roughness: 0.55 });
    for (const dx of [-0.14, 0, 0.14]) {
      g.add(ctx.tube([[dx, -6.2, 0.12], [dx * 2.2, -7.0, 0.2], [dx * 3.0, -7.7, 0.22]], 0.045, strandM, 12));
    }
    return g;
  },

  // THYROID — butterfly: two teardrop lobes hugging the trachea,
  // isthmus band across the front.
  thyroid(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("thyroid", { roughness: 0.5 });
    for (const s of [-1, 1]) {
      const lobe = ctx.mesh(new THREE.SphereGeometry(0.42, 20, 16), m, s * 0.37, 0, 0.02);
      lobe.scale.set(0.72, 1.38, 0.6);
      lobe.rotation.x = -0.12;
      g.add(lobe);
    }
    const isthmus = ctx.mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.66, 10), m, 0, -0.08, 0.26);
    isthmus.rotation.z = Math.PI / 2;
    isthmus.scale.z = 0.7;
    g.add(isthmus);
    return g;
  },

  // TRACHEA — tube with a slightly flattened back, stacked C-rings
  // (open at the back), carina split into two bronchi.
  trachea(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("trachea", { roughness: 0.5 });
    const shaft = ctx.mesh(new THREE.CylinderGeometry(0.33, 0.33, 3.1, 18), m, 0, 0, 0);
    shaft.scale.z = 0.9;
    g.add(shaft);
    const ringM = ctx.std(0xd8eef7, { roughness: 0.5 });
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.TorusGeometry(0.355, 0.05, 8, 24, Math.PI * 1.5);
      geo.rotateZ(-Math.PI / 4); // centre the gap, then lay flat -> gap faces back
      const r = ctx.mesh(geo, ringM, 0, 1.32 - i * 0.38, 0);
      r.rotation.x = Math.PI / 2;
      g.add(r);
    }
    for (const s of [-1, 1]) {
      g.add(ctx.tube([[0, -1.5, 0], [s * 0.35, -1.85, 0], [s * 0.8, -2.25, 0]], 0.19, m, 16));
    }
    return g;
  },

  // LUNGS — lobed construction: right 3 lobes, left 2 lobes + cardiac
  // notch; lobe overlaps leave fissure shadow lines. Base stays at the
  // group origin (breathing scale pivot).
  lungs(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("lungs", {
      transparent: true, opacity: 0.92, roughness: 0.55,
      bumpMap: ctx.spongeBump, bumpScale: 0.03,
      clearcoat: 0.55, clearcoatRoughness: 0.35,
    });
    const bronM = ctx.std(0x8fc9dd, { roughness: 0.5 });
    function lobe(cx, cy, cz, r, sx, sy, sz) {
      const l = ctx.mesh(new THREE.SphereGeometry(r, 24, 18), m, cx, cy, cz);
      l.scale.set(sx, sy, sz);
      return l;
    }
    // RIGHT lung (x = -2.0, larger): lower / middle / upper lobes
    g.add(lobe(-2.0, 1.35, 0, 1.05, 1.08, 1.35, 0.98));
    g.add(lobe(-1.82, 2.95, 0.28, 0.72, 1.0, 0.8, 0.95));
    g.add(lobe(-2.0, 4.05, 0, 0.92, 1.02, 1.15, 0.95));
    // LEFT lung (x = +2.0, smaller): lower / upper lobes + cardiac notch
    g.add(lobe(2.0, 1.3, 0, 1.0, 1.02, 1.4, 0.95));
    g.add(lobe(2.0, 3.7, 0, 0.9, 0.98, 1.25, 0.92));
    const notch = ctx.mesh(new THREE.SphereGeometry(0.52, 16, 12),
      ctx.std(0x4a90c2, { roughness: 0.7 }), 1.45, 2.65, 0.5);
    notch.scale.set(0.7, 1.0, 0.7);
    g.add(notch);
    // main bronchi stubs entering at the hilum
    for (const s of [-1, 1]) {
      const b = ctx.mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.95, 10), bronM, s * 1.32, 4.35, 0);
      b.rotation.z = s * 0.55;
      g.add(b);
    }
    return g;
  },

  // HEART — ventricle mass with apex down-left-forward, atrial bumps,
  // aorta arch with 3 branch stubs, pulmonary trunk split, SVC + IVC,
  // coronary groove arcs.
  heart(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("heart", {
      roughness: 0.34, map: ctx.veinMap, bumpMap: ctx.veinBump, bumpScale: 0.02,
      clearcoat: 0.9, clearcoatRoughness: 0.28,
    });
    const mass = ctx.mesh(new THREE.SphereGeometry(1.05, 28, 22), m, 0, -0.1, 0);
    mass.scale.set(1.04, 1.12, 0.98);
    g.add(mass);
    const apex = ctx.mesh(new THREE.ConeGeometry(0.74, 1.55, 24), m, 0.34, -0.95, 0.14);
    apex.rotation.z = 2.74; // tip down-left
    apex.rotation.x = 0.22; // ...and forward
    g.add(apex);
    for (const s of [-1, 1]) { // atria
      const a = ctx.mesh(new THREE.SphereGeometry(0.55, 18, 14), m, s * 0.44, 0.72, -0.08);
      a.scale.set(1, 0.8, 0.9);
      g.add(a);
    }
    const red = ctx.std(0xc22f2f, { roughness: 0.35 });
    const blue = ctx.std(0x3f6fd9, { roughness: 0.35 });
    // aorta: rises, arches back, 3 branch stubs on top of the arch
    g.add(ctx.tube([[-0.12, 0.85, -0.08], [-0.18, 1.5, -0.28], [-0.52, 1.78, -0.55], [-0.78, 1.42, -0.68]], 0.27, red, 32));
    const stubAt = [[-0.28, 1.86, -0.38], [-0.48, 1.95, -0.5], [-0.66, 1.9, -0.6]];
    for (const p of stubAt) {
      const st = ctx.mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.5, 10), red, p[0], p[1], p[2]);
      st.rotation.z = 0.2;
      g.add(st);
    }
    // pulmonary trunk splitting left/right (blue — blood heading to lungs)
    g.add(ctx.tube([[0.38, 0.72, 0.38], [0.3, 1.05, 0.05]], 0.19, blue, 12));
    g.add(ctx.tube([[0.3, 1.05, 0.05], [-0.45, 1.22, -0.3]], 0.14, blue, 12));
    g.add(ctx.tube([[0.3, 1.05, 0.05], [0.72, 1.18, -0.28]], 0.14, blue, 12));
    // SVC from above, IVC from below (blue)
    g.add(ctx.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.85, 14), blue, 0.58, 1.3, -0.18));
    const ivc = ctx.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.65, 14), blue, 0.52, -0.62, -0.28);
    ivc.rotation.x = 0.25;
    g.add(ivc);
    // coronary groove arcs across the front
    const grooveM = ctx.std(0x8e1f1f, { roughness: 0.5 });
    for (const gy of [0.18, -0.42]) {
      const arc = ctx.mesh(new THREE.TorusGeometry(0.98, 0.022, 6, 32, Math.PI * 0.75), grooveM, 0.02, gy, 0.42);
      arc.rotation.set(0.5, 0, Math.PI * 1.12);
      g.add(arc);
    }
    return g;
  },

  // AORTA & VENA CAVA — arch + descending aorta hugging the spine,
  // straighter IVC to its right.
  aorta(THREE, ctx) {
    const g = new THREE.Group();
    g.add(ctx.tube(
      [[0.45, 3.1, 0.6], [0.35, 4.4, 0.25], [-0.15, 4.85, -0.35], [-0.42, 4.2, -0.55],
       [-0.42, 1.8, -0.55], [-0.4, -1.8, -0.55], [-0.38, -5.0, -0.5]],
      0.29, ctx.organMat("aorta", { roughness: 0.35 })
    ));
    g.add(ctx.tube(
      [[0.88, -5.2, 0.2], [0.9, -1.8, 0.1], [0.88, 1.8, 0.28], [0.82, 2.9, 0.5]],
      0.32, ctx.std(0x3f6fd9, { roughness: 0.35 })
    ));
    return g;
  },

  // DIAPHRAGM — two domes (right higher, under the liver) + paler
  // central tendon, thin at the edges.
  diaphragm(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("diaphragm", { side: THREE.DoubleSide, roughness: 0.55 });
    const domeGeo = new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const right = ctx.mesh(domeGeo, m, -1.02, 0.18, 0); // body's right rides higher
    right.scale.set(1.95, 1.05, 2.5);
    const left = ctx.mesh(domeGeo, m, 1.02, 0, 0);
    left.scale.set(1.82, 0.9, 2.45);
    g.add(right, left);
    const tendon = ctx.mesh(new THREE.SphereGeometry(1, 20, 10),
      ctx.std(0xf0c8a8, { roughness: 0.6, side: THREE.DoubleSide }), 0, 0.62, 0.1);
    tendon.scale.set(1.05, 0.22, 1.35);
    g.add(tendon);
    return g;
  },

  // LIVER — wedge: big right lobe tapering to a thin left lobe,
  // porta-hepatis shadow notch underneath, falciform ridge on top.
  liver(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("liver", {
      roughness: 0.36, map: ctx.veinMap, bumpMap: ctx.veinBump, bumpScale: 0.02,
      clearcoat: 0.85, clearcoatRoughness: 0.3,
    });
    const rightLobe = ctx.mesh(new THREE.SphereGeometry(1.68, 30, 22), m, -0.45, 0, 0);
    rightLobe.scale.set(1.32, 0.6, 1.02);
    g.add(rightLobe);
    const leftLobe = ctx.mesh(new THREE.SphereGeometry(0.95, 24, 18), m, 1.95, 0.02, 0.05);
    leftLobe.scale.set(1.35, 0.4, 0.82);
    leftLobe.rotation.z = -0.05;
    g.add(leftLobe);
    const porta = ctx.mesh(new THREE.SphereGeometry(0.42, 14, 10),
      ctx.std(0x6e2a20, { roughness: 0.7 }), 0.15, -0.52, 0.28);
    porta.scale.set(1.1, 0.5, 0.8);
    g.add(porta);
    const falciform = ctx.mesh(new THREE.BoxGeometry(0.035, 0.5, 1.15),
      ctx.std(0xc46a55, { roughness: 0.6 }), 0.62, 0.62, 0.15);
    falciform.rotation.x = 0.35;
    g.add(falciform);
    return g;
  },

  // GALLBLADDER — lathe-turned pear: round fundus, narrow neck with a
  // short cystic-duct stub.
  gallbladder(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("gallbladder", { roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.3 });
    const profile = [[0.01, -0.55], [0.3, -0.48], [0.43, -0.2], [0.42, 0.18],
                     [0.28, 0.48], [0.13, 0.62], [0.1, 0.7]]
      .map((p) => new THREE.Vector2(p[0], p[1]));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 22), m));
    const duct = ctx.mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 8), m, 0.08, 0.82, 0);
    duct.rotation.z = -0.4;
    g.add(duct);
    return g;
  },

  // STOMACH — J tube with a fundus dome on top and a duodenum C-curve
  // curling off the pylorus.
  stomach(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("stomach", { roughness: 0.45 });
    g.add(ctx.tube(
      [[-0.15, 1.5, 0], [0.3, 1.05, 0], [0.52, 0.25, 0], [0.4, -0.6, 0],
       [-0.15, -1.0, 0], [-0.85, -0.9, 0], [-1.15, -0.45, -0.05],
       [-1.32, -0.85, -0.18], [-1.18, -1.22, -0.3]],
      0.47, m, 64
    ));
    const fundus = ctx.mesh(new THREE.SphereGeometry(0.62, 20, 16), m, -0.12, 1.42, 0);
    fundus.scale.set(1, 0.9, 0.95);
    g.add(fundus);
    return g;
  },

  // PANCREAS — lobulated chain of spheres: thick head, body, thin tail
  // reaching toward the spleen, slight upward tilt to the tail.
  pancreas(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("pancreas", { roughness: 0.6 });
    const lumps = [ // [x, y, r] head -> tail (local +x = toward stomach/duodenum)
      [1.05, -0.22, 0.47], [0.55, -0.08, 0.4], [0.05, 0.02, 0.35],
      [-0.45, 0.1, 0.3], [-0.9, 0.18, 0.25], [-1.3, 0.26, 0.19],
    ];
    for (const [x, y, r] of lumps) {
      const s = ctx.mesh(new THREE.SphereGeometry(r, 16, 12), m, x, y, 0);
      s.scale.set(1.15, 0.82, 0.72);
      g.add(s);
    }
    return g;
  },

  // SPLEEN — ovoid with a hilum notch (darker inset) on its inner face.
  spleen(THREE, ctx) {
    const g = new THREE.Group();
    const s = ctx.mesh(new THREE.SphereGeometry(0.72, 22, 16),
      ctx.organMat("spleen", { roughness: 0.45 }), 0, 0, 0);
    s.scale.set(0.62, 1.02, 0.44);
    s.rotation.z = 0.35;
    g.add(s);
    const hilum = ctx.mesh(new THREE.SphereGeometry(0.3, 14, 10),
      ctx.std(0x5f3d78, { roughness: 0.6 }), -0.34, 0.02, 0.06);
    hilum.scale.set(0.45, 0.85, 0.6);
    g.add(hilum);
    return g;
  },

  // KIDNEYS — true beans with medial hilum, renal vessel stubs, adrenal
  // caps, ureters running down to the bladder.
  kidneys(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("kidneys", { roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.3 });
    const dark = ctx.std(0x6e1f38, { roughness: 0.5 });
    const adrenalM = ctx.std(0xe8b34b, { roughness: 0.55 });
    const red = ctx.std(0xc23b3b, { roughness: 0.45 });
    const blue = ctx.std(0x3f6fd9, { roughness: 0.45 });
    for (const s of [-1, 1]) {
      const bean = ctx.mesh(new THREE.SphereGeometry(0.85, 24, 18), m, s * 2.15, 0, 0);
      bean.scale.set(0.78, 1.08, 0.58);
      bean.rotation.z = s * -0.1;
      g.add(bean);
      const hilum = ctx.mesh(new THREE.SphereGeometry(0.36, 14, 10), dark, s * 1.66, -0.02, 0.26);
      hilum.scale.set(0.55, 0.95, 0.6);
      g.add(hilum);
      const cap = ctx.mesh(new THREE.SphereGeometry(0.42, 14, 10), adrenalM, s * 2.12, 0.92, 0);
      cap.scale.set(1.05, 0.38, 0.8);
      cap.rotation.z = s * -0.15;
      g.add(cap);
      const art = ctx.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), red, s * 1.6, 0.12, 0.14);
      art.rotation.z = Math.PI / 2;
      const vein = ctx.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), blue, s * 1.6, -0.14, 0.2);
      vein.rotation.z = Math.PI / 2;
      g.add(art, vein);
    }
    const ureterM = ctx.std(0xd98aa6, { roughness: 0.5 });
    g.add(ctx.tube([[-1.78, -0.72, 0.18], [-1.15, -2.0, 0.7], [-0.4, -3.35, 1.35]], 0.09, ureterM, 24));
    g.add(ctx.tube([[1.78, -0.72, 0.18], [1.15, -2.0, 0.7], [0.4, -3.35, 1.35]], 0.09, ureterM, 24));
    return g;
  },

  // SMALL INTESTINE — denser, tighter coil pack inside the colon frame.
  "small-intestine"(THREE, ctx) {
    const pts = [];
    const turns = 72;
    for (let i = 0; i <= turns; i++) {
      const t = i / turns;
      pts.push([
        1.35 * Math.sin(t * Math.PI * 9),
        -1.05 + 2.1 * t,
        0.34 * Math.sin(t * Math.PI * 18),
      ]);
    }
    const g = new THREE.Group();
    g.add(ctx.tube(pts, 0.27, ctx.organMat("small-intestine", { roughness: 0.5 }), 300));
    return g;
  },

  // LARGE INTESTINE — frame tube + haustra: a chain of plump segments
  // along the same path gives the classic puckered colon look.
  "large-intestine"(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("large-intestine", { roughness: 0.5 });
    const framePts = [[-2.1, -1.6, 0], [-2.15, 0.2, 0], [-2.05, 1.45, 0], [-0.6, 1.68, 0],
                      [1.2, 1.62, 0], [2.05, 1.35, 0], [2.1, -0.4, 0], [2.0, -1.35, 0],
                      [0.9, -1.8, -0.1], [0.05, -1.95, -0.1]];
    g.add(ctx.tube(framePts, 0.42, m, 120));
    const curve = new THREE.CatmullRomCurve3(framePts.map((p) => new THREE.Vector3(...p)));
    const segGeo = new THREE.SphereGeometry(0.5, 14, 10);
    for (const p of curve.getPoints(30)) {
      const seg = ctx.mesh(segGeo, m, p.x, p.y, p.z);
      seg.scale.set(1, 0.94, 1);
      g.add(seg);
    }
    return g;
  },

  // APPENDIX — slender worm-like tube with a curled tip.
  appendix(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("appendix");
    g.add(ctx.tube([[0, 0.35, 0], [0.14, -0.02, 0.05], [0.1, -0.38, 0.04], [-0.05, -0.55, 0]], 0.1, m, 20));
    g.add(ctx.mesh(new THREE.SphereGeometry(0.11, 10, 8), m, -0.05, -0.57, 0));
    return g;
  },

  // BLADDER — lathe-turned pear: narrow neck below, fuller dome above.
  bladder(THREE, ctx) {
    const g = new THREE.Group();
    const m = ctx.organMat("bladder", { roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.32 });
    const profile = [[0.16, -0.62], [0.42, -0.45], [0.68, -0.1], [0.8, 0.35],
                     [0.72, 0.75], [0.45, 1.05], [0.01, 1.18]]
      .map((p) => new THREE.Vector2(p[0], p[1]));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 24), m));
    g.add(ctx.mesh(new THREE.CylinderGeometry(0.15, 0.21, 0.5, 12), m, 0, -0.82, 0));
    return g;
  },
};
