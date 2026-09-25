"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { PROCESS_STEPS } from "@/content/site";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { smoothstep } from "@/lib/math";
import { DesignLayer, DevelopmentLayer, LiveLayer, SketchLayer } from "./mock/MockLayers";

/** Number of layers wiped in on top of the sketch. */
export const REVEAL_LAYERS = 3;

/** How far layer `k` has been wiped in, for a scroll `stage` of 0…REVEAL_LAYERS. */
export const layerReveal = (k: number, stage: number) => smoothstep(k + 0.2, k + 1, stage);

export type BrowserMockHandle = {
  /** Applies the reveal state for the given stage; `t` is in seconds. */
  render: (stage: number, t: number) => void;
};

type BrowserMockProps = {
  ref: Ref<BrowserMockHandle>;
  step: number;
};

/** A browser window whose content evolves from sketch to live site. */
export function BrowserMock({ ref, step }: BrowserMockProps) {
  const designRef = useRef<HTMLDivElement>(null);
  const developmentRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useImperativeHandle(
    ref,
    () => ({
      render(stage, t) {
        let scanAt = -1;
        [designRef, developmentRef, liveRef].forEach(({ current: layer }, k) => {
          if (!layer) return;
          const reveal = layerReveal(k, stage);
          layer.style.clipPath = `inset(0 ${(1 - reveal) * 100}% 0 0)`;
          if (reveal > 0 && reveal < 1) scanAt = reveal;
        });

        const scan = scanRef.current;
        if (scan) {
          scan.style.opacity = scanAt >= 0 ? "1" : "0";
          if (scanAt >= 0) scan.style.left = `${scanAt * 100}%`;
        }
        if (sunRef.current && !reducedMotion) {
          sunRef.current.style.transform = `translate3d(${Math.sin(t * 0.8) * 8}%,${Math.cos(t * 0.6) * 6}%,0)`;
        }
      },
    }),
    [reducedMotion],
  );

  return (
    <div
      aria-hidden
      className="relative aspect-[16/10.5] max-h-[62vh] w-full justify-self-center overflow-hidden rounded-md border border-line-strong bg-[#050505]"
    >
      <div className="eyebrow-sm absolute inset-x-0 top-0 z-5 flex h-[34px] items-center gap-3 border-b border-line bg-[#050505] px-3.5 text-muted">
        <span className={cn("size-1.5 rounded-full", step === 3 ? "bg-brand" : "bg-[#444]")} />
        <span className="flex-1 tracking-[.08em] text-[#bdbdbd]">vasaznamka.si</span>
        <span>{PROCESS_STEPS[step].name}</span>
      </div>

      <div className="absolute inset-x-0 top-[34px] bottom-0">
        <SketchLayer />
        <DesignLayer ref={designRef} />
        <DevelopmentLayer ref={developmentRef} />
        <LiveLayer ref={liveRef} sunRef={sunRef} />
        <div
          ref={scanRef}
          className="pointer-events-none absolute inset-y-0 left-0 w-px bg-brand opacity-0 shadow-[0_0_18px_2px_rgba(245,117,30,.5)]"
        />
      </div>
    </div>
  );
}
