import type { FolderData } from "../types";

const pexels = (photoId: number) =>
  `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop`;

const BASE_STYLE_GROUPS: FolderData[] = [
  {
    id: "cyberpunk",
    title: "Cyberpunk & Neon",
    description:
      "High-contrast neon color schemes, futuristic tech elements, wet streets with glowing reflections, and deep digital shadows.",
    coverImage: pexels(28122495),
    files: [
      {
        id: "cyber-alley",
        name: "Neon Alley Rain",
        image: pexels(28122495),
        prompt:
          "A narrow cyberpunk alleyway at night, heavy rain, glowing neon signs in magenta, cyan, and yellow, puddles on the asphalt reflecting the vibrant lights, detailed cyberpunk vending machines, octane render, photorealistic, 8k.",
        description:
          "Captures intense street-level atmosphere with wet surface reflections and a rich magenta-cyan primary contrast.",
        details: {
          artist: "Syd Mead inspired",
          lighting: "Volumetric Neon, Wet Reflections",
          medium: "3D Digital / Octane Render",
          camera: "Anamorphic 35mm Lens",
          aspectRatio: "16:9",
        },
      },
      {
        id: "synthwave-grid",
        name: "Retro Synthwave Sun",
        image: pexels(19286060),
        prompt:
          "Retro 80s synthwave landscape, wireframe glowing grid stretching to the horizon, giant neon wireframe sun setting in the center, violet and pink gradients, laser lines, futuristic super-car, Outrun aesthetic, vector-detailed.",
        description:
          "Classic Outrun nostalgic 80s theme, featuring a low-poly wireframe plane and neon pink/deep indigo color scheme.",
        details: {
          artist: "Signalnoise",
          lighting: "Laser Neon Outline, Retro Glow",
          medium: "Vector / Digital Illustration",
          camera: "Infinitely wide-angle tracking shot",
          aspectRatio: "16:9",
        },
      },
      {
        id: "cyber-beams",
        name: "Cybernetic Glow Portrait",
        image: pexels(11163981),
        prompt:
          "Cinematic portrait of a cyborg with intricate bioluminescent skin patterns, cybernetic optical implants glowing soft amber, standing in a dark misty server room with green status LEDs, dramatic rim lighting, unreal engine 5, depth of field.",
        description:
          "Human-cybernetic integration with focus on fine glowing details, high depth of field, and hardware elements.",
        details: {
          artist: "Maciej Kuciara",
          lighting: "Rim lighting, Bio-luminescent amber",
          medium: "Digital Painting, UE5 Render",
          camera: "85mm Portrait Lens, f/1.2",
          aspectRatio: "4:3",
        },
      },
      {
        id: "cyber-car",
        name: "Midnight Neon Drifter",
        image: pexels(26732101),
        prompt:
          "Futuristic sleek sports car drifting through wet asphalt under towering cyberpunk skyscrapers, neon signs reflecting off polished chrome, glowing teal tire tracks, fast shutter speed, high dynamic range.",
        description:
          "Focus on dynamic speed, metallic reflections, and intense teal/purple color tones.",
        details: {
          artist: "Ash Thorp",
          lighting: "Teal neon underglow, direct wet reflections",
          medium: "High-end 3D Render",
          camera: "Low-angle action shot",
          aspectRatio: "16:9",
        },
      },
      {
        id: "cyber-skyline",
        name: "Cyber-City Skyline",
        image: pexels(20142441),
        prompt:
          "Panoramic vertical view of giant high-tech skyscrapers, glowing holographic flying fish in the sky, streams of bright yellow light lanes from traffic below, sci-fi dystopian metropolis, cinematic, extreme detail.",
        description:
          "Immense urban scale with futuristic holographic skies and deep ambient lighting layers.",
        details: {
          artist: "Vitaly Bulgarov",
          lighting: "Holographic projections, ambient fog glow",
          medium: "Digital Concept Art",
          camera: "Aerial drone perspective",
          aspectRatio: "9:16",
        },
      },
    ],
  },
  {
    id: "anime-ghibli",
    title: "Ghibli & Cozy Anime",
    description:
      "Soft hand-painted gouache style, bright summer sunlight, lush green nature, puffy white clouds, and a nostalgic, magical atmosphere.",
    coverImage: pexels(1671325),
    files: [
      {
        id: "ghibli-meadow",
        name: "Summer Grass Bridge",
        image: pexels(26840953),
        prompt:
          "Lush green summer meadow with a tiny red wooden footbridge over a clear running brook, endless sea of wildflowers, massive puffy white cumulus clouds in a brilliant blue sky, Studio Ghibli gouache painting style, warm sun rays, nostalgic.",
        description:
          "Emphasizes soft, painterly foliage textures, high saturation green-blue contrasts, and peaceful natural spaces.",
        details: {
          artist: "Kazuo Oga",
          lighting: "Warm mid-afternoon sun, dappled light",
          medium: "Traditional Gouache on Paper",
          camera: "Eye-level landscape canvas",
          aspectRatio: "16:9",
        },
      },
      {
        id: "cherry-train",
        name: "Spring Train Tracks",
        image: pexels(1367192),
        prompt:
          "A rustic train track curving through a tunnel of blooming cherry blossom trees, pink petals falling gently in the breeze, soft pastel morning fog, cozy anime scenery, Makoto Shinkai aesthetic, photorealistic anime, cinematic lighting.",
        description:
          "Features high-contrast bloom, detailed light rays, and beautiful pink/white petal details with light fog.",
        details: {
          artist: "Makoto Shinkai",
          lighting: "Early morning golden hour, heavy atmospheric bloom",
          medium: "Digital Anime Painting",
          camera: "Telephoto zoom compression lens",
          aspectRatio: "16:9",
        },
      },
      {
        id: "anime-peaks",
        name: "Overcast Mountain Valley",
        image: pexels(1761279),
        prompt:
          "Towering green mountains with majestic waterfalls cascading into a deep valley, a tiny cottage with smoke raising from the chimney, soft morning mist, watercolor and ink outline anime style, nostalgic illustration, hand-painted texture.",
        description:
          "Watercolor wash style with delicate ink outlines and majestic high-altitude visual scales.",
        details: {
          artist: "Studio Ghibli Art Dept",
          lighting: "Overcast soft light, diffuse sky glow",
          medium: "Watercolor & Fine Ink Outline",
          camera: "High-angle panoramic view",
          aspectRatio: "4:3",
        },
      },
      {
        id: "ghibli-market",
        name: "Cozy Lantern Street",
        image: pexels(1640777),
        prompt:
          "A magical bustling village night market, rows of wooden stalls selling food and potions, hundreds of warm floating paper lanterns lighting up the dark blue evening sky, soft cozy anime art style, nostalgic fantasy, hand-painted gouache look.",
        description:
          "Warm-cool lighting contrast, cozy fantasy elements, and hand-painted vintage textures.",
        details: {
          artist: "Yoichi Nishikawa",
          lighting: "Warm floating lanterns, deep indigo ambient shadow",
          medium: "Gouache & Digital Compositing",
          camera: "Cinematic wide shot",
          aspectRatio: "16:9",
        },
      },
      {
        id: "ghibli-kitchen",
        name: "Nostalgic Cozy Kitchen",
        image: pexels(32608379),
        prompt:
          "A warm and cluttered kitchen, a boiling clay pot of stew with rising steam on a pale green stove, sunlight streaming through a small window with potted herbs on the sill, hand-drawn anime interior, Studio Ghibli style, heartwarming.",
        description:
          "Rich focus on household details, steam bloom, and highly saturated nostalgic colors.",
        details: {
          artist: "Kazuo Oga",
          lighting: "Morning light shaft, soft volume steam",
          medium: "Acrylic Gouache Painting",
          camera: "Intimate close-medium interior lens",
          aspectRatio: "4:3",
        },
      },
    ],
  },
  {
    id: "impressionism",
    title: "Impasto Oil Painting",
    description:
      "Thick textured brushstrokes, visible palette knife patterns, vibrant color blending, and an emphasis on the playful quality of light.",
    coverImage: pexels(28802631),
    files: [
      {
        id: "oil-fields",
        name: "Impasto Sunflower Valley",
        image: pexels(28626259),
        prompt:
          "A vast vibrant field of blooming sunflowers under a swirling blue and gold sky, thick impasto oil painting, heavy palette knife texture, highly raised paint layers, deep yellow and rich cobalt blue, post-impressionist masterpiece style.",
        description:
          "Displays extreme 3D paint texture, thick ridges of oil paint, and highly dynamic paint-mixing swirls.",
        details: {
          artist: "Vincent van Gogh style",
          lighting: "Intense direct sunlight, swirling sky light",
          medium: "Thick Oil on Canvas (Impasto)",
          camera: "Close-up tilted upward dynamic focus",
          aspectRatio: "1:1",
        },
      },
      {
        id: "swirling-vortex",
        name: "Vibrant Swirling Flow",
        image: pexels(28901509),
        prompt:
          "An abstract swirling vortex of colors, thick textured oil brush strokes, deep navy, gold, and crimson red overlapping, dramatic lighting casting shadows on the thick paint ridges, masterpiece modern art, textured canvas.",
        description:
          "Focuses on paint substance itself: ridges, mixing imperfections, and dramatic shadow casting over brush strokes.",
        details: {
          artist: "Joan Mitchell inspired",
          lighting: "Side-angled spotlight revealing texture shadows",
          medium: "Action Painting Oil Canvas",
          camera: "Extreme close-up macro lens",
          aspectRatio: "1:1",
        },
      },
      {
        id: "venice-canal",
        name: "Venetian Palette Reflections",
        image: pexels(29412595),
        prompt:
          "Impressionist colorful painting of Venice canal with historical buildings, gondola sliding through water, water reflections broken into rich dabs of paint, vibrant sunset sky, loose expressive brushwork, fine art gallery piece.",
        description:
          "Captures water reflections and sunset gradients using loose dabs of pure color rather than smooth blending.",
        details: {
          artist: "Claude Monet inspired",
          lighting: "Sunset reflections, shimmering light on water",
          medium: "Oil on Linen Canvas",
          camera: "Water-level wide perspective",
          aspectRatio: "4:3",
        },
      },
      {
        id: "oil-sea",
        name: "Stormy Sea Cliffs",
        image: pexels(1269968),
        prompt:
          "Violent turquoise and deep indigo waves crashing against dark, jagged ocean cliffs, thick impasto oils, heavy palette knife scoring, white sea foam depicted with raised three-dimensional pure titanium white oil paint, tempestuous sky.",
        description:
          "Focuses on energetic ocean spray textures, heavy physical paint ridges, and natural dramatic movement.",
        details: {
          artist: "Winslow Homer inspired",
          lighting: "Flash-lightning sky, dark stormy shadow contrast",
          medium: "Impasto Oil on Wood Board",
          camera: "Low angle wide marine perspective",
          aspectRatio: "16:9",
        },
      },
      {
        id: "oil-cafe",
        name: "Vibrant Cafe Terrace",
        image: pexels(1570779),
        prompt:
          "Cozy cobblestone street corner cafe at night under warm yellow gaslamps, colorful dabs of orange, red, and blue indicating customers, expressive thick paint application, post-impressionist oil painting style.",
        description:
          "Charming night scene using warm-cool contrasts and highly textured palette knife work.",
        details: {
          artist: "Vincent van Gogh inspired",
          lighting: "Gaslamp warm glow, deep starry night sky",
          medium: "Oil on Gessoed Board",
          camera: "Pedestrian street-level angle",
          aspectRatio: "4:3",
        },
      },
    ],
  },
  {
    id: "minimal-geometric",
    title: "Minimal Geometric & Vector",
    description:
      "Flat illustration style, clean geometric paths, warm pastel color palettes, continuous lines, and smart use of negative space.",
    coverImage: pexels(19354503),
    files: [
      {
        id: "abstract-shapes",
        name: "Fluid Geometric Blocks",
        image: pexels(33923497),
        prompt:
          "Minimalist graphic art of organic interlocking geometric shapes, warm desert pastel colors, sand, terracotta, olive green, cream white, soft shadows, clean vectors, high aesthetic design, Scandinavian poster style.",
        description:
          "Clean, flat modern art layout centering balanced shapes and a soft earth-toned palette.",
        details: {
          artist: "Bauhaus style",
          lighting: "Flat, soft ambient lighting",
          medium: "Vector Graphic Illustration",
          camera: "Perfect orthographic front-facing view",
          aspectRatio: "3:4",
        },
      },
      {
        id: "isometric-zen",
        name: "Minimalist Concrete Villa",
        image: pexels(32573502),
        prompt:
          "Isometric vector illustration of a modern minimalist architectural villa made of glass and concrete, tiny green pine tree, clean water pool reflecting structural lines, soft warm lighting, minimalist background, 3D vector art.",
        description:
          "Architectural isometric layout showing spatial depth through clean 30-degree vector angles and neat shadows.",
        details: {
          artist: "Tadao Ando inspired",
          lighting: "Directional afternoon shadow casting",
          medium: "3D Isometric Vector Art",
          camera: "30-degree isometric orthographic camera",
          aspectRatio: "1:1",
        },
      },
      {
        id: "line-botany",
        name: "Continuous Botanical Line Art",
        image: pexels(33923506),
        prompt:
          "Continuous single-line art of tropical monstera and palm leaves, elegant black stroke on a warm cream-colored textured paper, minimalist design, high contrast, elegant fine-line drawing, boho home decor print.",
        description:
          "Pure line minimalism using a single line weight with no fills to outline clean botanical structures.",
        details: {
          artist: "Henri Matisse line art style",
          lighting: "Even studio backlighting, textured paper base",
          medium: "Single-line ink pen drawing",
          camera: "Flat scan close-up",
          aspectRatio: "3:4",
        },
      },
      {
        id: "minimal-desert",
        name: "Pastel Desert Arch",
        image: pexels(36129068),
        prompt:
          "Minimal graphic vector art of a tall terracotta stucco archway in a clean desert with pale sand, soft blue skies, elegant palm branch silhouette casting a delicate shadow, clean vector lines, mid-century modern aesthetic.",
        description: "Balanced structural geometry featuring warm clay and cool azure contrasts.",
        details: {
          artist: "Mid-Century Modernists",
          lighting: "Soft casting shadows, high noon sun",
          medium: "2D Flat Vector Illustration",
          camera: "Symmetrical front focal",
          aspectRatio: "4:3",
        },
      },
      {
        id: "geometric-cats",
        name: "Minimalist Bauhaus Cat",
        image: pexels(30797926),
        prompt:
          "Highly simplified abstract geometric composition of a sleeping cat, composed entirely of interlocking semicircles, triangles, and thin black lines, solid pastel yellow, coral, and navy blue, Swiss design style poster.",
        description:
          "Whimsical animal geometry leveraging clean flat planes and balanced design weights.",
        details: {
          artist: "Charley Harper style",
          lighting: "Zero directional lighting, completely flat",
          medium: "Digital Flat Vector Illustration",
          camera: "Graphic art flatbed scan",
          aspectRatio: "1:1",
        },
      },
    ],
  },
  {
    id: "cinematic-noir",
    title: "Cinematic Film Noir",
    description:
      "High-contrast monochrome, dramatic silhouettes, light beams shining through fog, deep moody shadows, and cinematic storytelling.",
    coverImage: pexels(19684018),
    files: [
      {
        id: "noir-boulevard",
        name: "Rainy Midnight Silhouette",
        image: pexels(36701089),
        prompt:
          "Cinematic black and white photography, a solitary figure in a trench coat and fedora walking down a wet cobblestone street at midnight, silhouette cast by a single glowing streetlight, heavy fog, high contrast, film grain.",
        description:
          "Classic high-contrast film-noir composition showcasing silhouette, rim-lighting, and thick fog grain.",
        details: {
          artist: "Roger Deakins style",
          lighting: "High contrast Chiaroscuro backlighting",
          medium: "Black and White Film Photography",
          camera: "35mm Leica Camera, Tri-X 400 Film",
          aspectRatio: "16:9",
        },
      },
      {
        id: "noir-jazz",
        name: "Smoky Brass Shadows",
        image: pexels(14364672),
        prompt:
          "Atmospheric jazz club stage close-up of a vintage brass trumpet glistening under a single warm golden spotlight, thick tobacco smoke curling in the air, deep black shadows, moody cinema grain, anamorphic flare.",
        description:
          "Detailed rendering of metallic surfaces and swirling atmospheric smoke under a tight spot flare.",
        details: {
          artist: "Herman Leonard inspired",
          lighting: "Narrow overhead golden spotlight, heavy shadows",
          medium: "Analog Film Cinema Frame",
          camera: "Anamorphic 50mm Lens",
          aspectRatio: "16:9",
        },
      },
      {
        id: "neon-passage",
        name: "Fluorescent Concrete Void",
        image: pexels(15861219),
        prompt:
          "An empty industrial concrete subway passage, single glowing green fluorescent bar light on the wall casting an eerie toxic green glow, deep shadows, cinematic mystery, raw brutalist architecture, depth.",
        description:
          "Brutalist architectural mood featuring a highly directional monochrome green toxic fluorescent glow.",
        details: {
          artist: "Gregory Crewdson",
          lighting: "Single toxic-green fluorescent rod light",
          medium: "Medium-format color film",
          camera: "6x7 Camera, CineStill 800T film",
          aspectRatio: "16:9",
        },
      },
      {
        id: "noir-diner",
        name: "Rainy Window Diner",
        image: pexels(5366568),
        prompt:
          "Medium shot looking through a rain-streaked diner window at night, warm yellow interior lights glowing through condensation, a single customer reading at the counter, neon diner sign glowing red in the background, film grain, nostalgic.",
        description:
          "Warm-cool lighting contrast, atmospheric weather details, and intimate character framing.",
        details: {
          artist: "Edward Hopper inspired",
          lighting: "Warm inner incandescent light, cool night rain ambient",
          medium: "35mm Color Film",
          camera: "50mm prime, f/1.8",
          aspectRatio: "16:9",
        },
      },
      {
        id: "noir-bridge",
        name: "Industrial Steel Bridge",
        image: pexels(24235386),
        prompt:
          "Brutalist silhouette of massive steel bridge girders towering into a thick white morning fog, light from an unseen sun casting soft grey gradients, moody, minimalist industrial cinematic atmosphere, high dynamic range black and white.",
        description:
          "Emphasizes structural symmetry, high-key fog atmospheric diffusion, and brutalist lines.",
        details: {
          artist: "Michael Kenna",
          lighting: "Diffused early morning fog daylight",
          medium: "Fine Art Black and White Print",
          camera: "Medium Format Hasselblad Camera",
          aspectRatio: "1:1",
        },
      },
    ],
  },
];

