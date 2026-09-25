"use client";

import { useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROJECTS } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { approach, padNumber } from "@/lib/math";
import { getPinProgress } from "@/lib/scroll";
import { CaseStudyDialog } from "./CaseStudyDialog";
import { ProjectCard } from "./ProjectCard";

type OpenCase = { index: number; origin: DOMRect };

/** Pinned section whose vertical scroll drives a horizontal project track. */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const [openCase, setOpenCase] = useState<OpenCase | null>(null);
  const visible = useInViewport(sectionRef);
  const reducedMotion = useReducedMotion();

  useFrame(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const target = getPinProgress(section);
    progress.current = reducedMotion ? target : approach(progress.current, target, 0.12);
    const q = progress.current;

    const maxShift = Math.max(0, track.scrollWidth - window.innerWidth);
    track.style.transform = `translate3d(${-maxShift * q}px,0,0)`;

    const current = Math.min(PROJECTS.length - 1, Math.floor(q * PROJECTS.length)) + 1;
    if (counterRef.current) counterRef.current.textContent = padNumber(current, 2);
    if (barRef.current) barRef.current.style.transform = `scaleX(${q})`;
  }, visible);

  return (
    <section
      id="projekti"
      ref={sectionRef}
      aria-labelledby="projekti-h"
      className="relative h-[260vh] border-t border-line-soft"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-x-[clamp(18px,3vw,40px)] top-[clamp(84px,12vh,120px)] flex items-start justify-between gap-5">
          <div className="flex flex-col gap-[18px]">
            <SectionLabel index="03">PROJEKTI</SectionLabel>
            <h2
              id="projekti-h"
              className="text-[clamp(34px,4.4vw,76px)] leading-[.95] font-bold tracking-[-.055em]"
            >
              Izbrano delo.
            </h2>
          </div>
          <div aria-hidden className="eyebrow flex items-center gap-3.5 text-muted">
            <span ref={counterRef} className="text-white">
              01
            </span>
            <span className="relative h-px w-[60px] overflow-hidden bg-line-strong">
              <span
                ref={barRef}
                className="absolute inset-0 origin-left bg-brand"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span>{padNumber(PROJECTS.length, 2)}</span>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-[clamp(130px,20vh,200px)] flex w-max items-start gap-[clamp(28px,5vw,90px)] px-[max(12vw,clamp(18px,3vw,40px))] will-change-transform [--card-h:min(max(240px,31.6vw),55vh)]"
        >
          {PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              onOpen={(origin) => setOpenCase({ index, origin })}
            />
          ))}

          <a
            href="#kontakt"
            data-cursor="link"
            className="flex w-[clamp(260px,30vw,460px)] flex-none flex-col gap-5 self-center transition-colors hover:text-brand"
          >
            <span className="eyebrow text-brand">
              {padNumber(PROJECTS.length + 1, 2)} — VAŠ PROJEKT
            </span>
            <span className="text-[clamp(34px,4.4vw,76px)] leading-[.95] font-bold tracking-[-.055em]">
              Naslednji je lahko vaš. →
            </span>
          </a>
        </div>
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
