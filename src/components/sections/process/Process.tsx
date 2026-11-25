"use client";

import { useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROCESS_STEPS } from "@/content/site";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

/**
 * 05 · PROCES — Clean, calm, easy-to-read Swiss delivery roadmap on Warm Stone (#F4F1EC).
 * Sticky left overview paired with four uncluttered numbered phases.
 */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInViewOnce(sectionRef);

  return (
    <section
      id="proces"
      data-theme="light"
      ref={sectionRef}
      aria-labelledby="proces-h"
      className="relative bg-paper px-[clamp(18px,3.2vw,48px)] py-[clamp(96px,13vh,156px)] text-ink"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-[clamp(40px,6vw,96px)] nav:grid-cols-12">
        {/* Sticky Left Column: Bold Headline + Simple Overview */}
        <div className="flex flex-col gap-6 nav:sticky nav:top-28 nav:col-span-5">
          <SectionLabel index="05" tone="light">
            PROCES
          </SectionLabel>
          <h2
            id="proces-h"
            className="overflow-hidden pb-[.06em] text-[clamp(44px,6.4vw,96px)] leading-[.94] font-extrabold tracking-[-.05em] text-ink"
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
              "max-w-[36ch] text-[16px] leading-relaxed text-pretty text-ink-soft transition-opacity delay-250 duration-900",
              !revealed && "opacity-0",
            )}
          >
            Štirje jasni koraki z določenimi roki, fiksnim obsegom in 100 % lastništvom kode.
          </p>

          <div
            className={cn(
              "mt-2 flex flex-wrap items-center gap-5 border-t border-ink-line pt-6 transition-[opacity,translate] delay-350 duration-900 ease-smooth",
              !revealed && "translate-y-4 opacity-0",
            )}
          >
            <a
              href="#kontakt"
              data-cursor="link"
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-6 font-display text-[13px] font-extrabold tracking-[.05em] text-white transition-colors duration-300 hover:bg-brand hover:text-black"
            >
              <span>ZAČNIMO PROJEKT</span>
              <span aria-hidden>→</span>
            </a>
            <span className="eyebrow-sm text-ink-muted">4–6 TEDNOV DO OBJAVE</span>
          </div>
        </div>

        {/* Right Column: Four Clean, Vertically Connected Phases */}
        <ol className="relative flex flex-col nav:col-span-7">
          {PROCESS_STEPS.map((phase, idx) => (
            <PhaseRow
              key={phase.index}
              phase={phase}
              index={idx}
              isFirst={idx === 0}
              isLast={idx === PROCESS_STEPS.length - 1}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function PhaseRow({
  phase,
  index,
  isFirst,
  isLast,
}: {
  phase: (typeof PROCESS_STEPS)[number];
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const visible = useInViewOnce(rowRef);

  return (
    <li
      ref={rowRef}
      className={cn(
        "group relative grid grid-cols-1 gap-2.5 pb-[clamp(30px,4.8vh,48px)] pl-11 transition-[opacity,translate] duration-900 ease-smooth last:pb-0 sm:pl-16",
        !visible && "translate-y-8 opacity-0",
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Vertical connector spine linking 01 -> 02 -> 03 -> 04 */}
      {!isLast && (
        <span
          aria-hidden
          className={cn(
            "absolute top-[22px] bottom-0 left-[15px] w-[1.5px] origin-top bg-ink/15 transition-transform duration-900 ease-smooth sm:top-[26px] sm:left-[21px]",
            visible ? "scale-y-100" : "scale-y-0",
          )}
        />
      )}
      {!isFirst && (
        <span
          aria-hidden
          className="absolute top-0 left-[15px] h-[14px] w-[1.5px] bg-ink/15 sm:left-[21px] sm:h-[18px]"
        />
      )}

      {/* Numbered node anchored directly onto the vertical spine */}
      <span
        aria-hidden
        className={cn(
          "absolute top-1 left-0 flex size-[32px] items-center justify-center rounded-full border-[1.5px] border-ink/20 bg-paper font-display text-[12px] font-extrabold tracking-[-0.02em] text-ink transition-colors duration-350 group-hover:border-brand group-hover:bg-brand group-hover:text-black sm:size-[44px] sm:text-[14px]",
          isFirst && "border-brand bg-brand text-black",
        )}
      >
        {phase.index}
      </span>

      {/* Phase Title, Timeline & Easy-to-Read Summary */}
      <div className={cn("flex flex-col gap-2 pt-1 sm:pt-1.5", !isLast && "border-b border-ink-line pb-[clamp(28px,4.2vh,44px)]")}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-[clamp(22px,2.3vw,32px)] leading-[1.08] font-extrabold tracking-[-0.035em] text-ink">
            {phase.word}
          </h3>
          <span className="eyebrow-sm shrink-0 text-ink-muted">{phase.timeline}</span>
        </div>

        <p className="max-w-[48ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft">
          {phase.description}
        </p>
      </div>
    </li>
  );
}
