export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/** Hermite interpolation between two edges, clamped to [0, 1]. */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp(t), 4);

/** Moves `current` a fraction of the way towards `target` (frame-based easing). */
export const approach = (current: number, target: number, factor: number) =>
  current + (target - current) * factor;

/** Zero-padded integer, e.g. `padNumber(42, 3)` → "042". */
export const padNumber = (value: number, length = 4) =>
  String(Math.max(0, Math.round(value))).padStart(length, "0");
