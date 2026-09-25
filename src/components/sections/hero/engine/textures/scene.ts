/**
 * Stylised "sunset over a building" illustration used as placeholder
 * photography inside the mock website textures. Three compositions.
 */
export function paintScene(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  variant = 0,
) {
  const k = variant % 3;
  ctx.save();
  ctx.beginPath();
  const radius = Math.min(w, h) * 0.025;
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, radius);
  else ctx.rect(x, y, w, h);
  ctx.clip();

  // Sky
  const horizon = y + h * [0.64, 0.6, 0.66][k];
  const sky = ctx.createLinearGradient(0, y, 0, horizon);
  sky.addColorStop(0, "#0f0f0f");
  sky.addColorStop(0.65, "#23140a");
  sky.addColorStop(1, "#5c2b0c");
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, horizon - y + 1);

  // Sun
  const sunX = x + w * [0.66, 0.3, 0.56][k];
  const sunR = Math.min(w, h) * [0.27, 0.2, 0.3][k];
  const sunY = horizon - sunR * 0.28;
  const sun = ctx.createRadialGradient(
    sunX - sunR * 0.3,
    sunY - sunR * 0.35,
    sunR * 0.08,
    sunX,
    sunY,
    sunR,
  );
  sun.addColorStop(0, "#ffb275");
  sun.addColorStop(0.5, "#F5751E");
  sun.addColorStop(1, "#b9490c");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Ground and reflections
  ctx.fillStyle = "#080808";
  ctx.fillRect(x, horizon, w, y + h - horizon);
  ctx.fillStyle = "rgba(245,117,30,.2)";
  for (let i = 0; i < 5; i++) {
    const ry = horizon + (y + h - horizon) * (0.1 + i * 0.17);
    const rw = sunR * (1.5 - i * 0.24);
    ctx.fillRect(sunX - rw / 2, ry, rw, Math.max(1, h * 0.005));
  }

  // Building silhouette with lit windows
  const bw = w * [0.44, 0.36, 0.5][k];
  const bx = x + w * [0.1, 0.5, 0.14][k];
  const bh = h * 0.15;
  ctx.fillStyle = "#050505";
  ctx.fillRect(bx, horizon - bh, bw, bh + 1);
  ctx.fillRect(bx - bw * 0.06, horizon - bh - h * 0.018, bw * 1.12, h * 0.018);
  ctx.fillStyle = "rgba(255,178,117,.92)";
  ctx.fillRect(bx + bw * 0.12, horizon - bh * 0.64, bw * 0.42, bh * 0.3);
  ctx.fillStyle = "rgba(255,178,117,.35)";
  ctx.fillRect(bx + bw * 0.62, horizon - bh * 0.64, bw * 0.14, bh * 0.3);

  ctx.restore();
}
