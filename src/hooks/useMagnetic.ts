"use client";

import { useRef, type RefObject } from "react";
import { approach } from "@/lib/math";
import { useFrame } from "./useFrame";
import { useHoverEffects } from "./useMediaQuery";
import { usePointer } from "./usePointer";

type MagneticOptions = {
  /** Activation distance in px. Defaults to the element's width. */
  radius?: number;
  /** How strongly the element follows the pointer, per axis. */
  strength?: { x: number; y: number };
  /** Per-frame easing factor. */
  easing?: number;
  /** Optional child that travels a bit further for a parallax feel. */
  innerRef?: RefObject<HTMLElement | null>;
  innerFactor?: number;
};

/** Pulls an element towards the pointer when it comes close. */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  {
    radius,
    strength = { x: 0.35, y: 0.35 },
    easing = 0.12,
    innerRef,
    innerFactor = 0.35,
  }: MagneticOptions = {},
) {
  const enabled = useHoverEffects();
  const pointer = usePointer();
  const offset = useRef({ x: 0, y: 0 });

  useFrame(() => {
    const element = ref.current;
    if (!element) return;

    const box = element.getBoundingClientRect();
    const o = offset.current;
    // Measure from the element's resting position, not its displaced one.
    const dx = pointer.x - (box.left + box.width / 2 - o.x);
    const dy = pointer.y - (box.top + box.height / 2 - o.y);
    const near = Math.hypot(dx, dy) < (radius ?? box.width);

    o.x = approach(o.x, near ? dx * strength.x : 0, easing);
    o.y = approach(o.y, near ? dy * strength.y : 0, easing);

    element.style.transform = `translate3d(${o.x}px,${o.y}px,0)`;
    if (innerRef?.current) {
      innerRef.current.style.transform = `translate3d(${o.x * innerFactor}px,${o.y * innerFactor}px,0)`;
    }
  }, enabled);
}
