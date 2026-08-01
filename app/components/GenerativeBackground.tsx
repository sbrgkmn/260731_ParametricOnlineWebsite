"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const modes = [
  { id: "cellular", label: "Cellular automata" },
  { id: "venation", label: "Leaf venation" },
  { id: "flock", label: "Flock simulation" },
  { id: "reaction", label: "Reaction-diffusion" },
  { id: "tiles", label: "Parametric tiles" },
  { id: "network", label: "Proximity network" },
  { id: "recursive", label: "Recursive growth" },
  { id: "radiolaria", label: "Radiolaria Voronoi mesh" },
  { id: "fractal", label: "Fractal basin" },
] as const;

type ModeId = (typeof modes)[number]["id"];

type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
};

type VenationNode = {
  x: number;
  y: number;
  parent: number | null;
  root: number;
};

type VenationLink = {
  from: number;
  to: number;
};

type AuxinSource = {
  x: number;
  y: number;
};

type MeshPoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  born: number;
};

type MeshVertex = {
  x: number;
  y: number;
};

type MeshCell = {
  siteIndex: number;
  polygon: MeshVertex[];
};

type InteractionSeed = {
  x: number;
  y: number;
  born: number;
  phase: number;
};

type ReactionState = {
  width: number;
  height: number;
  a: Float32Array;
  b: Float32Array;
  nextA: Float32Array;
  nextB: Float32Array;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
};

type FractalState = {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  parameterX: number;
  parameterY: number;
  targetX: number;
  targetY: number;
  lastRender: number;
};

type SimulationState = {
  width: number;
  height: number;
  points: Particle[];
  boids: Particle[];
  meshPoints: MeshPoint[];
  meshCells: MeshCell[];
  lastMeshUpdate: number;
  venationNodes: VenationNode[];
  venationLinks: VenationLink[];
  auxinSources: AuxinSource[];
  lastVenationStep: number;
  venationStartedAt: number;
  lastNetworkSpawn: number;
  lastFlockSpawn: number;
  cells: Uint8Array;
  nextCells: Uint8Array;
  cellColumns: number;
  cellRows: number;
  lastCellStep: number;
  tileSeeds: InteractionSeed[];
  growthSeeds: InteractionSeed[];
  fractalSeeds: InteractionSeed[];
  reaction: ReactionState | null;
  fractal: FractalState | null;
};

let INK = "#171717";
let ACCENT = "#ff5c35";
let FIELD_WARM = "#f2ad2e";
let PAPER = "#fbfbf8";
let INK_RGB: [number, number, number] = [23, 23, 23];
let ACCENT_RGB: [number, number, number] = [255, 92, 53];
let FIELD_WARM_RGB: [number, number, number] = [242, 173, 46];
let PAPER_RGB: [number, number, number] = [251, 251, 248];

function hexToRgb(
  value: string,
  fallback: [number, number, number],
): [number, number, number] {
  const match = value.trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return fallback;
  return [
    Number.parseInt(match[1], 16),
    Number.parseInt(match[2], 16),
    Number.parseInt(match[3], 16),
  ];
}

function syncCanvasPalette() {
  const styles = window.getComputedStyle(document.documentElement);
  INK = styles.getPropertyValue("--ink").trim() || INK;
  ACCENT = styles.getPropertyValue("--field-accent").trim() || ACCENT;
  FIELD_WARM = styles.getPropertyValue("--field-warm").trim() || FIELD_WARM;
  PAPER = styles.getPropertyValue("--paper").trim() || PAPER;
  INK_RGB = hexToRgb(INK, INK_RGB);
  ACCENT_RGB = hexToRgb(ACCENT, ACCENT_RGB);
  FIELD_WARM_RGB = hexToRgb(FIELD_WARM, FIELD_WARM_RGB);
  PAPER_RGB = hexToRgb(PAPER, PAPER_RGB);
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum);
}

function makeParticle(
  width: number,
  height: number,
  minimumSpeed = 0.25,
  maximumSpeed = 0.8,
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    phase: Math.random() * Math.PI * 2,
    size: 2 + Math.random() * 4,
  };
}

function makeMeshPoint(
  width: number,
  height: number,
  originX?: number,
  originY?: number,
): MeshPoint {
  const angle = Math.random() * Math.PI * 2;
  const clustered = originX !== undefined && originY !== undefined;
  const radius = clustered ? 8 + Math.random() * 58 : 0;
  return {
    x: clustered
      ? clamp(originX + Math.cos(angle) * radius, 3, width - 3)
      : Math.random() * width,
    y: clustered
      ? clamp(originY + Math.sin(angle) * radius, 3, height - 3)
      : Math.random() * height,
    vx: Math.cos(angle) * (0.07 + Math.random() * 0.16),
    vy: Math.sin(angle) * (0.07 + Math.random() * 0.16),
    phase: Math.random() * Math.PI * 2,
    born: performance.now(),
  };
}

function clipToBisector(
  polygon: MeshVertex[],
  site: MeshPoint,
  neighbor: MeshPoint,
) {
  if (polygon.length === 0) return polygon;
  const normalX = neighbor.x - site.x;
  const normalY = neighbor.y - site.y;
  const offset =
    (neighbor.x * neighbor.x +
      neighbor.y * neighbor.y -
      site.x * site.x -
      site.y * site.y) /
    2;
  const distance = (point: MeshVertex) =>
    point.x * normalX + point.y * normalY - offset;
  const clipped: MeshVertex[] = [];

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const currentDistance = distance(current);
    const previousDistance = distance(previous);
    const currentInside = currentDistance <= 0;
    const previousInside = previousDistance <= 0;

    if (currentInside !== previousInside) {
      const denominator = previousDistance - currentDistance;
      const amount =
        Math.abs(denominator) < 0.00001 ? 0 : previousDistance / denominator;
      clipped.push({
        x: previous.x + (current.x - previous.x) * amount,
        y: previous.y + (current.y - previous.y) * amount,
      });
    }
    if (currentInside) clipped.push(current);
  }

  return clipped;
}

function computeVoronoiCells(
  points: MeshPoint[],
  width: number,
  height: number,
): MeshCell[] {
  return points.flatMap((site, siteIndex) => {
    let polygon: MeshVertex[] = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];

    for (
      let neighborIndex = 0;
      neighborIndex < points.length;
      neighborIndex += 1
    ) {
      if (neighborIndex === siteIndex) continue;
      polygon = clipToBisector(polygon, site, points[neighborIndex]);
      if (polygon.length === 0) break;
    }

    return polygon.length > 2 ? [{ siteIndex, polygon }] : [];
  });
}

function addMeshCells(state: SimulationState, x: number, y: number, count = 7) {
  const limit = state.width < 720 ? 56 : 88;
  const additions = Math.min(count, limit - state.meshPoints.length);
  for (let index = 0; index < additions; index += 1) {
    state.meshPoints.push(makeMeshPoint(state.width, state.height, x, y));
  }
  state.lastMeshUpdate = 0;
}

function createFractal(width: number, height: number): FractalState {
  const fractalWidth = Math.max(190, Math.min(380, Math.floor(width / 3)));
  const fractalHeight = Math.max(110, Math.min(230, Math.floor(height / 3)));
  const canvas = document.createElement("canvas");
  canvas.width = fractalWidth;
  canvas.height = fractalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create fractal canvas");

  return {
    width: fractalWidth,
    height: fractalHeight,
    canvas,
    context,
    parameterX: -0.745,
    parameterY: 0.113,
    targetX: -0.745,
    targetY: 0.113,
    lastRender: 0,
  };
}

