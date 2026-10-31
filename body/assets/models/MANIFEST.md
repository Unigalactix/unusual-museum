# BodyVerse anatomy models — BodyParts3D provenance manifest

Real human anatomy meshes for the BodyVerse gallery, fetched and converted 2026-10-30 (PDT).
One GLB per BodyVerse organ id in this directory. **No site code was changed.**

## Dataset and license

- **Dataset:** BodyParts3D, Release 4.0 (archive "LATEST" snapshot), maintained by the Database Center for Life Science (DBCLS), Research Organization of Information and Systems, Japan.
- **Source (official):** LSDB Archive download page — https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
  - Mesh files: `isa_BP3D_4.0_obj_99.zip` and `partof_BP3D_4.0_obj_99.zip` from https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/
  - Concept/part mappings: `isa_parts_list_e.txt`, `partof_parts_list_e.txt`, `isa_element_parts.txt`, `partof_element_parts.txt` (same directory).
  - The archive distributes the OBJ set at its "Polygon reduction rate = 99%" grade; triangle counts "before" below are counts in those distributed OBJ files (the archive offers no higher-density download).
- **License (verified 2026-10-30 on the archive license page, last updated 2025/02/27 — https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html):** Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Required attribution, in the licensor's specified form:** "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International".
- Note: the older project info page (https://lifesciencedb.jp/bp3d/info_en/index.html) still carries legacy wording ("CC-BY SA 2.1 JP"). The archive license page above — the one the download page itself links as "the license" — is the current grant (CC BY 4.0, updated 2025/02/27) and is the one recorded and followed here.

## Conversion method

- OBJ parts selected by anatomical concept using the official parts lists (PART-OF tree unless noted); a compound concept contributes all of its elemental FJ files, unedited.
- Each source FJ file remains a **separate named mesh** inside its organ GLB (mesh name = FJ id).
- Vertex coordinates were carried over **verbatim** — no recentering, rescaling or re-axing per organ. Verified: round-tripping a converted GLB returns bounds identical to the source OBJ, with identity node transforms.
- Tooling: Python + trimesh 5.2.0 (OBJ load / GLB export); fast-simplification used for the single decimation case below.
- **Decimation:** no organ exceeded the 400k-triangle trigger, so no quality decimation was needed. The one exception is **brain**, reduced 322,262 → 284,979 triangles (quadric simplification) solely because its uncompressed GLB was 6.04 MB, over the 6 MB per-file cap; final size 5.29 MB. Every GLB is ≤ 6 MB.

## Coordinates (shared BodyParts3D space, preserved as-is)

All 17 GLBs live in the single original BodyParts3D coordinate system, so the parts assemble into a correctly proportioned body with no per-organ placement math.

- **Units:** millimetres.
- **Axes** (as stored in the files, x/y/z triples; determined from the data and cross-checked against sided organs — right/left kidney, adrenal glands, appendix, gallbladder):
  - **+X → the body's left** (right kidney sits at negative X, left kidney at positive X; the appendix, an anatomically right-sided structure, is at negative X).
  - **+Y → toward the back (posterior)**; anterior structures (stomach, bladder, heart) sit at strongly negative Y, the spinal cord near y ≈ −55, and nothing fetched lies beyond y ≈ +10.
  - **+Z → up (toward the head)**; Z is height above the dataset floor (bladder ≈ 790 mm, heart ≈ 1250 mm, top of brain ≈ 1630 mm).
  - The system is right-handed (it matches the DICOM "LPS" convention: Left–Posterior–Superior).
  - Origin: x ≈ 0 is the mid-sagittal plane; z = 0 is ground level under the feet; y = 0 lies just behind the posterior body surface.
- **Bounding box across all fetched parts** (the 17 organs below, post-decimation): min = (-126.8, -205.3, 757.3) mm, max = (125.4, 10.3, 1630.5) mm. This is the fetched subset only (no skin, limbs or skull), not the full dataset extents.
- Integrator note: the numbers are stored verbatim in glTF POSITION accessors with identity node transforms. For a Y-up three.js scene, apply ONE global transform to the whole assembled body (e.g. rotateX(−90°) maps dataset +Z to +Y and dataset −Y/anterior to +Z/front) and a single uniform scale (dataset is in mm; ÷1000 gives metres) — never per-organ transforms.

## Missing from the dataset

- **thyroid (thyroid gland): NOT PRESENT in BodyParts3D.** The gland concept has no mesh representation in either tree of Release 4.0 (searching both official parts lists finds only the thyroid cartilage, thyroid arteries/veins and related muscles). No thyroid.glb was produced; BodyVerse's thyroid remains the procedural model. This is a known dataset gap, not a download failure.
- All 17 other BodyVerse organ ids were found and converted, including the appendix.

## Files

### brain.glb

- Concepts used: brain (FMA50801, part-of tree)
- Source files (59): FJ1730, FJ1731, FJ1732, FJ1733, FJ1738, FJ1739, FJ1740, FJ1743, FJ1744, FJ1745, FJ1746, FJ1747, FJ1748, FJ1749, FJ1750, FJ1751, FJ1758, FJ1759, FJ1760, FJ1762, FJ1767, FJ1769, FJ1770, FJ1775, FJ1779, FJ1780, FJ1781, FJ1783, FJ1784, FJ1785, FJ1786, FJ1787, FJ1788, FJ1789, FJ1790, FJ1791, FJ1792, FJ1795, FJ1797, FJ1798, FJ1800, FJ1801, FJ1806, FJ1807, FJ1808, FJ1810, FJ1814, FJ1817, FJ1822, FJ1826, FJ1828, FJ1830, FJ1831, FJ1833, FJ1834, FJ1835, FJ1836, FJ1841, FJ1842
- Meshes in GLB: 59 · Vertices: 153,608 · Triangles: 322,262 before → 284,979 after · GLB size: 5,294,748 bytes
- Note: The 59 meshes are the elemental parts of the FMA "brain" compound: cerebral structures plus cerebellum (FJ1781, FJ1830) and brainstem (FJ1738, FJ1762, FJ1769, FJ1770, FJ1775, FJ1779, FJ1810, FJ1817, FJ1822, FJ1826, FJ1831) — those subsets are exact subsets of the brain element list, verified against partof_element_parts.txt. Decimated (see global note) only to meet the 6 MB file cap.

### spinal-cord.glb

- Concepts used: spinal cord (FMA7647, part-of tree); vertebral column (FMA13478, part-of tree)
- Source files (49): FJ1737, FJ3154, FJ3155, FJ3156, FJ3157, FJ3158, FJ3159, FJ3160, FJ3161, FJ3162, FJ3163, FJ3164, FJ3165, FJ3166, FJ3167, FJ3168, FJ3169, FJ3170, FJ3171, FJ3172, FJ3173, FJ3174, FJ3175, FJ3176, FJ3177, FJ3202, FJ3203, FJ3204, FJ3205, FJ3206, FJ3207, FJ3208, FJ3209, FJ3210, FJ3211, FJ3212, FJ3213, FJ3214, FJ3215, FJ3216, FJ3217, FJ3218, FJ3219, FJ3220, FJ3221, FJ3222, FJ3223, FJ3224, FJ3393
- Meshes in GLB: 49 · Vertices: 92,106 · Triangles: 124,948 before → 124,948 after · GLB size: 2,630,936 bytes
- Note: Spinal cord proper is a single mesh (FJ1737); the other 48 meshes are the vertebral column bones (FMA13478 compound: individual vertebrae, sacrum, coccyx).

### trachea.glb

- Concepts used: trachea (FMA7394, part-of tree); right main bronchus (FMA7395, part-of tree); left main bronchus (FMA7396, part-of tree)
- Source files (3): FJ2450, FJ2539, FJ2541
- Meshes in GLB: 3 · Vertices: 7,475 · Triangles: 13,600 before → 13,600 after · GLB size: 254,692 bytes
- Note: Trachea (FJ2541) plus left and right main bronchi.

### lungs.glb

- Concepts used: right lung (FMA7309, part-of tree); left lung (FMA7310, part-of tree)
- Source files (280): FJ2041, FJ2044, FJ2441, FJ2442, FJ2443, FJ2444, FJ2445, FJ2446, FJ2447, FJ2448, FJ2449, FJ2451, FJ2452, FJ2453, FJ2454, FJ2455, FJ2456, FJ2457, FJ2458, FJ2459, FJ2460, FJ2461, FJ2462, FJ2463, FJ2464, FJ2465, FJ2466, FJ2467, FJ2468, FJ2469, FJ2470, FJ2471, FJ2472, FJ2473, FJ2474, FJ2475, FJ2476, FJ2477, FJ2478, FJ2479, FJ2480, FJ2481, FJ2482, FJ2483, FJ2484, FJ2485, FJ2486, FJ2487, FJ2488, FJ2489, FJ2490, FJ2491, FJ2492, FJ2493, FJ2494, FJ2495, FJ2496, FJ2497, FJ2498, FJ2499, FJ2500, FJ2501, FJ2502, FJ2503, FJ2504, FJ2505, FJ2506, FJ2507, FJ2508, FJ2509, FJ2510, FJ2511, FJ2512, FJ2513, FJ2514, FJ2515, FJ2516, FJ2517, FJ2518, FJ2519, FJ2520, FJ2521, FJ2522, FJ2523, FJ2524, FJ2525, FJ2526, FJ2527, FJ2528, FJ2529, FJ2530, FJ2531, FJ2532, FJ2533, FJ2534, FJ2535, FJ2536, FJ2537, FJ2538, FJ2540, FJ2881, FJ2882, FJ2883, FJ2884, FJ2885, FJ2886, FJ2887, FJ2888, FJ2889, FJ2890, FJ2891, FJ2892, FJ2893, FJ2894, FJ2895, FJ2896, FJ2897, FJ2898, FJ2899, FJ2900, FJ2901, FJ2902, FJ2903, FJ2904, FJ2905, FJ2906, FJ2907, FJ2908, FJ2909, FJ2910, FJ2911, FJ2912, FJ2913, FJ2914, FJ2915, FJ2916, FJ2917, FJ2918, FJ2919, FJ2920, FJ2921, FJ2922, FJ2923, FJ2926, FJ2927, FJ2928, FJ2929, FJ2930, FJ2931, FJ2932, FJ2934, FJ2935, FJ2936, FJ2937, FJ2938, FJ2939, FJ2940, FJ2941, FJ2942, FJ2943, FJ2945, FJ2946, FJ2947, FJ2948, FJ2949, FJ2951, FJ2952, FJ2953, FJ2954, FJ2956, FJ2957, FJ2958, FJ2959, FJ2960, FJ2961, FJ2962, FJ2963, FJ2964, FJ2965, FJ2967, FJ2968, FJ2969, FJ2970, FJ2971, FJ2972, FJ2973, FJ2974, FJ2975, FJ2976, FJ2977, FJ2978, FJ2979, FJ2980, FJ2981, FJ2982, FJ2983, FJ2984, FJ2985, FJ2986, FJ2987, FJ2988, FJ2989, FJ2990, FJ2991, FJ2992, FJ2993, FJ2994, FJ2995, FJ2996, FJ2997, FJ2998, FJ2999, FJ3000, FJ3001, FJ3002, FJ3003, FJ3004, FJ3005, FJ3006, FJ3007, FJ3008, FJ3009, FJ3010, FJ3011, FJ3012, FJ3013, FJ3014, FJ3015, FJ3016, FJ3017, FJ3018, FJ3021, FJ3022, FJ3023, FJ3024, FJ3025, FJ3026, FJ3027, FJ3028, FJ3029, FJ3030, FJ3031, FJ3032, FJ3033, FJ3034, FJ3035, FJ3036, FJ3037, FJ3038, FJ3039, FJ3041, FJ3042, FJ3043, FJ3044, FJ3045, FJ3046, FJ3047, FJ3048, FJ3049, FJ3050, FJ3051, FJ3052, FJ3053, FJ3054, FJ3055, FJ3056, FJ3057, FJ3058, FJ3059, FJ3060, FJ3061, FJ3062, FJ3063, FJ3064, FJ3065, FJ3066, FJ3067, FJ3068, FJ3069, FJ3070
- Meshes in GLB: 280 · Vertices: 68,897 · Triangles: 114,750 before → 114,750 after · GLB size: 2,353,188 bytes
- Note: Right lung 156 meshes + left lung 124 meshes: the dataset composes each lung from bronchopulmonary segment meshes together with intrapulmonary bronchi and pulmonary vessel segments (this is the dataset's own part-of definition of a lung, used unchanged).

### heart.glb

- Concepts used: heart (FMA7088, part-of tree)
- Source files (83): FJ2417, FJ2418, FJ2419, FJ2420, FJ2421, FJ2422, FJ2423, FJ2424, FJ2425, FJ2426, FJ2427, FJ2429, FJ2430, FJ2431, FJ2432, FJ2433, FJ2434, FJ2435, FJ2436, FJ2437, FJ2438, FJ2439, FJ2631, FJ2632, FJ2633, FJ2634, FJ2635, FJ2636, FJ2637, FJ2638, FJ2639, FJ2640, FJ2641, FJ2642, FJ2643, FJ2644, FJ2645, FJ2646, FJ2647, FJ2648, FJ2649, FJ2650, FJ2651, FJ2652, FJ2653, FJ2654, FJ2655, FJ2656, FJ2667, FJ2668, FJ2670, FJ2671, FJ2672, FJ2673, FJ2674, FJ2675, FJ2676, FJ2677, FJ2692, FJ2693, FJ2694, FJ2695, FJ2696, FJ2697, FJ2698, FJ2699, FJ2700, FJ2714, FJ2715, FJ2716, FJ2717, FJ2718, FJ2719, FJ2720, FJ2721, FJ2722, FJ2723, FJ2724, FJ2727, FJ2728, FJ2729, FJ2731, FJ2737
- Meshes in GLB: 83 · Vertices: 59,953 · Triangles: 102,802 before → 102,802 after · GLB size: 1,997,360 bytes
- Note: The dataset's part-of heart compound (83 meshes: chamber walls, valves, papillary muscles, coronary vessels, etc.), used unchanged.

### aorta.glb

- Concepts used: aorta (FMA3734, part-of tree); superior vena cava (FMA4720, part-of tree); inferior vena cava (FMA10951, part-of tree); pulmonary trunk (FMA8612, part-of tree)
- Source files (9): FJ1931, FJ1932, FJ2966, FJ3411, FJ3413, FJ3427, FJ3441, FJ3645, FJ3659
- Meshes in GLB: 9 · Vertices: 8,366 · Triangles: 15,168 before → 15,168 after · GLB size: 287,364 bytes
- Note: Great vessels only: aorta compound (5 meshes), superior vena cava (1), inferior vena cava (2), pulmonary trunk (1). The four pulmonary veins are NOT included: in this dataset each named pulmonary vein resolves to 15–27 intrapulmonary branch meshes (no single great-vessel stump file exists), so they were left out rather than importing whole intrapulmonary trees.

### diaphragm.glb

- Concepts used: diaphragm (FMA13295, part-of tree)
- Source files (1): FJ3131
- Meshes in GLB: 1 · Vertices: 35,527 · Triangles: 68,522 before → 68,522 after · GLB size: 1,249,340 bytes

### liver.glb

- Concepts used: liver (FMA7197, part-of tree)
- Source files (60): FJ1883, FJ1893, FJ1913, FJ1914, FJ1916, FJ2386, FJ2404, FJ2405, FJ2409, FJ2415, FJ2416, FJ2816, FJ2818, FJ2819, FJ2820, FJ2821, FJ2822, FJ2823, FJ2824, FJ3071, FJ3072, FJ3073, FJ3074, FJ3075, FJ3076, FJ3077, FJ3081, FJ3083, FJ3086, FJ3088, FJ3089, FJ3090, FJ3091, FJ3092, FJ3093, FJ3095, FJ3096, FJ3102, FJ3103, FJ3104, FJ3105, FJ3106, FJ3107, FJ3108, FJ3109, FJ3110, FJ3111, FJ3112, FJ3113, FJ3114, FJ3115, FJ3116, FJ3117, FJ3122, FJ3123, FJ3124, FJ3125, FJ3126, FJ3127, FJ3128
- Meshes in GLB: 60 · Vertices: 109,730 · Triangles: 191,622 before → 191,622 after · GLB size: 3,641,120 bytes
- Note: The dataset's part-of liver compound (60 meshes: liver segments and intrahepatic vessel parts), used unchanged.

### gallbladder.glb

- Concepts used: gallbladder (FMA7202, part-of tree)
- Source files (1): FJ2817
- Meshes in GLB: 1 · Vertices: 1,202 · Triangles: 2,396 before → 2,396 after · GLB size: 43,920 bytes

### stomach.glb

- Concepts used: stomach (FMA7148, part-of tree)
- Source files (1): FJ2564
- Meshes in GLB: 1 · Vertices: 914 · Triangles: 1,810 before → 1,810 after · GLB size: 33,432 bytes

### pancreas.glb

- Concepts used: pancreas (FMA7198, part-of tree)
- Source files (4): FJ1895, FJ1896, FJ2629, FJ2630
- Meshes in GLB: 4 · Vertices: 12,896 · Triangles: 16,962 before → 16,962 after · GLB size: 360,628 bytes

### spleen.glb

- Concepts used: spleen (FMA7196, is-a tree)
- Source files (1): FJ2561
- Meshes in GLB: 1 · Vertices: 689 · Triangles: 1,330 before → 1,330 after · GLB size: 24,972 bytes
- Note: Spleen exists only in the IS-A tree of the archive distribution (single mesh FJ2561); it is absent from the part-of element lists. Same underlying elemental file/coordinate system.

### kidneys.glb

- Concepts used: right kidney (FMA7204, part-of tree); left kidney (FMA7205, part-of tree); right adrenal gland (FMA15629, part-of tree); left adrenal gland (FMA15630, part-of tree)
- Source files (4): FJ3129, FJ3130, FJ3145, FJ3147
- Meshes in GLB: 4 · Vertices: 5,809 · Triangles: 11,582 before → 11,582 after · GLB size: 211,016 bytes
- Note: Right kidney + left kidney + right and left adrenal (suprarenal) glands, one mesh each.

### small-intestine.glb

- Concepts used: small intestine (FMA7200, part-of tree)
- Source files (56): FJ2573, FJ2574, FJ2575, FJ2576, FJ2577, FJ2578, FJ2579, FJ2580, FJ2581, FJ2582, FJ2583, FJ2584, FJ2585, FJ2586, FJ2587, FJ2588, FJ2589, FJ2590, FJ2591, FJ2592, FJ2593, FJ2594, FJ2595, FJ2596, FJ2597, FJ2598, FJ2599, FJ2600, FJ2601, FJ2602, FJ2603, FJ2604, FJ2605, FJ2606, FJ2607, FJ2608, FJ2609, FJ2610, FJ2611, FJ2612, FJ2613, FJ2614, FJ2615, FJ2616, FJ2617, FJ2618, FJ2619, FJ2620, FJ2621, FJ2622, FJ2623, FJ2624, FJ2625, FJ2626, FJ2627, FJ2628
- Meshes in GLB: 56 · Vertices: 8,640 · Triangles: 16,058 before → 16,058 after · GLB size: 326,108 bytes

### large-intestine.glb

- Concepts used: large intestine (FMA7201, part-of tree)
- Source files (8): FJ2566, FJ2567, FJ2568, FJ2569, FJ2570, FJ2571, FJ2572, FJ2599
- Meshes in GLB: 8 · Vertices: 51,698 · Triangles: 59,284 before → 59,284 after · GLB size: 1,336,252 bytes

### appendix.glb

- Concepts used: appendix (FMA14542, part-of tree)
- Source files (1): FJ2565
- Meshes in GLB: 1 · Vertices: 244 · Triangles: 442 before → 442 after · GLB size: 8,972 bytes
- Note: The vermiform appendix DOES exist in the dataset (concept "appendix", FMA14542) as a single mesh, FJ2565.

### bladder.glb

- Concepts used: urinary bladder (FMA15900, part-of tree)
- Source files (1): FJ3149
- Meshes in GLB: 1 · Vertices: 127 · Triangles: 226 before → 226 after · GLB size: 4,972 bytes

## Verification

Every GLB was reloaded after export and checked: `glTF` magic bytes present, header declared length == actual file size, trimesh parse succeeds, and reloaded mesh/triangle totals match this manifest. All 17 files passed.
