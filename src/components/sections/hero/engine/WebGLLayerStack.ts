import { approach, smoothstep } from "@/lib/math";
import type { HeroPhases } from "./HeroScene";
import { createLayer, Pen, type CanvasFonts } from "./pen";
import { createProjector, type Projected } from "./projection";
import {
  CODE_TOTAL_CHARS,
  paintBrowserChrome,
  paintHighCraftCode,
  paintHighCraftForm,
  paintHighCraftSite,
  paintHighCraftStructure,
  type SiteMediaAssets,
  TEX_H,
  TEX_W,
} from "./textures/highCraftTextures";

const ASPECT = TEX_H / TEX_W; // 0.625 (16:10)
const CHROME = 0.05;

const VERT_SRC = `#version 300 es
precision highp float;

in vec2 a_uv;
out vec2 v_uv;

uniform vec2 u_planeSize;
uniform vec2 u_uvOffset;
uniform float u_z;
uniform float u_cosR;
uniform float u_sinR;
uniform float u_cosT;
uniform float u_sinT;
uniform float u_focal;
uniform vec2 u_offset;
uniform vec2 u_viewport;

void main() {
  v_uv = a_uv;
  vec2 local = (a_uv - 0.5 + u_uvOffset) * u_planeSize;
  float rx = local.x * u_cosR - local.y * u_sinR;
  float ry = local.x * u_sinR + local.y * u_cosR;
  float ty = ry * u_cosT + u_z * u_sinT;
  float tz = -ry * u_sinT + u_z * u_cosT;
  float w = max(60.0, u_focal + tz);

  // Exact match to projection.ts: sx = cx + offsetX + rx * (focal / w),
  // with gl_Position.w = w so the GPU performs true perspective-correct
  // interpolation, trilinear mipmapping, and hardware anisotropic filtering.
  float ndcX = (2.0 * u_offset.x / u_viewport.x) * w + (2.0 * u_focal / u_viewport.x) * rx;
  float ndcY = -(2.0 * u_offset.y / u_viewport.y) * w - (2.0 * u_focal / u_viewport.y) * ty;
  gl_Position = vec4(ndcX, ndcY, 0.0, w);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_tex;
uniform float u_alpha;
uniform float u_dim;
uniform float u_highlight;
uniform float u_sheen;
uniform vec4 u_borderColor;
uniform float u_borderPx;

void main() {
  vec4 tex = texture(u_tex, v_uv);

  // Subtle top-left diagonal glass sheen across the surface
  float sheen = u_sheen * smoothstep(0.65, 0.0, v_uv.x + v_uv.y) * 0.065;
  vec3 col = tex.rgb + vec3(sheen);

  // Dim lower layers cleanly when a higher layer is active
  col = mix(col, vec3(0.0), u_dim);

  // Analytically anti-aliased border using screen-space derivatives (fwidth)
  // so every horizontal, vertical, and steeply angled edge stays 100% smooth.
  vec2 fw = max(fwidth(v_uv), vec2(1e-5));
  vec2 edgeDistPx = min(v_uv, 1.0 - v_uv) / fw;
  float dEdge = min(edgeDistPx.x, edgeDistPx.y);

  // Smooth 1.2px outer anti-aliasing feather against transparent background
  float outerAA = smoothstep(-0.2, 1.0, dEdge);
  // Crisp anti-aliased inner border stroke
  float borderMask = 1.0 - smoothstep(max(0.4, u_borderPx - 0.8), u_borderPx + 0.6, dEdge);
  col = mix(col, u_borderColor.rgb, borderMask * u_borderColor.a);

  // Soft warm inner rim glow on the active layer
  float rimGlow = u_highlight * smoothstep(14.0, 0.0, dEdge) * 0.16;
  col += vec3(0.96, 0.46, 0.12) * rimGlow;

  float a = tex.a * u_alpha * outerAA;
  outColor = vec4(col * a, a);
}
`;

export type LabelAnchor = {
  x: number;
  y: number;
  alpha: number;
  highlight: number;
};

export type DimensionAnchor = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  angleDeg: number;
  alpha: number;
};

