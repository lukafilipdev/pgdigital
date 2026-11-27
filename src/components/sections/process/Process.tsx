"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeEngineIcon,
  DesignSystemIcon,
  RocketIcon,
  StrategyIcon,
} from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useFrame } from "@/hooks/useFrame";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useHoverEffects, useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { approach, clamp } from "@/lib/math";

const STEPS = [
  {
    id: "strategija",
    Icon: StrategyIcon,
    title: "Ideja in strategija",
    mobileLines: ["Ideja in", "strategija"],
    short: "STRATEGIJA",
    start: 0,
    end: 1,
    weeks: "TEDEN 1",
    description:
      "Razumemo vaš posel, ciljno občinstvo in prodajni tok. Določimo jasno strukturo vsebine, ki obiskovalca vodi do povpraševanja.",
  },
  {
    id: "oblikovanje",
    Icon: DesignSystemIcon,
    title: "Oblikovanje sistema",
    mobileLines: ["Oblikovanje", "sistema"],
    short: "OBLIKOVANJE",
    start: 1,
    end: 3,
    weeks: "TEDEN 2 DO 3",
    description:
      "Zasnujemo tipografijo, barvni sistem, interaktivne komponente in vizualno smer po meri vaše blagovne znamke, brez šablon.",
  },
  {
    id: "razvoj",
    Icon: CodeEngineIcon,
    title: "Inženiring in razvoj",
    mobileLines: ["Inženiring", "in razvoj"],
    short: "RAZVOJ",
    start: 2.5,
    end: 5,
    weeks: "TEDEN 3 DO 5",
    description:
      "Obliko pretvorimo v hitro, varno Next.js in TypeScript kodo z gibanjem pri 60 FPS, tehničnim SEO in čistim urejanjem vsebin.",
  },
  {
    id: "objava",
    Icon: RocketIcon,
    title: "Objava in podpora",
    mobileLines: ["Objava in", "podpora"],
    short: "OBJAVA",
    start: 5,
    end: 6,
    weeks: "TEDEN 6",
    description:
      "Pred objavo preverimo hitrost, dostopnost in vse naprave. Stran postavimo v produkcijo ter skrbimo za posodobitve in rast.",
  },
] as const;

const HOLLOW_TEXT_SHADOW =
  "1.25px 0 0 rgba(10,10,10,0.3), -1.25px 0 0 rgba(10,10,10,0.3), 0 1.25px 0 rgba(10,10,10,0.3), 0 -1.25px 0 rgba(10,10,10,0.3), 0.9px 0.9px 0 rgba(10,10,10,0.3), -0.9px -0.9px 0 rgba(10,10,10,0.3), 0.9px -0.9px 0 rgba(10,10,10,0.3), -0.9px 0.9px 0 rgba(10,10,10,0.3)";
const HOLLOW_DOT_SHADOW =
  "1.25px 0 0 #f5751e, -1.25px 0 0 #f5751e, 0 1.25px 0 #f5751e, 0 -1.25px 0 #f5751e, 0.9px 0.9px 0 #f5751e, -0.9px -0.9px 0 #f5751e, 0.9px -0.9px 0 #f5751e, -0.9px 0.9px 0 #f5751e";

const TOTAL_WEEKS = 6;
const PLAY_MS = 18000;
const HOLD_MS = 2400;
const WEEK_NUMS = [1, 2, 3, 4, 5, 6] as const;

function activeStepFor(p: number): number {
  let idx = 0;
  STEPS.forEach((step, i) => {
    if (p >= step.start) idx = i;
  });
  return idx;
}

/**
 * 05 · PROCES ("Od prvega pogovora do objave.")
 * Interactive draggable 6-week Gantt scrubber on Warm Stone (#F4F1EC) synced
 * at 60 FPS to a colossal auto-fitted hollow-to-solid filling step title.
 */
