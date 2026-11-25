"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number) {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Id of the section whose top edge most recently crossed `offset` (fraction
 * of the viewport height), regardless of the order of `ids`.
 * Falls back to the first id.
 */
export function useActiveSection(ids: readonly string[], offset = 0.45) {
  const getSnapshot = useCallback(() => {
    const line = window.innerHeight * offset;
    let current = ids[0];
    let closestTop = Number.NEGATIVE_INFINITY;
    for (const id of ids) {
      const top = document.getElementById(id)?.getBoundingClientRect().top;
      if (top !== undefined && top <= line && top > closestTop) {
        current = id;
        closestTop = top;
      }
    }
    return current;
  }, [ids, offset]);

  return useSyncExternalStore(subscribeToScroll, getSnapshot, () => ids[0]);
}

/** Returns "light" when a `[data-theme="light"]` section sits behind the fixed header. */
export function useHeaderTone(): "dark" | "light" {
  const getSnapshot = useCallback((): "dark" | "light" => {
    const sections = document.querySelectorAll<HTMLElement>('[data-theme="light"]');
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 48 && rect.bottom > 48) return "light";
    }
    return "dark";
  }, []);

  return useSyncExternalStore(subscribeToScroll, getSnapshot, () => "dark");
}
