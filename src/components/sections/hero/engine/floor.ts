import { clamp, smoothstep } from "@/lib/math";
import { BRAND, TAU } from "./pen";
import type { Point } from "./mapTexture";

type Block = {
  /** Grid column (negative = left of the vanishing point). */
  x: number;
  /** Grid row the block sits on. */
  row: number;
  width: number;
  depth: number;
  height: number;
  bornAt: number;
};

type Mote = { x: number; y: number; size: number };

type FloorView = {
  horizon: number;
  vanishX: number;
  depthK: number;
  columnW: number;
  /** How far the floor has scrolled towards the viewer, in rows. */
  travel: number;
  /** Ground-plane (column, depth) → screen. */
  project: (x: number, z: number) => Point;
};

type FloorDraw = {
  t: number;
  alpha: number;
  width: number;
  height: number;
  /** Smoothed horizontal pointer position, -1…1. */
  mouseX: number;
  pointer: { x: number; y: number; active: boolean };
  reducedMotion: boolean;
};

const STATIC_BLOCKS: Block[] = [
  { x: -9, row: 4, width: 2, depth: 1, height: 0.8, bornAt: -10 },
  { x: 6, row: 5, width: 1, depth: 2, height: 1.1, bornAt: -10 },
  { x: -5, row: 8, width: 1, depth: 1, height: 0.6, bornAt: -10 },
  { x: 10, row: 9, width: 2, depth: 1, height: 0.9, bornAt: -10 },
];

/**
 * The closing scene: an endless perspective floor scrolling towards the
 * viewer, with tiles that glow under the pointer and blocks that "get built".
 */
