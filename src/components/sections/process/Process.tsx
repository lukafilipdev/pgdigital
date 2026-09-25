"use client";

import { useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROCESS_STEPS } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { approach, padNumber } from "@/lib/math";
import { getPinProgress } from "@/lib/scroll";
import { BrowserMock, layerReveal, REVEAL_LAYERS, type BrowserMockHandle } from "./BrowserMock";

/** Scroll overshoot so the final layer is fully revealed before unpinning. */
const STAGE_SCALE = 3.4;

type Step = { index: number; direction: 1 | -1 };

/** Pinned section walking through Ideja → Oblika → Razvoj → Objava. */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockRef = useRef<BrowserMockHandle>(null);
  const progress = useRef(0);
  const [step, setStep] = useState<Step>({ index: 0, direction: 1 });
  const visible = useInViewport(sectionRef);
  const reducedMotion = useReducedMotion();

  useFrame((now) => {
    const section = sectionRef.current;
    if (!section) return;

    const target = getPinProgress(section);
    progress.current = reducedMotion ? target : approach(progress.current, target, 0.12);
    const stage = progress.current * STAGE_SCALE;
    mockRef.current?.render(stage, now / 1000);

    let index = 0;
    for (let k = 0; k < REVEAL_LAYERS; k++) if (layerReveal(k, stage) > 0.5) index = k + 1;
    setStep((prev) =>
      prev.index === index ? prev : { index, direction: index > prev.index ? 1 : -1 },
    );
  }, visible);

  return (
    <section
      id="proces"
      ref={sectionRef}
      aria-labelledby="proces-h"
      className="relative h-[320vh] border-t border-line-soft"
    >
      <div className="sticky top-0 grid h-svh grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] content-center items-center gap-[clamp(24px,5vw,80px)] overflow-hidden px-[clamp(18px,3vw,40px)] pt-[clamp(76px,10vh,110px)] pb-[clamp(24px,5vh,56px)]">
        <div className="flex flex-col gap-[clamp(18px,4vh,44px)]">
          <SectionLabel index="04">PROCES</SectionLabel>
          <h2
            id="proces-h"
            aria-live="polite"
            className="h-[1.08em] overflow-hidden text-[clamp(64px,10vw,190px)] leading-[1.08] font-extrabold tracking-[-.065em]"
          >
            <span
              key={step.index}
              className={cn(
                "block will-change-transform motion-reduce:animate-none",
                step.direction > 0 ? "animate-slide-in-up" : "animate-slide-in-down",
              )}
            >
              {PROCESS_STEPS[step.index].word}
            </span>
          </h2>
          <ol className="grid grid-cols-4 gap-2.5">
            {PROCESS_STEPS.map(({ name }, k) => (
              <li
                key={name}
                aria-current={k === step.index ? "step" : undefined}
                className={cn(
                  "eyebrow flex gap-2.5 border-t-2 pt-3 text-white transition-[opacity,border-color] duration-400",
                  k === step.index ? "border-brand" : "border-line-strong",
                  k === step.index ? "opacity-100" : k < step.index ? "opacity-55" : "opacity-30",
                )}
              >
                <span className="text-brand">{padNumber(k + 1, 2)}</span>
                <span>{name}</span>
              </li>
            ))}
          </ol>
        </div>

        <BrowserMock ref={mockRef} step={step.index} />
      </div>
    </section>
  );
}
