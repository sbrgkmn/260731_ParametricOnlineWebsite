export type LessonCategory =
  | "Grasshopper"
  | "ComfyUI"
  | "AI + Geometry"
  | "Digital Fabrication";

export type Lesson = {
  title: string;
  summary: string;
  category: LessonCategory;
  duration: string;
  level: string;
  youtubeId: string | null;
  youtubeUrl: string;
};

export const lessons: Lesson[] = [
  {
    title: "Brick Wall From Parametric Surface",
    summary:
      "Build a staggered brick system from contours, divisions, and controlled alignment on a freeform surface.",
    category: "Grasshopper",
    duration: "12:16",
    level: "Intermediate",
    youtubeId: "HxnFKpSabnA",
    youtubeUrl: "https://www.youtube.com/watch?v=HxnFKpSabnA",
  },
  {
    title: "Mesh Weaving Pattern with Weaverbird",
    summary:
      "Apply a topological triangle pattern to a mesh, then join, thicken, and offset the woven result.",
    category: "Grasshopper",
    duration: "17:43",
    level: "Intermediate",
    youtubeId: "aYr7Py4KMjI",
    youtubeUrl: "https://www.youtube.com/watch?v=aYr7Py4KMjI",
  },
  {
    title: "Python Scripting: Iceray Pattern",
    summary:
      "Translate a compact shape-grammar idea into a procedural Grasshopper Python study.",
    category: "AI + Geometry",
    duration: "18 min",
    level: "Advanced",
    youtubeId: null,
    youtubeUrl: "https://www.youtube.com/@Parametric/search?query=Iceray",
  },
  {
    title: "Random Subdivision Panels",
    summary:
      "Use controlled randomness and list operations to create variable facade panel divisions.",
    category: "Grasshopper",
    duration: "12 min",
    level: "Beginner",
    youtubeId: null,
    youtubeUrl: "https://www.youtube.com/@Parametric/search?query=Random%20Subdivision",
  },
  {
    title: "From Image to Repeatable AI Workflow",
    summary:
      "Organize a ComfyUI graph for repeatable architectural image studies and clean handoff.",
    category: "ComfyUI",
    duration: "24 min",
    level: "Beginner",
    youtubeId: null,
    youtubeUrl: "https://www.youtube.com/@Parametric",
  },
  {
    title: "Geometry to Fabrication Data",
    summary:
      "Prepare parametric parts for naming, indexing, nesting, and reliable fabrication output.",
    category: "Digital Fabrication",
    duration: "21 min",
    level: "Advanced",
    youtubeId: null,
    youtubeUrl: "https://www.youtube.com/@Parametric",
  },
];

