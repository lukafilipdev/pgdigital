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
  /**
   * Inline (phones): shown under the active service, square so the slides
   * have room. Otherwise a sticky panel next to the list.
   */
  inline?: boolean;
  className?: string;
};

/** Panel illustrating the active service; tilts towards the pointer. */
export function ServiceShowcase({ active, revealed, inline = false, className }: ServiceShowcaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0, glowX: 0.5, glowY: 0.5 });
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
    t.glowX = approach(t.glowX, nx, 0.1);
    t.glowY = approach(t.glowY, ny, 0.1);

    panel.style.transform = `rotateY(${t.x * 7}deg) rotateX(${-t.y * 6}deg)`;
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${(t.glowX - 0.3) * box.width}px,${(t.glowY - 0.4) * box.height}px,0)`;
    }
  }, revealed);

  return (
    <div
      className={cn(
        "perspective-[1400px]",
        inline
          ? "animate-fade-in-up motion-reduce:animate-none"
          : "sticky top-[max(96px,calc(50vh-270px))] transition-[opacity,translate] delay-300 duration-[1000ms,1200ms] ease-smooth",
        !inline && !revealed && "translate-y-[60px] opacity-0",
        className,
      )}
    >
      <div
        ref={panelRef}
        className={cn(
          "relative overflow-hidden rounded-sm border border-line bg-[#070707] will-change-transform",
          inline ? "aspect-square" : "aspect-[4/3.1] max-h-[calc(100vh-150px)]",
        )}
      >
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 aspect-square w-3/5 rounded-full bg-[radial-gradient(circle,rgba(245,117,30,.12),rgba(245,117,30,0)_65%)] will-change-transform"
        />

        {SLIDES.map((Slide, index) => (
          <ShowcaseSlide key={index} active={index === active}>
            <Slide active={index === active} />
          </ShowcaseSlide>
        ))}

        <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-line-soft">
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
        "absolute inset-0 p-[8%]",
        "transition-[opacity,translate,scale,filter] duration-[600ms,900ms,900ms,600ms] ease-smooth",
        !active && "translate-y-7 scale-96 opacity-0 blur-sm",
      )}
    >
      {children}
    </div>
  );
}
