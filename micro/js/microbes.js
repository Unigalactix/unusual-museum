// Microbe files for MicroVerse — original text, real organisms, real facts
// written in our own words for The Unusual Museum's microscope chamber.
//
// NOTE ON SCALE: these eight are shown together at roughly the same size so
// they can be explored side by side. In reality they span four orders of
// magnitude — the viruses are tens of nanometres across, the tardigrade is
// about half a millimetre. The `size` field always states the honest size.

export const MICROBES = [
  {
    id: "phage",
    index: "01",
    name: "Bacteriophage",
    type: "Virus",
    group: "virus",
    size: "≈ 200 nm tall — head about 90 nm wide",
    color: "#9a86e0",
    hook: "A moon-lander built by evolution — it hunts bacteria, not us.",
    description:
      "A bacteriophage is a virus that infects bacteria instead of animals or plants. Its angular protein head is a cargo pod packed with DNA; below it, a spring-loaded tail sheath and six jointed fibres form the landing gear. When the fibres lock onto a bacterium's surface, the sheath contracts like a syringe and drives the DNA through the cell wall — and the hijacked bacterium is turned into a factory for new phages.",
    fact:
      "Phages are the most abundant biological entities on Earth — roughly 10³¹ of them. A single millilitre of seawater can hold around ten million viruses, most of them phages quietly culling bacteria.",
    position: [-4.4, 1.7, -1.4],
    radius: 1.35,
  },
  {
    id: "sarscov2",
    index: "02",
    name: "SARS-CoV-2",
    type: "Virus",
    group: "virus",
    size: "≈ 100 nm across (roughly 60–140 nm)",
    color: "#e0685f",
    hook: "The coronavirus whose spike proteins changed the world in 2020.",
    description:
      "This is the virus that causes COVID-19: a fragile envelope of membrane stolen from its last host cell, wrapped around a strand of RNA. Studding the surface are the famous club-shaped spike (S) proteins — the keys it uses to latch onto the ACE2 receptor on human cells and slip inside — alongside smaller membrane bumps. Nearly everything about the pandemic, from the vaccines to the variant names, comes back to the shape and behaviour of those spikes.",
    fact:
      "The spikes are the 'crown' — corona — that gives coronaviruses their name, and they are the target of the COVID-19 vaccines: teach the immune system to recognise the spike, and it can block the key before it finds the lock.",
    position: [3.7, 2.5, -2.6],
    radius: 1.3,
  },
  {
    id: "ecoli",
    index: "03",
    name: "E. coli",
    type: "Bacterium",
    group: "bacteria",
    size: "≈ 2 µm long, 0.5 µm wide",
    color: "#86c95e",
    hook: "A rod-shaped gut resident that swims by spinning its tails like propellers.",
    description:
      "Escherichia coli is a rod-shaped bacterium that lives, usually harmlessly, in the guts of warm-blooded animals — including yours. Short hair-like pili coat its surface, and several long flagella trail behind: to swim, it bundles them together and spins them like a propeller; to change direction, it lets the bundle fly apart and tumbles. A few rogue strains cause food poisoning, but tame laboratory E. coli is one of the most studied organisms in all of biology.",
    fact:
      "Each flagellum is spun by a genuine rotary motor built from protein — a biological outboard motor that can turn hundreds of times per second, stop, and reverse, all inside a cell two micrometres long.",
    position: [-1.3, -2.4, 2.8],
    radius: 1.35,
  },
  {
    id: "influenza",
    index: "04",
    name: "Influenza Virus",
    type: "Virus",
    group: "virus",
    size: "≈ 120 nm across (roughly 80–120 nm)",
    color: "#6a9fd8",
    hook: "A spiky sphere carrying two different tools: keys for getting in, scissors for getting out.",
    description:
      "The influenza virus wraps its eight segments of RNA in a membrane borrowed from its host, then arms the surface with two kinds of spike. Haemagglutinin (the H spike) is the key that grips a cell and opens the way in; neuraminidase (the N spike) is the release tool new viruses use to cut themselves free and spread. Because the virus copies its genome sloppily, those spikes keep changing their shape — which is why flu keeps coming back, and why the vaccine is reformulated every year.",
    fact:
      "The letters in flu names like H1N1 or H3N2 are a census of those two spikes: which version of haemagglutinin, and which version of neuraminidase, the virus is wearing.",
    position: [4.7, -1.5, 0.8],
    radius: 1.3,
  },
  {
    id: "tardigrade",
    index: "05",
    name: "Tardigrade",
    type: "Micro-animal",
    group: "other",
    size: "≈ 0.5 mm long (0.1–1.5 mm, species depending)",
    color: "#e0a35c",
    hook: "The water bear — eight stubby legs, and possibly the toughest animal alive.",
    description:
      "Tardigrades are microscopic animals: a plump, segmented body on four pairs of stubby legs, each ending in tiny claws, with a straw-like mouth for piercing moss cells and algae. They live in the film of water on mosses and lichens all over the planet. Their legend comes from what happens when that water dries up — the tardigrade shrivels into a dormant husk called a tun, switches its metabolism almost entirely off, and waits, sometimes for decades, for the rain to return.",
    fact:
      "In its tun state a tardigrade has survived the vacuum of open space itself — dried tardigrades exposed outside a spacecraft in low Earth orbit in 2007 came back to life when rehydrated.",
    position: [0.5, 0.5, -4.6],
    radius: 1.4,
  },
  {
    id: "amoeba",
    index: "06",
    name: "Amoeba proteus",
    type: "Protist",
    group: "other",
    size: "≈ 0.5 mm across, stretching to ~0.75 mm",
    color: "#9fd8e8",
    hook: "A shape-shifter that flows around its food and swallows it whole.",
    description:
      "Amoeba proteus has no fixed shape at all: it moves by streaming its own jelly-like interior into soft bulges called pseudopods — 'false feet' — and flowing after them. When a pseudopod encounters food, the flow simply continues around it until the prey is sealed inside a bubble and digested. Look closely and you can pick out its dark nucleus and a clear contractile vacuole, rhythmically swelling and squeezing out the water that constantly leaks in.",
    fact:
      "It is named after Proteus, the Greek sea god who could change his shape at will — a fitting namesake for a creature whose entire body plan is whichever way it happens to be flowing right now.",
    position: [-4.9, -1.9, 2.0],
    radius: 1.3,
  },
  {
    id: "paramecium",
    index: "07",
    name: "Paramecium",
    type: "Protist",
    group: "other",
    size: "≈ 200 µm long (roughly 50–330 µm)",
    color: "#4fc9a8",
    hook: "A slipper-shaped sprinter rowing itself with thousands of tiny hairs.",
    description:
      "The paramecium is a single cell shaped like the sole of a slipper, and it is carpeted in cilia — thousands of short hairs that beat in coordinated waves to row it through the water, spinning as it goes. A groove along one side funnels bacteria toward its cell mouth, and inside it carries not one nucleus but two: a large one that runs daily life, and a small one kept for reproduction. For a single cell, it is remarkably busy.",
    fact:
      "A paramecium can reverse on the spot: bump into an obstacle and every cilium flips its stroke, the cell backs up, turns, and tries a new angle — a complete avoid-manoeuvre with no brain to plan it.",
    position: [1.9, -0.7, 3.8],
    radius: 1.35,
  },
  {
    id: "yeast",
    index: "08",
    name: "Brewer's Yeast",
    type: "Fungus",
    group: "other",
    size: "≈ 5–10 µm across",
    color: "#e3c565",
    hook: "The single-celled fungus that bakes your bread and brews your beer.",
    description:
      "Saccharomyces cerevisiae — 'sugar fungus of beer' — is a single-celled fungus that eats sugar and breathes out carbon dioxide and alcohol. In dough, the gas puffs the bread up; in a brewery, the alcohol is the point. It reproduces by budding: a small daughter cell swells out of the mother's wall, grows, and pinches off, leaving a permanent scar behind on the mother. It was also the first domesticated microbe, and one of the first organisms to have its entire genome read.",
    fact:
      "A mother yeast cell keeps a visible tally of her children — every bud leaves a permanent scar on her wall, and after roughly twenty-five buds she grows old and stops dividing.",
    position: [-0.9, 3.2, 1.4],
    radius: 1.2,
  },
];

export const MICROBE_MAP = Object.fromEntries(MICROBES.map((m) => [m.id, m]));
