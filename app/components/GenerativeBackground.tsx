"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const modes = [
  { id: "cellular", label: "Cellular automata" },
  { id: "flock", label: "Flock simulation" },
  { id: "reaction", label: "Reaction-diffusion" },
  { id: "tiles", label: "Parametric tiles" },
  { id: "network", label: "Proximity network" },
  { id: "radiolaria", label: "Radiolaria Voronoi mesh" },
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

type SimulationState = {
  width: number;
  height: number;
  points: Particle[];
  boids: Particle[];
  meshPoints: MeshPoint[];
  meshCells: MeshCell[];
  lastMeshUpdate: number;
  lastNetworkSpawn: number;
  lastFlockSpawn: number;
  cells: Uint8Array;
  nextCells: Uint8Array;
  cellColumns: number;
  cellRows: number;
  lastCellStep: number;
  tileSeeds: InteractionSeed[];
  growthSeeds: InteractionSeed[];
  reaction: ReactionState | null;
};

let INK = "#171717";
let ACCENT = "#e11d48";
let FIELD_WARM = "#ff4d6d";
let PAPER = "#fbfbf8";
let INK_RGB: [number, number, number] = [23, 23, 23];
let ACCENT_RGB: [number, number, number] = [225, 29, 72];
let FIELD_WARM_RGB: [number, number, number] = [255, 77, 109];
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
    cells[index] = Math.floor(Math.random() * 6);
  });

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
    lastNetworkSpawn: 0,
    lastFlockSpawn: 0,
    cells,
    nextCells: new Uint8Array(cells.length),
    cellColumns,
    cellRows,
    lastCellStep: 0,
    tileSeeds: [],
    growthSeeds: createRadialGrowthSeeds(width, height),
    reaction: mode === "reaction" ? createReaction(width, height) : null,
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

