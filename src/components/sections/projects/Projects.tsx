"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SectionCodeField } from "@/components/effects/SectionCodeField";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROJECTS, projectScreenshot, type Project } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { clamp, padNumber } from "@/lib/math";
import { CaseStudyDialog } from "./CaseStudyDialog";

type OpenCase = { index: number; origin: DOMRect };

/**
 * 04 · PROJEKTI — Stacked full-bleed alternating flagship project spreads
 * (Midnight Auto Studio + PG INŽENIRING both visible as you scroll) with dual desktop
 * and floating titanium mobile frames, crisp 3-column metadata (Storitve / Jeziki / Leto),
 * unified SVG icons, architectural dark mesh background, and closing "Vaš projekt" banner.
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
      className="relative overflow-hidden bg-[#08080c] bg-mesh-dark px-[clamp(18px,3.2vw,48px)] py-[clamp(96px,13vh,156px)] text-paper"
    >
      <SectionCodeField tone="dark" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[clamp(44px,6.5vh,76px)]">
        {/* Section Header on Solid Floating Obsidian Cards */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-4 rounded-[16px] border border-white/12 bg-[#0c0c10]/95 px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-[10px] nav:px-7 nav:py-6">
            <SectionLabel index="04">PROJEKTI</SectionLabel>
            <h2
              id="projekti-h"
              className="overflow-hidden pb-[.06em] text-[clamp(44px,8vw,132px)] leading-[.9] font-extrabold tracking-[-.048em] text-paper nav:text-[clamp(56px,6vw,108px)]"
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
              "flex max-w-[410px] flex-col items-start gap-3 rounded-[16px] border border-white/12 bg-[#0c0c10]/95 px-6 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-[10px] transition-opacity delay-250 duration-900 nav:items-end nav:text-right",
              !revealed && "opacity-0",
            )}
          >
            <span className="eyebrow flex items-center gap-2 text-brand">
              <span className="size-1.5 rounded-full bg-brand" />
              {padNumber(PROJECTS.length, 2)} OBJAVLJENA PROJEKTA · 2026
            </span>
            <p className="text-[16px] leading-[1.5] text-pretty text-soft">
              Vsaka spletna stran je zgrajena od temeljev —{" "}
              <span className="font-medium text-paper">
                po meri znamke, brez šablon in kompromisov.
              </span>
            </p>
          </div>
        </div>

        {/* Stacked Alternating Dual-Device Flagship Spreads */}
        <div className="flex flex-col gap-[clamp(32px,5vh,56px)]">
          {PROJECTS.map((project, index) => (
            <ProjectSpread
              key={project.slug}
              project={project}
              index={index}
              onOpen={(origin) => setOpenCase({ index, origin })}
            />
          ))}
        </div>

        {/* Bold "Vaš projekt?" architectural CTA banner */}
        <div
          className={cn(
            "relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[16px] border border-white/14 bg-[#0c0c10]/96 px-6 py-7 backdrop-blur-[10px] transition-[opacity,translate] delay-250 duration-900 ease-smooth sm:px-10 sm:py-9",
            !revealed && "translate-y-8 opacity-0",
          )}
        >
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-brand" />
          <div className="flex flex-col gap-2">
            <span className="eyebrow-sm flex items-center gap-2 text-brand">
              <span className="size-1.5 rounded-full bg-brand" />
              NASLEDNJI PRIMER · 03
            </span>
            <h3 className="text-[clamp(24px,2.8vw,40px)] leading-[1.02] font-extrabold tracking-[-.04em] text-paper">
              Naslednji projekt je lahko <span className="text-brand">vaš.</span>
            </h3>
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-soft">
              Povejte nam, kaj gradite — pripravimo jasen predlog strukture, oblikovanja in
              časovnice.
            </p>
          </div>
          <a
            href="#kontakt"
            data-cursor="link"
            className="group inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-paper px-6 font-display text-[14px] font-extrabold text-[#08080c] transition-colors duration-300 hover:bg-brand"
          >
            <span>Začnimo pogovor</span>
            <ArrowRightIcon
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>

      {openCase && (
        <CaseStudyDialog
          index={openCase.index}
          origin={openCase.origin}
          onNext={() =>
            setOpenCase((current) =>
              current ? { ...current, index: (current.index + 1) % PROJECTS.length } : null,
            )
          }
          onClose={() => setOpenCase(null)}
        />
      )}
    </section>
  );
}

