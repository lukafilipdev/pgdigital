import { HERO_LAYERS } from "@/content/site";
import { approach, clamp, smoothstep } from "@/lib/math";
import { mapTexture, type Point } from "./mapTexture";
import { BRAND, type CanvasFonts } from "./pen";
import type { Projected, Projector } from "./projection";

/**
 * Source listing drawn on the bottom ("code") plane.
 * Each line: [kind, ...segments]; kind 1 = alternate keyword/plain, 2 = comment.
 */
const SOURCE: [kind: 0 | 1 | 2, ...segments: string[]][] = [
  [1, "import", " { Hero } ", "from", " './vasa-znamka';"],
  [1, "export default function", " Stran() {"],
  [0, "  const [lens, setLens] = useSpring(0.08);"],
  [0, "  useScroll(ref, { pin: ", "true", " });"],
  [1, "  return", " ("],
  [0, '    <Hero naslov="Vaša znamka" />'],
  [0, "    <Mreza stolpci={12} razmik={24} />"],
  [0, '    <Gumb barva="--pg-orange">Začnimo</Gumb>'],
  [0, "  );"],
  [0, "}"],
  [2, "// build 1.2 s · 0 napak · 98/100"],
];

const ASPECT = 0.625;

type StackDraw = {
  t: number;
  /** Phase in which the planes rise and separate. */
  assemble: number;
  /** Phase in which the stack flattens and fills the screen. */
  collapse: number;
  /** Phase in which the top plane fades out for the closing statement. */
  outro: number;
  activeLayer: number;
  project: Projector;
  width: number;
  height: number;
  dpr: number;
  mobile: boolean;
};

export type StackTextures = {
  /** Planes 1–3 (plane 0 is drawn procedurally). */
  planes: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement];
  scratch: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D };
};

type PlaneLabel = { text: string; x: number; y: number; alpha: number; active: boolean };

/** Four website layers (code → structure → form → experience) floating in 3D. */
export class LayerStack {
  private highlight = [0, 0, 0, 0];
  private readonly projected: Projected = [0, 0, 0];

  constructor(private readonly fonts: CanvasFonts) {}

  draw(ctx: CanvasRenderingContext2D, textures: StackTextures, options: StackDraw) {
    const { assemble: b, collapse: c, outro: d, activeLayer, project, width: W, height: H, mobile } = options;
    const labelWidth = mobile ? 0 : 190;
    const top = 64 + (mobile ? 20 : 30);
    const bottom = H - (mobile ? 190 : 170);
    const q = this.projected;

    /** Screen bounds of the whole stack for a given plane width and spread. */
    const bounds = (planeW: number, spread: number) => {
      const planeH = planeW * ASPECT;
      const lift = planeH * 0.3 * spread;
      const gap = planeH * 0.3 * spread;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const z of [-lift, -(lift + 3 * gap + planeH * 0.1)]) {
        for (const u of [0, 1]) {
          for (const v of [0, 1]) {
            project((u - 0.5) * planeW, (v - 0.5) * planeH, z, q);
            x0 = Math.min(x0, q[0]);
            x1 = Math.max(x1, q[0]);
            y0 = Math.min(y0, q[1]);
            y1 = Math.max(y1, q[1]);
          }
        }
      }
      return { x0, x1, y0, y1 };
    };

    // Size the planes so the fully spread stack fits between header and caption.
    let PW = mobile ? W * 0.9 : Math.min(W * 0.56, 1100, H * 1.3);
    const full = bounds(PW, 1);
    PW *= Math.min(1, (bottom - top) / (full.y1 - full.y0), (W - labelWidth * 2 - 60) / (full.x1 - full.x0)) * 0.98;
    const PH = PW * ASPECT;
    const current = bounds(PW, b);

    const cover = Math.max(W / PW, H / PH) * 1.02;
    const zoom = 1 + smoothstep(0, 1, c) * (cover - 1);
    const lift = PH * 0.3 * b * (1 - c);
    const gap = lift;
    const centring = 1 - smoothstep(0, 1, c);
    const offsetX = (W / 2 + (mobile ? 0 : 30) - (current.x0 + current.x1) / 2) * centring;
    const offsetY = ((top + bottom) / 2 - (current.y0 + current.y1) / 2) * centring;