function createVenation(width: number, height: number) {
  const nodes: VenationNode[] = [];
  const rootCount = width < 720 ? 6 : 12;
  const minimumRootDistance = Math.min(width, height) * 0.15;
  let rootAttempts = 0;

  while (nodes.length < rootCount && rootAttempts < rootCount * 80) {
    rootAttempts += 1;
    const candidate = {
      x: width * 0.08 + Math.random() * width * 0.84,
      y: height * 0.1 + Math.random() * height * 0.8,
    };
    const distributed = nodes.every(
      (node) =>
        Math.hypot(node.x - candidate.x, node.y - candidate.y) >=
        minimumRootDistance,
    );
    if (!distributed) continue;
    nodes.push({
      ...candidate,
      parent: null,
      root: nodes.length,
    });
  }

  const sources: AuxinSource[] = [];
  const target = Math.min(
    330,
    Math.max(180, Math.floor((width * height) / 3400)),
  );
  const birthDistance = Math.max(
    10,
    Math.min(17, Math.min(width, height) / 50),
  );
  let attempts = 0;
  while (sources.length < target && attempts < target * 45) {
    attempts += 1;
    const candidate = {
      x: width * 0.035 + Math.random() * width * 0.93,
      y: height * 0.055 + Math.random() * height * 0.89,
    };
    if (
      sources.every(
        (source) =>
          Math.hypot(source.x - candidate.x, source.y - candidate.y) >=
          birthDistance,
      )
    ) {
      sources.push(candidate);
    }
  }

  return { nodes, sources };
}

function createReaction(width: number, height: number): ReactionState {
  const reactionWidth = Math.max(140, Math.min(340, Math.floor(width / 3)));
  const reactionHeight = Math.max(90, Math.min(220, Math.floor(height / 3)));
  const length = reactionWidth * reactionHeight;
  const a = new Float32Array(length).fill(1);
  const b = new Float32Array(length);
  const nextA = new Float32Array(length);
  const nextB = new Float32Array(length);

  const canvas = document.createElement("canvas");
  canvas.width = reactionWidth;
  canvas.height = reactionHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create reaction–diffusion canvas");

  const reaction = {
    width: reactionWidth,
    height: reactionHeight,
    a,
    b,
    nextA,
    nextB,
    canvas,
    context,
  };

  const initialStrips = width < 720 ? 6 : 11;
  for (let strip = 0; strip < initialStrips; strip += 1) {
    seedReactionStrip(
      reaction,
      0.08 + Math.random() * 0.84,
      0.1 + Math.random() * 0.8,
      Math.random() * Math.PI,
      24 + Math.random() * 34,
    );
  }

  return reaction;
}

function seedReactionStrip(
  reaction: ReactionState,
  normalizedX: number,
  normalizedY: number,
  angle: number,
  length = 34,
) {
  const centerX = normalizedX * reaction.width;
  const centerY = normalizedY * reaction.height;
  const halfLength = length * 0.5;
  const thickness = 2;

  for (let step = -halfLength; step <= halfLength; step += 1) {
    for (let offset = -thickness; offset <= thickness; offset += 1) {
      const x = Math.round(
        centerX +
          Math.cos(angle) * step +
          Math.cos(angle + Math.PI / 2) * offset,
      );
      const y = Math.round(
        centerY +
          Math.sin(angle) * step +
          Math.sin(angle + Math.PI / 2) * offset,
      );
      if (x < 1 || x >= reaction.width - 1 || y < 1 || y >= reaction.height - 1)
        continue;
      const index = y * reaction.width + x;
      reaction.a[index] = 0.18;
      reaction.b[index] = 1;
    }
  }
}

function createSimulation(
  width: number,
  height: number,
  mode: ModeId,
): SimulationState {
  const cellColumns = Math.max(64, Math.min(150, Math.floor(width / 8)));
  const cellRows = Math.max(42, Math.min(100, Math.floor(height / 8)));
  const cells = new Uint8Array(cellColumns * cellRows);
  cells.forEach((_, index) => {
    cells[index] = Math.random() > 0.77 ? 1 : 0;
  });

  const venation = createVenation(width, height);

  return {
    width,
    height,
    points: Array.from({ length: width < 720 ? 28 : 46 }, () =>
      makeParticle(width, height, 0.28, 0.62),
    ),
    boids: Array.from({ length: 38 }, () =>
      makeParticle(width, height, 1.8, 3),
    ),
    meshPoints: Array.from({ length: width < 720 ? 18 : 32 }, () =>
      makeMeshPoint(width, height),
    ),
    meshCells: [],
    lastMeshUpdate: 0,
    venationNodes: venation.nodes,
    venationLinks: [],
    auxinSources: venation.sources,
    lastVenationStep: 0,
    venationStartedAt: 0,
    lastNetworkSpawn: 0,
    lastFlockSpawn: 0,
    cells,
    nextCells: new Uint8Array(cells.length),
    cellColumns,
    cellRows,
    lastCellStep: 0,
    tileSeeds: [],
    growthSeeds: [],
    fractalSeeds: [],
    reaction: mode === "reaction" ? createReaction(width, height) : null,
    fractal: mode === "fractal" ? createFractal(width, height) : null,
  };
}

function addFlockAgents(
  state: SimulationState,
  x: number,
  y: number,
  count = 16,
) {
  const additions = Math.min(count, 180 - state.boids.length);
  for (let index = 0; index < additions; index += 1) {
    const boid = makeParticle(state.width, state.height, 2.2, 4);
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 42;
    boid.x = clamp(x + Math.cos(angle) * radius, 12, state.width - 12);
    boid.y = clamp(y + Math.sin(angle) * radius, 12, state.height - 12);
    state.boids.push(boid);
  }
}

