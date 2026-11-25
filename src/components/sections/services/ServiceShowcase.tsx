"use client";

import { useRef, type ComponentType, type ReactNode } from "react";
import { SERVICES } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useHoverEffects } from "@/hooks/useMediaQuery";
import { usePointer } from "@/hooks/usePointer";
import { cn } from "@/lib/cn";
import { approach, clamp } from "@/lib/math";
import { CodeSlide } from "./slides/CodeSlide";
import { MetricsSlide } from "./slides/MetricsSlide";
import { ShopSlide } from "./slides/ShopSlide";
import { TypographySlide } from "./slides/TypographySlide";

/** One slide per service, in the same order as SERVICES. */
const SLIDES: ComponentType<{ active: boolean }>[] = [TypographySlide, CodeSlide, ShopSlide, MetricsSlide];

/** Extra px around the panel where the pointer still tilts it. */
const TILT_MARGIN = 80;

type ServiceShowcaseProps = {
  active: number;
  revealed: boolean;
};

/** Sticky panel illustrating the active service; tilts towards the pointer. */
export function ServiceShowcase({ active, revealed }: ServiceShowcaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const hoverEffects = useHoverEffects();
  const pointer = usePointer();

  useFrame(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const box = panel.getBoundingClientRect();
    if (box.bottom <= 0 || box.top >= window.innerHeight) return;

    const near =
      hoverEffects &&
      pointer.x > box.left - TILT_MARGIN &&
      pointer.x < box.right + TILT_MARGIN &&
      pointer.y > box.top - TILT_MARGIN &&
      pointer.y < box.bottom + TILT_MARGIN;
    const nx = near ? clamp((pointer.x - box.left) / box.width) : 0.5;
    const ny = near ? clamp((pointer.y - box.top) / box.height) : 0.5;

    const t = tilt.current;
    t.x = approach(t.x, nx - 0.5, 0.08);
    t.y = approach(t.y, ny - 0.5, 0.08);

    panel.style.transform = `rotateY(${t.x * 7}deg) rotateX(${-t.y * 6}deg)`;
  }, revealed);

  const current = SERVICES[active];

  return (
    <div
      className={cn(
        "perspective-[1400px] nav:sticky nav:top-28 nav:mx-auto nav:w-full nav:max-w-[min(580px,68vh)]",
        "transition-[opacity,translate] delay-300 duration-[1000ms,1200ms] ease-smooth",
        !revealed && "translate-y-[60px] opacity-0",
      )}
    >
      <div
        ref={panelRef}
        className="relative flex aspect-[4/3.1] min-h-[260px] max-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-[16px] border border-ink/15 bg-[#08080c] text-paper shadow-[0_24px_64px_rgba(11,11,12,0.18)] will-change-transform nav:aspect-[4/3.35] nav:min-h-[440px] nav:shadow-[0_36px_80px_rgba(11,11,12,0.22)]"
      >
        {/* Subtle 12-column blueprint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:8.333%_100%]"
        />

        {/* Top showcase status header */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 nav:px-6 nav:py-4">
          <span className="eyebrow-sm truncate text-white/70 nav:eyebrow">{current.panelLabel}</span>
          <span className="eyebrow-sm shrink-0 text-brand tabular-nums nav:eyebrow">
            {String(active + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
          </span>
        </div>

        {/* Animated slide viewport */}
        <div className="relative flex-1">
          {SLIDES.map((Slide, index) => (
            <ShowcaseSlide key={index} active={index === active}>
              <Slide active={index === active} />
            </ShowcaseSlide>
          ))}
        </div>

        <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-0.5 bg-line-soft">
          <div
            className="h-full bg-brand transition-[width] duration-600 ease-smooth"
            style={{ width: `${((active + 1) / SERVICES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ShowcaseSlide({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      inert={!active}
      className={cn(
        "absolute inset-0 p-4 nav:p-6",
        "transition-[opacity,translate,scale,filter] duration-[600ms,900ms,900ms,600ms] ease-smooth",
        !active && "translate-y-7 scale-96 opacity-0 blur-sm",
      )}
    >
      {children}
    </div>
  );
}