function createRadialGrowthSeeds(width: number, height: number) {
  const seeds: InteractionSeed[] = [];
  const count = width < 720 ? 1 : 2;
  for (let index = 0; index < count; index += 1) {
    seeds.push({
      x: width * ((index + 1) / (count + 1)),
      y: height * (0.35 + Math.random() * 0.3),
      born: performance.now() - 700 - Math.random() * 900,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return seeds;
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

function addLSystemSeed(
  state: SimulationState,
  x: number,
  y: number,
) {
  if (state.growthSeeds.length >= 18) return;
  state.growthSeeds.push({
    x: clamp(x, 8, state.width - 8),
    y: clamp(y, 8, state.height - 8),
    born: performance.now(),
    phase: Math.random() * Math.PI * 2,
  });
}

function seedCellularBurst(state: SimulationState, x: number, y: number) {
  const centerX = Math.floor((x / state.width) * state.cellColumns);
  const centerY = Math.floor((y / state.height) * state.cellRows);
  const radius = 12;
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      const distance = Math.hypot(offsetX, offsetY);
      if (distance > radius) continue;
      const cellX = (centerX + offsetX + state.cellColumns) % state.cellColumns;
      const cellY = (centerY + offsetY + state.cellRows) % state.cellRows;
      state.cells[cellY * state.cellColumns + cellX] =
        Math.floor(distance * 0.72) % 6;
    }
  }
  state.lastCellStep = performance.now();
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
  clear(context, state.width, state.height, 0.42);
  const { cellColumns: columns, cellRows: rows } = state;

  if (pointer.active) {
    const cellX = Math.floor((pointer.x / state.width) * columns);
    const cellY = Math.floor((pointer.y / state.height) * rows);
    for (let y = -5; y <= 5; y += 1) {
      for (let x = -5; x <= 5; x += 1) {
        const distance = Math.hypot(x, y);
        if (distance > 5) continue;
        const px = (cellX + x + columns) % columns;
        const py = (cellY + y + rows) % rows;
        state.cells[py * columns + px] =
          (Math.floor(distance + time * 0.008) + 3) % 6;
      }
    }
  }

  if (time - state.lastCellStep > 82) {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const index = y * columns + x;
        const current = state.cells[index];
        const target = (current + 1) % 6;
        let advancingNeighbors = 0;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (ox === 0 && oy === 0) continue;
            const nx = (x + ox + columns) % columns;
            const ny = (y + oy + rows) % rows;
            if (state.cells[ny * columns + nx] === target) {
              advancingNeighbors += 1;
            }
          }
        }
        state.nextCells[index] =
          advancingNeighbors >= 2 || Math.random() < 0.00035
            ? target
            : current;
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
      const cellState = state.cells[index];
      const pointerDistance = pointer.active
        ? Math.hypot(
            (x + 0.5) * cellWidth - pointer.x,
            (y + 0.5) * cellHeight - pointer.y,
          )
        : Number.POSITIVE_INFINITY;
      const highlighted = pointerDistance < 135;
      context.fillStyle =
        cellState === 1 || cellState === 2
          ? ACCENT
          : cellState === 3
            ? FIELD_WARM
            : INK;
      context.globalAlpha = highlighted
        ? 0.42 + cellState * 0.085
        : 0.09 + cellState * 0.055;
      const pulse = 0.72 + 0.2 * Math.sin(time * 0.004 + cellState + x * 0.12);
      const insetX = cellWidth * (1 - pulse) * 0.5;
      const insetY = cellHeight * (1 - pulse) * 0.5;
      context.fillRect(
        x * cellWidth + insetX,
        y * cellHeight + insetY,
        Math.max(1, cellWidth * pulse - 0.7),
        Math.max(1, cellHeight * pulse - 0.7),
      );

      if (cellState === 2 || cellState === 5) {
        context.strokeStyle = cellState === 2 ? ACCENT : FIELD_WARM;
        context.globalAlpha = highlighted ? 0.72 : 0.22;
        context.lineWidth = 0.6;
        context.strokeRect(
          x * cellWidth + 1,
          y * cellHeight + 1,
          Math.max(1, cellWidth - 2),
          Math.max(1, cellHeight - 2),
        );
      }
    }
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
    const chemical = reaction.b[index];
    const ridge = Math.pow(clamp(1 - Math.abs(chemical - 0.34) * 6.5), 1.55);
    const accentBand = Math.pow(
      clamp(1 - Math.abs(chemical - 0.2) * 6.2),
      1.15,
    );
    const warmBand = Math.pow(
      clamp(1 - Math.abs(chemical - 0.48) * 5.4),
      1.2,
    );
    const deepBand = clamp((chemical - 0.58) * 5.5);
    for (let channel = 0; channel < 3; channel += 1) {
      const outlined =
        PAPER_RGB[channel] +
        (INK_RGB[channel] - PAPER_RGB[channel]) * ridge * 0.54;
      const accented =
        outlined +
        (ACCENT_RGB[channel] - outlined) * accentBand * 0.9;
      const warmed =
        accented +
        (FIELD_WARM_RGB[channel] - accented) * warmBand * 0.88;
      image.data[index * 4 + channel] = Math.floor(
        warmed + (INK_RGB[channel] - warmed) * deepBand * 0.48,
      );
    }
    image.data[index * 4 + 3] = 255;
  }
  reaction.context.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.globalAlpha = 0.86;
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

type ZipperVertex = { x: number; y: number };
type ZipperTriangle = {
  vertices: [number, number, number];
  neighbors: number[];
  x: number;
  y: number;
};
type ZipperMesh = {
  width: number;
  height: number;
  columns: number;
  rows: number;
  vertices: ZipperVertex[];
  triangles: ZipperTriangle[];
  edges: Array<[number, number]>;
};

let zipperMeshCache: ZipperMesh | null = null;

