export type FrameCallback = (now: number) => void;

const callbacks = new Set<FrameCallback>();
let rafId = 0;

function tick(now: number) {
  rafId = requestAnimationFrame(tick);
  callbacks.forEach((callback) => callback(now));
}

/**
 * Registers a callback on a single shared requestAnimationFrame loop.
 * The loop only runs while at least one subscriber exists.
 */
export function subscribeFrame(callback: FrameCallback) {
  callbacks.add(callback);
  if (!rafId) rafId = requestAnimationFrame(tick);

  return () => {
    callbacks.delete(callback);
    if (!callbacks.size) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}
