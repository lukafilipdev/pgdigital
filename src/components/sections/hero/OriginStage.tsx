"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRightIcon,
  BespokeLayersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PartnershipShieldIcon,
  PrecisionIcon,
} from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useFrame } from "@/hooks/useFrame";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { approach, clamp, easeOutQuart } from "@/lib/math";

const PILLARS = [
  {
    Icon: PrecisionIcon,
    title: "Inženirska natančnost",
    description: "Vsak razmik, tipografija in vrstica kode imajo jasen namen.",
  },
  {
    Icon: BespokeLayersIcon,
    title: "Brez šablon",
    description: "Spletne strani po meri znamke, od strukture do zadnjega detajla.",
  },
  {
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

/**
 * 02 · O NAS ("IZVOR · PG INŽENIRING")
 * Interactive draggable PROSTOR ◂▸ ZASLON split-reveal over full-width
 * auto-fitted typography, paired with a live-synced comparison table and
 * three architectural pillars on pure black (#000000).
 */
export function OriginStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const pLeftRef = useRef<HTMLSpanElement>(null);
  const pRightRef = useRef<HTMLSpanElement>(null);

  const visible = useInViewport(sectionRef);
  const revealed = useInViewOnce(sectionRef);
  const reducedMotion = useReducedMotion();

  const scrub = useRef({
    p: 0.5,
    targetP: 0.5,
    dragging: false,
    touched: false,
    startedAt: null as number | null,
    lastW: 0,
  });

  useEffect(() => {
    const hd = headRef.current;
    if (!hd) return;

    const fitHeadlines = () => {
      const W = hd.clientWidth;
      if (!W) return;
      const els = Array.from(hd.querySelectorAll<HTMLElement>("[data-fit]"));
      els.forEach((el) => {
        if (el.offsetParent === null) return;
        el.style.fontSize = "100px";
        const measured = el.offsetWidth || 1;
        const ratio = parseFloat(el.dataset.fit || "1");
        el.style.fontSize = `${((100 * W * ratio) / measured).toFixed(2)}px`;
      });
      hd.querySelectorAll<HTMLElement>("[data-w]").forEach((el) => {
        el.textContent = String(Math.round(W));
      });
      scrub.current.lastW = W;
    };

    fitHeadlines();
    const observer = new ResizeObserver(fitHeadlines);
    observer.observe(hd);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) fitHeadlines();
    });

    const updateTargetFromEvent = (e: PointerEvent) => {
      const rect = hd.getBoundingClientRect();
      if (!rect.width) return;
      scrub.current.targetP = clamp((e.clientX - rect.left) / rect.width, 0.04, 0.96);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!hd.contains(e.target as Node)) return;
      scrub.current.dragging = true;
      scrub.current.touched = true;
      updateTargetFromEvent(e);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!scrub.current.dragging) return;
      updateTargetFromEvent(e);
    };
    const onPointerUp = () => {
      scrub.current.dragging = false;
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useFrame((now) => {
    const section = sectionRef.current;
    const hd = headRef.current;
    if (!section || !hd) return;

    const s = scrub.current;
    s.startedAt ??= now;
    const elapsed = now - s.startedAt;

    if (!s.touched && !reducedMotion) {
      s.targetP = 0.5 + 0.26 * Math.sin(elapsed / 2200);
    }
    const easing = reducedMotion ? 1 : s.dragging ? 0.32 : 0.08;
    s.p = approach(s.p, s.targetP, easing);

    const w = hd.clientWidth;
    if (w > 0) {
      section.style.setProperty("--x", `${(s.p * w).toFixed(1)}px`);
      section.style.setProperty("--p", s.p.toFixed(4));
    }

    const leftPct = Math.round(s.p * 100);
    const rightPct = 100 - leftPct;
    if (pLeftRef.current && pLeftRef.current.textContent !== String(leftPct)) {
      pLeftRef.current.textContent = String(leftPct);
    }
    if (pRightRef.current && pRightRef.current.textContent !== String(rightPct)) {
      pRightRef.current.textContent = String(rightPct);
    }

    // Seamless scroll-driven materialization right as the finished Hero stage dissolves behind it.
    const content = contentRef.current;
    if (content) {
      if (reducedMotion) {
        content.style.opacity = "1";
        content.style.transform = "none";
        content.style.filter = "none";
      } else {
        const vh = window.innerHeight || 1;
        const top = section.getBoundingClientRect().top;
        const enter = easeOutQuart(clamp((vh * 1.02 - top) / (vh * 0.56)));
        content.style.opacity = enter.toFixed(3);
        content.style.transform = `translate3d(0, ${((1 - enter) * 28).toFixed(1)}px, 0) scale(${(0.955 + enter * 0.045).toFixed(4)})`;
        content.style.filter = enter < 0.99 ? `blur(${((1 - enter) * 6).toFixed(2)}px)` : "none";
      }
    }
  }, visible);

  return (
    <section
      id="o-nas"
      ref={sectionRef}
      aria-labelledby="o-nas-h"
      className="relative z-20 -mt-[100svh] flex min-h-svh flex-col justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.92)_12%,#000_24%,#000_100%)] px-[clamp(18px,3vw,64px)] pt-[clamp(76px,10vh,124px)] pb-[clamp(84px,11vh,138px)] text-white"
    >
      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-[clamp(44px,6.5vh,76px)] will-change-transform"
      >
        {/* Top Architectural Bar: Section Label + Live PROSTOR / ZASLON Split Readout */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[clamp(10px,1.2vw,12px)] tracking-[.18em] uppercase text-white/60">
          <SectionLabel>IZVOR · PG INŽENIRING</SectionLabel>
          <div aria-hidden className="inline-flex items-center gap-2 tabular-nums">
            <span>
              PROSTOR <span ref={pLeftRef} className="text-white">50</span> %
            </span>
            <span className="inline-flex items-center text-brand">
              <ChevronLeftIcon size={12} />
              <ChevronRightIcon size={12} className="-ml-1" />
            </span>
            <span>
              ZASLON <span ref={pRightRef} className="text-white">50</span> %
            </span>
          </div>
        </div>

        {/* Centerpiece: Interactive Draggable PROSTOR (Blueprint) ◂▸ ZASLON (Digital) Split Headline */}
        <div
          ref={headRef}
          data-cursor="explore"
          data-cursor-label="POVLECI"
          className="relative my-4 w-full cursor-ew-resize touch-pan-y select-none font-display font-extrabold leading-[.9] tracking-[-.055em] nav:my-6"
        >
          {/* Left-side (PROSTOR) localized blueprint stage backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-[clamp(18px,3vw,64px)] -inset-y-12 bg-[#070707] bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.028)_1px,transparent_1px)] bg-[length:80px_80px,80px_80px,16px_16px,16px_16px] nav:-inset-y-14"
          />

          {/* Base Layer: PROSTOR — Hollow Architectural Wireframe Blueprint */}
          <div
            aria-hidden
            className="relative text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.55)]"
          >
            {/* Top MM dimension callout */}
            <div className="absolute inset-x-0 -top-8 flex items-center gap-3 font-mono text-[10.5px] font-medium tracking-[.12em] text-white/60 [-webkit-text-stroke:0]">
              <span className="h-3 w-px bg-white/60" />
              <span className="flex-1 border-t border-dashed border-white/35" />
              <span className="tabular-nums">
                <span data-w="">—</span> MM
              </span>
              <span className="flex-1 border-t border-dashed border-white/35" />
              <span className="h-3 w-px bg-white/60" />
            </div>

            {/* Desktop 2-line wireframe */}
            <div className="hidden nav:block">
              <div>
                <span data-fit="1" className="inline-block whitespace-nowrap text-[10vw]">
                  Gradimo v prostoru.
                </span>
              </div>
              <div>
                <span data-fit="1" className="inline-block whitespace-nowrap text-[10vw]">
                  Zdaj tudi digitalno.
                </span>
              </div>
            </div>

            {/* Mobile 4-line wireframe */}
            <div className="nav:hidden">
              <div>
                <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                  Gradimo v
                </span>
              </div>
              <div>
                <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                  prostoru.
                </span>
              </div>
              <div>
                <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                  Zdaj tudi
                </span>
              </div>
              <div>
                <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                  digitalno.
                </span>
              </div>
            </div>

            {/* Bottom physical blueprint spec */}
            <div className="absolute -bottom-7 left-0 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] font-medium tracking-[.12em] text-white/55 [-webkit-text-stroke:0] nav:text-[11px]">
              <span>GRADBENI NAČRT</span>
              <span className="hidden sm:inline">TOLERANCA ±1 MM</span>
            </div>
          </div>

          {/* Clipped Right Layer: ZASLON — Solid Digital Web Grid */}
          <div
            className="pointer-events-none absolute -inset-x-[clamp(18px,3vw,64px)] -inset-y-12 bg-black px-[clamp(18px,3vw,64px)] py-12 nav:-inset-y-14 nav:py-14"
            style={{
              clipPath: "inset(0 0 0 calc(var(--x, 50%) + clamp(18px, 3vw, 64px)))",
              backgroundImage: "linear-gradient(90deg, rgba(245, 117, 30, 0.08) 1px, transparent 1px)",
              backgroundSize: "calc((100% - 2 * clamp(18px, 3vw, 64px)) / 12) 100%",
              backgroundPosition: "clamp(18px, 3vw, 64px) 0",
            }}
          >
            <div className="relative">
              {/* Top PX dimension callout */}
              <div
                aria-hidden
                className="absolute inset-x-0 -top-8 flex items-center gap-3 font-mono text-[10.5px] font-medium tracking-[.12em] text-brand"
              >
                <span className="h-3 w-px bg-brand" />
                <span className="h-px flex-1 bg-brand/55" />
                <span className="tabular-nums">
                  <span data-w="">—</span> PX
                </span>
                <span className="h-px flex-1 bg-brand/55" />
                <span className="h-3 w-px bg-brand" />
              </div>

              <h2 id="o-nas-h" className="m-0 font-display font-extrabold leading-[.9] tracking-[-.055em] text-white">
                {/* Desktop 2-line solid */}
                <span className="hidden nav:block">
                  <span className="block">
                    <span data-fit="1" className="inline-block whitespace-nowrap text-[10vw]">
                      Gradimo v prostoru.
                    </span>
                  </span>
                  <span className="block">
                    <span data-fit="1" className="inline-block whitespace-nowrap text-[10vw]">
                      Zdaj tudi <span className="text-brand">digitalno.</span>
                    </span>
                  </span>
                </span>

                {/* Mobile 4-line solid */}
                <span className="block nav:hidden">
                  <span className="block">
                    <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                      Gradimo v
                    </span>
                  </span>
                  <span className="block">
                    <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                      prostoru.
                    </span>
                  </span>
                  <span className="block">
                    <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw]">
                      Zdaj tudi
                    </span>
                  </span>
                  <span className="block">
                    <span data-fit="1" className="inline-block whitespace-nowrap text-[22vw] text-brand">
                      digitalno.
                    </span>
                  </span>
                </span>
              </h2>

              {/* Bottom digital web spec */}
              <div
                aria-hidden
                className="absolute right-0 -bottom-7 flex flex-wrap justify-end gap-x-4 gap-y-1 font-mono text-[10px] font-medium tracking-[.12em] text-brand nav:text-[11px]"
              >
                <span>&lt;h2&gt; · MREŽA 8 PX</span>
                <span className="hidden text-white/55 sm:inline">SPLETNA STRAN</span>
              </div>
            </div>
          </div>

          {/* Interactive Vertical Divider Line + Draggable PROSTOR · ZASLON Pill */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-y-12 left-0 z-20 w-0 nav:-inset-y-14"
            style={{ transform: "translateX(var(--x, 50%))" }}
          >
            <div className="absolute inset-y-0 left-0 w-px bg-brand" />
            <div className="absolute top-1/2 left-0 flex h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-brand px-3.5 font-mono text-[10px] font-bold tracking-[.14em] whitespace-nowrap text-black shadow-[0_0_0_6px_rgba(0,0,0,0.65)] nav:h-12 nav:text-[11px]">
              <ChevronLeftIcon size={13} strokeWidth={2.4} />
              <span>PROSTOR · ZASLON</span>
              <ChevronRightIcon size={13} strokeWidth={2.4} />
            </div>
          </div>
        </div>

        {/* Middle 2-Column Editorial Statement + Live-Synced Architectural Comparison Table */}
        <div
          className={cn(
            "grid grid-cols-1 items-start gap-10 transition-[opacity,translate] duration-900 ease-smooth nav:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] nav:gap-[clamp(36px,5vw,92px)]",
            !revealed && "translate-y-6 opacity-0",
          )}
        >
          <div className="flex flex-col items-start gap-6">
            <p className="m-0 font-display text-[clamp(26px,2.5vw,40px)] leading-[1.12] font-bold tracking-[-.032em] text-white/55 text-pretty">
              Ista natančnost. Ista odgovornost.{" "}
              <span className="text-white">Nov medij.</span>
            </p>
            <p className="m-0 max-w-[520px] text-[clamp(15.5px,1.15vw,18.5px)] leading-[1.58] text-pretty text-soft">
              Za PG Digital stoji inženirsko podjetje. Spletne strani gradimo po enakih pravilih
              kot objekte: najprej načrt, potem izvedba brez bližnjic.
            </p>
            <a
              href="#storitve"
              data-cursor="link"
              className="group inline-flex h-[52px] items-center gap-2.5 rounded-full border border-white/22 px-7 font-display text-[15px] font-bold text-white transition-colors duration-300 hover:border-brand hover:text-brand"
            >
              <span>Kaj gradimo</span>
              <ArrowRightIcon
                size={16}
                className="text-brand transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>

          {/* 3-Column Comparison Table synced in real time to --p */}
          <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] text-[clamp(13.5px,1.05vw,16.5px)]">
            <div className="border-b border-white/10 px-3.5 py-4 font-mono text-[9.5px] font-semibold tracking-[.16em] text-white/45 sm:px-5 sm:text-[10px]">
              ISTI STANDARD
            </div>
            <div
              className="border-b border-l border-white/10 px-3.5 py-4 font-mono text-[9.5px] font-semibold tracking-[.16em] text-white sm:px-5 sm:text-[10px]"
              style={{ opacity: "calc(0.32 + 0.68 * var(--p, 0.5))" }}
            >
              GRADBENI NAČRT
            </div>
            <div
              className="border-b border-l border-white/10 bg-brand/[0.06] px-3.5 py-4 font-mono text-[9.5px] font-semibold tracking-[.16em] text-brand sm:px-5 sm:text-[10px]"
              style={{ opacity: "calc(0.32 + 0.68 * (1 - var(--p, 0.5)))" }}
            >
              SPLETNA MREŽA
            </div>

            {COMPARE_ROWS.map((row, idx) => {
              const borderClass = idx < COMPARE_ROWS.length - 1 ? "border-b border-white/[0.06]" : "";
              return (
                <div key={row.label} className="contents">
                  <div
                    className={cn(
                      "px-3.5 py-4 font-mono text-[9.5px] tracking-[.14em] text-white/45 sm:px-5 sm:py-5 sm:text-[10px]",
                      borderClass,
                    )}
                  >
                    {row.label}
                  </div>
                  <div
                    className={cn(
                      "border-l border-white/10 px-3.5 py-4 font-display font-bold text-white sm:px-5 sm:py-5",
                      borderClass,
                    )}
                    style={{ opacity: "calc(0.32 + 0.68 * var(--p, 0.5))" }}
                  >
                    {row.physical}
                  </div>
                  <div
                    className={cn(
                      "border-l border-white/10 bg-brand/[0.06] px-3.5 py-4 font-display font-bold text-white sm:px-5 sm:py-5",
                      borderClass,
                    )}
                    style={{ opacity: "calc(0.32 + 0.68 * (1 - var(--p, 0.5)))" }}
                  >
                    {row.digital}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Three Clean Hairline Architectural Pillars */}
        <div
          className={cn(
            "grid w-full grid-cols-1 gap-8 transition-[opacity,translate] delay-150 duration-900 ease-smooth nav:grid-cols-3 nav:gap-12",
            !revealed && "translate-y-6 opacity-0",
          )}
        >
          {PILLARS.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="relative flex flex-col gap-3 border-t border-white/12 pt-6"
            >
              <span aria-hidden className="absolute -top-px left-0 h-[2px] w-12 bg-brand" />
              <Icon size={20} className="text-brand" />
              <h3 className="m-0 font-display text-[clamp(22px,1.7vw,28px)] leading-[1.1] font-extrabold tracking-[-.035em] text-white">
                {title}
              </h3>
              <p className="m-0 text-[15.5px] leading-[1.58] text-pretty text-soft">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
