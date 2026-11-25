"use client";

import { useRef } from "react";
import { useFrame } from "@/hooks/useFrame";
import { useReducedMotion } from "@/hooks/useMediaQuery";

const PALETTE_TOKENS = [
  { label: "OBSIDIAN", hex: "#0B0B0C", swatchClass: "bg-[#0b0b0c] ring-1 ring-white/25" },
  { label: "KAMEN", hex: "#F4F1EC", swatchClass: "bg-paper ring-1 ring-white/15" },
  { label: "POUDAREK", hex: "#F5751E", swatchClass: "bg-brand" },
  { label: "GRAFIT", hex: "#1C1C20", swatchClass: "bg-[#1c1c20] ring-1 ring-white/20" },
] as const;

const TYPE_SCALE = [
  { role: "H1", size: "168 px", className: "text-[clamp(15px,1.9vw,24px)] font-bold tracking-[-.04em] text-white" },
  { role: "H2", size: "84 px", className: "text-[clamp(13px,1.3vw,17px)] font-semibold tracking-[-.02em] text-white/80" },
  { role: "Besedilo", size: "16 px", className: "text-[12px] nav:text-[13px] text-white/55" },
] as const;

/** Web design: refined Swiss type specimen and color token board with breathing variable weight. */
export function TypographySlide({ active }: { active: boolean }) {
  const specimenRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useFrame((now) => {
    const weight = 500 + 300 * (0.5 + 0.5 * Math.sin((now / 1000) * 1.4));
    if (specimenRef.current) specimenRef.current.style.fontWeight = String(Math.round(weight));
  }, active && !reducedMotion);

  return (
    <div className="relative grid size-full grid-cols-6 grid-rows-[auto_1fr_auto] gap-3 nav:gap-4">
      {/* Subtle architectural 12-column blueprint guides */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[8%] grid grid-cols-12 gap-2 px-[6%] nav:-inset-[6%]"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="border-x border-white/[0.035]" />
        ))}
      </div>

      <div className="relative col-span-full flex items-center justify-between gap-2 border-b border-white/10 pb-2 nav:pb-2.5">
        <span className="eyebrow-sm text-white/75 nav:eyebrow">TIPOGRAFSKI SISTEM · BRICOLAGE</span>
        <span className="eyebrow-sm hidden text-brand sm:inline">12-STOLPČNA MREŽA</span>
      </div>

      <div className="relative col-[1/4] flex flex-col justify-center sm:col-[1/5]">
        <div
          ref={specimenRef}
          className="font-display text-[clamp(64px,16vw,124px)] leading-[.82] font-extrabold tracking-[-.06em] text-paper nav:text-[clamp(92px,15vh,164px)]"
        >
          Aa
        </div>
        <span className="eyebrow-sm mt-2 text-white/40">BRICOLAGE · 500–800</span>
      </div>

      <div className="relative col-[4/7] flex flex-col justify-center gap-2 border-l border-white/10 pl-3 sm:col-[5/7] nav:gap-3 nav:pl-4">
        {TYPE_SCALE.map((row) => (
          <div key={row.role} className="flex flex-col">
            <span className={row.className}>{row.role}</span>
            <span className="font-mono text-[10px] tracking-[.12em] text-white/45">{row.size}</span>
          </div>
        ))}
      </div>

      <div className="relative col-span-full grid grid-cols-4 gap-1.5 nav:gap-2">
        {PALETTE_TOKENS.map(({ label, hex, swatchClass }) => (
          <div
            key={label}
            className="flex flex-col gap-1.5 rounded-sm border border-white/10 bg-white/[0.03] px-2 py-1.5 nav:px-2.5 nav:py-2"
          >
            <span className={`h-2.5 w-full rounded-[2px] nav:h-3 ${swatchClass}`} />
            <div className="flex flex-col">
              <span className="font-mono text-[8.5px] font-semibold tracking-[.12em] text-white/80 nav:text-[9px]">
                {label}
              </span>
              <span className="hidden font-mono text-[8.5px] tracking-[.06em] text-white/40 sm:block">
                {hex}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