export type WebGLStackResult = {
  visible: boolean;
  labels: LabelAnchor[];
  dimension: DimensionAnchor;
};

export type WebGLStackFrame = {
  t: number;
  phases: HeroPhases;
  mouse: { x: number; y: number };
  activeLayer: number;
  width: number;
  height: number;
  mobile: boolean;
  reducedMotion: boolean;
};

/**
 * Hardware-accelerated WebGL2 plane stack with trilinear mipmapping
 * (LINEAR_MIPMAP_LINEAR), up to 16x EXT_texture_filter_anisotropic,
 * hardware MSAA, and fwidth-antialiased borders. Eliminates all speckled text,
 * broken hairlines, and jagged edges even at 58° tilt on 1x displays.
 */
export class WebGLLayerStack {
  private readonly gl: WebGL2RenderingContext | null;
  private readonly program: WebGLProgram | null = null;
  private readonly vao: WebGLVertexArrayObject | null = null;
  private readonly uniforms: Record<string, WebGLUniformLocation | null> = {};
  private readonly maxAnisotropy: number = 1;
  private readonly anisoExt: EXT_texture_filter_anisotropic | null = null;

  private readonly textures: (WebGLTexture | null)[] = [null, null, null, null];
  private chromeTex: WebGLTexture | null = null;
  private codeCanvas: HTMLCanvasElement | null = null;
  private codeCtx: CanvasRenderingContext2D | null = null;

  private width = 0;
  private height = 0;
  private dpr = 1;
  private highlight = [0, 0, 0, 0];
  private typedChars = -1;
  private caretVisible = false;
  private readonly projected: Projected = [0, 0, 0];
  private disposed = false;
  private readonly media: SiteMediaAssets = { cards: [] };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly fonts: CanvasFonts,
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    this.gl = gl;
    if (!gl) return;