    const labels: PlaneLabel[] = [];
    for (let i = 0; i < 4; i++) {
      this.highlight[i] = approach(this.highlight[i], i === activeLayer && c < 0.01 ? 1 : 0, 0.12);
      const on = this.highlight[i];
      const z = -(lift + i * gap + on * PH * 0.08);

      const pointAt = (u: number, v: number): Point => {
        project((u - 0.5) * PW * zoom, (v - 0.5) * PH * zoom, z, q);
        return [q[0] + offsetX, q[1] + offsetY];
      };
      const quad = (x: number, y: number, w: number, h: number) => {
        const corners = [pointAt(x, y), pointAt(x + w, y), pointAt(x + w, y + h), pointAt(x, y + h)];
        ctx.beginPath();
        corners.forEach(([px, py], n) => (n ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.closePath();
      };

      const rise = smoothstep(i * 0.06, 0.5 + i * 0.12, b);
      const alpha = rise * (i === 3 ? 1 - clamp(d * 1.7) : 1 - c);
      if (alpha < 0.01) continue;
      ctx.globalAlpha = alpha;

      quad(0, 0, 1, 1);
      ctx.fillStyle = i < 2 ? "rgba(0,0,0,.82)" : "#0b0b0b";
      ctx.fill();
      ctx.lineWidth = 1;

      if (i === 0) this.drawCodePlane(ctx, pointAt, quad, PW, PH, options);
      else this.drawTexturedPlane(ctx, textures, textures.planes[i - 1], pointAt, options);

      quad(0, 0, 1, 1);
      ctx.lineWidth = 1 + on * 0.5;
      ctx.strokeStyle = on > 0.5 ? BRAND : `rgba(255,255,255,${0.22 + on * 0.3})`;
      ctx.stroke();

      if (c < 0.5) {
        const [x, y] = pointAt(0, mobile ? 0 : 0.5);
        labels.push({
          text: `0${i + 1}  ${HERO_LAYERS[i].label}`,
          x,
          y,
          alpha: alpha * (1 - c * 2),
          active: on > 0.5,
        });
      }
      ctx.globalAlpha = 1;
    }

    // Labels go on top of every plane, otherwise the plane above hides them.
    this.drawLabels(ctx, labels, mobile);
  }

  /**
   * Desktop: to the left of each plane with a leader line.
   * Mobile: a small tag on the plane's top-left corner, with a dark backing.
   */
  private drawLabels(ctx: CanvasRenderingContext2D, labels: PlaneLabel[], mobile: boolean) {
    ctx.font = `${mobile ? 11 : 10}px ${this.fonts.mono}`;
    ctx.lineWidth = 1;
    for (const { text, x, y, alpha, active } of labels) {
      const color = active ? BRAND : mobile ? "rgba(255,255,255,.8)" : "rgba(255,255,255,.55)";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      if (mobile) {
        const tagW = ctx.measureText(text).width + 14;
        const tagH = 20;
        const tagY = y - tagH - 4;
        ctx.fillStyle = "rgba(0,0,0,.82)";
        ctx.fillRect(x, tagY, tagW, tagH);
        if (active) ctx.strokeRect(x + 0.5, tagY + 0.5, tagW - 1, tagH - 1);
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.fillText(text, x + 7, tagY + 14);
      } else {
        ctx.textAlign = "right";
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x - 40, y);
        ctx.stroke();
        ctx.fillText(text, x - 48, y + 3.5);
      }
    }
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;
  }

  /** Plane 0: column grid plus source code, drawn in the plane's own space. */
  private drawCodePlane(
    ctx: CanvasRenderingContext2D,
    pointAt: (u: number, v: number) => Point,
    quad: (x: number, y: number, w: number, h: number) => void,
    PW: number,
    PH: number,
    { t, dpr }: StackDraw,
  ) {
    ctx.strokeStyle = "rgba(245,117,30,.14)";
    for (let k = 0; k < 12; k++) {
      quad(0.08 + k * 0.07 + 0.006, 0, 0.058, 1);
      ctx.stroke();
    }

    const fontSize = PH * 0.038;
    const lineStep = 0.072;
    const caretVisible = Math.floor((t * 1000) / 530) % 2 === 0;
    ctx.font = `500 ${fontSize}px ${this.fonts.mono}`;
    ctx.textBaseline = "middle";

    SOURCE.forEach(([kind, ...segments], j) => {
      // Affine transform mapping text space onto the (perspective) plane.
      const v = 0.1 + j * lineStep;
      const origin = pointAt(0.06, v);
      const alongX = pointAt(0.16, v);
      const alongY = pointAt(0.06, v + 0.1);
      ctx.setTransform(
        (dpr * (alongX[0] - origin[0])) / (0.1 * PW),
        (dpr * (alongX[1] - origin[1])) / (0.1 * PW),
        (dpr * (alongY[0] - origin[0])) / (0.1 * PH),
        (dpr * (alongY[1] - origin[1])) / (0.1 * PH),
        dpr * origin[0],
        dpr * origin[1],
      );

      ctx.fillStyle = "rgba(255,255,255,.25)";
      ctx.fillText(String(j + 1).padStart(2, "0"), 0, 0);

      let x = fontSize * 2.6;
      segments.forEach((segment, n) => {
        const highlighted = (kind === 1 && n % 2 === 0) || segment === "true";
        ctx.fillStyle = kind === 2 ? "rgba(245,117,30,.75)" : highlighted ? BRAND : "rgba(255,255,255,.82)";
        ctx.fillText(segment, x, 0);
        x += ctx.measureText(segment).width;
      });

      if (j === 2 && caretVisible) {
        ctx.fillStyle = BRAND;
        ctx.fillRect(x + 2, -fontSize * 0.55, fontSize * 0.5, fontSize * 1.1);
      }
    });

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = "alphabetic";
  }

  /** Planes 1–3: perspective-map a pre-rendered texture via a scratch canvas. */
  private drawTexturedPlane(
    ctx: CanvasRenderingContext2D,
    { scratch }: StackTextures,
    texture: HTMLCanvasElement,
    pointAt: (u: number, v: number) => Point,
    { dpr, mobile }: StackDraw,
  ) {
    const corners = [pointAt(0, 0), pointAt(1, 0), pointAt(0, 1), pointAt(1, 1)];
    const xs = corners.map((p) => p[0]);
    const ys = corners.map((p) => p[1]);
    const x0 = Math.max(0, Math.floor(Math.min(...xs) * dpr) - 4);
    const y0 = Math.max(0, Math.floor(Math.min(...ys) * dpr) - 4);
    const x1 = Math.min(scratch.canvas.width, Math.ceil(Math.max(...xs) * dpr) + 4);
    const y1 = Math.min(scratch.canvas.height, Math.ceil(Math.max(...ys) * dpr) + 4);
    if (x1 <= x0 || y1 <= y0) return;

    const s = scratch.ctx;
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(x0, y0, x1 - x0, y1 - y0);
    s.imageSmoothingQuality = "high";
    mapTexture(s, texture, pointAt, dpr, mobile ? 6 : 10);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(scratch.canvas, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
  }
}