export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepWrapRef = useRef<HTMLDivElement>(null);
  const stepAnimRef = useRef<HTMLDivElement>(null);
  const phLabRef = useRef<HTMLSpanElement>(null);

  const revealed = useInViewOnce(sectionRef);
  const inViewport = useInViewport(sectionRef);
  const reducedMotion = useReducedMotion();
  const hoverCapable = useHoverEffects();
  const isMobile = useMediaQuery("(max-width: 899px)");

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const lastFitKeyRef = useRef("");

  const play = useRef({
    p: 0,
    touched: false,
    dragging: false,
    downX: 0,
    dragMoved: false,
    hovered: false,
    startedAt: null as number | null,
    mx: 0,
    my: 0,
    cx: 0,
    cy: 0,
    cs: 0,
  });

  const setProgress = useCallback((value: number) => {
    const nextP = clamp(value, 0, TOTAL_WEEKS);
    play.current.p = nextP;
    const nextActive = activeStepFor(nextP);
    if (nextActive !== activeRef.current) {
      activeRef.current = nextActive;
      setActive(nextActive);
    }
  }, []);

  const fitStepTitle = useCallback((force: boolean) => {
    const box = stepWrapRef.current;
    if (!box) return;
    const W = box.clientWidth;
    if (!W) return;
    const els = Array.from(box.querySelectorAll<HTMLElement>("[data-fit]"));
    if (!els.length) return;
    const key = `${W}|${activeRef.current}|${els.length}`;
    if (!force && lastFitKeyRef.current === key) return;
    lastFitKeyRef.current = key;

    els.forEach((el) => {
      el.style.fontSize = "100px";
      const measured = el.offsetWidth || 1;
      const ratio = parseFloat(el.dataset.fit || "1");
      el.style.fontSize = `${((100 * W * ratio) / measured).toFixed(2)}px`;
    });
  }, []);

  useEffect(() => {
    const box = stepWrapRef.current;
    if (!box) return;
    fitStepTitle(true);
    const observer = new ResizeObserver(() => fitStepTitle(true));
    observer.observe(box);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) fitStepTitle(true);
    });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [fitStepTitle]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => fitStepTitle(true));
    const animEl = stepAnimRef.current;
    if (animEl && !reducedMotion && animEl.animate) {
      animEl.animate(
        [
          { transform: "translateY(22px)", opacity: 0, filter: "blur(10px)" },
          { transform: "none", opacity: 1, filter: "blur(0)" },
        ],
        { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    }
    return () => cancelAnimationFrame(frame);
  }, [active, isMobile, reducedMotion, fitStepTitle]);

  useEffect(() => {
    const updateFromEvent = (e: PointerEvent) => {
      const tr = trackRef.current;
      if (!tr) return;
      const r = tr.getBoundingClientRect();
      if (!r.width) return;
      setProgress(((e.clientX - r.left) / r.width) * TOTAL_WEEKS);
    };

    const onDown = (e: PointerEvent) => {
      const sc = scrubRef.current;
      if (!sc || !sc.contains(e.target as Node)) return;
      play.current.touched = true;
      play.current.dragging = true;
      play.current.downX = e.clientX;
      play.current.dragMoved = false;
      updateFromEvent(e);
    };

    const onMove = (e: PointerEvent) => {
      if (play.current.dragging) {
        if (Math.abs(e.clientX - play.current.downX) > 4) {
          play.current.dragMoved = true;
        }
        updateFromEvent(e);
      }
      if (!hoverCapable) return;
      const sc = scrubRef.current;
      if (!sc) return;
      const r = sc.getBoundingClientRect();
      const inside =
        e.pointerType !== "touch" &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      play.current.hovered = inside;
      if (inside) {
        play.current.mx = e.clientX - r.left;
        play.current.my = e.clientY - r.top;
      }
    };

    const onUp = () => {
      play.current.dragging = false;
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [hoverCapable, setProgress]);

  useFrame((now) => {
    const section = sectionRef.current;
    const tr = trackRef.current;
    const st = stepWrapRef.current;
    if (!section || !tr) return;

    const s = play.current;
    s.startedAt ??= now;

    if (!s.touched && !reducedMotion) {
      const elapsed = (now - s.startedAt) % (PLAY_MS + HOLD_MS);
      setProgress(Math.min(1, elapsed / PLAY_MS) * TOTAL_WEEKS);
    }

    const p = s.p;
    const px = (p / TOTAL_WEEKS) * tr.clientWidth;
    section.style.setProperty("--px", `${px.toFixed(1)}px`);

    if (phLabRef.current) {
      const weekLabel = `TEDEN ${Math.min(TOTAL_WEEKS, Math.floor(p) + 1)}`;
      if (phLabRef.current.textContent !== weekLabel) {
        phLabRef.current.textContent = weekLabel;
      }
      phLabRef.current.style.transform = `translateX(${(-(p / TOTAL_WEEKS) * 100).toFixed(1)}%)`;
    }

    // Fill each Gantt bar dynamically via clip-path.
    tr.querySelectorAll<HTMLElement>("[data-bar]").forEach((bar) => {
      const step = STEPS[Number(bar.dataset.bar)];
      const f = clamp((p - step.start) / (step.end - step.start));
      bar.style.clipPath = `inset(0 ${(100 - f * 100).toFixed(2)}% 0 0)`;
      const live = f > 0 && f < 1;
      bar.style.backgroundColor = live ? "#f5751e" : "#0a0a0a";
      const inner = bar.firstElementChild as HTMLElement | null;
      if (inner) inner.style.color = live ? "#0a0a0a" : "#f4f1ec";
    });

    // Sync the colossal active step title fill & edge percentage badge.
    if (st) {
      const curStep = STEPS[activeRef.current];
      const f = reducedMotion ? 1 : clamp((p - curStep.start) / (curStep.end - curStep.start));
      const fill = st.querySelector<HTMLElement>("[data-fill]");
      const edge = st.querySelector<HTMLElement>("[data-edge]");
      const edgeLab = st.querySelector<HTMLElement>("[data-edgelab]");
      if (fill) fill.style.clipPath = `inset(0 ${(100 - f * 100).toFixed(2)}% 0 0)`;
      if (edge) {
        edge.style.left = `${(f * 100).toFixed(2)}%`;
        edge.style.opacity = f > 0.004 && f < 0.996 ? "1" : "0";
      }
      if (edgeLab) {
        const pctText = `${Math.round(f * 100)} %`;
        if (edgeLab.textContent !== pctText) edgeLab.textContent = pctText;
        edgeLab.style.left = f > 0.85 ? "auto" : "8px";
        edgeLab.style.right = f > 0.85 ? "8px" : "auto";
      }
    }

    // Smooth magnetic "◂ POVLECI ▸" scrubber cursor badge on desktop.
    s.cx = approach(s.cx, s.mx, 0.25);
    s.cy = approach(s.cy, s.my, 0.25);
    s.cs = approach(s.cs, s.hovered ? 1 : 0, 0.18);
    section.style.setProperty("--cx", `${s.cx.toFixed(1)}px`);
    section.style.setProperty("--cy", `${s.cy.toFixed(1)}px`);
    section.style.setProperty("--cs", s.cs.toFixed(3));
  }, inViewport);

  const cur = STEPS[active];
  const lines = isMobile ? cur.mobileLines : [cur.title];

  return (
    <section
      id="proces"
      data-theme="light"
      ref={sectionRef}
      aria-labelledby="proces-h"
      className="relative overflow-hidden bg-paper px-[clamp(18px,3vw,64px)] py-[clamp(88px,12vh,152px)] text-ink"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-[clamp(36px,5.5vh,68px)]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <div className="flex flex-col gap-4">
            <SectionLabel icon={<CalendarIcon size={14} />} tone="light">
              PROCES
            </SectionLabel>
            <h2
              id="proces-h"
              className="m-0 overflow-hidden pb-[.06em] font-display text-[clamp(44px,6.2vw,120px)] leading-[.9] font-extrabold tracking-[-.055em] text-ink"
            >
              <span
                className={cn(
                  "block transition-transform duration-1100 ease-smooth",
                  !revealed && "translate-y-[105%]",
                )}
              >
                Od prvega pogovora
                <br />
                do <span className="text-brand">objave.</span>
              </span>
            </h2>
          </div>

          <div
            className={cn(
              "flex max-w-[420px] flex-col items-start gap-3 transition-opacity delay-250 duration-900 nav:items-end nav:text-right",
              !revealed && "opacity-0",
            )}
          >
            <span className="font-mono text-[11px] font-bold tracking-[.18em] text-brand-dark">
              ŠTIRI FAZE · 4 DO 6 TEDNOV DO OBJAVE
            </span>
            <p className="m-0 text-[clamp(16px,1.15vw,19px)] leading-[1.52] text-pretty text-ink-soft">
              Jasni roki, fiksen obseg in{" "}
              <span className="font-semibold text-ink">100 % lastništvo kode.</span>
            </p>
          </div>
        </div>

        {/* Interactive Draggable 6-Week Gantt Scrubber */}
        <div
          ref={scrubRef}
          data-cursor="none"
          className="relative flex cursor-ew-resize flex-col border-t border-brand pt-3.5 touch-pan-y select-none nav:cursor-none"
        >
          <div className="flex items-center justify-between gap-3 pb-3.5 font-mono text-[10px] font-bold tracking-[.16em] text-ink-soft">
            <span>ČASOVNICA PROJEKTA</span>
            <span className="text-ink-muted">
              <span className="nav:hidden">POVLECITE</span>
              <span className="hidden nav:inline">POVLECITE ALI KLIKNITE FAZO</span>
            </span>
          </div>

          {/* 6-Week Column Headers */}
          <div className="grid grid-cols-6 pb-2.5 font-mono text-[10px] font-bold tracking-[.14em] text-ink-muted">
            {WEEK_NUMS.map((n) => (
              <span key={n} className="pl-2">
                <span className="nav:hidden">T{n}</span>
                <span className="hidden nav:inline">TEDEN {n}</span>
              </span>
            ))}
          </div>

          {/* Gantt Track + Live Playhead */}
          <div ref={trackRef} className="relative flex flex-col gap-2 py-2.5 pb-3">
            {/* Dashed vertical week dividers */}
            <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-6">
              {WEEK_NUMS.map((n) => (
                <span key={n} className="border-l border-dashed border-ink/14" />
              ))}
            </div>

            {STEPS.map((step, i) => {
              const narrow = step.end - step.start <= 1;
              return (
                <div key={step.id} className="relative h-[clamp(30px,2.4vw,38px)]">
                  <button
                    type="button"
                    aria-label={`${step.title} (${step.weeks})`}
                    onClick={() => {
                      if (play.current.dragMoved) return;
                      play.current.touched = true;
                      setProgress(step.start + 0.04);
                    }}
                    style={{
                      left: `${(step.start / TOTAL_WEEKS) * 100}%`,
                      width: `${((step.end - step.start) / TOTAL_WEEKS) * 100}%`,
                    }}
                    className="absolute inset-y-0 cursor-pointer rounded-[6px] bg-ink/[0.06] text-left shadow-[inset_0_0_0_1px_rgba(10,10,10,0.08)]"
                  >
                    <span className="absolute inset-0 flex items-center gap-2 overflow-hidden px-2.5 font-mono text-[10px] font-bold tracking-[.12em] whitespace-nowrap text-ink-soft">
                      <step.Icon size={12} className="shrink-0" />
                      <span className={narrow ? "hidden sm:inline" : undefined}>{step.short}</span>
                    </span>
                    <span
                      data-bar={i}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[6px] bg-ink"
                      style={{ clipPath: "inset(0 100% 0 0)" }}
                    >
                      <span className="absolute inset-0 flex items-center gap-2 overflow-hidden px-2.5 font-mono text-[10px] font-bold tracking-[.12em] whitespace-nowrap text-paper">
                        <step.Icon size={12} className="shrink-0" />
                        <span className={narrow ? "hidden sm:inline" : undefined}>{step.short}</span>
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Vertical Orange Playhead + Week Pill */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-7 bottom-0 left-0 z-20 w-0"
              style={{ transform: "translateX(var(--px, 0px))" }}
            >
              <span className="absolute inset-y-0 -left-px w-[2px] bg-brand" />
              <span className="absolute -top-1 -left-[5px] size-2.5 rounded-full bg-brand shadow-[0_0_0_4px_#f4f1ec]" />
              <span
                ref={phLabRef}
                className="absolute top-full left-0 mt-1.5 rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] font-bold tracking-[.12em] whitespace-nowrap text-ink"
              >
                TEDEN 1
              </span>
            </div>
          </div>

          {/* Desktop Magnetic Scrubber Cursor Pill */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-30 -mt-[42px] -ml-[42px] hidden size-[84px] items-center justify-center gap-0.5 rounded-full bg-ink/90 font-mono text-[9.5px] font-bold tracking-[.12em] whitespace-nowrap text-paper shadow-[0_14px_32px_rgba(0,0,0,0.22)] will-change-transform nav:flex"
            style={{
              transform: "translate3d(var(--cx, 50%), var(--cy, 50%), 0) scale(var(--cs, 0))",
            }}
          >
            <ChevronLeftIcon size={11} className="text-brand" />
            <span>POVLECI</span>
            <ChevronRightIcon size={11} className="text-brand" />
          </span>
        </div>

        {/* Colossal Live-Filling Active Step Detail */}
        <div className="mt-4 flex flex-col gap-[clamp(18px,2.2vw,28px)]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[clamp(10px,1.3vw,12px)] tracking-[.18em] text-ink-soft">
            <div className="inline-flex items-center gap-2.5">
              <cur.Icon size={14} className="text-brand" />
              <span className="font-bold text-brand">{cur.short}</span>
              <span className="text-ink-muted">·</span>
              <span>{cur.weeks}</span>
            </div>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Faze procesa">
              {STEPS.map((step, i) => (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={step.title}
                  data-cursor="link"
                  onClick={() => {
                    play.current.touched = true;
                    setProgress(step.start + 0.04);
                  }}
                  className={cn(
                    "h-1.5 w-7 cursor-pointer rounded-full transition-colors duration-300",
                    i === active
                      ? "bg-brand"
                      : i < active
                        ? "bg-ink"
                        : "bg-ink/15 hover:bg-ink/35",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Full-Width Auto-Fitted Hollow-to-Solid Filling Step Title */}
          <div
            ref={stepWrapRef}
            className="relative w-full font-display leading-[.92] font-extrabold tracking-[-.055em]"
          >
            <div ref={stepAnimRef} className="relative">
              {/* Base Hollow Outline Layer — rasterized shadow outline works cleanly on Safari & Chrome */}
              <h3 className="m-0 text-paper" style={{ textShadow: HOLLOW_TEXT_SHADOW }}>
                {lines.map((txt, idx) => (
                  <span key={`${cur.id}-${idx}`} className="block">
                    <span
                      data-fit="1"
                      className="inline-block pt-[0.04em] pb-[0.04em] whitespace-nowrap text-[9vw]"
                    >
                      <span>{txt}</span>
                      {idx === lines.length - 1 && (
                        <span style={{ textShadow: HOLLOW_DOT_SHADOW }}>.</span>
                      )}
                    </span>
                  </span>
                ))}
              </h3>

              {/* Clipped Solid Ink Fill Layer */}
              <div
                data-fill=""
                aria-hidden
                className="pointer-events-none absolute inset-0 text-ink"
                style={{ clipPath: "inset(0 100% 0 0)" }}
              >
                {lines.map((txt, idx) => (
                  <span key={`${cur.id}-fill-${idx}`} className="block">
                    <span
                      data-fit="1"
                      className="inline-block pt-[0.04em] pb-[0.04em] whitespace-nowrap text-[9vw]"
                    >
                      <span>{txt}</span>
                      {idx === lines.length - 1 && <span className="text-brand">.</span>}
                    </span>
                  </span>
                ))}
              </div>

              {/* Moving Orange Progress Edge & Live Percentage Badge */}
              <div
                data-edge=""
                aria-hidden
                className="pointer-events-none absolute -inset-y-2.5 left-0 w-0 opacity-0"
              >
                <span className="absolute inset-y-0 -left-[0.5px] w-px bg-brand" />
                <span
                  data-edgelab=""
                  className="absolute top-0 left-2 font-mono text-[11px] font-bold tracking-[.12em] whitespace-nowrap tabular-nums text-brand-dark"
                >
                  0 %
                </span>
              </div>
            </div>
          </div>

          {/* Step Description & CTA */}
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
            <p className="m-0 max-w-[620px] text-[clamp(16px,1.2vw,20px)] leading-[1.55] text-pretty text-ink-soft">
              {cur.description}
            </p>
            <a
              href="#kontakt"
              data-cursor="link"
              className="group inline-flex h-[52px] shrink-0 items-center gap-2.5 rounded-full bg-ink px-6 font-display text-[15px] font-extrabold text-paper transition-colors duration-300 hover:bg-brand hover:text-ink"
            >
              <span>Začnimo projekt</span>
              <ArrowRightIcon
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
