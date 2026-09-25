export type Point = [x: number, y: number];

/**
 * Draws `image` onto an arbitrary (projected) quad by splitting it into an
 * N×N grid of triangles, each rendered with its own affine transform.
 * `pointAt(u, v)` maps normalised texture coordinates to CSS-pixel positions.
 */
export function mapTexture(
  ctx: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  pointAt: (u: number, v: number) => Point,
  dpr: number,
  segments: number,
) {
  const iw = image.width;
  const ih = image.height;
  const cellW = iw / segments;
  const cellH = ih / segments;

  const points: Point[] = [];
  for (let j = 0; j <= segments; j++) {
    for (let i = 0; i <= segments; i++) points.push(pointAt(i / segments, j / segments));
  }

  let cellX = 0;
  let cellY = 0;

  const triangle = (a: Point, b: Point, c: Point, ex: Point, ey: Point, ox: number, oy: number) => {
    // Grow each triangle by ~0.7px to hide hairline seams between neighbours.
    const mx = (a[0] + b[0] + c[0]) / 3;
    const my = (a[1] + b[1] + c[1]) / 3;
    const expand = (p: Point): Point => {
      const dx = p[0] - mx;
      const dy = p[1] - my;
      const length = Math.hypot(dx, dy) || 1;
      return [p[0] + (dx / length) * 0.7, p[1] + (dy / length) * 0.7];
    };
    const [pa, pb, pc] = [expand(a), expand(b), expand(c)];

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pa[0] * dpr, pa[1] * dpr);
    ctx.lineTo(pb[0] * dpr, pb[1] * dpr);
    ctx.lineTo(pc[0] * dpr, pc[1] * dpr);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(
      dpr * ex[0],
      dpr * ex[1],
      dpr * ey[0],
      dpr * ey[1],
      dpr * (a[0] - ex[0] * ox - ey[0] * oy),
      dpr * (a[1] - ex[1] * ox - ey[1] * oy),
    );
    // Only draw the source cell (plus a small margin) rather than the full image.
    const sx = Math.max(0, Math.min(ox, cellX) - 2);
    const sy = Math.max(0, Math.min(oy, cellY) - 2);
    const sw = Math.min(iw - sx, cellW + 4);
    const sh = Math.min(ih - sy, cellH + 4);
    ctx.drawImage(image, sx, sy, sw, sh, sx, sy, sw, sh);
    ctx.restore();
  };

  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const row = j * (segments + 1);
      const a = points[row + i];
      const b = points[row + i + 1];
      const c = points[row + segments + 1 + i];
      const d = points[row + segments + 2 + i];
      cellX = i * cellW;
      cellY = j * cellH;

      triangle(
        a,
        b,
        c,
        [(b[0] - a[0]) / cellW, (b[1] - a[1]) / cellW],
        [(c[0] - a[0]) / cellH, (c[1] - a[1]) / cellH],
        cellX,
        cellY,
      );
      triangle(
        d,
        c,
        b,
        [(d[0] - c[0]) / cellW, (d[1] - c[1]) / cellW],
        [(d[0] - b[0]) / cellH, (d[1] - b[1]) / cellH],
        cellX + cellW,
        cellY + cellH,
      );
    }
  }
}