    this.anisoExt =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    if (this.anisoExt) {
      this.maxAnisotropy = Math.min(16, gl.getParameter(this.anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1);
    }

    const program = createProgram(gl, VERT_SRC, FRAG_SRC);
    if (!program) return;
    this.program = program;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.vao = vao;

    for (const name of [
      "u_planeSize",
      "u_uvOffset",
      "u_z",
      "u_cosR",
      "u_sinR",
      "u_cosT",
      "u_sinT",
      "u_focal",
      "u_offset",
      "u_viewport",
      "u_tex",
      "u_alpha",
      "u_dim",
      "u_highlight",
      "u_sheen",
      "u_borderColor",
      "u_borderPx",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.initStaticTextures();
    this.loadSiteMedia();
  }

  get supported() {
    return this.gl !== null && this.program !== null;
  }

  resize(width: number, height: number, mobile: boolean) {
    if (!this.gl || (width === this.width && height === this.height)) return;
    this.width = width;
    this.height = height;
    this.dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  refreshTextures() {
    if (!this.gl || this.disposed) return;
    this.typedChars = -1;
    this.initStaticTextures();
  }

  private initStaticTextures() {
    const gl = this.gl;
    if (!gl) return;

    // Code plane offscreen canvas (updated only when typedChars / caret changes)
    const codeLayer = createLayer(1024, 640, 2);
    this.codeCanvas = codeLayer.canvas;
    this.codeCtx = codeLayer.ctx;
    paintHighCraftCode(new Pen(this.codeCtx, this.fonts), 0, true);
    this.textures[0] = this.uploadTexture(this.textures[0], this.codeCanvas);

    // Planes 1–3 painted at 2048×1280 (2× supersampled)
    const painters: ((pen: Pen) => void)[] = [
      paintHighCraftStructure,
      paintHighCraftForm,
      (pen) => paintHighCraftSite(pen, this.media),
    ];
    painters.forEach((painter, idx) => {
      const layer = createLayer(1024, 640, 2);
      painter(new Pen(layer.ctx, this.fonts));
      this.textures[idx + 1] = this.uploadTexture(this.textures[idx + 1], layer.canvas);
    });

    // Browser bar strip for Rezultat
    const chromeH = Math.round(640 * CHROME);
    const chromeLayer = createLayer(1024, chromeH, 2);
    paintBrowserChrome(new Pen(chromeLayer.ctx, this.fonts), 1024, chromeH);
    this.chromeTex = this.uploadTexture(this.chromeTex, chromeLayer.canvas);
  }

  private repaintSiteTexture() {
    if (!this.gl || this.disposed) return;
    const layer = createLayer(1024, 640, 2);
    paintHighCraftSite(new Pen(layer.ctx, this.fonts), this.media);
    this.textures[3] = this.uploadTexture(this.textures[3], layer.canvas);
  }

  private loadSiteMedia() {
    if (typeof window === "undefined") return;
    const loadImg = (src: string, onReady: (img: HTMLImageElement) => void) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (this.disposed) return;
        onReady(img);
        this.repaintSiteTexture();
      };
      img.src = src;
    };

    loadImg("/images/hero-stack/hero-architecture.jpg", (img) => {
      this.media.hero = img;
    });
    const cardSources = [
      "/images/hero-stack/card-service.jpg",
      "/images/hero-stack/card-product.jpg",
      "/images/hero-stack/card-reference.jpg",
    ];
    cardSources.forEach((src, idx) => {
      loadImg(src, (img) => {
        if (!this.media.cards) this.media.cards = [];
        this.media.cards[idx] = img;
      });
    });
  }

  private uploadTexture(existing: WebGLTexture | null, source: HTMLCanvasElement): WebGLTexture | null {
    const gl = this.gl;
    if (!gl) return null;
    const tex = existing ?? gl.createTexture();
    if (!tex) return null;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    if (this.anisoExt && this.maxAnisotropy > 1) {
      gl.texParameterf(gl.TEXTURE_2D, this.anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, this.maxAnisotropy);
    }
    gl.generateMipmap(gl.TEXTURE_2D);
    return tex;
  }

  render(frame: WebGLStackFrame): WebGLStackResult {
    const empty: WebGLStackResult = {
      visible: false,
      labels: [0, 1, 2, 3].map(() => ({ x: 0, y: 0, alpha: 0, highlight: 0 })),
      dimension: { x0: 0, y0: 0, x1: 0, y1: 0, angleDeg: 0, alpha: 0 },
    };
    const gl = this.gl;
    if (!gl || !this.program || !this.vao || this.disposed) return empty;

    const { t, phases, mouse, activeLayer, width: W, height: H, mobile, reducedMotion } = frame;
    const { open: a, layers, build, code, merge: m, outro } = phases;

    if (layers[0] <= 0.002 || outro >= 0.999 || W <= 0 || H <= 0) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return empty;
    }

    // Update code texture only when typing progress or caret blink changes
    const targetChars = Math.round(code * CODE_TOTAL_CHARS);
    const caretVisible = Math.floor((t * 1000) / 530) % 2 === 0;
    if (
      (targetChars !== this.typedChars || caretVisible !== this.caretVisible) &&
      this.codeCtx &&
      this.codeCanvas
    ) {
      this.codeCtx.save();
      this.codeCtx.setTransform(2, 0, 0, 2, 0, 0);
      paintHighCraftCode(new Pen(this.codeCtx, this.fonts), targetChars, caretVisible);
      this.codeCtx.restore();
      this.textures[0] = this.uploadTexture(this.textures[0], this.codeCanvas);
      this.typedChars = targetChars;
      this.caretVisible = caretVisible;
    }

    // Exact original camera projection & angles from HeroScene.ts + layerStack.ts
    const cx = W / 2;
    const cy = H / 2;
    const focalLength = Math.max(W, H) * 1.15;
    const steer = reducedMotion ? 0 : layers[0] * (0.25 + 0.75 * layers[3]);
    const tiltRad =
      outro > 0
        ? 1.15 * smoothstep(0, 1, outro)
        : (a * 1.02 + mouse.y * 0.12 * steer) * (1 - m);
    const rollRad =
      outro > 0
        ? 0
        : (-0.5 * a + 0.45 * build + mouse.x * 0.22 * steer) * (1 - m);

    const project = createProjector({ cx, cy, tilt: tiltRad, roll: rollRad, focalLength });
    const q = this.projected;

    const labelWidth = mobile ? 0 : 190;
    const top = 64 + (mobile ? 20 : 48);
    const bottom = H - (mobile ? 190 : 170);

    const bounds = (planeW: number, spreadVal: number, levels: number) => {
      const planeH = planeW * ASPECT;
      const liftVal = planeH * 0.3 * spreadVal;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const z of [-liftVal, -(liftVal + levels * liftVal + planeH * 0.1 * spreadVal)]) {
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

    let stagePW = mobile ? W * 0.9 : Math.min(W * 0.56, 1100, H * 1.3);
    if (m < 1) {
      const full = bounds(stagePW, 1, 3);
      stagePW *=
        Math.min(1, (bottom - top) / (full.y1 - full.y0), (W - labelWidth * 2 - 60) / (full.x1 - full.x0)) * 0.98;
    }
    const reserve = mobile ? 150 : 120;
    const finalPW = Math.min(mobile ? W * 0.9 : W * 0.68, (H - top - reserve) / (ASPECT * (1 + CHROME)), 1240);
    const PW = (stagePW + (finalPW - stagePW) * m) * (1 - 0.22 * outro);
    const PH = PW * ASPECT;

    const spread = 1 - m;
    const lift = PH * 0.3 * spread;
    const count = layers.reduce((sum, v) => sum + v, 0);
    const current = bounds(PW, spread, Math.max(0, count - 1));

    const stageCentre = [W / 2 + (mobile ? 0 : 30), (top + bottom) / 2];
    const finalCentre = [W / 2, top + (H - top - reserve) / 2 + (PH * CHROME) / 2];
    const centreX = stageCentre[0] + (finalCentre[0] - stageCentre[0]) * m;
    const centreY =
      stageCentre[1] + (finalCentre[1] - stageCentre[1]) * m + outro * (H * 0.8 - finalCentre[1]) * 0.75;
    const offsetX = centreX - (current.x0 + current.x1) / 2;
    const offsetY = centreY - (current.y0 + current.y1) / 2;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform1f(this.uniforms.u_cosR, Math.cos(rollRad));
    gl.uniform1f(this.uniforms.u_sinR, Math.sin(rollRad));
    gl.uniform1f(this.uniforms.u_cosT, Math.cos(tiltRad));
    gl.uniform1f(this.uniforms.u_sinT, Math.sin(tiltRad));
    gl.uniform1f(this.uniforms.u_focal, focalLength);
    gl.uniform2f(this.uniforms.u_offset, offsetX, offsetY);
    gl.uniform2f(this.uniforms.u_viewport, W, H);
    gl.uniform1i(this.uniforms.u_tex, 0);

    const experience = layers[3] * spread * (reducedMotion ? 0 : 1);
    const labels: LabelAnchor[] = [];
    let dimension = empty.dimension;

    for (let i = 0; i < 4; i++) {
      const target = i === activeLayer && m < 0.01 ? 1 : 0;
      this.highlight[i] = reducedMotion ? target : approach(this.highlight[i], target, 0.1);
      const on = this.highlight[i];
      const arrive = layers[i];
      const fadeIn = smoothstep(0, 0.6, arrive);
      const alpha = fadeIn * (i === 3 ? 1 - smoothstep(0.15, 0.65, outro) : 1 - smoothstep(0.3, 0.85, m));

      if (arrive < 0.004 || alpha < 0.008 || !this.textures[i]) {
        labels.push({ x: 0, y: 0, alpha: 0, highlight: on });
        continue;
      }

      const floatZ = Math.sin(t * 0.9 + i * 0.8) * PH * 0.012 * experience;
      const z = -(lift + i * lift + on * PH * 0.06 + (1 - arrive) * PH * 0.5 + floatZ);
      const dim = activeLayer > i ? 0.54 * (1 - on) * spread : 0;

      // Draw plane with trilinear mipmapping + 16× anisotropic filtering
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      gl.uniform2f(this.uniforms.u_planeSize, PW, PH);
      gl.uniform2f(this.uniforms.u_uvOffset, 0, 0);
      gl.uniform1f(this.uniforms.u_z, z);
      gl.uniform1f(this.uniforms.u_alpha, alpha);
      gl.uniform1f(this.uniforms.u_dim, dim);
      gl.uniform1f(this.uniforms.u_highlight, on * spread);
      gl.uniform1f(this.uniforms.u_sheen, 1.0);
      gl.uniform1f(this.uniforms.u_borderPx, (1.1 + on * 0.55) * this.dpr);
      if (on > 0.35) {
        gl.uniform4f(this.uniforms.u_borderColor, 0.961, 0.459, 0.118, 0.5 + on * 0.5);
      } else {
        gl.uniform4f(this.uniforms.u_borderColor, 1.0, 1.0, 1.0, 0.18 + on * 0.25);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Browser bar strip above Layer 04 during merge -> Rezultat
      if (i === 3 && m > 0.45 && this.chromeTex) {
        const chromeAlpha = alpha * smoothstep(0.5, 0.98, m) * (1 - smoothstep(0, 0.3, outro));
        if (chromeAlpha > 0.01) {
          gl.bindTexture(gl.TEXTURE_2D, this.chromeTex);
          gl.uniform2f(this.uniforms.u_planeSize, PW, PH * CHROME);
          // Position directly above the top edge of Layer 04 (offset by -(0.5/CHROME + 0.5) in chrome heights)
          gl.uniform2f(this.uniforms.u_uvOffset, 0, -(0.5 / CHROME + 0.5));
          gl.uniform1f(this.uniforms.u_alpha, chromeAlpha);
          gl.uniform1f(this.uniforms.u_dim, 0);
          gl.uniform1f(this.uniforms.u_highlight, 0);
          gl.uniform1f(this.uniforms.u_sheen, 0);
          gl.uniform1f(this.uniforms.u_borderPx, 1.1 * this.dpr);
          gl.uniform4f(this.uniforms.u_borderColor, 1.0, 1.0, 1.0, 0.18);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }

      // Compute exact projected left-center anchor for DOM leader label ("KODA 01 ——")
      project(-0.5 * PW, 0, z, q);
      labels.push({
        x: q[0] + offsetX,
        y: q[1] + offsetY,
        alpha: mobile ? 0 : alpha * Math.max(0, 1 - m * 2),
        highlight: on,
      });

      // Layer 02 top dimension bar ("1440 PX")
      if (i === 1 && on > 0.01) {
        project(-0.5 * PW, -0.5 * PH, z, q);
        const ax = q[0] + offsetX;
        const ay = q[1] + offsetY;
        project(0.5 * PW, -0.5 * PH, z, q);
        const bx = q[0] + offsetX;
        const by = q[1] + offsetY;
        project(0, 0, z, q);
        const midX = q[0] + offsetX;
        const midY = q[1] + offsetY;

        const len = Math.hypot(bx - ax, by - ay) || 1;
        let nx = (ay - by) / len;
        let ny = (bx - ax) / len;
        if (nx * ((ax + bx) / 2 - midX) + ny * ((ay + by) / 2 - midY) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const off = 18;
        let angle = Math.atan2(by - ay, bx - ax);
        if (angle > Math.PI / 2) angle -= Math.PI;
        if (angle < -Math.PI / 2) angle += Math.PI;
        dimension = {
          x0: ax + nx * off,
          y0: ay + ny * off,
          x1: bx + nx * off,
          y1: by + ny * off,
          angleDeg: (angle * 180) / Math.PI,
          alpha: on * alpha * (1 - smoothstep(0.25, 0.7, m)),
        };
      }
    }

    gl.bindVertexArray(null);
    return { visible: true, labels, dimension };
  }

  dispose() {
    this.disposed = true;
    const gl = this.gl;
    if (!gl) return;
    for (const tex of this.textures) if (tex) gl.deleteTexture(tex);
    if (this.chromeTex) gl.deleteTexture(this.chromeTex);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.program) gl.deleteProgram(this.program);
  }
}

function createProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
