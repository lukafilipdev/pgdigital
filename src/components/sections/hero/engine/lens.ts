import { BRAND, TAU, type CanvasFonts } from "./pen";

export type LensState = { x: number; y: number; vx: number; vy: number };

type LensDraw = {
  lens: LensState;
  radius: number;
  t: number;
  reducedMotion: boolean;
  width: number;
  height: number;
  /** Texture shown in the outer ring (a finished website). */
  site: HTMLCanvasElement;
  /** Texture shown in the inner ring (its source code). */
  code: HTMLCanvasElement;
  fonts: CanvasFonts;
};

/**
 * A wobbly, velocity-stretched double lens that reveals the website and,
 * deeper inside, the code behind it. Surrounded by a rotating tick dial.
 */
export function drawLens(ctx: CanvasRenderingContext2D, options: LensDraw) {
  const { lens, radius, t, reducedMotion, width, height, site, code, fonts } = options;
  const speed = Math.hypot(lens.vx, lens.vy);
  const heading = Math.atan2(lens.vy, lens.vx);
  const stretch = Math.min(0.38, speed * 0.014);

  const blobPath = (r: number, phase: number) => {
    ctx.beginPath();
    for (let i = 0; i <= 72; i++) {
      const theta = (i / 72) * TAU;
      const along = Math.cos(theta - heading);
      const wobble = reducedMotion
        ? 0
        : 0.045 * Math.sin(3 * theta + t * 0.9 + phase) + 0.028 * Math.sin(5 * theta - t * 1.4 + phase);
      const rr = r * (1 + wobble) * (1 + stretch * along * along) * (1 - stretch * 0.35);
      const x = lens.x + Math.cos(theta) * rr;
      const y = lens.y + Math.sin(theta) * rr;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.closePath();
  };

  // Parallax: the textures drift opposite to the lens, the inner one more.
  const parallaxX = -(lens.x - width / 2) * 0.07;
  const parallaxY = -(lens.y - height / 2) * 0.07;

  ctx.save();
  blobPath(radius, 0);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.clip();
  ctx.globalAlpha = 0.62;
  ctx.drawImage(site, parallaxX, parallaxY, width, height);
  ctx.globalAlpha = 1;

  blobPath(radius * 0.5, 2);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#050505";
  ctx.fill();
  ctx.drawImage(code, parallaxX * 1.8, parallaxY * 1.8, width, height);
  ctx.restore();
  ctx.restore();

  // Outlines
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,.32)";
  blobPath(radius, 0);
  ctx.stroke();
  ctx.strokeStyle = "rgba(245,117,30,.85)";
  blobPath(radius * 0.5, 2);
  ctx.stroke();

  // Dial ticks
  const rotation = reducedMotion ? 0 : t * 0.08;
  const dialRadius = radius * 1.08;
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.beginPath();
  for (let i = 0; i < 60; i++) {
    const theta = (i / 60) * TAU + rotation;
    const length = i % 5 ? 4 : 9;
    ctx.moveTo(lens.x + Math.cos(theta) * dialRadius, lens.y + Math.sin(theta) * dialRadius);
    ctx.lineTo(
      lens.x + Math.cos(theta) * (dialRadius + length),
      lens.y + Math.sin(theta) * (dialRadius + length),
    );
  }
  ctx.stroke();

  // Heading indicator while moving
  if (speed > 0.3) {
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(lens.x, lens.y, dialRadius + 5, heading - 0.12, heading + 0.12);
    ctx.stroke();
  }

  // Labels
  ctx.font = `9px ${fonts.mono}`;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillText("SPLETNA STRAN · 01", lens.x + radius * 0.8 + 12, lens.y - radius * 0.8 - 6);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(245,117,30,.95)";
  ctx.fillText("KODA · 02", lens.x, lens.y + radius * 0.5 + 16);
  ctx.textAlign = "left";
}