const VARIANT_TITLES = [
  ["Neon Rain District", "Retro Grid Horizon", "Cybernetic Portraits", "Midnight Drifters"],
  ["Summer Meadow", "Blossom Rail", "Misty Mountain", "Lantern Market"],
  ["Sunflower Impasto", "Chromatic Vortex", "Venetian Reflections", "Storm Coast"],
  ["Fluid Geometry", "Isometric Architecture", "Botanical Linework", "Desert Modernism"],
  ["Midnight Boulevard", "Brass & Smoke", "Concrete Fluorescence", "Rainy Diner"],
] as const;

/**
 * Twenty real gallery entries built from the curated source groups. Every folder receives
 * a globally unique cover and locally unique card ids; no row is a repeated clone.
 */
export const STYLES_DATA: FolderData[] = BASE_STYLE_GROUPS.flatMap((group, groupIndex) =>
  VARIANT_TITLES[groupIndex].map((title, coverIndex) => {
    const rotatedFiles = [
      ...group.files.slice(coverIndex),
      ...group.files.slice(0, coverIndex),
    ].map((file) => ({ ...file, id: `${group.id}-${coverIndex + 1}-${file.id}` }));

    return {
      ...group,
      id: `${group.id}-${coverIndex + 1}`,
      title,
      coverImage: group.files[coverIndex].image,
      files: rotatedFiles,
    };
  }),
);
