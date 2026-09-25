import { clamp } from "./math";

/**
 * Progress (0–1) through a tall "pinned" section whose child is
 * `position: sticky`. 0 when the section top reaches the viewport top,
 * 1 when its bottom reaches the viewport bottom.
 */
export function getPinProgress(section: HTMLElement) {
  const range = section.offsetHeight - window.innerHeight;
  if (range <= 0) return 0;
  return clamp((window.scrollY - section.offsetTop) / range);
}
