import { smoothstep } from "@/lib/math";
import { Floor } from "./floor";
import { LayerStack, type StackTextures } from "./layerStack";
import { drawLens, type LensState } from "./lens";
import { Mesh } from "./mesh";
import { createLayer, Pen, type CanvasFonts } from "./pen";
import { createProjector } from "./projection";
import { paintCode } from "./textures/code";
import { paintInspect } from "./textures/inspect";
import { paintSite } from "./textures/site";
import { paintSpec } from "./textures/spec";

export const MOBILE_BREAKPOINT = 900;

const PLANE_WIDTH = 1600;
const PLANE_HEIGHT = 1000;

/** Scroll-driven phases of the hero, each easing from 0 to 1. */
export type HeroPhases = {
  /** Lens closes, the mesh tilts back into a floor. */
  open: number;
  /** The four website layers rise and separate. */
  assemble: number;
  /** The stack flattens and zooms to fill the screen. */
  collapse: number;
  /** Closing statement over the perspective floor. */
  outro: number;
};

export type HeroFrame = {
  /** Seconds since the scene started. */
  t: number;
  progress: number;
  phases: HeroPhases;
  lens: LensState;
  lensRadius: number;
  /** Smoothed pointer position, -1…1 on both axes. */
  mouse: { x: number; y: number };
  pointer: { x: number; y: number; active: boolean };
  /** Highlighted layer index, or -1. */
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
  private readonly floor = new Floor();
  private readonly stack: LayerStack;
  private dpr = 1;
  private lensTextures: { site: HTMLCanvasElement; code: HTMLCanvasElement } | null = null;
  private stackTextures: StackTextures | null = null;
  private planeScale = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly fonts: CanvasFonts,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.stack = new LayerStack(fonts);
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
    this.planeScale = 0;
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
      site: this.paint(W, H, dpr, (pen) => paintSite(pen, W, H, false)),
      code: this.paint(W, H, dpr, (pen) => paintCode(pen, W, H)),
    };

    const scratch = document.createElement("canvas");
    scratch.width = Math.round(W * dpr);
    scratch.height = Math.round(H * dpr);

    // The plane textures are resolution-independent of the viewport; only
    // repaint them when their quality level changes.
    const planeScale = this.mobile ? 0.85 : Math.min(1.6, dpr);
    const planes =
      this.stackTextures && planeScale === this.planeScale
        ? this.stackTextures.planes
        : ([
            this.paint(PLANE_WIDTH, PLANE_HEIGHT, planeScale, (pen) => paintInspect(pen, PLANE_WIDTH, PLANE_HEIGHT)),
            this.paint(PLANE_WIDTH, PLANE_HEIGHT, planeScale, (pen) => paintSpec(pen, PLANE_WIDTH, PLANE_HEIGHT)),
            this.paint(PLANE_WIDTH, PLANE_HEIGHT, planeScale, (pen) => paintSite(pen, PLANE_WIDTH, PLANE_HEIGHT, true)),
          ] as StackTextures["planes"]);
    this.planeScale = planeScale;
    this.stackTextures = { planes, scratch: { canvas: scratch, ctx: scratch.getContext("2d")! } };
  }

  render(frame: HeroFrame) {
    const { ctx, width: W, height: H, dpr } = this;
    const { t, progress, phases, lens, lensRadius, mouse, reducedMotion } = frame;
    const { open: a, assemble: b, collapse: c, outro: d } = phases;
    if (!W || !H) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const project = createProjector({
      cx,
      cy,
      tilt: (a * 1.02 + mouse.y * 0.12 * b) * (1 - c),
      roll: (-0.5 * a + 0.45 * smoothstep(0.38, 0.74, progress) + mouse.x * 0.22 * b) * (1 - c),
      focalLength: Math.max(W, H) * 1.15,
    });

    this.mesh.update({
      t,
      lensX: lens.x - cx,
      lensY: lens.y - cy,
      lensRadius,
      ambient: !reducedMotion,
      scale: 1 + a * 0.2,
      offsetY: a * H * 0.14 * (1 - c),
      project,
    });
    this.mesh.draw(ctx, {
      t,
      alpha: (1 - c) * (1 - 0.35 * b),
      lensRadius,
      ambient: !reducedMotion,
      width: W,
      height: H,
    });

    if (lensRadius > 2 && this.lensTextures) {
      drawLens(ctx, {
        lens,
        radius: lensRadius,
        t,
        reducedMotion,
        width: W,
        height: H,
        ...this.lensTextures,
        fonts: this.fonts,
      });
    }

    if (b > 0.002 && this.stackTextures) {
      this.stack.draw(ctx, this.stackTextures, {
        t,
        assemble: b,
        collapse: c,
        outro: d,
        activeLayer: frame.activeLayer,
        project,
        width: W,
        height: H,
        dpr,
        mobile: this.mobile,
      });
    }

    if (d > 0.002) {
      this.floor.draw(ctx, {
        t,
        alpha: d,
        width: W,
        height: H,
        mouseX: mouse.x,
        pointer: frame.pointer,
        reducedMotion,
      });
    }
  }
}