function ProjectSpread({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (origin: DOMRect) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLButtonElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const revealed = useInViewOnce(cardRef);
  const inViewport = useInViewport(cardRef);
  const reducedMotion = useReducedMotion();

  const host = new URL(project.url).host.replace(/^www\./, "");
  const desktopSrc =
    project.cardView === "desktop"
      ? projectScreenshot(project.slug, "card")
      : projectScreenshot(project.slug, "cover");
  const phoneSrc = projectScreenshot(project.slug, "phone");
  const reversed = index % 2 === 1;

  // Subtle scroll-linked parallax on the floating titanium mobile frame.
  useFrame(() => {
    const card = cardRef.current;
    const phone = phoneRef.current;
    if (!card || !phone) return;
    const rect = card.getBoundingClientRect();
    const viewH = window.innerHeight || 900;
    const norm = clamp((rect.top + rect.height / 2) / viewH, 0, 1);
    const shiftY = (norm - 0.5) * 24;
    phone.style.transform = `translate3d(0, ${shiftY.toFixed(2)}px, 0)`;
  }, inViewport && !reducedMotion);

  const openFromVisual = () => {
    const rect = visualRef.current?.getBoundingClientRect();
    if (rect) onOpen(rect);
  };

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative grid grid-cols-1 overflow-hidden rounded-[18px] border border-white/12 bg-[#0c0c10]/96 backdrop-blur-[10px]",
        "transition-[opacity,translate,border-color] duration-900 ease-smooth hover:border-white/22 nav:grid-cols-12",
        !revealed && "translate-y-10 opacity-0",
      )}
    >
      {/* Top hover rim accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-[linear-gradient(90deg,transparent,rgba(245,117,30,0.65),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Visual Stage (7 of 12 cols) */}
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-[#060609]/85 p-4 sm:p-6 nav:col-span-7 nav:p-8",
          reversed && "nav:order-2",
        )}
      >
        <button
          ref={visualRef}
          type="button"
          data-cursor="view"
          data-cursor-label="POGLEJ"
          aria-label={`Odpri študijo projekta ${project.title}`}
          onClick={openFromVisual}
          className="relative block w-full cursor-pointer pr-[12%] pb-4 text-left focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brand sm:pr-[13%] sm:pb-6"
        >
          <div className="relative overflow-hidden rounded-[12px] border border-white/12 bg-[#141418] shadow-[0_28px_68px_rgba(0,0,0,0.72)] transition-[border-color,box-shadow] duration-500 group-hover:border-brand/45 group-hover:shadow-[0_32px_76px_rgba(0,0,0,0.82),0_0_40px_rgba(245,117,30,0.1)]">
            <div className="flex h-8 items-center justify-between border-b border-white/[0.08] bg-[#141418] px-3.5 sm:h-9">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-white/18" />
                <span className="size-2 rounded-full bg-white/18" />
                <span className="size-2 rounded-full bg-white/18" />
              </div>
              <span className="flex items-center gap-2 rounded-full bg-[#08080c] px-3 py-0.5 font-mono text-[10px] tracking-[.06em] text-white/75">
                <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                <span className="max-w-[190px] truncate">{host}</span>
              </span>
              <span className="hidden font-mono text-[9.5px] text-dim sm:inline">
                {project.year}
              </span>
            </div>

            <div
              className={cn(
                "relative w-full overflow-hidden bg-black",
                project.cardView === "phone" ? "aspect-[2/1]" : "aspect-[16/10.5]",
              )}
            >
              <Image
                src={desktopSrc}
                alt={`Namizni prikaz spletne strani ${project.title}`}
                fill
                sizes="(min-width: 900px) 52vw, 86vw"
                className="object-cover object-top transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* Floating matte-black phone mockup seated cleanly in the right gutter */}
          <div
            ref={phoneRef}
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 z-10 w-[21%] min-w-[74px] max-w-[132px] overflow-hidden rounded-[16px] border border-white/22 bg-[#08080c] p-[3.5px] shadow-[0_24px_48px_rgba(0,0,0,0.88)] will-change-transform sm:rounded-[22px] sm:p-[4.5px]"
          >
            <div className="relative aspect-[390/810] w-full overflow-hidden rounded-[12px] bg-[#141418] sm:rounded-[17px]">
              <Image
                src={phoneSrc}
                alt=""
                fill
                sizes="140px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </button>
      </div>

      {/* Editorial Info & Actions (5 of 12 cols) */}
      <div
        className={cn(
          "relative flex flex-col justify-center gap-6 border-t border-white/[0.08] p-6 sm:p-8 nav:col-span-5 nav:border-t-0 nav:p-9",
          reversed
            ? "nav:order-1 nav:border-r nav:border-white/[0.08]"
            : "nav:border-l nav:border-white/[0.08]",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="eyebrow flex items-center gap-3 text-soft">
            <span className="text-brand">{padNumber(index + 1, 2)}</span>
            <span aria-hidden className="h-px w-6 bg-white/25" />
            <span>{project.category}</span>
          </div>

          <h3 className="text-[clamp(28px,3.2vw,48px)] leading-[.96] font-extrabold tracking-[-.045em] text-paper">
            {project.title}
          </h3>

          <p className="text-[15px] leading-[1.62] text-pretty text-soft">{project.summary}</p>
        </div>

        {/* Clean 3-column metadata strip */}
        <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-4">
          <div className="flex flex-col gap-1">
            <span className="eyebrow-sm text-muted">STORITVE</span>
            <span className="text-[13.5px] font-semibold text-paper">{project.services}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="eyebrow-sm text-muted">JEZIKI</span>
            <span className="text-[13.5px] font-semibold text-paper">{project.languages}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="eyebrow-sm text-muted">LETO</span>
            <span className="text-[13.5px] font-semibold tabular-nums text-paper">
              {project.year}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-cursor="link"
            onClick={openFromVisual}
            className="group/btn inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-5 font-display text-[13.5px] font-extrabold text-[#08080c] transition-colors duration-300 hover:bg-paper"
          >
            <span>Odpri študijo</span>
            <ArrowRightIcon
              size={15}
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            />
          </button>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/22 px-5 font-display text-[13.5px] font-bold text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-[#08080c]"
          >
            <span>Obišči stran</span>
            <ArrowUpRightIcon size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