function addInteractionSeeds(
  seeds: InteractionSeed[],
  x: number,
  y: number,
  width: number,
  height: number,
  count: number,
  limit: number,
  spread = 34,
) {
  const additions = Math.min(count, limit - seeds.length);
  for (let index = 0; index < additions; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * spread;
    seeds.push({
      x: clamp(x + Math.cos(angle) * radius, 4, width - 4),
      y: clamp(y + Math.sin(angle) * radius, 4, height - 4),
      born: performance.now(),
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function seedCellularBurst(state: SimulationState, x: number, y: number) {
  const centerX = Math.floor((x / state.width) * state.cellColumns);
  const centerY = Math.floor((y / state.height) * state.cellRows);
  const radius = 8;
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (
        offsetX * offsetX + offsetY * offsetY > radius * radius ||
        Math.random() < 0.22
      ) {
        continue;
      }
      const cellX = (centerX + offsetX + state.cellColumns) % state.cellColumns;
      const cellY = (centerY + offsetY + state.cellRows) % state.cellRows;
      state.cells[cellY * state.cellColumns + cellX] = 1;
    }
  }
  state.lastCellStep = performance.now();
}

function addVenationAgent(state: SimulationState, x: number, y: number) {
  const rootIds = state.venationNodes.map((node) => node.root);
  const nextRoot = rootIds.length === 0 ? 0 : Math.max(...rootIds) + 1;
  if (nextRoot < 22) {
    state.venationNodes.push({
      x: clamp(x, 8, state.width - 8),
      y: clamp(y, 8, state.height - 8),
      parent: null,
      root: nextRoot,
    });
  }

  const additions = Math.min(42, 460 - state.auxinSources.length);
  for (let index = 0; index < additions; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 18 + Math.random() * 125;
    state.auxinSources.push({
      x: clamp(x + Math.cos(angle) * radius, 8, state.width - 8),
      y: clamp(y + Math.sin(angle) * radius, 8, state.height - 8),
    });
  }
  state.venationStartedAt = performance.now();
}

function addNetworkAgents(state: SimulationState, x: number, y: number) {
  const additions = Math.min(12, 96 - state.points.length);
  for (let index = 0; index < additions; index += 1) {
    const point = makeParticle(state.width, state.height, 0.5, 1.15);
    const angle = Math.random() * Math.PI * 2;
    const radius = 6 + Math.random() * 52;
    point.x = clamp(x + Math.cos(angle) * radius, 5, state.width - 5);
    point.y = clamp(y + Math.sin(angle) * radius, 5, state.height - 5);
    state.points.push(point);
  }
}

function clear(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha = 1,
) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = PAPER;
  context.fillRect(0, 0, width, height);
  context.restore();
}

function wrapParticle(particle: Particle, width: number, height: number) {
  if (particle.x < -20) particle.x = width + 20;
  if (particle.x > width + 20) particle.x = -20;
  if (particle.y < -20) particle.y = height + 20;
  if (particle.y > height + 20) particle.y = -20;
}

function pointerForce(
  particle: Particle,
  pointer: PointerState,
  strength: number,
) {
  if (!pointer.active) return;
  const deltaX = pointer.x - particle.x;
  const deltaY = pointer.y - particle.y;
  const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
  if (distance > 240) return;
  const force = (1 - distance / 240) * strength;
  particle.vx += (deltaX / distance) * force;
  particle.vy += (deltaY / distance) * force;
}

function drawCellular(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
) {
  clear(context, state.width, state.height);
  const { cellColumns: columns, cellRows: rows } = state;

  if (pointer.active) {
    const cellX = Math.floor((pointer.x / state.width) * columns);
    const cellY = Math.floor((pointer.y / state.height) * rows);
    for (let y = -2; y <= 2; y += 1) {
      for (let x = -2; x <= 2; x += 1) {
        const px = (cellX + x + columns) % columns;
        const py = (cellY + y + rows) % rows;
        if (Math.random() > 0.35) state.cells[py * columns + px] = 1;
      }
    }
  }

  if (time - state.lastCellStep > 260) {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        let neighbors = 0;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (ox === 0 && oy === 0) continue;
            const nx = (x + ox + columns) % columns;
            const ny = (y + oy + rows) % rows;
            neighbors += state.cells[ny * columns + nx];
          }
        }
        const index = y * columns + x;
        state.nextCells[index] =
          neighbors === 3 || (state.cells[index] === 1 && neighbors === 2)
            ? 1
            : 0;
      }
    }
    [state.cells, state.nextCells] = [state.nextCells, state.cells];
    state.lastCellStep = time;
  }

  const cellWidth = state.width / columns;
  const cellHeight = state.height / rows;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const index = y * columns + x;
      if (!state.cells[index]) continue;
      const pointerDistance = pointer.active
        ? Math.hypot(x * cellWidth - pointer.x, y * cellHeight - pointer.y)
        : 999;
      context.fillStyle = pointerDistance < 110 ? ACCENT : INK;
      context.globalAlpha = pointerDistance < 110 ? 0.82 : 0.26;
      context.fillRect(
        x * cellWidth + 0.6,
        y * cellHeight + 0.6,
        Math.max(1, cellWidth - 1.2),
        Math.max(1, cellHeight - 1.2),
      );
    }
  }
  context.globalAlpha = 1;
}

