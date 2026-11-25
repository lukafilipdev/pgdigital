"use client";

import Image from "next/image";
import { useRef } from "react";
import { projectScreenshot, type Project } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { clamp, padNumber } from "@/lib/math";

type ProjectCardProps = {
  project: Project;
  index: number;
  onOpen: (origin: DOMRect) => void;
};

/**
 * High-impact flagship project spread: crisp desktop browser frame paired with
 * an offset floating titanium mobile device (positioned cleanly outside the
 * hero headline text on desktop, and visible on mobile too) plus editorial copy
 * and direct study/live actions.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
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

  // Subtle scroll-linked parallax lift on the floating titanium mobile device.
  useFrame(() => {
    const card = cardRef.current;
    const phone = phoneRef.current;
    if (!card || !phone) return;
    const rect = card.getBoundingClientRect();
    const viewH = window.innerHeight || 900;
    const norm = clamp((rect.top + rect.height / 2) / viewH, 0, 1);
    const shiftY = (norm - 0.5) * 26;
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
        "group relative grid grid-cols-1 overflow-hidden rounded-md border border-white/[0.09] bg-[#070709]",
        "transition-[opacity,translate,border-color] duration-900 ease-smooth hover:border-white/20",
        "nav:grid-cols-12",
        !revealed && "translate-y-12 opacity-0",
      )}
    >
      {/* Subtle warm top rim highlight on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-[linear-gradient(90deg,transparent,rgba(245,117,30,0.65),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Visual stage (7 of 12 cols on desktop) */}
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-[#040406] p-4 sm:p-6 nav:col-span-7 nav:p-8",
          reversed && "nav:order-2",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,117,30,0.09),transparent_68%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100"
        />

        {/* Clickable dual-device showcase (dedicated right gutter so phone never obscures desktop headlines) */}
        <button
          ref={visualRef}
          type="button"
          data-cursor="view"
          data-cursor-label="POGLEJ"
          aria-label={`Odpri študijo projekta ${project.title}`}
          onClick={openFromVisual}
          className="relative w-full cursor-pointer pr-[14%] pb-3 text-left focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-brand sm:pr-[15%] sm:pb-4"
        >
          <div className="relative overflow-hidden rounded-[6px] border border-white/[0.12] bg-[#0c0c0e] shadow-[0_24px_60px_rgba(0,0,0,0.78)] transition-[border-color,box-shadow] duration-500 group-hover:border-brand/45 group-hover:shadow-[0_28px_72px_rgba(0,0,0,0.88),0_0_40px_rgba(245,117,30,0.1)]">
            {/* Minimalist browser chrome bar */}
            <div className="flex h-7 items-center justify-between border-b border-white/[0.08] bg-[#111114] px-3 font-mono text-[9.5px] tracking-[0.1em] text-muted sm:h-8 sm:px-3.5 sm:text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-white/22 sm:size-2" />
                <span className="size-1.5 rounded-full bg-white/22 sm:size-2" />
                <span className="size-1.5 rounded-full bg-white/22 sm:size-2" />
              </div>
              <span className="flex items-center gap-1.5 truncate text-white/70">
                <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                <span className="truncate">{host}</span>
              </span>
              <span className="hidden text-[9px] text-dim sm:inline">{project.year}</span>
            </div>

            {/* Uncropped full-bleed desktop screenshot */}
            <div
              className={cn(
                "relative w-full overflow-hidden bg-black",
                project.cardView === "phone" ? "aspect-[2/1]" : "aspect-[16/10.6]",
              )}
            >
              <Image
                src={desktopSrc}
                alt={`Namizni prikaz spletne strani ${project.title}`}
                fill
                sizes="(min-width: 900px) 52vw, 84vw"
                className="object-cover object-top transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-55 transition-opacity duration-500 group-hover:opacity-25"
              />
            </div>
          </div>

          {/* Floating matte-black phone mockup seated cleanly in the dedicated right gutter */}
          <div
            ref={phoneRef}
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 z-10 w-[21%] min-w-[68px] max-w-[128px] overflow-hidden rounded-[14px] border-[2px] border-white/22 bg-[#08080a] p-[2.5px] shadow-[0_22px_46px_rgba(0,0,0,0.92)] will-change-transform sm:rounded-[18px] sm:border-[2.5px] sm:p-[3px]"
          >
            <div className="relative aspect-[390/810] w-full overflow-hidden rounded-[11px] bg-black sm:rounded-[14px]">
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

      {/* Editorial info & actions panel (5 of 12 cols on desktop) */}
      <div
        className={cn(
          "relative flex flex-col justify-center gap-6 border-t border-white/[0.07] p-6 sm:p-8 nav:col-span-5 nav:border-t-0 nav:p-9",
          reversed ? "nav:order-1 nav:border-r nav:border-white/[0.07]" : "nav:border-l nav:border-white/[0.07]",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow flex items-center gap-2.5 text-muted">
              <span className="text-brand">{padNumber(index + 1, 2)}</span>
              <span aria-hidden className="h-px w-5 bg-edge" />
              <span>{project.category}</span>
            </span>
            <span className="eyebrow-sm text-dim">{project.year}</span>
          </div>

          <h3 className="text-[clamp(28px,3.1vw,48px)] leading-[0.96] font-extrabold tracking-[-0.055em] text-white">
            {project.title}
          </h3>

          <p className="text-[14.5px] leading-[1.65] text-pretty text-soft sm:text-[15.5px]">
            {project.summary}
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-5">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em]">
            <span className="text-dim">STORITVE</span>
            <span className="text-white/85">{project.services}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-cursor="link"
              onClick={openFromVisual}
              className="eyebrow inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-5 font-bold text-black transition-colors duration-300 hover:bg-brand-light"
            >
              <span>ODPRI ŠTUDIJO</span>
              <span aria-hidden>→</span>
            </button>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="eyebrow inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/20 px-5 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              <span>STRAN</span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
