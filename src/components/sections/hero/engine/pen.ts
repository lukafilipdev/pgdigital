export const BRAND = "#F5751E";
export const MUTED = "#8c8c8c";
export const TAU = Math.PI * 2;

export type Rect = [x: number, y: number, width: number, height: number];

export type CanvasFonts = { sans: string; mono: string };

export type TextStyle = {
  size: number;
  weight?: number;
  color?: string;
  /** Letter spacing in em. */
  tracking?: number;
  mono?: boolean;
  align?: CanvasTextAlign;
};

const supportsLetterSpacing =
  typeof CanvasRenderingContext2D !== "undefined" &&
  "letterSpacing" in CanvasRenderingContext2D.prototype;

/** Reads the next/font family stacks so canvas text matches the page. */
export function resolveCanvasFonts(): CanvasFonts {
  const style = getComputedStyle(document.documentElement);
  const sans = style.getPropertyValue("--font-geist-sans").trim();
  const mono = style.getPropertyValue("--font-geist-mono").trim();
  return {
    sans: sans ? `${sans}, sans-serif` : "sans-serif",
    mono: mono ? `${mono}, monospace` : "monospace",
  };
}

/** Thin convenience layer over a 2D context for styled text and shapes. */
export class Pen {
  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly fonts: CanvasFonts,
  ) {}

  private applyFont({ size, weight = 400, tracking = 0, mono }: TextStyle) {
    this.ctx.font = `${weight} ${size}px ${mono ? this.fonts.mono : this.fonts.sans}`;
    if (supportsLetterSpacing) this.ctx.letterSpacing = `${tracking * size}px`;
  }

  private resetFont() {
    if (supportsLetterSpacing) this.ctx.letterSpacing = "0px";
  }

  text(value: string, x: number, y: number, style: TextStyle) {
    const { ctx } = this;
    this.applyFont(style);
    ctx.fillStyle = style.color ?? "#fff";
    ctx.textAlign = style.align ?? "left";
    ctx.fillText(value, x, y);
    ctx.textAlign = "left";
    this.resetFont();
  }

  measure(value: string, style: TextStyle) {
    this.applyFont(style);
    const width = this.ctx.measureText(value).width;
    this.resetFont();
    return width;
  }

  /** 1px horizontal rule. */
  hairline(x0: number, y: number, x1: number, alpha = 0.08) {
    this.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    this.ctx.fillRect(x0, Math.round(y), x1 - x0, 1);
  }

  /** Begins a new rounded-rectangle path. */
  roundRect(x: number, y: number, width: number, height: number, radius: number) {
    const { ctx } = this;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, width, height, Math.min(radius, height / 2, width / 2));
    else ctx.rect(x, y, width, height);
  }
}

/** Creates an offscreen canvas pre-scaled for crisp drawing at `scale`. */
export function createLayer(width: number, height: number, scale: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  return { canvas, ctx };
}
