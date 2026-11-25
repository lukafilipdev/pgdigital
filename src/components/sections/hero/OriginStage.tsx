"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { smoothstep } from "@/lib/math";

const PILLARS = [
  {
    index: "01",
    title: "Inženirska natančnost",
    description: "Vsak razmik, tipografija in vrstica kode imajo jasen namen.",
  },
  {
    index: "02",
    title: "Brez šablon",
    description: "Spletne strani po meri znamke — od strukture do zadnjega detajla.",
  },
  {
    index: "03",
    title: "Dolgoročna odgovornost",
    description: "Za projektom stojimo tudi dolgo po tem, ko gre v živo.",
  },
] as const;

export type OriginStageFrame = {
  progress: number;
  outro: number;
  digitize: number;
  mouseX: number;
  reducedMotion: boolean;
};

export type OriginStageHandle = {
  update: (frame: OriginStageFrame) => void;
};

/**
 * Closing "02 · O nas" ("IZVOR — PG INŽENIRING") showcase inside the pinned hero.
 * Monumental, uncluttered display statement commanding the center of the canvas,
 * grounded cleanly by three crisp Swiss hairline pillars.
 */
export const OriginStage = forwardRef<OriginStageHandle>(function OriginStage(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<(HTMLElement | null)[]>([]);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    update({ progress: P, outro, digitize, mouseX, reducedMotion }) {
      const root = rootRef.current;
      if (!root) return;

      const visible = outro > 0.005;
      if (!visible) {
        if (root.style.visibility !== "hidden") {
          root.style.visibility = "hidden";
          root.style.opacity = "0";
        }
        return;
      }
      if (root.style.visibility !== "visible") root.style.visibility = "visible";
      root.style.opacity = "1";

      if (glowRef.current) {
        const gAlpha = reducedMotion ? 1 : smoothstep(0.83, 0.92, P);
        const shiftX = reducedMotion ? 0 : mouseX * 36;
        glowRef.current.style.opacity = gAlpha.toFixed(3);
        glowRef.current.style.transform = `translate3d(${shiftX.toFixed(2)}px, 0, 0)`;
      }

      const statementSteps = [
        [0.84, 0.885],
        [0.85, 0.895],
        [0.875, 0.925],
        [0.9, 0.945],
      ] as const;
      statementSteps.forEach((step, k) => {
        const el = partRefs.current[k];
        if (!el) return;
        const e = reducedMotion ? 1 : smoothstep(step[0], step[1], P);
        el.style.opacity = e.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - e) * (k === 1 || k === 2 ? 28 : 12)).toFixed(2)}px, 0)`;
      });

      PILLARS.forEach((_, idx) => {
        const pillar = pillarRefs.current[idx];
        const rule = ruleRefs.current[idx];
        const start = 0.88 + idx * 0.016;
        const e = reducedMotion ? 1 : smoothstep(start, start + 0.05, P);

        if (pillar) {
          pillar.style.opacity = e.toFixed(3);
          pillar.style.transform = `translate3d(0, ${((1 - e) * 16).toFixed(2)}px, 0)`;
        }
        if (rule) {
          const draw = reducedMotion ? 1 : smoothstep(idx * 0.18, idx * 0.18 + 0.45, digitize);
          rule.style.transform = `scaleX(${draw.toFixed(4)})`;
        }
      });
    },
  }));

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 flex flex-col justify-center overflow-hidden px-[clamp(18px,3.2vw,48px)] pt-[76px] pb-[clamp(24px,4.5vh,52px)] nav:pt-[86px]"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      {/* Whisper-subtle warm architectural horizon glow */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-18vh] mx-auto h-[46vh] w-[min(92vw,1040px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,117,30,0.14)_0%,rgba(245,117,30,0.03)_42%,transparent_72%)] will-change-transform"
        style={{ opacity: 0 }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[clamp(32px,6vh,76px)]">
        {/* Monumental editorial statement — unmistakable focal point on both mobile and desktop */}
        <div className="flex flex-col items-center text-center">
          <div
            ref={(el) => {
              partRefs.current[0] = el;
            }}
            className="eyebrow mb-[clamp(18px,3vh,34px)] flex items-center gap-3.5 text-soft"
          >
            <span className="text-brand">02</span>
            <span aria-hidden className="h-px w-6 bg-edge" />
            <span>IZVOR · PG INŽENIRING</span>
          </div>
          <h2 className="text-[clamp(42px,11vw,62px)] leading-[0.95] font-extrabold tracking-[-0.045em] nav:text-[clamp(56px,6.4vw,108px)] nav:leading-[0.94] nav:tracking-[-0.048em]">
            <span
              ref={(el) => {
                partRefs.current[1] = el;
              }}
              className="block"
            >
              Gradimo v prostoru.
            </span>
            <span
              ref={(el) => {
                partRefs.current[2] = el;
              }}
              className="block"
            >
              Zdaj tudi <span className="text-brand">digitalno.</span>
            </span>
          </h2>
          <p
            ref={(el) => {
              partRefs.current[3] = el;
            }}
            className="mt-[clamp(16px,2.6vh,32px)] max-w-[34ch] text-[15px] leading-snug tracking-[-0.015em] text-white/78 nav:max-w-[560px] nav:text-[clamp(16px,1.4vw,21px)] nav:leading-relaxed"
          >
            Ista natančnost. Ista odgovornost. Nov medij.
          </p>
        </div>

        {/* Three clean Swiss hairline pillars — quiet secondary add-on on mobile, full architectural footer on desktop */}
        <div className="grid w-full max-w-[1280px] grid-cols-1 gap-2.5 nav:grid-cols-3 nav:gap-12">
          {PILLARS.map((pillar, idx) => (
            <div
              key={pillar.index}
              ref={(el) => {
                pillarRefs.current[idx] = el;
              }}
              className="relative border-t border-white/10 pt-2.5 nav:border-white/12 nav:pt-5"
              style={{ opacity: 0 }}
            >
              <span
                ref={(el) => {
                  ruleRefs.current[idx] = el;
                }}
                aria-hidden
                className="absolute -top-px left-0 h-[1.5px] w-8 origin-left bg-brand nav:w-12"
                style={{ transform: "scaleX(0)" }}
              />
              <div className="flex items-baseline gap-2 nav:gap-3">
                <span className="eyebrow-sm text-brand nav:eyebrow">{pillar.index}</span>
                <h3 className="text-[13px] font-semibold tracking-[-0.02em] text-white/82 nav:text-[18px] nav:font-bold nav:tracking-[-0.03em] nav:text-white">
                  {pillar.title}
                </h3>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-snug text-pretty text-white/48 nav:mt-2.5 nav:max-w-[34ch] nav:text-sm nav:leading-relaxed nav:text-subtle">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
