"use client";

import { useEffect, useRef, useState } from "react";

const modes = [
  { id: "cellular", label: "Cellular automata", code: "RULE / LIFE" },
  { id: "venation", label: "Leaf venation", code: "GROW / VEIN" },
  { id: "flock", label: "Flock simulation", code: "AGENT / FLOCK" },
  { id: "reaction", label: "Reaction–diffusion", code: "FIELD / GRAY-SCOTT" },
  { id: "tiles", label: "Parametric tiles", code: "GRID / TRANSFORM" },
  { id: "network", label: "Proximity network", code: "POINT / CONNECT" },
  { id: "recursive", label: "Recursive growth", code: "TREE / RECURSE" },
  { id: "flowers", label: "Moving flowers", code: "AGENT / BLOOM" },
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

type AuxinSource = {
  x: number;
  y: number;
};

type Flower = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  lifespan: number;
  maxSize: number;
  phase: number;
  branches: number;
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
  flowers: Flower[];
  venationNodes: VenationNode[];
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
  reaction: ReactionState | null;
};

const INK = "#f4f2ed";
const ACCENT = "#ff4d00";

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum);
}

function makeParticle(width: number, height: number, minimumSpeed = 0.25, maximumSpeed = 0.8): Particle {
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

function makeFlower(width: number, height: number, stagger = true): Flower {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: width * 0.08 + Math.random() * width * 0.84,
    y: height * 0.12 + Math.random() * height * 0.76,
    vx: Math.cos(angle) * (0.08 + Math.random() * 0.18),
    vy: Math.sin(angle) * (0.08 + Math.random() * 0.18),
    age: stagger ? -Math.random() * 4200 : 0,
    lifespan: 3400 + Math.random() * 2600,
    maxSize: 19 + Math.random() * 28,
    phase: Math.random() * Math.PI * 2,
    branches: 4 + Math.floor(Math.random() * 4),
  };
}

