"use client";

import { useRef } from "react";
import { useFrame } from "@/hooks/useFrame";
import { useReducedMotion } from "@/hooks/useMediaQuery";

const SWATCHES = ["bg-black border border-edge", "bg-white", "bg-brand", "bg-[#171717]"];

/** Web design: type specimen over a 12-column grid, with a breathing variable weight. */
export function TypographySlide({ active }: { active: boolean }) {
  const specimenRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useFrame((now) => {
    const weight = 500 + 300 * (0.5 + 0.5 * Math.sin((now / 1000) * 1.4));
    if (specimenRef.current) specimenRef.current.style.fontWeight = String(Math.round(weight));
  }, active && !reducedMotion);

  return (
    <div className="grid size-full grid-cols-6 grid-rows-[auto_1fr_auto] gap-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid grid-cols-12 gap-2.5 px-[5%]"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="border-x border-brand/22 bg-brand/5" />
        ))}
      </div>

      <div className="eyebrow relative col-span-full text-muted">TIPOGRAFSKI SISTEM · GEIST</div>
      <div
        ref={specimenRef}
        className="relative col-[1/5] self-center text-[clamp(90px,13vw,220px)] leading-[.8] font-extrabold tracking-[-.07em]"
      >
        Aa
      </div>
      <div className="relative col-[5/7] flex flex-col justify-center gap-2.5">
        <span className="text-[clamp(16px,2vw,28px)] font-bold tracking-[-.04em]">H1 · 168</span>
        <span className="text-[clamp(13px,1.3vw,18px)] font-semibold text-[#ddd]">H2 · 84</span>
        <span className="text-[13px] text-[#aaa]">Besedilo · 16</span>
      </div>
      <div className="relative col-span-full flex gap-2.5">
        {SWATCHES.map((swatch) => (
          <span key={swatch} className={`h-9 flex-1 ${swatch}`} />
        ))}
      </div>
    </div>
  );
}
