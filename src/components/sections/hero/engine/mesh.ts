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
  t: number;
  alpha: number;
  lensRadius: number;
  ambient: boolean;
  width: number;
  height: number;
};

/**
 * A spring-driven grid of points that is pushed away by the lens,
 * gently undulates, and is drawn as a wireframe with glowing vertices.
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
  /** Per-vertex pseudo-random phase for the twinkle effect. */
  private seed = new Float32Array(0);
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
    this.seed = buffer();

    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const k = j * this.cols + i;
        this.baseX[k] = (i - (this.cols - 1) / 2) * spacing;
        this.baseY[k] = (j - (this.rows - 1) / 2) * spacing;
        this.seed[k] = (Math.sin(k * 12.9898) * 43758.5453) % 1;
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

  draw(ctx: CanvasRenderingContext2D, { t, alpha, lensRadius, ambient, width, height }: MeshDraw) {
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
    const inverseRadius = 1 / Math.max(40, lensRadius || 40);
    for (let k = 0; k < this.count; k++) {
      const x = px[k];
      const y = py[k];
      if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;

      const ox = this.offset.x[k];
      const oy = this.offset.y[k];
      const displacement = Math.sqrt(ox * ox + oy * oy) * inverseRadius;
      const twinkle = ambient ? Math.pow(Math.max(0, Math.sin(t * 1.3 + this.seed[k] * 40)), 16) * 0.5 : 0;
      const depth = clamp((this.screenScale[k] - 0.55) * 2.2, 0.15, 1);
      const a = (0.16 + Math.min(0.7, displacement * 1.1) + twinkle) * alpha * depth;
      if (a < 0.02) continue;

      const orange = displacement > 0.62;
      ctx.fillStyle = orange ? BRAND : "#fff";
      ctx.globalAlpha = Math.min(1, orange ? a * 1.2 : a);
      const size = (orange ? 2 : 1.4) * this.screenScale[k];
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }
}