function createVenation(width: number, height: number) {
  const nodes: VenationNode[] = [];
  const roots = width < 720 ? 5 : 8;
  const centerX = width * 0.5;
  const centerY = height * 0.52;
  const rootRadius = Math.min(width, height) * 0.035;

  for (let root = 0; root < roots; root += 1) {
    const angle = (root / roots) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      x: centerX + Math.cos(angle) * rootRadius,
      y: centerY + Math.sin(angle) * rootRadius,
      parent: null,
      root,
    });
  }

  const sources: AuxinSource[] = [];
  const target = Math.min(330, Math.max(180, Math.floor((width * height) / 3400)));
  const birthDistance = Math.max(10, Math.min(17, Math.min(width, height) / 50));
  let attempts = 0;
  while (sources.length < target && attempts < target * 45) {
    attempts += 1;
    const candidate = {
      x: width * 0.035 + Math.random() * width * 0.93,
      y: height * 0.055 + Math.random() * height * 0.89,
    };
    if (Math.hypot(candidate.x - centerX, candidate.y - centerY) < rootRadius * 2.2) continue;
    if (
      sources.every(
        (source) => Math.hypot(source.x - candidate.x, source.y - candidate.y) >= birthDistance,
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

  for (let seed = 0; seed < 38; seed += 1) {
    const centerX = 8 + Math.floor(Math.random() * (reactionWidth - 16));
    const centerY = 8 + Math.floor(Math.random() * (reactionHeight - 16));
    for (let y = -1; y <= 1; y += 1) {
      for (let x = -1; x <= 1; x += 1) {
        const index = (centerY + y) * reactionWidth + centerX + x;
        a[index] = 0.45;
        b[index] = 1;
      }
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = reactionWidth;
  canvas.height = reactionHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create reaction–diffusion canvas");

  return {
    width: reactionWidth,
    height: reactionHeight,
    a,
    b,
    nextA,
    nextB,
    canvas,
    context,
  };
}

function createSimulation(width: number, height: number, mode: ModeId): SimulationState {
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
    points: Array.from({ length: 42 }, () => makeParticle(width, height, 1.2, 2.1)),
    boids: Array.from({ length: 38 }, () => makeParticle(width, height, 1.8, 3)),
    flowers: Array.from({ length: 14 }, () => makeFlower(width, height)),
    venationNodes: venation.nodes,
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
    reaction: mode === "reaction" ? createReaction(width, height) : null,
  };
}

function clear(context: CanvasRenderingContext2D, width: number, height: number, alpha = 1) {
  context.fillStyle = `rgba(5, 5, 5, ${alpha})`;
  context.fillRect(0, 0, width, height);
}

function wrapParticle(particle: Particle, width: number, height: number) {
  if (particle.x < -20) particle.x = width + 20;
  if (particle.x > width + 20) particle.x = -20;
  if (particle.y < -20) particle.y = height + 20;
  if (particle.y > height + 20) particle.y = -20;
}

function pointerForce(particle: Particle, pointer: PointerState, strength: number) {
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
          neighbors === 3 || (state.cells[index] === 1 && neighbors === 2) ? 1 : 0;
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

  const restart = time - state.venationStartedAt > 28000 || state.venationNodes.length > 1450;
  if (restart) {
    const venation = createVenation(state.width, state.height);
    state.venationNodes = venation.nodes;
    state.auxinSources = venation.sources;
    state.venationStartedAt = time;
    state.lastVenationStep = time;
  }

  if (pointer.active && Math.random() < 0.42 && state.auxinSources.length < 380) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 12 + Math.random() * 72;
    state.auxinSources.push({
      x: clamp(pointer.x + Math.cos(angle) * radius, 8, state.width - 8),
      y: clamp(pointer.y + Math.sin(angle) * radius, 8, state.height - 8),
    });
  }

  if (time - state.lastVenationStep > 46) {
    const nodes = state.venationNodes;
    const influenceRadiusSquared = Math.pow(Math.min(220, Math.max(125, state.width * 0.18)), 2);
    const killDistanceSquared = 9 * 9;
    const stepDistance = Math.min(6.2, Math.max(4.2, state.width / 230));
    const sourceBirthDistanceSquared = 13 * 13;
    const veinBirthDistanceSquared = 15 * 15;

    for (let attempt = 0; attempt < 10 && state.auxinSources.length < 340; attempt += 1) {
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
      if (child.x < 5 || child.x > state.width - 5 || child.y < 5 || child.y > state.height - 5) {
        continue;
      }
      const collides = nodes.some((node) => {
        const deltaX = node.x - child.x;
        const deltaY = node.y - child.y;
        return deltaX * deltaX + deltaY * deltaY < stepDistance * stepDistance * 0.42;
      });
      if (!collides) children.push(child);
    }

    const firstChildIndex = nodes.length;
    nodes.push(...children);
    state.auxinSources = state.auxinSources.filter((source) => {
      for (let index = firstChildIndex; index < nodes.length; index += 1) {
        const deltaX = source.x - nodes[index].x;
        const deltaY = source.y - nodes[index].y;
        if (deltaX * deltaX + deltaY * deltaY < killDistanceSquared) return false;
      }
      return true;
    });
    state.lastVenationStep = time;
  }

  context.lineCap = "round";
  context.lineJoin = "round";
  for (let index = 0; index < state.venationNodes.length; index += 1) {
    const node = state.venationNodes[index];
    if (node.parent === null) continue;
    const parent = state.venationNodes[node.parent];
    context.strokeStyle = node.root % 5 === 0 ? ACCENT : INK;
    context.globalAlpha = node.root % 5 === 0 ? 0.58 : 0.44;
    context.lineWidth = node.root % 5 === 0 ? 1.15 : 0.8;
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

    if (Math.abs(boid.x - previousX) < 30 && Math.abs(boid.y - previousY) < 30) {
      context.strokeStyle = index % 9 === 0 ? ACCENT : INK;
      context.globalAlpha = index % 9 === 0 ? 0.4 : 0.2;
      context.lineWidth = index % 9 === 0 ? 1.1 : 0.65;
      context.beginPath();
      context.moveTo(previousX, previousY);
      context.lineTo(boid.x - boid.vx * 4.5, boid.y - boid.vy * 4.5);
      context.stroke();
    }

    const angle = Math.atan2(boid.vy, boid.vx);
    context.save();
    context.translate(boid.x, boid.y);
    context.rotate(angle);
    context.strokeStyle = index % 9 === 0 ? ACCENT : INK;
    context.globalAlpha = index % 9 === 0 ? 0.9 : 0.55;
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

function stepReaction(reaction: ReactionState, pointer: PointerState, width: number, height: number) {
  const { width: columns, height: rows } = reaction;
  const { a, b, nextA, nextB } = reaction;
  const feed = 0.036;
  const kill = 0.065;

  if (pointer.active) {
    const px = Math.floor((pointer.x / width) * columns);
    const py = Math.floor((pointer.y / height) * rows);
    for (let y = -3; y <= 3; y += 1) {
      for (let x = -3; x <= 3; x += 1) {
        const cx = clamp(px + x, 1, columns - 2);
        const cy = clamp(py + y, 1, rows - 2);
        const index = cy * columns + cx;
        a[index] = 0.35;
        b[index] = 1;
      }
    }
  }

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
      nextA[index] = clamp(a[index] + laplaceA - reactionTerm + feed * (1 - a[index]));
      nextB[index] = clamp(b[index] + 0.5 * laplaceB + reactionTerm - (kill + feed) * b[index]);
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
  pointer: PointerState,
) {
  clear(context, state.width, state.height);
  if (!state.reaction) state.reaction = createReaction(state.width, state.height);
  const reaction = state.reaction;
  for (let iteration = 0; iteration < 4; iteration += 1) {
    stepReaction(reaction, pointer, state.width, state.height);
  }

  const image = reaction.context.createImageData(reaction.width, reaction.height);
  for (let index = 0; index < reaction.a.length; index += 1) {
    const intensity = Math.pow(clamp(1 - Math.abs(reaction.b[index] - 0.34) * 6.5), 1.7);
    const accent = clamp((reaction.b[index] - 0.38) * 7);
    image.data[index * 4] = Math.floor(5 + 239 * intensity);
    image.data[index * 4 + 1] = Math.floor(5 + 237 * intensity * (1 - accent) + 69 * accent);
    image.data[index * 4 + 2] = Math.floor(5 + 232 * intensity * (1 - accent));
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
  const columns = Math.max(12, Math.floor(state.width / 46));
  const rows = Math.max(9, Math.floor(state.height / 46));
  const tileWidth = state.width / columns;
  const tileHeight = state.height / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const centerX = (column + 0.5) * tileWidth;
      const centerY = (row + 0.5) * tileHeight;
      const distance = pointer.active
        ? Math.hypot(centerX - pointer.x, centerY - pointer.y)
        : Math.hypot(centerX - state.width * 0.55, centerY - state.height * 0.45);
      const influence = clamp(1 - distance / Math.max(state.width, state.height) * 2.2);
      const wave = Math.sin(time * 0.0018 + column * 0.62 + row * 0.43);
      const scale = 0.24 + influence * 0.72 + wave * 0.08;
      const rotation = wave * 0.35 + influence * ((column + row) % 2 ? -0.7 : 0.7);

      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);
      context.scale(scale, scale);
      context.strokeStyle = influence > 0.68 ? ACCENT : INK;
      context.globalAlpha = 0.16 + influence * 0.72;
      context.lineWidth = 1 / Math.max(scale, 0.2);
      context.strokeRect(-tileWidth * 0.36, -tileHeight * 0.36, tileWidth * 0.72, tileHeight * 0.72);
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
  clear(context, state.width, state.height, 0.38);
  const speedScale = Math.min(delta / 16.67, 2);
  const threshold = Math.min(108, state.width * 0.105);

  if (state.lastNetworkSpawn === 0) state.lastNetworkSpawn = time;
  if (time - state.lastNetworkSpawn > 340 && state.points.length < 165) {
    const additions = Math.min(2, 165 - state.points.length);
    for (let index = 0; index < additions; index += 1) {
      const point = makeParticle(state.width, state.height, 1.7, 2.8);
      if (pointer.active) {
        point.x = pointer.x + (Math.random() - 0.5) * 40;
        point.y = pointer.y + (Math.random() - 0.5) * 40;
      }
      state.points.push(point);
    }
    state.lastNetworkSpawn = time;
  }

  state.points.forEach((point) => {
    pointerForce(point, pointer, 0.035);
    const speed = Math.max(Math.hypot(point.vx, point.vy), 0.001);
    const targetSpeed = clamp(speed, 1.45, 3.15);
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
      context.strokeStyle = distance < threshold * 0.4 ? ACCENT : INK;
      context.globalAlpha = (1 - distance / threshold) * 0.38;
      context.lineWidth = 0.7;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
  }

  state.points.forEach((point, index) => {
    context.fillStyle = index % 13 === 0 ? ACCENT : INK;
    context.globalAlpha = index % 13 === 0 ? 0.9 : 0.66;
    context.beginPath();
    context.arc(point.x, point.y, index % 13 === 0 ? 2.4 : 1.3, 0, Math.PI * 2);
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
  const cycle = (time % 10000) / 10000;
  const pointerAngle = pointer.active ? (pointer.x / state.width - 0.5) * 0.45 : 0;

  const branch = (
    x: number,
    y: number,
    length: number,
    angle: number,
    depth: number,
    phase: number,
  ) => {
    if (depth <= 0) return;
    const localGrowth = clamp(cycle * 7 - phase);
    if (localGrowth <= 0) return;
    const endX = x + Math.cos(angle) * length * localGrowth;
    const endY = y + Math.sin(angle) * length * localGrowth;
    context.strokeStyle = depth <= 2 ? ACCENT : INK;
    context.globalAlpha = 0.2 + depth * 0.09;
    context.lineWidth = Math.max(0.55, depth * 0.42);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(endX, endY);
    context.stroke();

    if (localGrowth < 0.98) return;
    const spread = 0.34 + Math.sin(time * 0.00035 + depth) * 0.08;
    branch(endX, endY, length * 0.72, angle - spread + pointerAngle * 0.25, depth - 1, phase + 0.82);
    branch(endX, endY, length * 0.69, angle + spread + pointerAngle * 0.25, depth - 1, phase + 0.92);
    if (depth % 2 === 0) {
      branch(endX, endY, length * 0.58, angle + Math.sin(time * 0.0004) * 0.16, depth - 2, phase + 1.08);
    }
  };

  const roots = state.width < 700 ? 2 : 3;
  for (let root = 0; root < roots; root += 1) {
    const x = state.width * ((root + 1) / (roots + 1));
    branch(x, state.height * 1.02, state.height * 0.17, -Math.PI / 2 + pointerAngle, 8, root * 0.32);
  }
  context.globalAlpha = 1;
}

function drawFlowers(
  context: CanvasRenderingContext2D,
  state: SimulationState,
  pointer: PointerState,
  time: number,
  delta: number,
) {
  clear(context, state.width, state.height, 0.24);
  const speedScale = Math.min(delta / 16.67, 2);

  state.flowers.forEach((flower, index) => {
    flower.age += delta;
    if (flower.age > flower.lifespan) {
      const replacement = makeFlower(state.width, state.height, false);
      if (pointer.active && Math.random() < 0.58) {
        replacement.x = clamp(pointer.x + (Math.random() - 0.5) * 170, 30, state.width - 30);
        replacement.y = clamp(pointer.y + (Math.random() - 0.5) * 170, 30, state.height - 30);
      }
      Object.assign(flower, replacement);
    }
    if (flower.age < 0) return;

    flower.vx += Math.cos(time * 0.00032 + flower.phase) * 0.0015;
    flower.vy += Math.sin(time * 0.00039 + flower.phase) * 0.0015;
    flower.x += flower.vx * speedScale;
    flower.y += flower.vy * speedScale;
    if (flower.x < 20 || flower.x > state.width - 20) flower.vx *= -1;
    if (flower.y < 20 || flower.y > state.height - 20) flower.vy *= -1;

    const progress = clamp(flower.age / flower.lifespan);
    const entrance = clamp(progress / 0.2);
    const overshoot = 1 + 2.7 * Math.pow(entrance - 1, 3) + 1.7 * Math.pow(entrance - 1, 2);
    const exit = progress < 0.72 ? 1 : 1 - Math.pow((progress - 0.72) / 0.28, 2);
    const growth = Math.max(0, overshoot * exit);
    const opacity = progress < 0.68 ? 1 : clamp(1 - (progress - 0.68) / 0.32);
    const radius = flower.maxSize * growth;
    const rotation = flower.phase + time * 0.00008 * (index % 2 ? 1 : -1);

    context.save();
    context.translate(flower.x, flower.y);
    context.rotate(rotation);
    context.strokeStyle = index % 7 === 0 ? ACCENT : INK;
    context.globalAlpha = opacity * (index % 7 === 0 ? 0.82 : 0.48);
    context.lineWidth = 0.75;

    if (progress < 0.18) {
      context.globalAlpha = opacity * (1 - progress / 0.18) * 0.65;
      context.beginPath();
      context.arc(0, 0, radius * 1.8, 0, Math.PI * 2);
      context.stroke();
    }

    context.globalAlpha = opacity * (index % 7 === 0 ? 0.82 : 0.42);
    for (let branch = 0; branch < flower.branches; branch += 1) {
      const angle = (branch / flower.branches) * Math.PI * 2;
      const bend = Math.sin(flower.phase + branch * 1.7) * 0.24;
      const innerX = Math.cos(angle) * radius * 0.16;
      const innerY = Math.sin(angle) * radius * 0.16;
      const jointX = Math.cos(angle + bend) * radius * 0.58;
      const jointY = Math.sin(angle + bend) * radius * 0.58;
      const tipX = Math.cos(angle - bend * 0.35) * radius;
      const tipY = Math.sin(angle - bend * 0.35) * radius;
      context.beginPath();
      context.moveTo(innerX, innerY);
      context.quadraticCurveTo(jointX, jointY, tipX, tipY);
      context.stroke();

      if (progress > 0.24) {
        const forkSize = radius * 0.27 * clamp((progress - 0.24) / 0.18);
        for (const side of [-1, 1]) {
          const forkAngle = angle + side * 0.5;
          context.beginPath();
          context.moveTo(jointX, jointY);
          context.lineTo(
            jointX + Math.cos(forkAngle) * forkSize,
            jointY + Math.sin(forkAngle) * forkSize,
          );
          context.stroke();
        }
      }

      if (progress > 0.38) {
        const bud = radius * 0.12 * clamp((progress - 0.38) / 0.16);
        context.beginPath();
        context.arc(tipX, tipY, bud, 0, Math.PI * 2);
        context.stroke();
      }
    }

    const petals = 5 + (index % 3);
    context.beginPath();
    for (let petal = 0; petal <= petals * 10; petal += 1) {
      const angle = (petal / (petals * 10)) * Math.PI * 2;
      const bloom = (0.5 + Math.cos(petals * angle) * 0.28) * radius * 0.46;
      const x = Math.cos(angle) * bloom;
      const y = Math.sin(angle) * bloom;
      if (petal === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.stroke();
    context.restore();
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
      drawReaction(context, state, pointer);
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
    case "flowers":
      drawFlowers(context, state, pointer, time, delta);
      break;
  }
}

export function GenerativeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<ModeId>("network");
  const currentMode = modes.find((item) => item.id === mode) ?? modes[0];

  const chooseMode = (nextMode: ModeId) => {
    setMode(nextMode);
    const index = modes.findIndex((item) => item.id === nextMode);
    window.sessionStorage.setItem("parametric-background-mode", String(index));
  };

  const shuffleMode = () => {
    const currentIndex = modes.findIndex((item) => item.id === mode);
    chooseMode(modes[(currentIndex + 1) % modes.length].id);
  };

  useEffect(() => {
    const stored = Number(window.sessionStorage.getItem("parametric-background-mode"));
    const nextIndex = Number.isFinite(stored)
      ? (stored + 1) % modes.length
      : Math.floor(Math.random() * modes.length);
    window.sessionStorage.setItem("parametric-background-mode", String(nextIndex));
    const frame = window.requestAnimationFrame(() => setMode(modes[nextIndex].id));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const pointer: PointerState = { x: 0, y: 0, active: false };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    const render = (time: number) => {
      const delta = Math.min(time - previousTime, 40);
      previousTime = time;
      drawMode(context, simulation, mode, pointer, time, delta);
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerout", clearPointer, { passive: true });
    render(performance.now());

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerout", clearPointer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [mode]);

  return (
    <div className="generative-background">
      <canvas ref={canvasRef} className="generative-canvas" aria-hidden="true" />
      <div className="generative-status" aria-live="polite">
        <span>{currentMode.code}</span>
        <strong>{currentMode.label}</strong>
      </div>
      <div className="generative-controls">
        <label htmlFor="background-mode">Background simulation</label>
        <div>
          <select
            id="background-mode"
            value={mode}
            onChange={(event) => chooseMode(event.target.value as ModeId)}
          >
            {modes.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={shuffleMode} aria-label="Load the next background simulation">
            Next ↗
          </button>
        </div>
      </div>
    </div>
  );
}
