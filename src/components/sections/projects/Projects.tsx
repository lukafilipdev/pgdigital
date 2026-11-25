"use client";

import { useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROJECTS } from "@/content/site";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";
import { padNumber } from "@/lib/math";
import { CaseStudyDialog } from "./CaseStudyDialog";
import { ProjectCard } from "./ProjectCard";

type OpenCase = { index: number; origin: DOMRect };

/**
 * Editorial flagship portfolio section showcasing finished client work in
 * full-bleed interactive spreads, followed by a prominent "Vaš projekt" CTA.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInViewOnce(sectionRef);
  const [openCase, setOpenCase] = useState<OpenCase | null>(null);

  return (
    <section
      id="projekti"
      ref={sectionRef}
      aria-labelledby="projekti-h"
      className="relative bg-black px-[clamp(18px,3.2vw,48px)] py-[clamp(96px,14vh,168px)] text-white"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[clamp(44px,7vh,80px)]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-[22px] nav:gap-4">
            <SectionLabel index="04">PROJEKTI</SectionLabel>
            <h2
              id="projekti-h"
              className="overflow-hidden pb-[.06em] text-[clamp(48px,8vw,148px)] leading-[.92] font-extrabold tracking-[-.048em] nav:text-[clamp(56px,6vw,104px)]"
            >
              <span
                className={cn(
                  "block transition-transform duration-1100 ease-smooth",
                  !revealed && "translate-y-[105%]",
                )}
              >
                Izbrano delo.
              </span>
            </h2>
          </div>

          <div
            className={cn(
              "flex max-w-[380px] flex-col items-start gap-3 transition-opacity delay-300 duration-1000 nav:items-end nav:text-right",
              !revealed && "opacity-0",
            )}
          >
            <span className="eyebrow flex items-center gap-2 text-brand">
              <span className="size-1.5 rounded-full bg-brand" />
              {padNumber(PROJECTS.length, 2)} OBJAVLJENA PROJEKTA · 2026
            </span>
            <p className="text-base leading-normal text-pretty text-subtle">
              Vsaka spletna stran je zgrajena od temeljev — po meri znamke, brez šablon in kompromisov.
            </p>
          </div>
        </div>

        {/* Flagship Project Spreads */}
        <div className="flex flex-col gap-[clamp(28px,4.5vh,52px)]">
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              onOpen={(origin) => setOpenCase({ index, origin })}
            />
          ))}
        </div>

        {/* Monumental "Vaš projekt" CTA Banner */}
        <a
          href="#kontakt"
          data-cursor="link"
          className="group relative flex flex-col justify-between gap-7 overflow-hidden rounded-md border border-white/[0.12] bg-[#08080b] p-6 transition-colors duration-500 hover:border-brand/60 sm:p-10 nav:flex-row nav:items-center nav:p-14"
        >
          {/* Subtle architectural grid backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(245,117,30,0.16),transparent_68%)] transition-transform duration-700 group-hover:scale-125"
          />

          <div className="relative z-10 flex flex-col gap-3.5">
            <div className="eyebrow flex items-center gap-2.5 text-brand">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              <span>
                {padNumber(PROJECTS.length + 1, 2)} — VAŠ PROJEKT · PROSTI TERMINI 2026
              </span>
            </div>
            <div className="text-[clamp(32px,4.4vw,68px)] leading-[0.96] font-extrabold tracking-[-0.055em] text-white transition-colors duration-300 group-hover:text-white">
              Naslednji je lahko <span className="text-brand">vaš.</span>
            </div>
            <p className="max-w-[520px] text-[15px] leading-relaxed text-soft">
              Povejte nam za svoj cilj — pripravimo jasen načrt, oblikovno smer in časovnico izvedbe.
            </p>
          </div>

          <span className="eyebrow relative z-10 inline-flex h-13 shrink-0 items-center justify-center gap-2.5 rounded-full bg-brand px-7 font-bold text-black transition-all duration-400 group-hover:bg-white">
            <span>ZAČNIMO PROJEKT</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-400 ease-smooth group-hover:translate-x-1.5"
            >
              →
            </span>
          </span>
        </a>
      </div>

      {openCase && (
        <CaseStudyDialog
          index={openCase.index}
          origin={openCase.origin}
          onNext={() =>
            setOpenCase((current) => current && { ...current, index: (current.index + 1) % PROJECTS.length })
          }
          onClose={() => setOpenCase(null)}
        />
      )}
    </section>
  );
}
