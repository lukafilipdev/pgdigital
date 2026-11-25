"use client";

import { useRef, useState } from "react";
import { SectionCodeField } from "@/components/effects/SectionCodeField";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROCESS_STEPS } from "@/content/site";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const WEEKS = ["T1", "T2", "T3", "T4", "T5", "T6"] as const;

/**
 * 05 · PROCES — Interactive 6-week Gantt timeline card paired with four vertically
 * connected delivery phases on Warm Stone (#F4F1EC). Hovering or clicking any step
 * or Gantt bar synchronizes active/completed states cleanly.
 */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInViewOnce(sectionRef);
  const [active, setActive] = useState(0);

  return (
    <section
      id="proces"
      data-theme="light"
      ref={sectionRef}
      aria-labelledby="proces-h"
      className="relative overflow-hidden bg-paper bg-mesh-light px-[clamp(18px,3.2vw,48px)] py-[clamp(96px,13vh,156px)] text-ink"
    >
      <SectionCodeField tone="light" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-[clamp(28px,4.5vw,64px)] nav:grid-cols-12">
        {/* Sticky Left Column: Floating Warm Stone Card so code never overlaps text */}
        <div className="flex flex-col gap-6 rounded-[18px] border border-ink/12 bg-paper/95 p-6 shadow-[0_24px_60px_rgba(11,11,12,0.07)] backdrop-blur-[8px] sm:p-8 nav:sticky nav:top-28 nav:col-span-5">
          <SectionLabel index="05" tone="light">
            PROCES
          </SectionLabel>
          <h2
            id="proces-h"
            className="overflow-hidden pb-[.06em] text-[clamp(44px,6.2vw,96px)] leading-[.93] font-extrabold tracking-[-.048em] text-ink"
          >
            <span
              className={cn(
                "block transition-transform duration-1100 ease-smooth",
                !revealed && "translate-y-[105%]",
              )}
            >
              Od prvega pogovora do{" "}
              <span className="text-brand">objave.</span>
            </span>
          </h2>
          <p
            className={cn(
              "max-w-[38ch] text-[16px] leading-relaxed text-pretty text-ink-soft transition-opacity delay-200 duration-900",
              !revealed && "opacity-0",
            )}
          >
            Štirje jasni koraki z določenimi roki, fiksnim obsegom in{" "}
            <span className="font-semibold text-ink">100 % lastništvom kode.</span>
          </p>

          {/* Interactive 6-Week Gantt Timeline Overview */}
          <div
            className={cn(
              "flex flex-col gap-2.5 rounded-[16px] border border-ink/10 bg-white/55 p-5 transition-[opacity,translate] delay-250 duration-900 ease-smooth",
              !revealed && "translate-y-4 opacity-0",
            )}
          >
            <div className="grid grid-cols-6 gap-1 border-b border-ink/10 pb-2 font-mono text-[10px] font-semibold tracking-[.1em] text-ink-muted">
              {WEEKS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            {PROCESS_STEPS.map((phase, idx) => {
              const isActive = idx === active;
              const isDone = idx < active;
              return (
                <button
                  key={phase.index}
                  type="button"
                  data-cursor="link"
                  aria-label={`${phase.index} ${phase.word} (${phase.timeline})`}
                  onMouseEnter={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  onClick={() => setActive(idx)}
                  className="grid w-full cursor-pointer grid-cols-6 gap-1 text-left"
                >
                  <span
                    style={{ gridColumn: phase.col }}
                    className={cn(
                      "flex h-7 items-center rounded-[6px] px-2.5 font-mono text-[10px] font-semibold tracking-[.1em] transition-colors duration-250",
                      isActive
                        ? "bg-brand text-ink"
                        : isDone
                          ? "bg-ink text-paper"
                          : "bg-[#e4dfd7] text-ink-muted hover:bg-[#dad4ca]",
                    )}
                  >
                    {phase.index}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              "mt-1 flex flex-wrap items-center gap-5 transition-[opacity,translate] delay-350 duration-900 ease-smooth",
              !revealed && "translate-y-4 opacity-0",
            )}
          >
            <a
              href="#kontakt"
              data-cursor="link"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-6 font-display text-[13.5px] font-extrabold tracking-[.04em] text-white transition-colors duration-300 hover:bg-brand hover:text-ink"
            >
              <span>Začnimo projekt</span>
              <ArrowRightIcon
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
            <span className="eyebrow-sm text-ink-muted">
              <span className="text-ink">4–6 TEDNOV</span> DO OBJAVE
            </span>
          </div>
        </div>

        {/* Right Column: Four Interactive Vertically Connected Phases on Floating Warm Stone Card */}
        <ol className="relative flex flex-col rounded-[18px] border border-ink/12 bg-paper/95 p-6 shadow-[0_24px_60px_rgba(11,11,12,0.07)] backdrop-blur-[8px] sm:p-8 nav:col-span-7">
          {PROCESS_STEPS.map((phase, idx) => {
            const isActive = idx === active;
            const isDone = idx < active;
            const isLast = idx === PROCESS_STEPS.length - 1;
            return (
              <li
                key={phase.index}
                onMouseEnter={() => setActive(idx)}
                onClick={() => setActive(idx)}
                className="group grid cursor-pointer grid-cols-[44px_minmax(0,1fr)] gap-x-5 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-x-6"
              >
                {/* Node + Connecting Spine */}
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono text-[12.5px] font-semibold transition-colors duration-250 sm:size-12 sm:text-[13px]",
                      isActive
                        ? "border-brand bg-brand text-ink"
                        : isDone
                          ? "border-ink bg-ink text-paper"
                          : "border-ink/20 bg-paper text-ink group-hover:border-ink/45",
                    )}
                  >
                    {phase.index}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        "min-h-[28px] w-[2px] flex-1 transition-colors duration-300",
                        isDone
                          ? "bg-ink"
                          : isActive
                            ? "bg-[linear-gradient(to_bottom,#f5751e,rgba(11,11,12,0.14))]"
                            : "bg-ink/14",
                      )}
                    />
                  )}
                </div>

                {/* Phase Content */}
                <div className={cn("flex flex-col gap-3 pt-1.5", !isLast && "pb-[clamp(28px,4vh,46px)]")}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                    <h3
                      className={cn(
                        "text-[clamp(22px,2.3vw,34px)] leading-[1.06] font-extrabold tracking-[-0.035em] transition-colors duration-250",
                        isActive ? "text-ink" : "text-ink/55 group-hover:text-ink/85",
                      )}
                    >
                      {phase.word}
                    </h3>
                    <span
                      className={cn(
                        "eyebrow-sm shrink-0 rounded-full border px-3 py-1 transition-colors duration-250",
                        isActive
                          ? "border-brand/50 text-[#b4500c]"
                          : "border-ink/14 text-ink-muted",
                      )}
                    >
                      {phase.timeline}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "max-w-[50ch] text-[15.5px] leading-[1.62] text-pretty transition-colors duration-250",
                      isActive ? "text-ink-soft" : "text-ink-muted",
                    )}
                  >
                    {phase.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
