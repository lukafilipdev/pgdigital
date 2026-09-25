/**
 * Shared, mutable pointer state read by animation loops. Kept outside React
 * on purpose: it changes on every pointer move and must never trigger renders.
 */
export const pointer = {
  x: 0,
  y: 0,
  /** Whether the user has moved the pointer at least once. */
  active: false,
  lastMoveAt: Number.NEGATIVE_INFINITY,
};

let subscribers = 0;

function handleMove(event: PointerEvent) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  pointer.lastMoveAt = performance.now();
}

/** Starts tracking the pointer (ref-counted). Returns a cleanup function. */
export function trackPointer() {
  if (subscribers++ === 0) {
    if (!pointer.active) {
      pointer.x = window.innerWidth / 2;
      pointer.y = window.innerHeight / 2;
    }
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });
  }

  return () => {
    if (--subscribers === 0) {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
    }
  };
}