function drawVenation(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
) {
  clear(context, state.width, state.height);
  if (state.venationStartedAt === 0) state.venationStartedAt = time;

  const restart =
    time - state.venationStartedAt > 52000 || state.venationNodes.length > 1900;
  if (restart) {
    const venation = createVenation(state.width, state.height);
    state.venationNodes = venation.nodes;
    state.venationLinks = [];
    state.auxinSources = venation.sources;
    state.venationStartedAt = time;
    state.lastVenationStep = time;
  }

  if (
    pointer.active &&
    Math.random() < 0.42 &&
    state.auxinSources.length < 380
  ) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 12 + Math.random() * 72;
    state.auxinSources.push({
      x: clamp(pointer.x + Math.cos(angle) * radius, 8, state.width - 8),
      y: clamp(pointer.y + Math.sin(angle) * radius, 8, state.height - 8),
    });
  }

  if (time - state.lastVenationStep > 46) {
    const nodes = state.venationNodes;
    const influenceRadiusSquared = Math.pow(
      Math.min(220, Math.max(125, state.width * 0.18)),
      2,
    );
    const killDistanceSquared = 9 * 9;
    const stepDistance = Math.min(6.2, Math.max(4.2, state.width / 230));
    const sourceBirthDistanceSquared = 13 * 13;
    const veinBirthDistanceSquared = 15 * 15;

    for (
      let attempt = 0;
      attempt < 10 && state.auxinSources.length < 340;
      attempt += 1
    ) {
      const candidate = {
        x: state.width * 0.035 + Math.random() * state.width * 0.93,
        y: state.height * 0.055 + Math.random() * state.height * 0.89,
      };
      const clearOfSources = state.auxinSources.every((source) => {
        const deltaX = source.x - candidate.x;
        const deltaY = source.y - candidate.y;
        return deltaX * deltaX + deltaY * deltaY >= sourceBirthDistanceSquared;
      });
      const clearOfVeins = nodes.every((node) => {
        const deltaX = node.x - candidate.x;
        const deltaY = node.y - candidate.y;
        return deltaX * deltaX + deltaY * deltaY >= veinBirthDistanceSquared;
      });
      if (clearOfSources && clearOfVeins) state.auxinSources.push(candidate);
    }

    const sumX = new Float32Array(nodes.length);
    const sumY = new Float32Array(nodes.length);
    const counts = new Uint16Array(nodes.length);

    for (const source of state.auxinSources) {
      let nearest = -1;
      let nearestDistanceSquared = influenceRadiusSquared;
      for (let index = 0; index < nodes.length; index += 1) {
        const deltaX = source.x - nodes[index].x;
        const deltaY = source.y - nodes[index].y;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        if (distanceSquared < nearestDistanceSquared) {
          nearest = index;
          nearestDistanceSquared = distanceSquared;
        }
      }
      if (nearest < 0) continue;
      const distance = Math.max(Math.sqrt(nearestDistanceSquared), 0.001);
      sumX[nearest] += (source.x - nodes[nearest].x) / distance;
      sumY[nearest] += (source.y - nodes[nearest].y) / distance;
      counts[nearest] += 1;
    }

    const children: VenationNode[] = [];
    for (let index = 0; index < nodes.length; index += 1) {
      if (counts[index] === 0) continue;
      const directionLength = Math.hypot(sumX[index], sumY[index]);
      if (directionLength < 0.001) continue;
      const child = {
        x: nodes[index].x + (sumX[index] / directionLength) * stepDistance,
        y: nodes[index].y + (sumY[index] / directionLength) * stepDistance,
        parent: index,
        root: nodes[index].root,
      };
      if (
        child.x < 5 ||
        child.x > state.width - 5 ||
        child.y < 5 ||
        child.y > state.height - 5
      ) {
        continue;
      }
      let collisionIndex = -1;
      let collisionDistanceSquared = Number.POSITIVE_INFINITY;
      const connectionDistanceSquared = Math.pow(stepDistance * 1.8, 2);
      nodes.forEach((node, nodeIndex) => {
        if (nodeIndex === index) return;
        const deltaX = node.x - child.x;
        const deltaY = node.y - child.y;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const collisionThreshold =
          node.root === child.root
            ? stepDistance * stepDistance * 0.42
            : connectionDistanceSquared;
        if (
          distanceSquared < collisionThreshold &&
          distanceSquared < collisionDistanceSquared
        ) {
          collisionIndex = nodeIndex;
          collisionDistanceSquared = distanceSquared;
        }
      });
      if (collisionIndex < 0) {
        children.push(child);
        continue;
      }

      if (
        nodes[collisionIndex].root !== child.root &&
        state.venationLinks.length < 54 &&
        !state.venationLinks.some(
          (link) =>
            (link.from === index && link.to === collisionIndex) ||
            (link.from === collisionIndex && link.to === index),
        )
      ) {
        state.venationLinks.push({ from: index, to: collisionIndex });
      }
    }

    const firstChildIndex = nodes.length;
    nodes.push(...children);
    state.auxinSources = state.auxinSources.filter((source) => {
      for (let index = firstChildIndex; index < nodes.length; index += 1) {
        const deltaX = source.x - nodes[index].x;
        const deltaY = source.y - nodes[index].y;
        if (deltaX * deltaX + deltaY * deltaY < killDistanceSquared)
          return false;
      }
      return true;
    });
    state.lastVenationStep = time;
  }

  context.lineCap = "round";
  context.lineJoin = "round";
  state.venationLinks.forEach((link, index) => {
    const from = state.venationNodes[link.from];
    const to = state.venationNodes[link.to];
    if (!from || !to) return;
    context.strokeStyle = index % 2 === 0 ? ACCENT : FIELD_WARM;
    context.globalAlpha = 0.78;
    context.lineWidth = 1.55;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  });

  for (let index = 0; index < state.venationNodes.length; index += 1) {
    const node = state.venationNodes[index];
    if (node.parent === null) continue;
    const parent = state.venationNodes[node.parent];
    const highlightedRoot = node.root % 5 <= 1;
    context.strokeStyle =
      node.root % 5 === 0 ? ACCENT : node.root % 5 === 1 ? FIELD_WARM : INK;
    context.globalAlpha = highlightedRoot ? 0.58 : 0.44;
    context.lineWidth = highlightedRoot ? 1.15 : 0.8;
    context.beginPath();
    context.moveTo(parent.x, parent.y);
    context.lineTo(node.x, node.y);
    context.stroke();
  }

  context.fillStyle = INK;
  context.globalAlpha = 0.12;
  for (const source of state.auxinSources) {
    context.fillRect(source.x, source.y, 1, 1);
  }

  context.fillStyle = ACCENT;
  context.globalAlpha = 0.9;
  for (const node of state.venationNodes) {
    if (node.parent !== null) continue;
    context.beginPath();
    context.arc(node.x, node.y, 2.3, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function drawFlock(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
  delta: number,
) {
  clear(context, state.width, state.height, 0.1);
  const speedScale = Math.min(delta / 16.67, 2);

  if (state.lastFlockSpawn === 0) state.lastFlockSpawn = time;
  if (time - state.lastFlockSpawn > 480 && state.boids.length < 118) {
    const parent = state.boids[Math.floor(Math.random() * state.boids.length)];
    const child = makeParticle(state.width, state.height, 2.2, 3.4);
    child.x = parent.x + (Math.random() - 0.5) * 18;
    child.y = parent.y + (Math.random() - 0.5) * 18;
    child.vx = parent.vx + (Math.random() - 0.5) * 0.8;
    child.vy = parent.vy + (Math.random() - 0.5) * 0.8;
    state.boids.push(child);
    state.lastFlockSpawn = time;
  }

  state.boids.forEach((boid, index) => {
    let alignX = 0;
    let alignY = 0;
    let centerX = 0;
    let centerY = 0;
    let separateX = 0;
    let separateY = 0;
    let neighbors = 0;

    state.boids.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      const deltaX = other.x - boid.x;
      const deltaY = other.y - boid.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 92) {
        alignX += other.vx;
        alignY += other.vy;
        centerX += other.x;
        centerY += other.y;
        neighbors += 1;
      }
      if (distance < 28 && distance > 0) {
        separateX -= deltaX / distance;
        separateY -= deltaY / distance;
      }
    });

    if (neighbors > 0) {
      boid.vx += (alignX / neighbors - boid.vx) * 0.018;
      boid.vy += (alignY / neighbors - boid.vy) * 0.018;
      boid.vx += (centerX / neighbors - boid.x) * 0.00025;
      boid.vy += (centerY / neighbors - boid.y) * 0.00025;
    }
    boid.vx += separateX * 0.032;
    boid.vy += separateY * 0.032;
    pointerForce(boid, pointer, -0.055);

    const speed = Math.max(Math.hypot(boid.vx, boid.vy), 0.01);
    const maximum = 4.25;
    if (speed > maximum) {
      boid.vx = (boid.vx / speed) * maximum;
      boid.vy = (boid.vy / speed) * maximum;
    } else if (speed < 2.1) {
      boid.vx = (boid.vx / speed) * 2.1;
      boid.vy = (boid.vy / speed) * 2.1;
    }

    const previousX = boid.x;
    const previousY = boid.y;
    boid.x += boid.vx * speedScale;
    boid.y += boid.vy * speedScale;
    wrapParticle(boid, state.width, state.height);

    if (
      Math.abs(boid.x - previousX) < 30 &&
      Math.abs(boid.y - previousY) < 30
    ) {
      context.strokeStyle =
        index % 9 === 0 ? ACCENT : index % 11 === 0 ? FIELD_WARM : INK;
      context.globalAlpha = index % 9 === 0 || index % 11 === 0 ? 0.4 : 0.2;
      context.lineWidth = index % 9 === 0 || index % 11 === 0 ? 1.1 : 0.65;
      context.beginPath();
      context.moveTo(previousX, previousY);
      context.lineTo(boid.x - boid.vx * 4.5, boid.y - boid.vy * 4.5);
      context.stroke();
    }

    const angle = Math.atan2(boid.vy, boid.vx);
    context.save();
    context.translate(boid.x, boid.y);
    context.rotate(angle);
    context.strokeStyle =
      index % 9 === 0 ? ACCENT : index % 11 === 0 ? FIELD_WARM : INK;
    context.globalAlpha = index % 9 === 0 || index % 11 === 0 ? 0.9 : 0.55;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(8, 0);
    context.lineTo(-5, 4);
    context.lineTo(-2, 0);
    context.lineTo(-5, -4);
    context.closePath();
    context.stroke();
    context.restore();
  });
  context.globalAlpha = 1;
}

