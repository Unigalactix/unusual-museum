export const ORGANELLES = [
  {
    id: "membrane",
    name: "Cell Membrane",
    label: "Cell membrane",
    color: "#5ec8e6",
    tagline: "The gatekeeper of the cell",
    description:
      "The cell membrane is a thin, flexible barrier made of a double layer of lipids dotted with proteins. It decides what may enter and leave, keeping the inside of the cell stable while letting nutrients, signals and waste pass through selective channels and pumps.",
    fact: "If you stretched out the membrane of a single cell it would be far too thin to see — it is only about 7 nanometres thick, yet it holds the entire cell together.",
  },
  {
    id: "nucleus",
    name: "Nucleus",
    label: "Nucleus",
    color: "#9b7ede",
    tagline: "The control centre",
    description:
      "The nucleus is the largest organelle in most animal cells and stores the DNA — the complete instruction set for building and running the cell. Its double envelope is pierced by pores that carefully control the flow of messages, such as messenger RNA, to the rest of the cell.",
    fact: "The DNA inside one human nucleus would stretch about 2 metres long if unwound, packed into a sphere only a few micrometres across.",
  },
  {
    id: "nucleolus",
    name: "Nucleolus",
    label: "Nucleolus",
    color: "#6a4fb0",
    tagline: "Where ribosomes are born",
    description:
      "Sitting inside the nucleus, the nucleolus is a dense knot of RNA and protein. Its job is to build the small and large subunits of ribosomes, which are then exported through the nuclear pores to start assembling proteins in the cytoplasm.",
    fact: "The nucleolus disappears and re-forms every time the cell divides — it is rebuilt from scratch around the same stretches of DNA.",
  },
  {
    id: "mitochondria",
    name: "Mitochondria",
    label: "Mitochondria",
    color: "#ff8c42",
    tagline: "The powerhouse — literally",
    description:
      "Mitochondria convert energy from food molecules into ATP, the chemical fuel almost every cellular process spends. They have their own small loop of DNA and a folded inner membrane, the cristae, whose huge surface area hosts the reactions of cellular respiration.",
    fact: "Mitochondria are descended from free-living bacteria that moved into an ancestor cell roughly 1.5 billion years ago — and never left.",
  },
  {
    id: "rough-er",
    name: "Rough Endoplasmic Reticulum",
    label: "Rough ER",
    color: "#e65a7a",
    tagline: "The protein workshop floor",
    description:
      "The rough endoplasmic reticulum is a maze of flattened membranes studded with ribosomes, which gives it a bumpy, sandpaper look under a microscope. Newly made proteins enter its channels to be folded, checked and shipped onward, mostly toward the Golgi apparatus.",
    fact: "Cells that secrete lots of protein, like antibody-making plasma cells, are packed with so much rough ER that it fills most of the cell.",
  },
  {
    id: "golgi",
    name: "Golgi Apparatus",
    label: "Golgi apparatus",
    color: "#f2c14e",
    tagline: "The post office of the cell",
    description:
      "The Golgi apparatus is a stack of curved, flattened sacs that receives proteins and lipids from the endoplasmic reticulum. It modifies them, tags them with destination labels, and packages them into vesicles that carry each delivery to the right place.",
    fact: "The Golgi is named after Camillo Golgi, who first saw it in 1898 — many scientists initially dismissed his discovery as a staining artefact.",
  },
  {
    id: "ribosomes",
    name: "Ribosomes",
    label: "Ribosomes",
    color: "#7dd069",
    tagline: "Tiny protein factories",
    description:
      "Ribosomes are small machines built from RNA and protein that read messenger RNA and stitch amino acids together into new proteins. Some float freely in the cytoplasm, while others sit on the rough ER making proteins destined for export or membranes.",
    fact: "A single busy cell can contain millions of ribosomes, and each one can add roughly 20 amino acids to a growing protein every second.",
  },
  {
    id: "lysosomes",
    name: "Lysosomes",
    label: "Lysosomes",
    color: "#e04e4e",
    tagline: "The clean-up crew",
    description:
      "Lysosomes are small sacs filled with powerful digestive enzymes. They break down worn-out organelles, debris and swallowed particles, recycling the raw materials so the cell can build replacements — a constant internal spring-clean.",
    fact: "The enzymes inside a lysosome work best in acid, so the organelle pumps itself to about pH 5 — roughly as acidic as tomato juice.",
  },
  {
    id: "peroxisomes",
    name: "Peroxisomes",
    label: "Peroxisomes",
    color: "#38b8a5",
    tagline: "The detox unit",
    description:
      "Peroxisomes handle chemical clean-up jobs that other organelles cannot: they break down very long fatty acids and neutralise hydrogen peroxide, a toxic by-product, turning it safely into water and oxygen with the enzyme catalase.",
    fact: "Peroxisomes can multiply by splitting in two, and cells build more of them on demand when there is extra detox work to do.",
  },
  {
    id: "centrosome",
    name: "Centrosome",
    label: "Centrosome",
    color: "#e8e4da",
    tagline: "The anchor for the skeleton",
    description:
      "The centrosome sits near the nucleus and is built from two barrel-shaped centrioles arranged at right angles. It organises the microtubules of the cytoskeleton and, during cell division, helps form the spindle that pulls chromosomes apart.",
    fact: "The two centrioles in a centrosome sit at a perfect right angle to each other — one is always older, the 'mother' centriole.",
  },
  {
    id: "vacuole",
    name: "Vacuole",
    label: "Vacuole",
    color: "#4e9be0",
    tagline: "Storage and housekeeping",
    description:
      "Animal cells contain small vacuoles — membrane-bound pockets used to store materials, move substances around, or hold waste until it can be expelled. They are far smaller than the giant central vacuole found in plant cells, but they do a similar set of odd jobs.",
    fact: "In some single-celled organisms, contractile vacuoles work like bilge pumps, rhythmically squeezing out excess water so the cell does not burst.",
  },
  {
    id: "cytoskeleton",
    name: "Cytoskeleton",
    label: "Cytoskeleton",
    color: "#b8c4ce",
    tagline: "Beams, ropes and railways",
    description:
      "The cytoskeleton is a dynamic network of protein filaments — sturdy intermediate filaments, rope-like actin strands and hollow microtubule rails. It gives the cell its shape, anchors the organelles, and acts as a railway system along which motor proteins haul cargo.",
    fact: "Your cells rebuild parts of their cytoskeleton within minutes — the network is less like scaffolding and more like a motorway system under constant roadworks.",
  },
  {
    id: "cytoplasm",
    name: "Cytoplasm",
    label: "Cytoplasm",
    color: "#3a5a8c",
    tagline: "The busy jelly everything floats in",
    description:
      "The cytoplasm is the gel-like fluid filling the cell, mostly water mixed with salts, proteins and small molecules. It is the medium in which the organelles sit and where many chemical reactions, including the first stage of respiration, take place.",
    fact: "The cytoplasm is not still — it streams and swirls in a motion called cytoplasmic streaming, helping to distribute materials around the cell.",
  },
];

export const ORGANELLE_MAP = Object.fromEntries(
  ORGANELLES.map((o) => [o.id, o])
);