function getZipperMesh(width: number, height: number) {
  if (
    zipperMeshCache &&
    Math.abs(zipperMeshCache.width - width) < 1 &&
    Math.abs(zipperMeshCache.height - height) < 1
  ) {
    return zipperMeshCache;
  }

  const targetSize = width < 720 ? 54 : 62;
  const columns = Math.max(8, Math.ceil(width / targetSize));
  let rows = Math.max(7, Math.ceil(height / (targetSize * 0.82)));
  if (rows % 2 === 0) rows += 1;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const vertices: ZipperVertex[] = [];

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      vertices.push({
        x: column * cellWidth,
        y: row * cellHeight,
      });
    }
  }

  const triangles: ZipperTriangle[] = [];
  const addTriangle = (a: number, b: number, c: number) => {
    const first = vertices[a];
    const second = vertices[b];
    const third = vertices[c];
    triangles.push({
      vertices: [a, b, c],
      neighbors: [],
      x: (first.x + second.x + third.x) / 3,
      y: (first.y + second.y + third.y) / 3,
    });
  };

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const topLeft = row * (columns + 1) + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns + 1;
      const bottomRight = bottomLeft + 1;
      if ((row + column) % 2 === 0) {
        addTriangle(topLeft, bottomLeft, bottomRight);
        addTriangle(topLeft, bottomRight, topRight);
      } else {
        addTriangle(topLeft, bottomLeft, topRight);
        addTriangle(topRight, bottomLeft, bottomRight);
      }
    }
  }

  const edgeOwners = new Map<string, number[]>();
  const edgeVertices = new Map<string, [number, number]>();
  triangles.forEach((triangle, triangleIndex) => {
    const [a, b, c] = triangle.vertices;
    for (const [first, second] of [
      [a, b],
      [b, c],
      [c, a],
    ] as Array<[number, number]>) {
      const edge: [number, number] =
        first < second ? [first, second] : [second, first];
      const key = `${edge[0]}:${edge[1]}`;
      edgeVertices.set(key, edge);
      const owners = edgeOwners.get(key) ?? [];
      owners.push(triangleIndex);
      edgeOwners.set(key, owners);
    }
  });

  edgeOwners.forEach((owners) => {
    if (owners.length === 2) {
      triangles[owners[0]].neighbors.push(owners[1]);
      triangles[owners[1]].neighbors.push(owners[0]);
    }
  });

  zipperMeshCache = {
    width,
    height,
    columns,
    rows,
    vertices,
    triangles,
    edges: [...edgeVertices.values()],
  };
  return zipperMeshCache;
}

function buildLacedRing(mesh: ZipperMesh) {
  const stride = mesh.columns + 1;
  const ring = [0];

  for (let row = 0; row <= mesh.rows; row += 1) {
    if (row === 0) {
      for (let column = 1; column <= mesh.columns; column += 1) {
        ring.push(column);
      }
    } else if (row % 2 === 1) {
      ring.push(row * stride + mesh.columns);
      for (let column = mesh.columns - 1; column >= 1; column -= 1) {
        ring.push(row * stride + column);
      }
    } else {
      ring.push(row * stride + 1);
      for (let column = 2; column <= mesh.columns; column += 1) {
        ring.push(row * stride + column);
      }
    }
  }

  ring.push(mesh.rows * stride);
  for (let row = mesh.rows - 1; row >= 0; row -= 1) {
    ring.push(row * stride);
  }

  const edgeIndices = new Map<string, number>();
  for (let index = 1; index < ring.length; index += 1) {
    const first = ring[index - 1];
    const second = ring[index];
    const key = first < second ? `${first}:${second}` : `${second}:${first}`;
    edgeIndices.set(key, index - 1);
  }
  return { ring, edgeIndices };
}

function nearestZipperTriangle(
  mesh: ZipperMesh,
  x: number,
  y: number,
) {
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  mesh.triangles.forEach((triangle, index) => {
    const distance = (triangle.x - x) ** 2 + (triangle.y - y) ** 2;
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  });
  return nearest;
}

