"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROJECTS, projectScreenshot, type Project } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useHoverEffects, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { approach } from "@/lib/math";
import { CaseStudyDialog } from "./CaseStudyDialog";

type OpenCase = { index: number; origin: DOMRect };

/** Split project titles cleanly across two monumental mobile lines. */
function splitMobileTitle(title: string): [string, string] {
  const idx = title.indexOf(" ");
  if (idx === -1) return [title, ""];
  return [title.slice(0, idx), title.slice(idx + 1)];
}

/**
 * 04 · PROJEKTI ("Izbrano delo.")
 * Full-width edge-to-edge fitted project titles, interactive 3D-tilting
 * desktop + pop-out mobile stages with a live magnetic "ODPRI ↗" badge,
 * unboxed hairline editorial spreads, and a colossal hollow "Vaš projekt?" CTA.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const nextTitleRef = useRef<HTMLDivElement>(null);
  const revealed = useInViewOnce(sectionRef);
  const [openCase, setOpenCase] = useState<OpenCase | null>(null);

  useEffect(() => {
    const box = nextTitleRef.current;
    if (!box) return;

    const fit = () => {
      const W = box.clientWidth;
      if (!W) return;
      box.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
        el.style.fontSize = "100px";
        const measured = el.offsetWidth || 1;
        const ratio = parseFloat(el.dataset.fit || "1");
        el.style.fontSize = `${((100 * W * ratio) / measured).toFixed(2)}px`;
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) fit();
    });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="projekti"
      ref={sectionRef}
      aria-labelledby="projekti-h"
      className="relative overflow-hidden bg-black px-[clamp(18px,3vw,64px)] py-[clamp(88px,12vh,152px)] text-white"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-[clamp(48px,7vh,88px)]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <div className="flex flex-col gap-4">
            <SectionLabel>PROJEKTI</SectionLabel>
            <h2
              id="projekti-h"
              className="m-0 overflow-hidden pb-[.06em] font-display text-[clamp(48px,6.4vw,120px)] leading-[.9] font-extrabold tracking-[-.055em] text-white"
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
              "flex max-w-[420px] flex-col items-start gap-3 transition-opacity delay-250 duration-900 nav:items-end nav:text-right",
              !revealed && "opacity-0",
            )}
          >
            <span className="font-mono text-[11px] font-bold tracking-[.18em] text-brand">
              OBJAVLJENI PROJEKTI · 2026
            </span>
            <p className="m-0 text-[clamp(16px,1.15vw,19px)] leading-[1.52] text-pretty text-soft">
              Vsaka spletna stran je zgrajena od temeljev,{" "}
              <span className="font-medium text-white">
                po meri znamke, brez šablon in kompromisov.
              </span>
            </p>
          </div>
        </div>

        {/* Full-Bleed Unboxed Flagship Project Spreads */}
        <div className="flex flex-col gap-[clamp(56px,9vh,112px)]">
          {PROJECTS.map((project, index) => (
            <ProjectSpread
              key={project.slug}
              project={project}
              index={index}
              onOpen={(origin) => setOpenCase({ index, origin })}
            />
          ))}
        </div>

        {/* Colossal Hollow Wireframe "Vaš projekt?" Closing CTA (rasterized shadow outline — spotless on Safari & Chrome) */}
        <a
          href="#kontakt"
          data-cursor="link"
          className="group relative flex flex-col gap-4 border-t border-white/12 pt-[clamp(22px,2.6vw,34px)] transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[clamp(10px,1.3vw,12px)] tracking-[.18em] uppercase text-white/60">
            <span className="inline-flex items-center gap-2.5">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              <span className="font-bold text-brand">NASLEDNJI</span>
              <span>VAŠA ZNAMKA</span>
            </span>
            <span className="inline-flex items-center gap-2 text-white transition-colors group-hover:text-brand">
              <span>ZAČNIMO PROJEKT</span>
              <ArrowRightIcon
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>

          <div
            ref={nextTitleRef}
            className="w-full font-display leading-[.92] font-extrabold tracking-[-.058em]"
          >
            <span
              data-fit="1"
              style={{
                textShadow:
                  "1.35px 0 0 #f5751e, -1.35px 0 0 #f5751e, 0 1.35px 0 #f5751e, 0 -1.35px 0 #f5751e, 1px 1px 0 #f5751e, -1px -1px 0 #f5751e, 1px -1px 0 #f5751e, -1px 1px 0 #f5751e",
              }}
              className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[15vw] text-black transition-colors duration-450 group-hover:text-brand"
            >
              Vaš projekt?
            </span>
          </div>
        </a>
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
  const articleRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLButtonElement>(null);

  const revealed = useInViewOnce(articleRef);
  const inViewport = useInViewport(articleRef);
  const reducedMotion = useReducedMotion();
  const hoverCapable = useHoverEffects();

  const host = new URL(project.url).host.replace(/^www\./, "");
  const desktopSrc =
    project.cardView === "desktop"
      ? projectScreenshot(project.slug, "card")
      : projectScreenshot(project.slug, "cover");
  const phoneSrc = projectScreenshot(project.slug, "phone");
  const [mobileLine1, mobileLine2] = splitMobileTitle(project.title);

  const tilt = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    s: 0,
    targetX: 0,
    targetY: 0,
    targetTx: 0,
    targetTy: 0,
    hovered: false,
  });

  useEffect(() => {
    const titleBox = titleRef.current;
    if (!titleBox) return;

    const fit = () => {
      const W = titleBox.clientWidth;
      if (!W) return;
      titleBox.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
        if (el.offsetParent === null) return;
        el.style.fontSize = "100px";
        const measured = el.offsetWidth || 1;
        const ratio = parseFloat(el.dataset.fit || "1");
        el.style.fontSize = `${((100 * W * ratio) / measured).toFixed(2)}px`;
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(titleBox);
    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) fit();
    });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hoverCapable) return;
    const onMove = (e: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const inside =
        e.pointerType !== "touch" &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      tilt.current.hovered = inside;
      if (inside) {
        tilt.current.targetX = e.clientX - r.left;
        tilt.current.targetY = e.clientY - r.top;
        tilt.current.targetTx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tilt.current.targetTy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [hoverCapable]);

  useFrame((now) => {
    const stage = stageRef.current;
    if (!stage) return;
    const c = tilt.current;

    if (!c.hovered) {
      if (reducedMotion) {
        c.targetTx = 0;
        c.targetTy = 0;
      } else {
        c.targetTx = 0.32 * Math.sin(now / 2600 + index * 1.4);
        c.targetTy = 0.22 * Math.sin(now / 1900 + 1 + index);
      }
    }

    const targetS = c.hovered ? 1 : 0;
    c.x = approach(c.x, c.targetX, 0.22);
    c.y = approach(c.y, c.targetY, 0.22);
    c.tx = approach(c.tx, c.targetTx, 0.07);
    c.ty = approach(c.ty, c.targetTy, 0.07);
    c.s = approach(c.s, targetS, 0.16);

    stage.style.setProperty("--tx", c.tx.toFixed(4));
    stage.style.setProperty("--ty", c.ty.toFixed(4));
    stage.style.setProperty("--cx", `${c.x.toFixed(1)}px`);
    stage.style.setProperty("--cy", `${c.y.toFixed(1)}px`);
    stage.style.setProperty("--cs", c.s.toFixed(3));
  }, inViewport);

  const openFromVisual = () => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) onOpen(rect);
  };

  return (
    <article
      ref={articleRef}
      className={cn(
        "relative flex flex-col gap-[clamp(22px,3vw,42px)] border-t border-white/12 pt-[clamp(22px,2.6vw,34px)] transition-[opacity,translate] duration-900 ease-smooth",
        !revealed && "translate-y-8 opacity-0",
      )}
    >
      {/* Project Meta Strip */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[clamp(10px,1.3vw,12px)] tracking-[.18em] uppercase text-white/60">
        <div className="inline-flex items-center gap-2.5">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          <span>{project.category}</span>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-brand"
        >
          <span>{host}</span>
          <ArrowUpRightIcon size={13} className="text-brand" />
        </a>
      </div>

      {/* Edge-to-Edge Auto-Fitted Monumental Project Title */}
      <div
        ref={titleRef}
        className="w-full font-display leading-[.9] font-extrabold tracking-[-.058em] text-white"
      >
        <h3 className="m-0">
          {/* Desktop single-line 100% width fit */}
          <span className="hidden nav:block">
            <span data-fit="1" className="inline-block pt-[0.04em] pb-[0.04em] whitespace-nowrap text-[10vw]">
              {project.title}
            </span>
          </span>

          {/* Mobile & Tablet 2-line 100% width fit */}
          <span className="block nav:hidden">
            <span className="block">
              <span data-fit="1" className="inline-block pt-[0.04em] whitespace-nowrap text-[24vw]">
                {mobileLine1}
              </span>
            </span>
            {mobileLine2 && (
              <span className="block">
                <span data-fit="1" className="inline-block pb-[0.04em] whitespace-nowrap text-[18vw]">
                  {mobileLine2}
                  <span className="text-brand">.</span>
                </span>
              </span>
            )}
          </span>
        </h3>
      </div>

      {/* 3D Tilting Showcase Stage + Bottom-Aligned Editorial Copy & Specs */}
      <div className="flex flex-wrap items-stretch gap-[clamp(32px,4vw,72px)]">
        <button
          ref={stageRef}
          type="button"
          data-cursor="none"
          aria-label={`Odpri študijo primera ${project.title}`}
          onClick={openFromVisual}
          className="group relative block min-w-[min(100%,300px)] flex-[1_1_580px] cursor-pointer pt-2 pr-[clamp(24px,4.5vw,84px)] pb-[clamp(40px,4.8vw,74px)] pl-0 text-left perspective-[1600px] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brand nav:cursor-none"
        >
          <div
            className="relative will-change-transform [transform-style:preserve-3d]"
            style={{
              transform:
                "rotateY(calc(var(--tx, 0) * 5deg)) rotateX(calc(var(--ty, 0) * -4deg)) translate3d(calc(var(--tx, 0) * -10px), calc(var(--ty, 0) * -8px), 0)",
            }}
          >
            {/* Desktop Browser Frame */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0e0e0e] shadow-[0_48px_96px_-28px_rgba(0,0,0,0.95)] transition-[border-color] duration-500 group-hover:border-brand/45">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#141414] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-white/18" />
                  <span className="size-2 rounded-full bg-white/18" />
                  <span className="size-2 rounded-full bg-white/18" />
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-1 font-mono text-[10.5px] text-white/80">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                  <span className="max-w-[190px] truncate">{host}</span>
                </span>
                <span className="hidden font-mono text-[10px] text-white/40 sm:inline">
                  {project.year}
                </span>
              </div>

              <div
                className={cn(
                  "relative w-full overflow-hidden bg-black",
                  project.cardView === "phone" ? "aspect-[2/1]" : "aspect-[16/9.6]",
                )}
              >
                <Image
                  src={desktopSrc}
                  alt={`Namizni prikaz spletne strani ${project.title}`}
                  fill
                  sizes="(min-width: 900px) 58vw, 94vw"
                  className="scale-[1.06] object-cover object-top will-change-transform"
                  style={{
                    transform:
                      "translate3d(calc(var(--tx, 0) * -12px), calc(var(--ty, 0) * -8px), 0)",
                  }}
                />
              </div>
            </div>

            {/* 3D Pop-Out Floating Mobile Frame */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-[calc(clamp(24px,4.5vw,84px)*-1)] bottom-[calc(clamp(40px,4.8vw,74px)*-1)] w-[24%] min-w-[88px] max-w-[158px] rounded-[clamp(14px,1.6vw,26px)] border border-white/16 bg-[#141414] p-[4.5px] shadow-[0_38px_76px_-18px_rgba(0,0,0,0.95)] will-change-transform"
              style={{
                transform:
                  "translateZ(60px) translate3d(calc(var(--tx, 0) * 20px), calc(var(--ty, 0) * 14px), 0)",
              }}
            >
              <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[clamp(10px,1.25vw,21px)] bg-black">
                <Image
                  src={phoneSrc}
                  alt=""
                  fill
                  sizes="170px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Live Magnetic Orange "ODPRI ↗" Cursor Badge (Desktop Hover) */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-20 -mt-[56px] -ml-[56px] hidden size-[112px] items-center justify-center gap-1 rounded-full bg-brand font-mono text-[11.5px] font-bold tracking-[.14em] text-black shadow-[0_18px_40px_rgba(0,0,0,0.65)] will-change-transform nav:flex"
            style={{
              transform: "translate3d(var(--cx, 50%), var(--cy, 50%), 0) scale(var(--cs, 0))",
            }}
          >
            <span>ODPRI</span>
            <ArrowUpRightIcon size={14} />
          </span>
        </button>

        {/* Right Column: Summary, Hairline 3-Column Specs & Pill Actions */}
        <div className="flex max-w-[540px] flex-[1_1_340px] flex-col justify-end gap-7">
          <p className="m-0 text-[clamp(16px,1.15vw,19px)] leading-[1.6] text-pretty text-soft">
            {project.summary}
          </p>

          <div className="grid grid-cols-3 border-y border-white/12">
            <div className="flex flex-col gap-2 py-4 pr-3">
              <span className="font-mono text-[10px] tracking-[.18em] text-white/50">STORITVE</span>
              <span className="font-display text-[clamp(13.5px,1.05vw,16.5px)] font-extrabold tracking-[-.01em] text-white">
                {project.services}
              </span>
            </div>
            <div className="flex flex-col gap-2 py-4 pr-3">
              <span className="font-mono text-[10px] tracking-[.18em] text-white/50">JEZIKI</span>
              <span className="font-display text-[clamp(13.5px,1.05vw,16.5px)] font-extrabold tracking-[-.01em] text-white">
                {project.languages}
              </span>
            </div>
            <div className="flex flex-col gap-2 py-4">
              <span className="font-mono text-[10px] tracking-[.18em] text-white/50">LETO</span>
              <span className="font-display text-[clamp(13.5px,1.05vw,16.5px)] font-extrabold tracking-[-.01em] tabular-nums text-white">
                {project.year}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              data-cursor="link"
              onClick={openFromVisual}
              className="group/btn inline-flex min-h-[54px] flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand px-6 font-display text-[15.5px] font-extrabold whitespace-nowrap text-black transition-colors duration-300 hover:bg-white"
            >
              <span>Odpri študijo</span>
              <ArrowRightIcon
                size={16}
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </button>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-white/22 px-6 font-display text-[15.5px] font-extrabold whitespace-nowrap text-white transition-colors duration-300 hover:border-brand hover:text-brand"
            >
              <span>Obišči stran</span>
              <ArrowUpRightIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
