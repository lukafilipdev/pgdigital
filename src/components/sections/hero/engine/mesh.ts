import { clamp } from "@/lib/math";
import { BRAND } from "./pen";
import type { Projected, Projector } from "./projection";

type MeshUpdate = {
  t: number;
  /** Lens centre relative to the canvas centre. */
  lensX: number;
  lensY: number;
  lensRadius: number;
  ambient: boolean;
  scale: number;
  offsetY: number;
  project: Projector;
};

type MeshDraw = {
  alpha: number;
  lensRadius: number;
  width: number;
  height: number;
};

/** Opacity of each vertex bucket (bucket n holds alphas in [n/8, (n+1)/8)). */
const VERTEX_BUCKETS = Array.from({ length: 8 }, (_, n) => (n + 0.6) / 8);

/**
 * A spring-driven grid of points that is pushed away by the lens,
 * gently undulates, and is drawn as a wireframe with vertex points.
 */
export class Mesh {
  private cols = 0;
  private rows = 0;
  private count = 0;
  private baseX = new Float32Array(0);
  private baseY = new Float32Array(0);
  private offset = { x: new Float32Array(0), y: new Float32Array(0), z: new Float32Array(0) };
  private velocity = { x: new Float32Array(0), y: new Float32Array(0), z: new Float32Array(0) };
  private screenX = new Float32Array(0);
  private screenY = new Float32Array(0);
  private screenScale = new Float32Array(0);
  private readonly projected: Projected = [0, 0, 0];

  resize(width: number, height: number, mobile: boolean) {
    const spacing = mobile ? Math.max(15, width / 22) : Math.max(15, width / 66);
    this.cols = Math.ceil((width * 1.5) / spacing) | 1;
    this.rows = Math.ceil((height * 1.6) / spacing) | 1;
    const n = (this.count = this.cols * this.rows);

    const buffer = () => new Float32Array(n);
    this.baseX = buffer();
    this.baseY = buffer();
    this.offset = { x: buffer(), y: buffer(), z: buffer() };
    this.velocity = { x: buffer(), y: buffer(), z: buffer() };
    this.screenX = buffer();
    this.screenY = buffer();
    this.screenScale = buffer();

    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const k = j * this.cols + i;
        this.baseX[k] = (i - (this.cols - 1) / 2) * spacing;
        this.baseY[k] = (j - (this.rows - 1) / 2) * spacing;
      }
    }
  }

  update({ t, lensX, lensY, lensRadius, ambient, scale, offsetY, project }: MeshUpdate) {
    const { baseX, baseY, offset: o, velocity: v, projected } = this;
    const reach = lensRadius * 1.3;

    for (let k = 0; k < this.count; k++) {
      const x0 = baseX[k];
      const y0 = baseY[k];
      let tx = 0;
      let ty = 0;
      let tz = 0;

      // Push vertices out of the lens.
      if (reach > 1) {
        const dx = x0 - lensX;
        const dy = y0 - lensY;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.001;
        if (distance < reach) {
          const f = 1 - distance / reach;
          const falloff = f * f * (3 - 2 * f);
          const push = falloff * lensRadius * 0.95;
          tx = (dx / distance) * push;
          ty = (dy / distance) * push;
          tz = -falloff * 70;
        }
      }

      // Slow ambient wave.
      if (ambient) {
        tz += Math.sin(x0 * 0.006 + t * 0.7) * Math.cos(y0 * 0.008 - t * 0.5) * 22;
        ty += Math.sin(x0 * 0.012 + t * 0.9) * 2.2;
      }

      v.x[k] = (v.x[k] + (tx - o.x[k]) * 0.075) * 0.82;
      o.x[k] += v.x[k];
      v.y[k] = (v.y[k] + (ty - o.y[k]) * 0.075) * 0.82;
      o.y[k] += v.y[k];
      v.z[k] = (v.z[k] + (tz - o.z[k]) * 0.06) * 0.85;
      o.z[k] += v.z[k];

      project((x0 + o.x[k]) * scale, (y0 + o.y[k]) * scale, o.z[k], projected);
      this.screenX[k] = projected[0];
      this.screenY[k] = projected[1] + offsetY;
      this.screenScale[k] = projected[2];
    }
  }

  draw(ctx: CanvasRenderingContext2D, { alpha, lensRadius, width, height }: MeshDraw) {
    if (alpha <= 0.01) return;
    const { cols, rows, screenX: px, screenY: py } = this;

    // Wireframe
    ctx.strokeStyle = `rgba(255,255,255,${0.055 * alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let j = 0; j < rows; j++) {
      let k = j * cols;
      ctx.moveTo(px[k], py[k]);
      for (let i = 1; i < cols; i++) {
        k++;
        ctx.lineTo(px[k], py[k]);
      }
    }
    for (let i = 0; i < cols; i++) {
      let k = i;
      ctx.moveTo(px[k], py[k]);
      for (let j = 1; j < rows; j++) {
        k += cols;
        ctx.lineTo(px[k], py[k]);
      }
    }
    ctx.stroke();

    // Vertices — brighter (and orange) the further the lens displaced them.
    // Plain vertices are batched into a few opacity buckets: one fill each.
    const buckets = VERTEX_BUCKETS.map(() => new Path2D());
    const inverseRadius = 1 / Math.max(40, lensRadius || 40);
    ctx.fillStyle = BRAND;
    for (let k = 0; k < this.count; k++) {
      const x = px[k];
      const y = py[k];
      if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;

      const ox = this.offset.x[k];
      const oy = this.offset.y[k];
      const displacement = Math.sqrt(ox * ox + oy * oy) * inverseRadius;
      const depth = clamp((this.screenScale[k] - 0.55) * 2.2, 0.15, 1);
      const a = (0.16 + Math.min(0.7, displacement * 1.1)) * alpha * depth;
      if (a < 0.02) continue;

      if (displacement > 0.62) {
        ctx.globalAlpha = Math.min(1, a * 1.2);
        const size = 2 * this.screenScale[k];
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      } else {
        const size = 1.4 * this.screenScale[k];
        const bucket = Math.min(VERTEX_BUCKETS.length - 1, Math.floor(a * VERTEX_BUCKETS.length));
        buckets[bucket].rect(x - size / 2, y - size / 2, size, size);
      }
    }
    ctx.fillStyle = "#fff";
    buckets.forEach((path, n) => {
      ctx.globalAlpha = VERTEX_BUCKETS[n];
      ctx.fill(path);
    });
    ctx.globalAlpha = 1;
  }
}
