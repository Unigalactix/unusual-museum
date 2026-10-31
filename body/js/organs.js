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
