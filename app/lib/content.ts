export type StreamSlug =
  | "parametric-design"
  | "creative-scripting"
  | "generative-ai"
  | "digital-fabrication";

export type WorkflowStream = {
  slug: StreamSlug;
  title: string;
  shortDescription: string;
  introduction: string;
  tags: string[];
};

export type Tutorial = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stream: StreamSlug;
  software: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  durationSeconds: number;
  viewCount: number;
  thumbnailUrl: string;
  youtubeUrl: string;
  stage: "start" | "deeper";
  featured: boolean;
  keyConcepts: string[];
  requirements: string[];
  relatedScriptId?: string;
};

export type ScriptProduct = {
  id: string;
  title: string;
  outcome: string;
  productType: "Foundational file" | "Tutorial script" | "Workflow kit";
  accessType: "Free download" | "Pay what you want" | "Fixed price";
  software: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  thumbnailUrl: string;
  downloadUrl: string;
  tutorialUrl: string;
};

export const workflowStreams: WorkflowStream[] = [
  {
    slug: "parametric-design",
    title: "Parametric Design",
    shortDescription:
      "Grasshopper fundamentals, surface systems, paneling, facades, and procedural geometry.",
    introduction:
      "Build clear Grasshopper systems from geometric inputs, data structures, and repeatable modeling logic.",
    tags: ["Grasshopper", "Rhino", "Weaverbird", "Stripper"],
  },
  {
    slug: "creative-scripting",
    title: "Creative Scripting",
    shortDescription:
      "Python, cellular systems, recursive logic, and AI-assisted code for spatial experiments.",
    introduction:
      "Move from visual scripting into code-led design through small generative systems you can inspect and adapt.",
    tags: ["Python", "Rhino", "Grasshopper", "Copilot"],
  },
  {
    slug: "generative-ai",
    title: "Generative AI",
    shortDescription:
      "ComfyUI, ControlNet, architectural image workflows, and controlled AI rendering.",
    introduction:
      "Create repeatable image workflows that preserve architectural structure while opening space for visual exploration.",
    tags: ["ComfyUI", "ControlNet", "IP-Adapter", "RunPod"],
  },
  {
    slug: "digital-fabrication",
    title: "Digital Fabrication",
    shortDescription:
      "Unrolling, joinery, nesting, annotated parts, and fabrication-ready geometry.",
    introduction:
      "Translate complex geometry into organized, labeled, and buildable parts without losing parametric control.",
    tags: ["Grasshopper", "OpenNest", "Python", "CNC"],
  },
];

const thumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const tutorials: Tutorial[] = [
  {
    id: "HxnFKpSabnA",
    slug: "brick-wall-from-parametric-surface",
    title: "Brick Wall From Parametric Surface (Grasshopper Tutorial)",
    summary:
      "Build staggered brick courses from surface contours, curve divisions, and controlled alignment.",
    stream: "parametric-design",
    software: ["Grasshopper", "Rhino"],
    difficulty: "Intermediate",
    duration: "12:16",
    durationSeconds: 736,
    viewCount: 13567,
    thumbnailUrl: thumbnail("HxnFKpSabnA"),
    youtubeUrl: youtube("HxnFKpSabnA"),
    stage: "start",
    featured: true,
    keyConcepts: [
      "Surface contours",
      "Length-based division",
      "Staggered courses",
    ],
    requirements: ["Rhino", "Grasshopper"],
  },
  {
    id: "aYr7Py4KMjI",
    slug: "mesh-weaving-with-weaverbird",
    title: "Mesh Weaving Pattern with Weaverbird (Grasshopper Tutorial)",
    summary:
      "Apply a triangular topological pattern to a mesh, then join, thicken, and offset the woven result.",
    stream: "parametric-design",
    software: ["Grasshopper", "Weaverbird"],
    difficulty: "Intermediate",
    duration: "17:42",
    durationSeconds: 1062,
    viewCount: 18128,
    thumbnailUrl: thumbnail("aYr7Py4KMjI"),
    youtubeUrl: youtube("aYr7Py4KMjI"),
    stage: "start",
    featured: true,
    keyConcepts: ["Mesh topology", "Pattern joining", "Thickness and offset"],
    requirements: ["Rhino", "Grasshopper", "Weaverbird plug-in"],
  },
  {
    id: "p_yBUNTmuH4",
    slug: "minimal-surface-strips",
    title: "Minimal Surface Strips",
    summary:
      "Divide complex meshes into continuous strips for unrolling, visualization, and physical prototyping.",
    stream: "parametric-design",
    software: ["Grasshopper", "Stripper"],
    difficulty: "Advanced",
    duration: "25:22",
    durationSeconds: 1522,
    viewCount: 888,
    thumbnailUrl: thumbnail("p_yBUNTmuH4"),
    youtubeUrl: youtube("p_yBUNTmuH4"),
    stage: "deeper",
    featured: false,
    keyConcepts: ["Mesh striping", "Topology continuity", "Unrolling"],
    requirements: ["Rhino", "Grasshopper", "Stripper plug-in"],
  },
  {
    id: "L977gtvPIYE",
    slug: "scripting-2d-cellular-automata",
    title: "Scripting 2D Cellular Automata Using AI",
    summary:
      "Use AI-assisted coding to write, debug, and run an elementary cellular automaton in Rhino and Grasshopper.",
    stream: "creative-scripting",
    software: ["Python", "Grasshopper", "Copilot"],
    difficulty: "Beginner",
    duration: "25:33",
    durationSeconds: 1533,
    viewCount: 823,
    thumbnailUrl: thumbnail("L977gtvPIYE"),
    youtubeUrl: youtube("L977gtvPIYE"),
    stage: "start",
    featured: false,
    keyConcepts: ["Cellular rules", "AI-assisted debugging", "Grid iteration"],
    requirements: [
      "Rhino",
      "Grasshopper",
      "A Python editor or script component",
    ],
  },
  {
    id: "F0_eZod9TJM",
    slug: "scripting-3d-cellular-automata",
    title: "Scripting 3D Cellular Automata Using AI",
    summary:
      "Extend cellular rules into three dimensions and visualize the resulting spatial system in Rhino and Grasshopper.",
    stream: "creative-scripting",
    software: ["Python", "Grasshopper", "Copilot"],
    difficulty: "Intermediate",
    duration: "25:50",
    durationSeconds: 1550,
    viewCount: 813,
    thumbnailUrl: thumbnail("F0_eZod9TJM"),
    youtubeUrl: youtube("F0_eZod9TJM"),
    stage: "start",
    featured: true,
    keyConcepts: [
      "3D neighborhoods",
      "State transitions",
      "Spatial visualization",
    ],
    requirements: [
      "Rhino",
      "Grasshopper",
      "A Python editor or script component",
    ],
  },
  {
    id: "a6TeBJDUGWs",
    slug: "voxel-model-with-copilot",
    title: "Designing / Editing a Voxel Model with Co-Pilot",
    summary:
      "Generate and refine Python scripts for a procedural voxel tower while testing AI as a design partner.",
    stream: "creative-scripting",
    software: ["Python", "Grasshopper", "Copilot"],
    difficulty: "Advanced",
    duration: "37:23",
    durationSeconds: 2243,
    viewCount: 485,
    thumbnailUrl: thumbnail("a6TeBJDUGWs"),
    youtubeUrl: youtube("a6TeBJDUGWs"),
    stage: "deeper",
    featured: false,
    keyConcepts: [
      "Voxel data",
      "Procedural towers",
      "Iterative code refinement",
    ],
    requirements: ["Rhino", "Grasshopper", "Python", "GitHub Copilot"],
  },
  {
    id: "zfWGJdB1-X0",
    slug: "introduction-to-comfyui",
    title: "Introduction to ComfyUI",
    summary:
      "Learn the node interface, text-to-image, image-to-image, and a practical cloud-GPU setup.",
    stream: "generative-ai",
    software: ["ComfyUI", "RunPod"],
    difficulty: "Beginner",
    duration: "19:50",
    durationSeconds: 1190,
    viewCount: 2918,
    thumbnailUrl: thumbnail("zfWGJdB1-X0"),
    youtubeUrl: youtube("zfWGJdB1-X0"),
    stage: "start",
    featured: false,
    keyConcepts: [
      "Node graphs",
      "Text-to-image",
      "Image-to-image",
      "Cloud GPU setup",
    ],
    requirements: ["ComfyUI", "A local GPU or RunPod account"],
    relatedScriptId: "comfyui-introduction-workflow",
  },
  {
    id: "zlZuyxPYGpA",
    slug: "comfyui-controlnets",
    title: "ComfyUI Controlnets",
    summary:
      "Combine depth, Canny, and scribble guidance to keep architectural proportions and edge detail under control.",
    stream: "generative-ai",
    software: ["ComfyUI", "ControlNet"],
    difficulty: "Intermediate",
    duration: "23:32",
    durationSeconds: 1412,
    viewCount: 13538,
    thumbnailUrl: thumbnail("zlZuyxPYGpA"),
    youtubeUrl: youtube("zlZuyxPYGpA"),
    stage: "start",
    featured: true,
    keyConcepts: [
      "Multiple ControlNets",
      "Depth guidance",
      "Canny edges",
      "Scribble control",
    ],
    requirements: ["ComfyUI", "SDXL", "Compatible ControlNet models"],
  },
  {
    id: "IApOVLuPeqU",
    slug: "ai-rendering-with-comfyui",
    title: "AI Rendering with ComfyUI",
    summary:
      "Turn Rhino view captures into controlled architectural renderings with ControlNet and IP-Adapter.",
    stream: "generative-ai",
    software: ["ComfyUI", "Rhino", "IP-Adapter"],
    difficulty: "Intermediate",
    duration: "17:08",
    durationSeconds: 1028,
    viewCount: 10074,
    thumbnailUrl: thumbnail("IApOVLuPeqU"),
    youtubeUrl: youtube("IApOVLuPeqU"),
    stage: "deeper",
    featured: true,
    keyConcepts: [
      "Rhino view capture",
      "Structural conditioning",
      "Style transfer",
      "Prompt control",
    ],
    requirements: ["Rhino", "ComfyUI", "ControlNet", "IP-Adapter"],
  },
  {
    id: "gIRyoRJZJ7w",
    slug: "unrolling-parts-with-opennest",
    title: "Unrolling Parts",
    summary:
      "Unroll mesh surfaces into annotated, nested parts ready for cutting and assembly.",
    stream: "digital-fabrication",
    software: ["Grasshopper", "OpenNest"],
    difficulty: "Intermediate",
    duration: "23:32",
    durationSeconds: 1412,
    viewCount: 978,
    thumbnailUrl: thumbnail("gIRyoRJZJ7w"),
    youtubeUrl: youtube("gIRyoRJZJ7w"),
    stage: "start",
    featured: true,
    keyConcepts: [
      "Mesh unrolling",
      "Part annotation",
      "Nesting",
      "Assembly data",
    ],
    requirements: ["Rhino", "Grasshopper", "OpenNest plug-in"],
  },
  {
    id: "pU9DAUY5oOU",
    slug: "wood-fabrication-workflows",
    title: "Wood Fabrication: Co-Pilot & Grasshopper Workflows",
    summary:
      "Detail wood joints, automate annotations, and prepare fabrication drawings with Grasshopper and Python.",
    stream: "digital-fabrication",
    software: ["Grasshopper", "Python", "Copilot"],
    difficulty: "Intermediate",
    duration: "24:16",
    durationSeconds: 1456,
    viewCount: 1082,
    thumbnailUrl: thumbnail("pU9DAUY5oOU"),
    youtubeUrl: youtube("pU9DAUY5oOU"),
    stage: "start",
    featured: false,
    keyConcepts: [
      "Wood joinery",
      "Fabrication drawings",
      "Automated annotation",
    ],
    requirements: ["Rhino", "Grasshopper", "Python", "GitHub Copilot"],
  },
  {
    id: "uSt7fm12lQI",
    slug: "joints-for-unrolled-mesh-strips",
    title: "How to Add Joints to Unrolled Mesh Strips for Digital Fabrication",
    summary:
      "Develop repeatable edge connections for zip ties, rivets, and other strip-based assemblies.",
    stream: "digital-fabrication",
    software: ["Grasshopper", "Rhino"],
    difficulty: "Advanced",
    duration: "38:01",
    durationSeconds: 2281,
    viewCount: 588,
    thumbnailUrl: thumbnail("uSt7fm12lQI"),
    youtubeUrl: youtube("uSt7fm12lQI"),
    stage: "deeper",
    featured: false,
    keyConcepts: [
      "Edge matching",
      "Connection details",
      "Batch processing",
      "Assembly logic",
    ],
    requirements: ["Rhino", "Grasshopper", "Unrolled mesh geometry"],
  },
];