function stepReaction(reaction: ReactionState) {
  const { width: columns, height: rows } = reaction;
  const { a, b, nextA, nextB } = reaction;
  const feed = 0.022;
  const kill = 0.051;

  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < columns - 1; x += 1) {
      const index = y * columns + x;
      const laplaceA =
        a[index - 1] * 0.2 +
        a[index + 1] * 0.2 +
        a[index - columns] * 0.2 +
        a[index + columns] * 0.2 +
        a[index - columns - 1] * 0.05 +
        a[index - columns + 1] * 0.05 +
        a[index + columns - 1] * 0.05 +
        a[index + columns + 1] * 0.05 -
        a[index];
      const laplaceB =
        b[index - 1] * 0.2 +
        b[index + 1] * 0.2 +
        b[index - columns] * 0.2 +
        b[index + columns] * 0.2 +
        b[index - columns - 1] * 0.05 +
        b[index - columns + 1] * 0.05 +
        b[index + columns - 1] * 0.05 +
        b[index + columns + 1] * 0.05 -
        b[index];
      const reactionTerm = a[index] * b[index] * b[index];
      nextA[index] = clamp(
        a[index] + laplaceA - reactionTerm + feed * (1 - a[index]),
      );
      nextB[index] = clamp(
        b[index] + 0.5 * laplaceB + reactionTerm - (kill + feed) * b[index],
      );
    }
  }

  for (let x = 0; x < columns; x += 1) {
    nextA[x] = nextA[columns + x];
    nextB[x] = nextB[columns + x];
    const bottom = (rows - 1) * columns + x;
    const insideBottom = (rows - 2) * columns + x;
    nextA[bottom] = nextA[insideBottom];
    nextB[bottom] = nextB[insideBottom];
  }
  for (let y = 0; y < rows; y += 1) {
    const left = y * columns;
    const right = left + columns - 1;
    nextA[left] = nextA[left + 1];
    nextB[left] = nextB[left + 1];
    nextA[right] = nextA[right - 1];
    nextB[right] = nextB[right - 1];
  }

  reaction.a = nextA;
  reaction.b = nextB;
  reaction.nextA = a;
  reaction.nextB = b;
}

function drawReaction(
  context: CanvasRenderingContext2D,
  state: SimulationState,
) {
  clear(context, state.width, state.height);
  if (!state.reaction)
    state.reaction = createReaction(state.width, state.height);
  const reaction = state.reaction;
  for (let iteration = 0; iteration < 4; iteration += 1) {
    stepReaction(reaction);
  }

  const image = reaction.context.createImageData(
    reaction.width,
    reaction.height,
  );
  for (let index = 0; index < reaction.a.length; index += 1) {
    const intensity = Math.pow(
      clamp(1 - Math.abs(reaction.b[index] - 0.34) * 6.5),
      1.7,
    );
    const accent = clamp((reaction.b[index] - 0.4) * 8);
    const warm = clamp((reaction.b[index] - 0.62) * 8);
    const mark = intensity * 0.74;
    for (let channel = 0; channel < 3; channel += 1) {
      const monochrome =
        PAPER_RGB[channel] + (INK_RGB[channel] - PAPER_RGB[channel]) * mark;
      const accented =
        monochrome + (ACCENT_RGB[channel] - monochrome) * accent * 0.72;
      image.data[index * 4 + channel] = Math.floor(
        accented + (FIELD_WARM_RGB[channel] - accented) * warm * 0.62,
      );
    }
    image.data[index * 4 + 3] = 255;
  }
  reaction.context.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.globalAlpha = 0.62;
  context.drawImage(reaction.canvas, 0, 0, state.width, state.height);
  context.globalAlpha = 1;
}

function drawTiles(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
) {
  clear(context, state.width, state.height);
  state.tileSeeds = state.tileSeeds.filter((seed) => time - seed.born < 9000);
  const columns = Math.max(12, Math.floor(state.width / 46));
  const rows = Math.max(9, Math.floor(state.height / 46));
  const tileWidth = state.width / columns;
  const tileHeight = state.height / rows;
  const tileSize = Math.min(tileWidth, tileHeight);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const centerX = (column + 0.5) * tileWidth;
      const centerY = (row + 0.5) * tileHeight;
      const pointerDistance = pointer.active
        ? Math.hypot(centerX - pointer.x, centerY - pointer.y)
        : Math.hypot(
            centerX - state.width * 0.55,
            centerY - state.height * 0.45,
          );
      let influence = clamp(
        1 - (pointerDistance / Math.max(state.width, state.height)) * 2.2,
      );
      state.tileSeeds.forEach((seed) => {
        const age = time - seed.born;
        const life = clamp(1 - age / 9000);
        const distance = Math.hypot(centerX - seed.x, centerY - seed.y);
        const waveFront = age * 0.045;
        const waveBand = Math.exp(-Math.pow((distance - waveFront) / 88, 2));
        const localPressure = clamp(1 - distance / (150 + age * 0.022));
        influence = Math.max(
          influence,
          (waveBand * 0.72 + localPressure * 0.58) * life,
        );
      });
      const wave = Math.sin(time * 0.0018 + column * 0.62 + row * 0.43);
      const scale = 0.24 + influence * 0.72 + wave * 0.08;
      const rotation =
        wave * 0.35 + influence * ((column + row) % 2 ? -0.7 : 0.7);
      const tileColor =
        influence > 0.72
          ? (column + row) % 3 === 0
            ? FIELD_WARM
            : ACCENT
          : INK;

      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);
      context.scale(scale, scale);
      context.strokeStyle = tileColor;
      context.fillStyle = tileColor;
      context.globalAlpha = 0.16 + influence * 0.72;
      context.lineWidth = 1 / Math.max(scale, 0.2);
      context.strokeRect(
        -tileWidth * 0.36,
        -tileHeight * 0.36,
        tileWidth * 0.72,
        tileHeight * 0.72,
      );

      context.rotate(Math.PI / 4 + wave * 0.08);
      context.globalAlpha = 0.1 + influence * 0.48;
      context.strokeRect(
        -tileSize * 0.19,
        -tileSize * 0.19,
        tileSize * 0.38,
        tileSize * 0.38,
      );

      context.rotate(-Math.PI / 4 - wave * 0.08);
      context.beginPath();
      context.arc(
        0,
        0,
        tileSize * (0.12 + influence * 0.06),
        wave,
        wave + Math.PI * (1.25 + influence * 0.5),
      );
      context.globalAlpha = 0.18 + influence * 0.58;
      context.stroke();

      const diagonalDirection = (column + row) % 2 === 0 ? 1 : -1;
      context.globalAlpha = 0.08 + influence * 0.34;
      context.beginPath();
      context.moveTo(-tileWidth * 0.32, diagonalDirection * tileHeight * 0.32);
      context.lineTo(tileWidth * 0.32, -diagonalDirection * tileHeight * 0.32);
      context.stroke();

      context.globalAlpha = 0.34 + influence * 0.62;
      context.beginPath();
      context.arc(0, 0, 1.25 / Math.max(scale, 0.24), 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }
  context.globalAlpha = 1;
}

