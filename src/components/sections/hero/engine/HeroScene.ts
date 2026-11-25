import { approach } from "@/lib/math";
import { drawLens, type LensState } from "./lens";
import { Mesh } from "./mesh";
import { createLayer, Pen, type CanvasFonts } from "./pen";
import { createProjector } from "./projection";
import { paintCode } from "./textures/code";

export const MOBILE_BREAKPOINT = 900;

/**
 * How present the background grid is while each layer is built: it steps
 * forward for structure (where the grid *is* the subject) and back for form.
 */
const GRID_LEVEL = { idle: 1, layers: [0.55, 0.95, 0.35, 0.5] };

/** Scroll-driven phases of the hero, each easing from 0 to 1. */
export type HeroPhases = {
  /** Headline separates, lens closes, the mesh tilts back into a floor. */
  open: number;
  /** Arrival of each layer (code, structure, form, experience). */
  layers: readonly number[];
  /** Progress through all four build stages (drives the slow camera roll). */
  build: number;
  /** Typing of the code layer. */
  code: number;
  /** Layers align, merge and the finished site turns to face the viewer. */
  merge: number;
  /** The finished site lays down into the floor of the closing scene. */
  outro: number;
  /** Buildings in the closing scene turn from physical into digital. */
  digitize: number;
};

export type HeroFrame = {
  /** Seconds since the scene started. */
  t: number;
  phases: HeroPhases;
  lens: LensState;
  lensRadius: number;
  /** Smoothed pointer position, -1…1 on both axes. */
  mouse: { x: number; y: number };
  pointer: { x: number; y: number; active: boolean };
  /** Layer being built, or -1. */
  activeLayer: number;
  reducedMotion: boolean;
};

/** Owns the hero canvas and renders one frame of the scroll-driven scene. */
export class HeroScene {
  width = 0;
  height = 0;
  mobile = false;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly mesh = new Mesh();
  private dpr = 1;
  private lensTextures: { code: HTMLCanvasElement } | null = null;
  private gridLevel = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly fonts: CanvasFonts,
  ) {
    this.ctx = canvas.getContext("2d")!;
  }

  resize(width: number, height: number) {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.mobile = width < MOBILE_BREAKPOINT;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 2);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.mesh.resize(width, height, this.mobile);
    this.buildTextures();
  }

  /** Repaints all textures, e.g. once web fonts have finished loading. */
  refreshTextures() {
    this.buildTextures();
  }

  private paint(width: number, height: number, scale: number, painter: (pen: Pen) => void) {
    const layer = createLayer(width, height, scale);
    painter(new Pen(layer.ctx, this.fonts));
    return layer.canvas;
  }

  private buildTextures() {
    const { width: W, height: H, dpr } = this;
    if (!W || !H) return;

    this.lensTextures = {
      code: this.paint(W, H, dpr, (pen) => paintCode(pen, W, H)),
    };
  }

  render(frame: HeroFrame) {
    const { ctx, width: W, height: H, dpr } = this;
    const { t, phases, lens, lensRadius, mouse, activeLayer, reducedMotion } = frame;
    const { open: a, layers, build, merge: m, outro } = phases;
    if (!W || !H) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const focalLength = Math.max(W, H) * 1.15;
    // The pointer steers the camera gently once the stack exists, and fully
    // in the "experience" stage, where response is the subject.
    const steer = reducedMotion ? 0 : layers[0] * (0.25 + 0.75 * layers[3]);
    const tilt = (a * 1.02 + mouse.y * 0.12 * steer) * (1 - m);
    const roll = (-0.5 * a + 0.45 * build + mouse.x * 0.22 * steer) * (1 - m);
    const project = createProjector({ cx, cy, tilt, roll, focalLength });

    const gridTarget = activeLayer >= 0 ? GRID_LEVEL.layers[activeLayer] : GRID_LEVEL.idle;
    this.gridLevel = reducedMotion ? gridTarget : approach(this.gridLevel, gridTarget, 0.05);
    const meshAlpha = Math.max((1 - m) * (1 - 0.35 * layers[0]) * this.gridLevel, outro * 0.9);

    if (meshAlpha > 0.01 || lensRadius > 1) {
      this.mesh.update({
        t,
        lensX: lens.x - cx,
        lensY: lens.y - cy,
        lensRadius,
        ambient: !reducedMotion,
        scale: 1 + a * 0.2,
        offsetY: a * H * 0.14 * (1 - m),
        project,
      });
      this.mesh.draw(ctx, { alpha: meshAlpha, lensRadius, width: W, height: H });
    }

    // Quiet the grid towards the edges so the area under construction leads.
    const focus = layers[0] * (1 - m);
    if (focus > 0.01) {
      const vignette = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.25, cx, cy, Math.max(W, H) * 0.75);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, `rgba(0,0,0,${0.85 * focus})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    }

    if (lensRadius > 2 && this.lensTextures) {
      drawLens(ctx, {
        lens,
        radius: lensRadius,
        t,
        reducedMotion,
        width: W,
        height: H,
        ...this.lensTextures,
      });
    }
  }
}
