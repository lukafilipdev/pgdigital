"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { subscribeFrame } from "@/lib/frame-loop";

let activeLenis: Lenis | null = null;
let lockCount = 0;

/** Called by useScrollLock so modals and mobile menus cleanly pause Lenis. */
export function setSmoothScrollLocked(locked: boolean) {
  lockCount = Math.max(0, lockCount + (locked ? 1 : -1));
  if (!activeLenis) return;
  if (lockCount > 0) activeLenis.stop();
  else activeLenis.start();
}

/**
 * Lightweight Lenis smooth scroll attached to the site's single shared rAF loop.
 * Automatically disabled when the user prefers reduced motion.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });
    activeLenis = lenis;
    if (lockCount > 0) lenis.stop();

    const unsubscribe = subscribeFrame((now) => {
      lenis.raf(now);
    });

    const onAnchorClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.15 });
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      unsubscribe();
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, [reducedMotion]);

  return null;
}