function drawNetwork(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
  delta: number,
) {
  clear(context, state.width, state.height, 0.2);
  const speedScale = Math.min(delta / 16.67, 2);
  const threshold = Math.min(145, state.width * 0.18);
  const pointLimit = state.width < 720 ? 42 : 68;

  if (state.lastNetworkSpawn === 0) state.lastNetworkSpawn = time;
  if (
    time - state.lastNetworkSpawn > 1800 &&
    state.points.length < pointLimit
  ) {
    const point = makeParticle(state.width, state.height, 0.28, 0.62);
    if (pointer.active) {
      point.x = pointer.x + (Math.random() - 0.5) * 40;
      point.y = pointer.y + (Math.random() - 0.5) * 40;
    }
    state.points.push(point);
    state.lastNetworkSpawn = time;
  }

  state.points.forEach((point) => {
    pointerForce(point, pointer, 0.006);
    const speed = Math.max(Math.hypot(point.vx, point.vy), 0.001);
    const targetSpeed = clamp(speed, 0.28, 0.82);
    point.vx = (point.vx / speed) * targetSpeed;
    point.vy = (point.vy / speed) * targetSpeed;
    point.x += point.vx * speedScale;
    point.y += point.vy * speedScale;
    wrapParticle(point, state.width, state.height);
  });

  for (let first = 0; first < state.points.length; first += 1) {
    const a = state.points[first];
    for (let second = first + 1; second < state.points.length; second += 1) {
      const b = state.points[second];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > threshold) continue;
      const nearPointer =
        pointer.active &&
        (Math.hypot(a.x - pointer.x, a.y - pointer.y) < 145 ||
          Math.hypot(b.x - pointer.x, b.y - pointer.y) < 145);
      context.strokeStyle = nearPointer
        ? (first + second) % 3 === 0
          ? FIELD_WARM
          : ACCENT
        : INK;
      context.globalAlpha =
        (1 - distance / threshold) * (nearPointer ? 0.74 : 0.38);
      context.lineWidth = nearPointer ? 1.8 : 1.15;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
  }

  state.points.forEach((point, index) => {
    const nearPointer =
      pointer.active &&
      Math.hypot(point.x - pointer.x, point.y - pointer.y) < 145;
    context.fillStyle = nearPointer
      ? index % 3 === 0
        ? FIELD_WARM
        : ACCENT
      : INK;
    context.globalAlpha = nearPointer ? 0.96 : 0.7;
    context.beginPath();
    context.arc(point.x, point.y, nearPointer ? 3.6 : 2.25, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}

function drawRecursive(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
) {
  clear(context, state.width, state.height);
  state.growthSeeds = state.growthSeeds.filter(
    (seed) => time - seed.born < 12000,
  );
  const cycle = (time % 10000) / 10000;
  const pointerAngle = pointer.active
    ? (pointer.x / state.width - 0.5) * 0.45
    : 0;

  const branch = (
    x: number,
    y: number,
    length: number,
    angle: number,
    depth: number,
    phase: number,
    growthCycle = cycle,
    opacityScale = 1,
  ) => {
    if (depth <= 0) return;
    const localGrowth = clamp(growthCycle * 7 - phase);
    if (localGrowth <= 0) return;
    const endX = x + Math.cos(angle) * length * localGrowth;
    const endY = y + Math.sin(angle) * length * localGrowth;
    context.strokeStyle = depth <= 2 ? ACCENT : INK;
    context.globalAlpha = (0.2 + depth * 0.09) * opacityScale;
    context.lineWidth = Math.max(0.55, depth * 0.42);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(endX, endY);
    context.stroke();

    if (depth <= 2 && localGrowth > 0.58) {
      const leafGrowth = clamp((localGrowth - 0.58) / 0.42);
      const leafCount = depth === 1 ? 4 : 2;
      for (let leaf = 0; leaf < leafCount; leaf += 1) {
        const leafAngle = angle + (leaf - (leafCount - 1) / 2) * 0.34;
        const leafDistance = 3 + leaf * 1.8;
        context.fillStyle =
          leaf % 3 === 0 ? ACCENT : leaf % 3 === 1 ? FIELD_WARM : INK;
        context.globalAlpha =
          (leaf % 3 === 0 ? 0.8 : 0.5) * leafGrowth * opacityScale;
        context.beginPath();
        context.arc(
          endX + Math.cos(leafAngle) * leafDistance,
          endY + Math.sin(leafAngle) * leafDistance,
          (depth === 1 ? 2.2 : 1.55) * leafGrowth,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    }

    if (localGrowth < 0.98) return;
    const spread = 0.34 + Math.sin(time * 0.00035 + depth) * 0.08;
    branch(
      endX,
      endY,
      length * 0.72,
      angle - spread + pointerAngle * 0.25,
      depth - 1,
      phase + 0.82,
      growthCycle,
      opacityScale,
    );
    branch(
      endX,
      endY,
      length * 0.69,
      angle + spread + pointerAngle * 0.25,
      depth - 1,
      phase + 0.92,
      growthCycle,
      opacityScale,
    );
    if (depth % 2 === 0) {
      branch(
        endX,
        endY,
        length * 0.58,
        angle + Math.sin(time * 0.0004) * 0.16,
        depth - 2,
        phase + 1.08,
        growthCycle,
        opacityScale,
      );
    }
  };

  const roots = state.width < 700 ? 2 : 4;
  const branchDepth = state.width < 700 ? 8 : 9;
  for (let root = 0; root < roots; root += 1) {
    const x = state.width * ((root + 1) / (roots + 1));
    branch(
      x,
      state.height * 1.02,
      state.height * (state.width < 700 ? 0.17 : 0.145),
      -Math.PI / 2 + pointerAngle,
      branchDepth,
      root * 0.24,
    );
  }

  state.growthSeeds.forEach((seed) => {
    const life = clamp((time - seed.born) / 12000);
    const growthCycle = clamp(life * 1.55);
    const fade = clamp(1 - Math.max(0, life - 0.72) / 0.28);
    const sprouts = state.width < 700 ? 2 : 3;
    for (let sprout = 0; sprout < sprouts; sprout += 1) {
      const angle =
        seed.phase +
        (sprout / sprouts) * Math.PI * 2 +
        Math.sin(time * 0.0003 + seed.phase) * 0.12;
      branch(
        seed.x,
        seed.y,
        Math.min(state.width, state.height) * 0.075,
        angle,
        6,
        sprout * 0.16,
        growthCycle,
        fade,
      );
    }
  });
  context.globalAlpha = 1;
}

function drawRadiolaria(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
  delta: number,
) {
  clear(context, state.width, state.height);
  const speedScale = Math.min(delta / 16.67, 2);

  state.meshPoints.forEach((point) => {
    point.vx += Math.cos(time * 0.00018 + point.phase) * 0.0007;
    point.vy += Math.sin(time * 0.00022 + point.phase) * 0.0007;
    if (pointer.active) {
      const deltaX = point.x - pointer.x;
      const deltaY = point.y - pointer.y;
      const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
      if (distance < 230) {
        const pressure = (1 - distance / 230) * 0.004;
        point.vx += (deltaX / distance) * pressure;
        point.vy += (deltaY / distance) * pressure;
      }
    }
    const speed = Math.max(Math.hypot(point.vx, point.vy), 0.001);
    const targetSpeed = clamp(speed, 0.07, 0.28);
    point.vx = (point.vx / speed) * targetSpeed;
    point.vy = (point.vy / speed) * targetSpeed;
    point.x += point.vx * speedScale;
    point.y += point.vy * speedScale;
    if (point.x < 0 || point.x > state.width) point.vx *= -1;
    if (point.y < 0 || point.y > state.height) point.vy *= -1;
    point.x = clamp(point.x, 0, state.width);
    point.y = clamp(point.y, 0, state.height);
  });

  if (time - state.lastMeshUpdate > 85 || state.meshCells.length === 0) {
    state.meshCells = computeVoronoiCells(
      state.meshPoints,
      state.width,
      state.height,
    );
    state.lastMeshUpdate = time;
  }

  state.meshCells.forEach((cell) => {
    const site = state.meshPoints[cell.siteIndex];
    const centroid = cell.polygon.reduce(
      (center, vertex) => ({
        x: center.x + vertex.x / cell.polygon.length,
        y: center.y + vertex.y / cell.polygon.length,
      }),
      { x: 0, y: 0 },
    );
    const pointerDistance = pointer.active
      ? Math.hypot(pointer.x - site.x, pointer.y - site.y)
      : Number.POSITIVE_INFINITY;
    const birthGrowth = clamp((time - site.born) / 850);
    const highlighted = pointerDistance < 190 || birthGrowth < 1;
    const cellColor = cell.siteIndex % 2 === 0 ? ACCENT : FIELD_WARM;

    context.beginPath();
    cell.polygon.forEach((vertex, index) => {
      if (index === 0) context.moveTo(vertex.x, vertex.y);
      else context.lineTo(vertex.x, vertex.y);
    });
    context.closePath();
    context.fillStyle = highlighted ? cellColor : INK;
    context.globalAlpha = (highlighted ? 0.095 : 0.018) * birthGrowth;
    context.fill();
    context.strokeStyle = highlighted ? cellColor : INK;
    context.globalAlpha = (highlighted ? 0.82 : 0.46) * birthGrowth;
    context.lineWidth = highlighted ? 1.45 : 0.9;
    context.stroke();

    context.beginPath();
    cell.polygon.forEach((vertex, index) => {
      const insetX = centroid.x + (vertex.x - centroid.x) * 0.78;
      const insetY = centroid.y + (vertex.y - centroid.y) * 0.78;
      if (index === 0) context.moveTo(insetX, insetY);
      else context.lineTo(insetX, insetY);
    });
    context.closePath();
    context.globalAlpha = (highlighted ? 0.38 : 0.18) * birthGrowth;
    context.lineWidth = 0.65;
    context.stroke();

    context.globalAlpha = (highlighted ? 0.32 : 0.12) * birthGrowth;
    context.lineWidth = 0.5;
    cell.polygon.forEach((vertex, index) => {
      if (index % 2 !== 0) return;
      context.beginPath();
      context.moveTo(site.x, site.y);
      context.lineTo(
        centroid.x + (vertex.x - centroid.x) * 0.78,
        centroid.y + (vertex.y - centroid.y) * 0.78,
      );
      context.stroke();
    });

    context.fillStyle = highlighted ? cellColor : INK;
    context.globalAlpha = (highlighted ? 0.9 : 0.5) * birthGrowth;
    context.beginPath();
    context.arc(site.x, site.y, highlighted ? 2.2 : 1.3, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}

function drawFractal(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
) {
  clear(context, state.width, state.height);
  state.fractalSeeds = state.fractalSeeds.filter(
    (seed) => time - seed.born < 7200,
  );
  if (!state.fractal) {
    state.fractal = createFractal(state.width, state.height);
  }
  const fractal = state.fractal;
  fractal.parameterX += (fractal.targetX - fractal.parameterX) * 0.018;
  fractal.parameterY += (fractal.targetY - fractal.parameterY) * 0.018;

  if (time - fractal.lastRender > 72) {
    const image = fractal.context.createImageData(
      fractal.width,
      fractal.height,
    );
    const aspect = state.width / Math.max(state.height, 1);
    const pointerX = pointer.active
      ? (pointer.x / state.width - 0.5) * 0.045
      : 0;
    const pointerY = pointer.active
      ? (pointer.y / state.height - 0.5) * 0.045
      : 0;
    const parameterX =
      fractal.parameterX + pointerX + Math.sin(time * 0.00009) * 0.008;
    const parameterY =
      fractal.parameterY + pointerY + Math.cos(time * 0.00007) * 0.008;
    const maximumIterations = 48;

    for (let y = 0; y < fractal.height; y += 1) {
      for (let x = 0; x < fractal.width; x += 1) {
        let real = (x / fractal.width - 0.5) * 2.85 * aspect;
        let imaginary = (y / fractal.height - 0.5) * 2.85;
        let iteration = 0;
        let magnitudeSquared = 0;

        while (iteration < maximumIterations && magnitudeSquared <= 4) {
          const nextReal = real * real - imaginary * imaginary + parameterX;
          imaginary = 2 * real * imaginary + parameterY;
          real = nextReal;
          magnitudeSquared = real * real + imaginary * imaginary;
          iteration += 1;
        }

        const escaped = iteration < maximumIterations;
        const smoothIteration = escaped
          ? iteration + 1 - Math.log2(Math.log2(Math.sqrt(magnitudeSquared)))
          : maximumIterations;
        const normalized = clamp(smoothIteration / maximumIterations);
        const filament = 0.5 + Math.cos(smoothIteration * 2.15) * 0.5;
        const intensity = escaped
          ? clamp(Math.pow(normalized, 0.44) * (0.48 + filament * 0.68))
          : 0.16;
        const warmMix = 0.5 + Math.sin(smoothIteration * 0.47) * 0.5;
        const pixelIndex = (y * fractal.width + x) * 4;

        for (let channel = 0; channel < 3; channel += 1) {
          const fractalColor =
            ACCENT_RGB[channel] * (1 - warmMix) +
            FIELD_WARM_RGB[channel] * warmMix;
          const targetColor = escaped ? fractalColor : INK_RGB[channel];
          const amount = escaped ? 0.08 + intensity * 0.78 : 0.2;
          image.data[pixelIndex + channel] = Math.floor(
            PAPER_RGB[channel] + (targetColor - PAPER_RGB[channel]) * amount,
          );
        }
        image.data[pixelIndex + 3] = 255;
      }
    }

    fractal.context.putImageData(image, 0, 0);
    fractal.lastRender = time;
  }

  context.imageSmoothingEnabled = true;
  context.globalAlpha = 0.88;
  context.drawImage(fractal.canvas, 0, 0, state.width, state.height);

  const orbitAspect = state.width / Math.max(state.height, 1);
  state.fractalSeeds.forEach((seed, seedIndex) => {
    const age = time - seed.born;
    const life = clamp(1 - age / 7200);
    const visibleIterations = Math.min(24, 3 + Math.floor(age / 105));
    let real = (seed.x / state.width - 0.5) * 2.85 * orbitAspect;
    let imaginary = (seed.y / state.height - 0.5) * 2.85;
    context.strokeStyle = seedIndex % 2 === 0 ? ACCENT : FIELD_WARM;
    context.fillStyle = context.strokeStyle;
    context.globalAlpha = life * 0.84;
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(seed.x, seed.y);

    let lastX = seed.x;
    let lastY = seed.y;
    for (let iteration = 0; iteration < visibleIterations; iteration += 1) {
      const nextReal = real * real - imaginary * imaginary + fractal.parameterX;
      imaginary = 2 * real * imaginary + fractal.parameterY;
      real = nextReal;
      if (real * real + imaginary * imaginary > 18) break;
      lastX = (real / (2.85 * orbitAspect) + 0.5) * state.width;
      lastY = (imaginary / 2.85 + 0.5) * state.height;
      context.lineTo(lastX, lastY);
    }
    context.stroke();
    context.beginPath();
    context.arc(lastX, lastY, 2.2, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}

function drawMode(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  mode: ModeId,
  pointer: PointerState,
  time: number,
  delta: number,
) {
  switch (mode) {
    case "cellular":
      drawCellular(context, state, pointer, time);
      break;
    case "venation":
      drawVenation(context, state, pointer, time);
      break;
    case "flock":
      drawFlock(context, state, pointer, time, delta);
      break;
    case "reaction":
      drawReaction(context, state);
      break;
    case "tiles":
      drawTiles(context, state, pointer, time);
      break;
    case "network":
      drawNetwork(context, state, pointer, time, delta);
      break;
    case "recursive":
      drawRecursive(context, state, pointer, time);
      break;
    case "radiolaria":
      drawRadiolaria(context, state, pointer, time, delta);
      break;
    case "fractal":
      drawFractal(context, state, pointer, time);
      break;
  }
}

export function GenerativeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<ModeId>("network");
  const [autoCycle, setAutoCycle] = useState(true);

  const advanceMode = useCallback(() => {
    setMode((currentMode) => {
      const currentIndex = modes.findIndex((item) => item.id === currentMode);
      return modes[(currentIndex + 1) % modes.length].id;
    });
  }, []);

  useEffect(() => {
    const stored = Number(
      window.sessionStorage.getItem("parametric-background-mode"),
    );
    const nextIndex = Number.isFinite(stored)
      ? (stored + 1) % modes.length
      : Math.floor(Math.random() * modes.length);
    const frame = window.requestAnimationFrame(() =>
      setMode(modes[nextIndex].id),
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const index = modes.findIndex((item) => item.id === mode);
    window.sessionStorage.setItem("parametric-background-mode", String(index));

    if (
      !autoCycle ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const interval = window.setInterval(advanceMode, 16000);
    return () => window.clearInterval(interval);
  }, [advanceMode, autoCycle, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    syncCanvasPalette();
    const pointer: PointerState = { x: 0, y: 0, active: false };
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let simulation = createSimulation(1, 1, mode);
    let animationFrame = 0;
    let previousTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      simulation = createSimulation(rect.width, rect.height, mode);
    };

    const updatePointer = (event: globalThis.PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= rect.width &&
        pointer.y <= rect.height;
    };

    const clearPointer = () => {
      pointer.active = false;
    };

    const injectPointer = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".generative-controls")) {
        return;
      }
      updatePointer(event);
      if (!pointer.active) return;

      if (mode === "cellular") {
        seedCellularBurst(simulation, pointer.x, pointer.y);
      }

      if (mode === "venation") {
        addVenationAgent(simulation, pointer.x, pointer.y);
      }

      if (mode === "flock") {
        addFlockAgents(simulation, pointer.x, pointer.y);
      }

      if (mode === "tiles") {
        addInteractionSeeds(
          simulation.tileSeeds,
          pointer.x,
          pointer.y,
          simulation.width,
          simulation.height,
          3,
          18,
          30,
        );
      }

      if (mode === "network") {
        addNetworkAgents(simulation, pointer.x, pointer.y);
      }

      if (mode === "recursive") {
        addInteractionSeeds(
          simulation.growthSeeds,
          pointer.x,
          pointer.y,
          simulation.width,
          simulation.height,
          2,
          18,
          24,
        );
      }

      if (mode === "radiolaria") {
        addMeshCells(simulation, pointer.x, pointer.y);
      }

      if (mode === "fractal") {
        if (!simulation.fractal) {
          simulation.fractal = createFractal(
            simulation.width,
            simulation.height,
          );
        }
        simulation.fractal.targetX =
          -0.84 + (pointer.x / simulation.width) * 0.28;
        simulation.fractal.targetY =
          -0.22 + (pointer.y / simulation.height) * 0.44;
        simulation.fractal.lastRender = 0;
        addInteractionSeeds(
          simulation.fractalSeeds,
          pointer.x,
          pointer.y,
          simulation.width,
          simulation.height,
          4,
          28,
          18,
        );
      }

      if (mode === "reaction") {
        if (!simulation.reaction) {
          simulation.reaction = createReaction(
            simulation.width,
            simulation.height,
          );
        }
        const normalizedX = pointer.x / simulation.width;
        const normalizedY = pointer.y / simulation.height;
        for (let strip = 0; strip < 3; strip += 1) {
          seedReactionStrip(
            simulation.reaction,
            normalizedX + (Math.random() - 0.5) * 0.05,
            normalizedY + (Math.random() - 0.5) * 0.05,
            Math.random() * Math.PI,
            28 + Math.random() * 32,
          );
        }
      }
    };

    const updateTheme = () => {
      syncCanvasPalette();
      if (simulation.fractal) simulation.fractal.lastRender = 0;
      clear(context, simulation.width, simulation.height);
    };

    const render = (time: number) => {
      const delta = Math.min(time - previousTime, 40);
      previousTime = time;
      drawMode(context, simulation, mode, pointer, time, delta);
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", injectPointer, { passive: true });
    window.addEventListener("pointerout", clearPointer, { passive: true });
    window.addEventListener("parametric-theme-change", updateTheme);
    render(performance.now());

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", injectPointer);
      window.removeEventListener("pointerout", clearPointer);
      window.removeEventListener("parametric-theme-change", updateTheme);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [mode]);

  return (
    <>
      <div className="generative-background">
        <div className="generative-fallback" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <canvas
          ref={canvasRef}
          className="generative-canvas"
          aria-hidden="true"
        />
      </div>
      <div className="generative-controls">
        <label htmlFor="background-mode">Background system</label>
        <div>
          <select
            id="background-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as ModeId)}
          >
            {modes.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={advanceMode}>
            Next
          </button>
          <button
            className="cycle-toggle"
            type="button"
            aria-pressed={autoCycle}
            onClick={() => setAutoCycle((enabled) => !enabled)}
          >
            {autoCycle ? "Auto on" : "Auto off"}
          </button>
        </div>
        <p className="generative-hint" aria-live="polite">
          {mode === "cellular"
            ? "Click the field to seed a new cell colony."
            : mode === "venation"
              ? "Click the field to add a root and growth resources."
              : mode === "flock"
                ? "Click the field to release more agents."
                : mode === "reaction"
                  ? "Click the field to seed new reaction strips."
                  : mode === "tiles"
                    ? "Click the field to send new pulses through the tiles."
                    : mode === "network"
                      ? "Click the field to add moving network nodes."
                      : mode === "recursive"
                        ? "Click the field to plant new recursive growth."
                        : mode === "radiolaria"
                          ? "Click the field to add cells to the Voronoi mesh."
                          : "Click the field to seed and shift the fractal basin."}
        </p>
      </div>
    </>
  );
}