export const scriptProducts: ScriptProduct[] = [
  {
    id: "comfyui-introduction-workflow",
    title: "Introduction to ComfyUI Workflow",
    outcome:
      "Open the node workflow used in the introductory ComfyUI tutorial.",
    productType: "Foundational file",
    accessType: "Free download",
    software: ["ComfyUI"],
    difficulty: "Beginner",
    thumbnailUrl: thumbnail("zfWGJdB1-X0"),
    downloadUrl:
      "https://drive.google.com/file/d/1Ce8qloTW5g9Ls-fP8eegVDsAm2gnWAg9/view?usp=drive_link",
    tutorialUrl: youtube("zfWGJdB1-X0"),
  },
  {
    id: "ai-mesh-generation-workflow",
    title: "AI Mesh Generation Workflow",
    outcome:
      "Follow the ComfyUI pipeline from a generated image to views, keyframes, and a reconstructed 3D mesh.",
    productType: "Workflow kit",
    accessType: "Free download",
    software: ["ComfyUI", "Hunyuan 3D"],
    difficulty: "Advanced",
    thumbnailUrl: thumbnail("P9TJo3OtW-c"),
    downloadUrl:
      "https://drive.google.com/file/d/1ytEdhBj6iZOqpJ__PviQWZu-TKr0LB-6/view?usp=sharing",
    tutorialUrl: youtube("P9TJo3OtW-c"),
  },
];

export function getStream(slug: string) {
  return workflowStreams.find((stream) => stream.slug === slug);
}

export function getTutorial(slug: string) {
  return tutorials.find((tutorial) => tutorial.slug === slug);
}

export function getTutorialsForStream(stream: StreamSlug) {
  return tutorials.filter((tutorial) => tutorial.stream === stream);
}

export function getScriptProduct(id: string | undefined) {
  return scriptProducts.find((product) => product.id === id);
}