function buildZipperTraversal(
  mesh: ZipperMesh,
  start: number,
  phase: number,
) {
  const traversal = [start];
  const visited = new Set<number>(traversal);
  let previousX = mesh.triangles[start].x - Math.cos(phase) * 20;
  let previousY = mesh.triangles[start].y - Math.sin(phase) * 20;
  let current = start;
  let preferLeft = Math.sin(phase) >= 0;

  while (traversal.length < mesh.triangles.length) {
    const triangle = mesh.triangles[current];
    const directionX = triangle.x - previousX;
    const directionY = triangle.y - previousY;
    const candidates = triangle.neighbors.filter(
      (neighbor) => !visited.has(neighbor),
    );
    if (candidates.length === 0) break;

    candidates.sort((first, second) => {
      const a = mesh.triangles[first];
      const b = mesh.triangles[second];
      const crossA =
        directionX * (a.y - triangle.y) -
        directionY * (a.x - triangle.x);
      const crossB =
        directionX * (b.y - triangle.y) -
        directionY * (b.x - triangle.x);
      const sideA = (preferLeft ? crossA : -crossA) >= 0 ? 1 : 0;
      const sideB = (preferLeft ? crossB : -crossB) >= 0 ? 1 : 0;
      if (sideA !== sideB) return sideB - sideA;
      const exitsA = a.neighbors.filter((neighbor) => !visited.has(neighbor)).length;
      const exitsB = b.neighbors.filter((neighbor) => !visited.has(neighbor)).length;
      return exitsA - exitsB;
    });

    previousX = triangle.x;
    previousY = triangle.y;
    current = candidates[0];
    traversal.push(current);
    visited.add(current);
    preferLeft = !preferLeft;
  }

  return traversal;
}

