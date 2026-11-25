"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@/hooks/useFrame";
import { useHoverEffects, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePointer } from "@/hooks/usePointer";
import { approach, clamp } from "@/lib/math";

/**
 * Elements opt in with `data-cursor="link" | "view" | "explore" | "none"` and
 * an optional `data-cursor-label`. Disabled on mobile/touch viewports so a
 * stray orange dot never freezes over tapped mobile controls, and the center
 * dot fades cleanly while a ring label ("RAZIŠČI", "VRTI", "POGLEJ") is shown.
 */
const VARIANTS: Record<string, { size: number; accent: boolean }> = {
  link: { size: 42, accent: true },
  view: { size: 92, accent: true },
  explore: { size: 78, accent: false },
};

export function CustomCursor() {
  const hoverCapable = useHoverEffects();
  const isDesktopWidth = useMediaQuery("(min-width: 900px)");
  const enabled = hoverCapable && isDesktopWidth;
  const pointer = usePointer();
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const target = useRef<HTMLElement | null>(null);
  const touchHidden = useRef(false);
  const cursor = useRef({ x: 0, y: 0, size: 0, label: "", initialised: false });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        touchHidden.current = true;
        return;
      }
      touchHidden.current = false;
      target.current = (event.target as Element).closest<HTMLElement>("[data-cursor]");
    };
    root.classList.add("has-custom-cursor");
    document.addEventListener("pointerover", onOver);
    return () => {
      root.classList.remove("has-custom-cursor");
      document.removeEventListener("pointerover", onOver);
    };
  }, [enabled]);

  useFrame(() => {
    const c = cursor.current;
    if (!c.initialised) Object.assign(c, { x: pointer.x, y: pointer.y, initialised: true });
    c.x = approach(c.x, pointer.x, 0.22);
    c.y = approach(c.y, pointer.y, 0.22);

    const element = target.current?.isConnected ? target.current : null;
    const hidden = touchHidden.current || !pointer.active || element?.dataset.cursor === "none";
    const variant = element ? VARIANTS[element.dataset.cursor ?? ""] : undefined;
    const label = element?.dataset.cursorLabel ?? "";
    const targetSize =
      !variant || (element?.dataset.cursor === "explore" && !label) ? 0 : variant.size;
    c.size = approach(c.size, targetSize, 0.16);

    const root = rootRef.current!;
    root.style.transform = `translate3d(${c.x}px,${c.y}px,0)`;
    root.style.opacity = hidden ? "0" : "1";
    const ring = ringRef.current!;
    ring.style.width = ring.style.height = `${c.size}px`;
    ring.style.opacity = String(clamp(c.size / 30));
    ring.style.borderColor = variant?.accent ? "rgba(245,117,30,.9)" : "rgba(255,255,255,.4)";

    const labelElement = labelRef.current!;
    if (label !== c.label) labelElement.textContent = c.label = label;
    const labelOpacity = label ? clamp((c.size - 50) / 25) : 0;
    labelElement.style.opacity = String(labelOpacity);

    // Hide the center orange dot while a text label is displayed so they never collide.
    if (dotRef.current) {
      dotRef.current.style.opacity = String(1 - labelOpacity);
    }
  }, enabled);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-200 size-0 opacity-0 will-change-transform"
    >
      <div
        ref={ringRef}
        className="absolute top-0 left-0 flex size-0 -translate-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 opacity-0 backdrop-blur-[2px]"
      >
        <span
          ref={labelRef}
          className="pl-[.2em] font-mono text-[8.5px] font-semibold tracking-[.2em] whitespace-nowrap text-white"
        />
      </div>
      <div ref={dotRef} className="absolute -top-[3.5px] -left-[3.5px] size-[7px] rounded-full bg-brand" />
    </div>
  );
}