export class Floor {
  private heat = new Map<string, number>();
  private blocks: Block[] = [];
  private nextBlockAt = 0;
  private motes: Mote[] = Array.from({ length: 46 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 0.3 + Math.random() * 0.7,
  }));

  draw(ctx: CanvasRenderingContext2D, options: FloorDraw) {
    const { t, alpha, width: W, height: H, mouseX, reducedMotion } = options;
    const horizon = H * 0.76;
    const vanishX = W / 2 + mouseX * W * 0.03;
    const depthK = H - horizon;
    const columnW = W * 0.075;
    const travel = reducedMotion ? 0 : t * 0.22;

    const view: FloorView = {
      horizon,
      vanishX,
      depthK,
      columnW,
      travel,
      project: (x, z) => [vanishX + (x * columnW) / z, horizon + depthK / z],
    };

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.rect(0, horizon, W, depthK);
    ctx.clip();
    this.drawHeat(ctx, view, options);
    this.drawGrid(ctx, view, W, H);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    this.drawBlocks(ctx, view, options);
    ctx.globalAlpha = alpha;
    this.drawMotes(ctx, view, options);
    this.drawHorizon(ctx, view, options);
    ctx.restore();
  }

  private drawHeat(ctx: CanvasRenderingContext2D, view: FloorView, { pointer, reducedMotion }: FloorDraw) {
    const { heat } = this;
    const { horizon, vanishX, depthK, columnW, travel, project } = view;

    if (pointer.active && pointer.y > horizon + 3) {
      const z = depthK / (pointer.y - horizon);
      const x = Math.floor(((pointer.x - vanishX) * z) / columnW);
      const row = Math.floor(z + travel);
      heat.set(`${x},${row}`, 1);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const key = `${x + dx},${row + dy}`;
        heat.set(key, Math.max(heat.get(key) ?? 0, 0.45));
      }
    }

    // Occasional random sparkle further back.
    if (!reducedMotion && Math.random() < 0.18) {
      const key = `${Math.floor(Math.random() * 28) - 14},${Math.floor(travel) + 2 + Math.floor(Math.random() * 9)}`;
      heat.set(key, Math.max(heat.get(key) ?? 0, 0.5 + Math.random() * 0.4));
    }

    for (const [key, value] of heat) {
      const [x, row] = key.split(",").map(Number);
      const z0 = row - travel;
      if (z0 < 0.35 || value < 0.02) {
        heat.delete(key);
        continue;
      }
      const tile = [project(x, z0), project(x + 1, z0), project(x + 1, z0 + 1), project(x, z0 + 1)];
      polygon(ctx, tile);
      ctx.fillStyle = `rgba(245,117,30,${value * 0.34 * fadeWithDepth(z0)})`;
      ctx.fill();
      heat.set(key, value * (reducedMotion ? 0.9 : 0.955));
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D, view: FloorView, W: number, H: number) {
    const { horizon, vanishX, depthK, columnW, travel } = view;
    const phase = travel % 1;

    ctx.lineWidth = 1;
    for (let k = 0; k < 44; k++) {
      const z = k + 1 - phase;
      const y = horizon + depthK / z;
      if (y > H + 2 || z <= 0) continue;
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.16, 0.45 / z)})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.beginPath();
    for (let i = -30; i <= 30; i++) {
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(vanishX + i * columnW, H);
    }
    ctx.stroke();

    // Fade the far end into black.
    const fade = ctx.createLinearGradient(0, horizon, 0, horizon + depthK * 0.4);
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, horizon, W, depthK * 0.4);
  }

  private drawBlocks(ctx: CanvasRenderingContext2D, view: FloorView, options: FloorDraw) {
    const { t, alpha, height: H, reducedMotion } = options;
    const { depthK, travel, project } = view;
    const blocks = this.blocks;

    if (!reducedMotion && t > this.nextBlockAt && blocks.length < 9) {
      const width = Math.random() < 0.35 ? 2 : 1;
      const offset = 5 + Math.floor(Math.random() * 8);
      blocks.push({
        x: Math.random() < 0.5 ? -offset - width : offset,
        row: Math.floor(travel) + 5 + Math.floor(Math.random() * 5),
        width,
        depth: Math.random() < 0.4 ? 2 : 1,
        height: 0.7 + Math.random() * 1.3,
        bornAt: t,
      });
      this.nextBlockAt = t + 0.9 + Math.random() * 1.1;
    }
    if (reducedMotion && !blocks.length) blocks.push(...STATIC_BLOCKS.map((b) => ({ ...b })));

    // Far to near, dropping blocks that have passed the viewer.
    blocks.sort((p, q) => q.row - p.row);
    for (let n = blocks.length - 1; n >= 0; n--) {
      if (blocks[n].row - travel < 1.7) blocks.splice(n, 1);
    }

    for (const block of blocks) {
      const z0 = block.row - travel;
      const z1 = z0 + block.depth;
      const growth = reducedMotion ? 1 : smoothstep(0, 1.4, t - block.bornAt);
      const visibility = fadeWithDepth(z0) * clamp((z0 - 1.7) * 1.2);
      if (visibility < 0.01) continue;

      const heightAt = (z: number) =>
        Math.min((block.height * depthK * 1.15) / z, H * 0.07 + (depthK * 0.3) / z) * growth;
      const raise = ([x, y]: Point, z: number): Point => [x, y - heightAt(z)];

      const f0 = project(block.x, z0);
      const f1 = project(block.x + block.width, z0);
      const b0 = project(block.x, z1);
      const b1 = project(block.x + block.width, z1);
      const F0 = raise(f0, z0);
      const F1 = raise(f1, z0);
      const B0 = raise(b0, z1);
      const B1 = raise(b1, z1);
      const side = block.x > 0 ? [f0, b0, B0, F0] : [f1, b1, B1, F1];
      const topFace = [F0, F1, B1, B0];
      const front = [f0, f1, F1, F0];

      ctx.globalAlpha = alpha * visibility;
      polygon(ctx, side);
      ctx.fillStyle = "rgba(12,12,12,.96)";
      ctx.fill();
      polygon(ctx, topFace);
      ctx.fillStyle = "rgba(22,22,22,.96)";
      ctx.fill();
      polygon(ctx, front);
      ctx.fillStyle = "rgba(6,6,6,.97)";
      ctx.fill();

      const building = growth < 1;
      ctx.lineWidth = 1;
      ctx.strokeStyle = building ? "rgba(245,117,30,.9)" : "rgba(255,255,255,.34)";
      for (const face of [front, side, topFace]) {
        polygon(ctx, face);
        ctx.stroke();
      }

      // Floor lines on the front face.
      const floors = Math.max(1, Math.round(block.height * 5));
      const frontH = heightAt(z0);
      ctx.strokeStyle = building ? "rgba(245,117,30,.35)" : "rgba(255,255,255,.1)";
      ctx.beginPath();
      for (let k = 1; k < floors; k++) {
        ctx.moveTo(f0[0], f0[1] - (frontH * k) / floors);
        ctx.lineTo(f1[0], f1[1] - (frontH * k) / floors);
      }
      ctx.stroke();

      if (building) {
        // Orange "construction" edge on top while growing.
        ctx.fillStyle = BRAND;
        ctx.fillRect(F0[0] - 1, F0[1] - 1, F1[0] - F0[0] + 2, 2);
        ctx.beginPath();
        ctx.arc(F1[0], F1[1], 2.2, 0, TAU);
        ctx.fill();
      } else if (Math.sin(block.bornAt * 13.7 + t * 0.6) > 0.6) {
        // A lit window that switches on and off.
        const floorH = frontH / floors;
        const y = f0[1] - floorH * (Math.floor(floors / 2) + 0.3);
        ctx.fillStyle = "rgba(245,117,30,.55)";
        ctx.fillRect(f0[0] + (f1[0] - f0[0]) * 0.2, y - floorH * 0.45, (f1[0] - f0[0]) * 0.25, floorH * 0.4);
      }
    }
  }

  private drawMotes(ctx: CanvasRenderingContext2D, view: FloorView, { width: W, height: H, reducedMotion }: FloorDraw) {
    for (const mote of this.motes) {
      if (!reducedMotion) {
        mote.y -= 0.0009 * mote.size;
        if (mote.y < 0) {
          mote.y = 1;
          mote.x = Math.random();
        }
      }
      const a = Math.sin(mote.y * Math.PI) * 0.55 * mote.size;
      ctx.fillStyle = mote.size > 0.85 ? `rgba(245,117,30,${a})` : `rgba(255,255,255,${a * 0.6})`;
      ctx.fillRect(view.vanishX + (mote.x - 0.5) * W * 1.1, view.horizon - (1 - mote.y) * H * 0.5, 1.5, 1.5);
    }
  }

  private drawHorizon(ctx: CanvasRenderingContext2D, view: FloorView, { t, width: W, reducedMotion }: FloorDraw) {
    const { horizon, vanishX } = view;
    const pulse = reducedMotion ? 0.8 : 0.75 + 0.25 * Math.sin(t * 1.3);

    const line = ctx.createLinearGradient(0, 0, W, 0);
    line.addColorStop(0, "rgba(245,117,30,0)");
    line.addColorStop(0.5, `rgba(245,117,30,${0.95 * pulse})`);
    line.addColorStop(1, "rgba(245,117,30,0)");
    ctx.fillStyle = line;
    ctx.fillRect(0, horizon - 0.5, W, 1);

    if (!reducedMotion) {
      const sparkX = W * (0.5 + 0.46 * Math.sin(t * 0.35));
      const spark = ctx.createRadialGradient(sparkX, horizon, 0, sparkX, horizon, 60);
      spark.addColorStop(0, "rgba(255,178,117,.8)");
      spark.addColorStop(1, "rgba(245,117,30,0)");
      ctx.fillStyle = spark;
      ctx.fillRect(sparkX - 60, horizon - 3, 120, 6);
    }

    // Flattened radial glow along the horizon.
    ctx.translate(vanishX, horizon);
    ctx.scale(1, 0.14);
    const glowR = W * 0.42;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
    glow.addColorStop(0, `rgba(245,117,30,${0.24 * pulse})`);
    glow.addColorStop(1, "rgba(245,117,30,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);
  }
}

/** Fades tiles near the viewer and towards the horizon. */
const fadeWithDepth = (z: number) => clamp(1 - (z - 1) / 14) * clamp(z * 1.4 - 0.6);

function polygon(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}