function sharedEdgeMidpoint(
  mesh: ZipperMesh,
  firstTriangle: number,
  secondTriangle: number,
) {
  const first = mesh.triangles[firstTriangle].vertices;
  const second = new Set(mesh.triangles[secondTriangle].vertices);
  const shared = first.filter((vertex) => second.has(vertex));
  if (shared.length !== 2) return mesh.triangles[secondTriangle];
  const a = mesh.vertices[shared[0]];
  const b = mesh.vertices[shared[1]];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function drawRecursive(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
) {
  clear(context, state.width, state.height);
  const mesh = getZipperMesh(state.width, state.height);
  const { ring, edgeIndices } = buildLacedRing(mesh);
  const ringEdgeCount = ring.length - 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  mesh.triangles.forEach((triangle) => {
    const [a, b, c] = triangle.vertices;
    const triangleEdges: Array<[number, number]> = [
      [a, b],
      [b, c],
      [c, a],
    ];
    const triangleRingIndices = triangleEdges.flatMap(([first, second]) => {
      const key = first < second ? `${first}:${second}` : `${second}:${first}`;
      const ringIndex = edgeIndices.get(key);
      return ringIndex === undefined ? [] : [ringIndex];
    });
    const triangleType = triangleRingIndices.length;
    const ringIndex = triangleRingIndices[0] ?? 0;
    const solid =
      triangleType === 2 || (triangleType === 1 && ringIndex % 2 === 0);
    if (!solid && triangleType !== 0) return;
    const pointerDistance = pointer.active
      ? Math.hypot(triangle.x - pointer.x, triangle.y - pointer.y)
      : Number.POSITIVE_INFINITY;
    context.fillStyle =
      pointerDistance < 70
        ? FIELD_WARM
        : pointerDistance < 155
          ? ACCENT
          : triangleType === 2
            ? FIELD_WARM
            : triangleType === 0
              ? ACCENT
              : INK;
    context.globalAlpha =
      pointerDistance < 155
        ? 0.28
        : triangleType === 2
          ? 0.2
          : triangleType === 0
            ? 0.035
            : 0.12;
    context.beginPath();
    triangle.vertices.forEach((vertexIndex, index) => {
      const vertex = mesh.vertices[vertexIndex];
      if (index === 0) context.moveTo(vertex.x, vertex.y);
      else context.lineTo(vertex.x, vertex.y);
    });
    context.closePath();
    context.fill();
  });

  for (const [firstIndex, secondIndex] of mesh.edges) {
    const first = mesh.vertices[firstIndex];
    const second = mesh.vertices[secondIndex];
    const midpointX = (first.x + second.x) / 2;
    const midpointY = (first.y + second.y) / 2;
    const pointerDistance = pointer.active
      ? Math.hypot(midpointX - pointer.x, midpointY - pointer.y)
      : Number.POSITIVE_INFINITY;
    context.strokeStyle =
      pointerDistance < 70
        ? FIELD_WARM
        : pointerDistance < 155
          ? ACCENT
          : INK;
    context.globalAlpha = pointerDistance < 155 ? 0.5 : 0.16;
    context.lineWidth = pointerDistance < 70 ? 1.5 : 0.75;
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.lineTo(second.x, second.y);
    context.stroke();
  }

  for (let edgeIndex = 0; edgeIndex < ringEdgeCount; edgeIndex += 1) {
    const first = mesh.vertices[ring[edgeIndex]];
    const second = mesh.vertices[ring[edgeIndex + 1]];
    context.strokeStyle = edgeIndex % 2 === 0 ? ACCENT : INK;
    context.globalAlpha = 0.5;
    context.lineWidth = 1.8;
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.lineTo(second.x, second.y);
    context.stroke();
  }

  state.growthSeeds.forEach((seed, seedIndex) => {
    let startIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < ringEdgeCount; index += 1) {
      const vertex = mesh.vertices[ring[index]];
      const distance = (vertex.x - seed.x) ** 2 + (vertex.y - seed.y) ** 2;
      if (distance < nearestDistance) {
        startIndex = index;
        nearestDistance = distance;
      }
    }
    const direction = Math.sin(seed.phase) >= 0 ? 1 : -1;
    const visibleSteps = Math.min(
      ringEdgeCount,
      Math.max(1, Math.floor((time - seed.born + 100) / 16)),
    );
    const baseColor = seedIndex % 2 === 0 ? FIELD_WARM : ACCENT;

    for (let step = 0; step < visibleSteps; step += 1) {
      const edgeIndex =
        (startIndex + direction * step + ringEdgeCount) % ringEdgeCount;
      const nextIndex =
        (edgeIndex + direction + ringEdgeCount) % ringEdgeCount;
      const first = mesh.vertices[ring[edgeIndex]];
      const second = mesh.vertices[ring[nextIndex]];
      const pointerDistance = pointer.active
        ? Math.hypot(
            (first.x + second.x) / 2 - pointer.x,
            (first.y + second.y) / 2 - pointer.y,
          )
        : Number.POSITIVE_INFINITY;
      context.strokeStyle =
        pointerDistance < 70
          ? FIELD_WARM
          : pointerDistance < 155
            ? ACCENT
            : baseColor;
      context.globalAlpha = 0.38 + (step / visibleSteps) * 0.58;
      context.lineWidth = 2.4 + (step / visibleSteps) * 1.5;
      context.beginPath();
      context.moveTo(first.x, first.y);
      context.lineTo(second.x, second.y);
      context.stroke();
    }

    const headIndex =
      (startIndex + direction * (visibleSteps - 1) + ringEdgeCount) %
      ringEdgeCount;
    const head = mesh.vertices[ring[headIndex]];
    context.fillStyle = baseColor;
    context.globalAlpha = 0.92;
    context.beginPath();
    context.arc(
      head.x,
      head.y,
      3.6 + Math.sin(time * 0.007 + seed.phase) * 1.2,
      0,
      Math.PI * 2,
    );
    context.fill();
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
    case "radiolaria":
      drawRadiolaria(context, state, pointer, time, delta);
      break;
  }
}

export function GenerativeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cycleTimeoutRef = useRef<number | null>(null);
  const [mode, setMode] = useState<ModeId>("network");

  const advanceMode = useCallback(() => {
    setMode((currentMode) => {
      const currentIndex = modes.findIndex((item) => item.id === currentMode);
      return modes[(currentIndex + 1) % modes.length].id;
    });
  }, []);

  const scheduleAdvance = useCallback(() => {
    if (cycleTimeoutRef.current !== null) {
      window.clearTimeout(cycleTimeoutRef.current);
    }
    cycleTimeoutRef.current = window.setTimeout(advanceMode, 8000);
  }, [advanceMode]);

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

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scheduleAdvance();
    }

    return () => {
      if (cycleTimeoutRef.current !== null) {
        window.clearTimeout(cycleTimeoutRef.current);
        cycleTimeoutRef.current = null;
      }
    };
  }, [mode, scheduleAdvance]);

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
      updatePointer(event);
      if (!pointer.active) return;
      scheduleAdvance();

      if (mode === "cellular") {
        seedCellularBurst(simulation, pointer.x, pointer.y);
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

      if (mode === "radiolaria") {
        addMeshCells(simulation, pointer.x, pointer.y);
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
  }, [mode, scheduleAdvance]);

  return (
    <div className="generative-stage">
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
    </div>
  );
}
