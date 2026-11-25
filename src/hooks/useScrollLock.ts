"use client";

import { useEffect } from "react";
import { setSmoothScrollLocked } from "@/components/effects/SmoothScroll";

/** Prevents the document (and Lenis smooth scroll) from scrolling while `locked` is true. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    setSmoothScrollLocked(true);
    return () => {
      root.style.overflow = previous;
      setSmoothScrollLocked(false);
    };
  }, [locked]);
}
