"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Becomes true (once) when the element scrolls into view.
 * `rootMargin` defaults to triggering when the top passes 78% of the viewport.
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  rootMargin = "0px 0px -22% 0px",
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, inView]);

  return inView;
}

/** Tracks whether the element currently intersects the viewport. */
export function useInViewport(ref: RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}
