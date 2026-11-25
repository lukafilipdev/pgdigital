import { BRAND, TAU } from "./pen";

export type LensState = { x: number; y: number; vx: number; vy: number };

type LensDraw = {
  lens: LensState;
  radius: number;
  t: number;
  reducedMotion: boolean;
  width: number;
  height: number;
  /** Source-code texture revealed by the lens. */
  code: HTMLCanvasElement;
};

/**
 * One code-only X-ray on every viewport, surrounded by a slowly rotating tick dial.
 */
export function drawLens(ctx: CanvasRenderingContext2D, options: LensDraw) {
  const { lens, radius, t, reducedMotion, width, height, code } = options;
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

  // Overscan keeps the texture under the lens even at the viewport edges.
  const parallaxX = -(lens.x - width / 2) * 0.04;
  const parallaxY = -(lens.y - height / 2) * 0.04;
  ctx.save();
  blobPath(radius, 0);
  ctx.clip();
  ctx.drawImage(code, -width * 0.08 + parallaxX, -height * 0.08 + parallaxY, width * 1.16, height * 1.16);
  // Dark veil keeps the code atmospheric so foreground hero typography stays effortlessly legible on desktop and mobile.
  ctx.fillStyle = "rgba(0,0,0,0.58)";
  ctx.fillRect(lens.x - radius * 1.6, lens.y - radius * 1.6, radius * 3.2, radius * 3.2);
  ctx.restore();

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(245,117,30,.55)";
  blobPath(radius, 0);
  ctx.stroke();

  // Dial ticks
  const rotation = reducedMotion ? 0 : t * 0.08;
  const dialRadius = radius * 1.08;
  ctx.strokeStyle = "rgba(255,255,255,.2)";
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
}
