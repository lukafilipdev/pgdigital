"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  ArrowRightIcon,
  BespokeLayersIcon,
  PartnershipShieldIcon,
  PrecisionIcon,
} from "@/components/ui/Icons";
import { smoothstep } from "@/lib/math";

const PILLARS = [
  {
    index: "01",
    Icon: PrecisionIcon,
    title: "Inženirska natančnost",
    description: "Vsak razmik, tipografija in vrstica kode imajo jasen namen.",
  },
  {
    index: "02",
    Icon: BespokeLayersIcon,
    title: "Brez šablon",
    description: "Spletne strani po meri znamke — od strukture do zadnjega detajla.",
  },
  {
    index: "03",
    Icon: PartnershipShieldIcon,
    title: "Dolgoročna odgovornost",
    description: "Za projektom stojimo tudi dolgo po tem, ko gre v živo.",
  },
] as const;

const COMPARE_ROWS = [
  { label: "NATANČNOST", physical: "Toleranca ±1 mm", digital: "Mreža 8 px" },
  { label: "ODGOVORNOST", physical: "Garancija na izvedbo", digital: "Podpora po objavi" },
  { label: "REZULTAT", physical: "Objekt, ki stoji", digital: "Stran, ki deluje" },
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
 * Leaves the live animated canvas mesh & vertex dots shining cleanly behind frosted
 * architectural cards and crisp unified SVG iconography.
 */
export const OriginStage = forwardRef<OriginStageHandle>(function OriginStage(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<(HTMLElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
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
          root.style.pointerEvents = "none";
        }
        return;
      }
      if (root.style.visibility !== "visible") root.style.visibility = "visible";
      root.style.opacity = "1";
      root.style.pointerEvents = outro > 0.35 ? "auto" : "none";

      const statementSteps = [
        [0.84, 0.885],
        [0.85, 0.895],
        [0.87, 0.92],
        [0.89, 0.94],
        [0.9, 0.945],
      ] as const;
      statementSteps.forEach((step, k) => {
        const el = partRefs.current[k];
        if (!el) return;
        const e = reducedMotion ? 1 : smoothstep(step[0], step[1], P);
        el.style.opacity = e.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - e) * (k === 1 || k === 2 ? 26 : 12)).toFixed(2)}px, 0)`;
      });

      if (panelRef.current) {
        const mAlpha = reducedMotion ? 1 : smoothstep(0.86, 0.93, P);
        const shift = reducedMotion ? 0 : -mouseX * 10;
        panelRef.current.style.opacity = mAlpha.toFixed(3);
        panelRef.current.style.transform = `translate3d(${shift.toFixed(2)}px, ${((1 - mAlpha) * 20).toFixed(2)}px, 0)`;
      }

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
      className="pointer-events-none absolute inset-0 flex flex-col justify-center overflow-hidden px-[clamp(18px,3.6vw,56px)] pt-[78px] pb-[clamp(22px,3.8vh,44px)] nav:pt-[92px]"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[clamp(20px,3.6vh,40px)]">
        {/* Top Two-Column Editorial Statement + "Prostor -> Zaslon" Blueprint Comparison Card */}
        <div className="grid grid-cols-1 items-stretch gap-5 nav:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] nav:gap-8">
          <div className="flex flex-col items-start justify-center rounded-[16px] border border-white/12 bg-[#0b0b0e]/95 px-5 py-4 text-left shadow-[0_28px_68px_rgba(0,0,0,0.65)] backdrop-blur-[10px] nav:px-8 nav:py-7">
            <div
              ref={(el) => {
                partRefs.current[0] = el;
              }}
              className="eyebrow mb-[clamp(12px,2vh,22px)] inline-flex items-center gap-3.5 text-soft"
            >
              <span className="text-brand">02</span>
              <span aria-hidden className="h-px w-6 bg-white/25" />
              <span>IZVOR · PG INŽENIRING</span>
            </div>

            <h2 className="text-[clamp(38px,10.2vw,58px)] leading-[0.93] font-extrabold tracking-[-0.048em] text-white nav:text-[clamp(48px,4.9vw,84px)] nav:leading-[0.92]">
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
              className="mt-[clamp(12px,1.8vh,20px)] max-w-[460px] text-[14.5px] leading-[1.5] text-soft nav:text-[clamp(16.5px,1.3vw,20px)]"
            >
              Ista natančnost. Ista odgovornost.{" "}
              <span className="font-medium text-white">Nov medij.</span>
            </p>

            <a
              ref={(el) => {
                partRefs.current[4] = el;
              }}
              href="#storitve"
              data-cursor="link"
              className="group mt-5 hidden items-center gap-2.5 border-b border-white/25 pb-2.5 font-display text-[15px] font-bold text-white transition-colors duration-300 hover:border-brand hover:text-brand nav:inline-flex"
            >
              <span>Kaj gradimo</span>
              <ArrowRightIcon
                size={16}
                className="text-brand transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>

          {/* Right (Desktop): "Isti standard · Prostor -> Zaslon" Blueprint Comparison Card */}
          <div
            ref={panelRef}
            className="hidden flex-col overflow-hidden rounded-[16px] border border-white/12 bg-[#0b0b0e]/96 shadow-[0_36px_76px_rgba(0,0,0,0.65)] backdrop-blur-[12px] will-change-transform nav:flex"
            style={{ opacity: 0 }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-3.5 font-mono text-[10.5px] font-semibold tracking-[.14em] uppercase">
              <span className="text-muted">ISTI STANDARD</span>
              <span className="inline-flex items-center gap-1.5 text-brand">
                <span>PROSTOR</span>
                <ArrowRightIcon size={13} />
                <span>ZASLON</span>
              </span>
            </div>

            {/* Side-by-side Technical Blueprint Diagrams (1200 mm vs 1200 px) */}
            <div className="grid grid-cols-2 border-b border-white/[0.08]">
              {/* Left: Gradbeni načrt */}
              <div className="flex flex-col gap-4 border-r border-white/[0.08] p-5">
                <span className="font-mono text-[10.5px] font-semibold tracking-[.14em] uppercase text-muted">
                  GRADBENI NAČRT
                </span>
                <div className="relative mt-2 ml-4 h-[92px] rounded-[2px] border-[1.5px] border-dashed border-white/40">
                  <div className="absolute inset-x-0 -top-[18px] flex items-center gap-1.5">
                    <span className="h-2 w-px bg-white/45" />
                    <span className="h-px flex-1 bg-white/45" />
                    <span className="font-mono text-[9.5px] text-soft tabular-nums">1200 mm</span>
                    <span className="h-px flex-1 bg-white/45" />
                    <span className="h-2 w-px bg-white/45" />
                  </div>
                  <div className="absolute inset-y-0 -left-4 flex flex-col items-center gap-1">
                    <span className="h-px w-2 bg-white/45" />
                    <span className="w-px flex-1 bg-white/45" />
                    <span className="h-px w-2 bg-white/45" />
                  </div>
                </div>
              </div>

              {/* Right: Spletna mreža */}
              <div className="flex flex-col gap-4 bg-brand/[0.06] p-5">
                <span className="font-mono text-[10.5px] font-semibold tracking-[.14em] uppercase text-brand">
                  SPLETNA MREŽA
                </span>
                <div className="relative mt-2 ml-4 h-[92px] rounded-[10px] border-[1.5px] border-brand bg-[linear-gradient(90deg,rgba(245,117,30,0.18)_1px,transparent_1px)] bg-[length:8.333%_100%]">
                  <div className="absolute inset-x-0 -top-[18px] flex items-center gap-1.5">
                    <span className="h-2 w-px bg-white/45" />
                    <span className="h-px flex-1 bg-white/45" />
                    <span className="font-mono text-[9.5px] text-soft tabular-nums">1200 px</span>
                    <span className="h-px flex-1 bg-white/45" />
                    <span className="h-2 w-px bg-white/45" />
                  </div>
                  <div className="absolute inset-y-0 -left-4 flex flex-col items-center gap-1">
                    <span className="h-px w-2 bg-white/45" />
                    <span className="w-px flex-1 bg-white/45" />
                    <span className="h-px w-2 bg-white/45" />
                  </div>
                </div>
              </div>
            </div>

            {/* Three Engineering Standard Comparison Rows */}
            {COMPARE_ROWS.map((row, idx) => (
              <div
                key={row.label}
                className={
                  "grid grid-cols-2 " +
                  (idx < COMPARE_ROWS.length - 1 ? "border-b border-white/[0.08]" : "")
                }
              >
                <div className="flex flex-col gap-0.5 border-r border-white/[0.08] px-6 py-3">
                  <span className="font-mono text-[9.5px] font-semibold tracking-[.14em] uppercase text-dim">
                    {row.label}
                  </span>
                  <span className="text-[15px] font-semibold text-soft">{row.physical}</span>
                </div>
                <div className="flex flex-col gap-0.5 bg-brand/[0.06] px-6 py-3">
                  <span className="font-mono text-[9.5px] font-semibold tracking-[.14em] uppercase text-dim">
                    {row.label}
                  </span>
                  <span className="text-[15px] font-semibold text-white">{row.digital}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three Frosted Dark Architectural Pillar Cards with Crisp Bespoke Icons */}
        <div className="grid w-full grid-cols-1 gap-2.5 nav:grid-cols-3 nav:gap-4">
          {PILLARS.map(({ index, Icon, title, description }, idx) => (
            <div
              key={index}
              ref={(el) => {
                pillarRefs.current[idx] = el;
              }}
              className="relative flex flex-col justify-between gap-2 rounded-[12px] border border-white/12 bg-[#0b0b0e]/95 px-4 py-3 backdrop-blur-[10px] transition-colors duration-300 hover:border-brand/50 nav:gap-5 nav:rounded-[16px] nav:p-6"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-[8px] border border-brand/30 bg-brand/10 text-brand nav:size-9 nav:rounded-[10px]">
                    <Icon size={16} className="nav:size-[18px]" />
                  </span>
                  <span className="eyebrow-sm text-brand nav:eyebrow">{index}</span>
                </div>
                <span
                  ref={(el) => {
                    ruleRefs.current[idx] = el;
                  }}
                  aria-hidden
                  className="h-[2px] w-7 origin-left bg-brand nav:w-9"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <div className="flex flex-col gap-0.5 nav:gap-1.5">
                <h3 className="text-[14px] font-extrabold tracking-[-0.025em] text-white nav:text-[clamp(18px,1.5vw,23px)] nav:leading-[1.1]">
                  {title}
                </h3>
                <p className="text-[12px] leading-snug text-pretty text-white/60 nav:text-[14.5px] nav:leading-[1.52] nav:text-soft">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
