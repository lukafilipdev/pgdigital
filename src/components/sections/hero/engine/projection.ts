/** [screenX, screenY, perspectiveScale] — reused to avoid per-point allocations. */
export type Projected = [x: number, y: number, scale: number];

export type Projector = (x: number, y: number, z: number, out: Projected) => Projected;

type ProjectorOptions = {
  /** Screen-space centre. */
  cx: number;
  cy: number;
  /** Rotation around the view axis (radians). */
  roll: number;
  /** Tilt away from the viewer around the horizontal axis (radians). */
  tilt: number;
  focalLength: number;
};

/** Simple perspective camera: roll → tilt → perspective divide. */
export function createProjector({ cx, cy, roll, tilt, focalLength }: ProjectorOptions): Projector {
  const cosR = Math.cos(roll);
  const sinR = Math.sin(roll);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  return (x, y, z, out) => {
    const rx = x * cosR - y * sinR;
    const ry = x * sinR + y * cosR;
    const ty = ry * cosT + z * sinT;
    const tz = -ry * sinT + z * cosT;
    const scale = focalLength / Math.max(60, focalLength + tz);
    out[0] = cx + rx * scale;
    out[1] = cy + ty * scale;
    out[2] = scale;
    return out;
  };
}
