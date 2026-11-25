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
    <div className="relative flex size-full flex-col justify-between gap-3 nav:gap-5">
      <div className="grid flex-1 grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-center gap-4 nav:gap-6">
        <div className="flex flex-col justify-center">
          <div
            ref={specimenRef}
            className="font-display text-[clamp(62px,15vw,116px)] leading-[.82] font-extrabold tracking-[-.06em] text-paper nav:text-[clamp(96px,14vh,164px)]"
          >
            Aa
          </div>
          <span className="eyebrow-sm mt-2 text-white/45">BRICOLAGE GROTESQUE · 500–800</span>
        </div>

        <div className="flex flex-col justify-center gap-2 border-l border-white/12 pl-3.5 nav:gap-3.5 nav:pl-5">
          {TYPE_SCALE.map((row) => (
            <div key={row.role} className="flex flex-col">
              <span className={row.className}>{row.role}</span>
              <span className="font-mono text-[10px] tracking-[.12em] text-white/45">{row.size}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 nav:gap-2">
        {PALETTE_TOKENS.map(({ label, hex, swatchClass }) => (
          <div
            key={label}
            className="flex flex-col gap-1.5 rounded-[8px] border border-white/10 bg-white/[0.03] px-2 py-1.5 nav:gap-2 nav:px-2.5 nav:py-2.5"
          >
            <span className={`h-4 w-full rounded-[4px] nav:h-7 ${swatchClass}`} />
            <div className="flex flex-col">
              <span className="font-mono text-[8.5px] font-semibold tracking-[.1em] text-white/80 nav:text-[9.5px]">
                {label}
              </span>
              <span className="hidden font-mono text-[8.5px] tracking-[.06em] text-white/45 sm:block">
                {hex}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
