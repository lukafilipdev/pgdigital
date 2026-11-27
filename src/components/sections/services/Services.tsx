"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CodeEngineIcon,
  CommerceBagIcon,
  DesignSystemIcon,
  SpeedShieldIcon,
} from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SERVICES } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

const AUTO_CYCLE_MS = 5200;

/** Compact display titles paired with discipline-specific geometric icons. */
const DISPLAY_TITLES = [
  { title: "Spletno oblikovanje", code: false, fitRatio: 0.9, Icon: DesignSystemIcon },
  { title: "Spletni razvoj", code: true, fitRatio: 0.88, Icon: CodeEngineIcon },
  { title: "E-commerce", code: false, fitRatio: 0.78, Icon: CommerceBagIcon },
  { title: "Vzdrževanje", code: false, fitRatio: 0.86, Icon: SpeedShieldIcon },
] as const;

/**
 * 03 · STORITVE ("Kaj gradimo.")
 * Full-width interactive editorial accordion on Warm Stone (#F4F1EC).
 * The active service expands its display title to fill the column width and
 * reveals a discipline-specific live kinetic ornament right around the type:
 *  01 Design selection frame (live OKVIR W × H + OBLIKOVALEC cursor)
 *  02 Live JSX syntax brackets & blinking code caret
 *  03 Live ticking cart badge & checkout flow
 *  04 Live Lighthouse 100 performance meter
 */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const revealed = useInViewOnce(sectionRef);
  const inViewport = useInViewport(sectionRef);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 899px)");

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const touchedRef = useRef(false);
  const cycleStartRef = useRef(0);
  const lastSizeKeyRef = useRef("");

  const selectService = useCallback((index: number, manual: boolean) => {
    if (manual) touchedRef.current = true;
    if (index === activeRef.current) return;
    activeRef.current = index;
    cycleStartRef.current = performance.now();
    setActive(index);
  }, []);

  const sizeTitles = useCallback(
    (force: boolean) => {
      const list = listRef.current;
      const meas = measureRef.current;
      if (!list || !meas) return;
      const col = list.querySelector<HTMLElement>("[data-tcol]");
      if (!col) return;

      const W = col.clientWidth;
      if (!W) return;
      const currentActive = activeRef.current;
      const key = `${W}|${currentActive}|${isMobile ? 1 : 0}`;
      if (!force && lastSizeKeyRef.current === key) return;
      lastSizeKeyRef.current = key;

      const inactivePx = isMobile ? 25 : Math.min(72, Math.max(32, window.innerWidth * 0.04));

      list.querySelectorAll<HTMLElement>("[data-title]").forEach((el) => {
        const idx = Number(el.dataset.title);
        const cfg = DISPLAY_TITLES[idx];
        let px = inactivePx;
        el.style.whiteSpace = "nowrap";

        if (idx === currentActive) {
          if (isMobile) {
            px = Math.min(W * 0.16, 62);
            el.style.whiteSpace = "normal";
          } else {
            meas.textContent = cfg.code ? `<${cfg.title} />` : cfg.title;
            const measuredW = meas.offsetWidth || 1;
            px = Math.max(inactivePx, Math.min(148, (100 * W * cfg.fitRatio) / measuredW));
          }
        }
        el.style.fontSize = `${px.toFixed(1)}px`;
      });
    },
    [isMobile],
  );

  useEffect(() => {
    cycleStartRef.current = performance.now();
    const list = listRef.current;
    if (!list) return;

    sizeTitles(true);
    const observer = new ResizeObserver(() => sizeTitles(true));
    observer.observe(list);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) sizeTitles(true);
    });

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [sizeTitles]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => sizeTitles(true));
    return () => cancelAnimationFrame(frame);
  }, [active, isMobile, sizeTitles]);

  useFrame((now) => {
    const list = listRef.current;
    if (!list) return;

    if (cycleStartRef.current === 0) cycleStartRef.current = now;
    const auto = !touchedRef.current && !reducedMotion;
    const elapsed = now - cycleStartRef.current;

    if (auto && elapsed >= AUTO_CYCLE_MS) {
      selectService((activeRef.current + 1) % SERVICES.length, false);
    }

    // Update top hairline progress bars directly on DOM (zero React re-renders).
    list.querySelectorAll<HTMLElement>("[data-prog]").forEach((bar) => {
      const idx = Number(bar.dataset.prog);
      const isCurrent = idx === activeRef.current;
      const pct = isCurrent ? (auto ? Math.min(100, (elapsed / AUTO_CYCLE_MS) * 100) : 100) : 0;
      bar.style.width = `${pct.toFixed(2)}%`;
    });

    // 01 Design: live OKVIR bounding-box pixel readout.
    const dim = list.querySelector<HTMLElement>("[data-dim]");
    if (dim) {
      const box = dim.closest<HTMLElement>("[data-title]");
      if (box) {
        const text = `${Math.round(box.offsetWidth)} × ${Math.round(box.offsetHeight)}`;
        if (dim.textContent !== text) dim.textContent = text;
      }
    }

    // 02 Code: blinking cursor caret.
    const caret = list.querySelector<HTMLElement>("[data-caret]");
    if (caret) {
      caret.style.opacity = reducedMotion || Math.floor(now / 530) % 2 === 0 ? "1" : "0";
    }

    // 03 E-commerce: live ticking cart count.
    const cart = list.querySelector<HTMLElement>("[data-cart]");
    if (cart) {
      const count = reducedMotion ? "3" : String(1 + (Math.floor(now / 1300) % 9));
      if (cart.textContent !== count) cart.textContent = count;
    }

    // 04 Maintenance: animated Lighthouse 100 meter.
    const meter = list.querySelector<HTMLElement>("[data-meter]");
    const score = list.querySelector<HTMLElement>("[data-score]");
    if (meter) {
      const eased = reducedMotion
        ? 1
        : (() => {
            const ph = (now % 3600) / 3600;
            const v = Math.min(1, ph / 0.7);
            return 1 - Math.pow(1 - v, 3);
          })();
      meter.style.width = `${(eased * 100).toFixed(1)}%`;
      if (score) {
        const val = String(Math.round(42 + 58 * eased));
        if (score.textContent !== val) score.textContent = val;
      }
    }
  }, inViewport);

  return (
    <section
      id="storitve"
      data-theme="light"
      ref={sectionRef}
      aria-labelledby="storitve-h"
      className="relative overflow-hidden bg-paper px-[clamp(18px,3vw,64px)] py-[clamp(80px,11vh,144px)] text-ink"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-[clamp(32px,5vh,56px)]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex flex-col gap-4">
            <SectionLabel tone="light">STORITVE</SectionLabel>
            <h2
              id="storitve-h"
              className="m-0 overflow-hidden pb-[.06em] font-display text-[clamp(48px,6.4vw,120px)] leading-[.9] font-extrabold tracking-[-.055em] text-ink"
            >
              <span
                className={cn(
                  "block transition-transform duration-1100 ease-smooth",
                  !revealed && "translate-y-[105%]",
                )}
              >
                Kaj gradimo.
              </span>
            </h2>
          </div>

          <p
            className={cn(
              "m-0 max-w-[380px] text-[clamp(16px,1.15vw,19px)] leading-[1.52] text-pretty text-ink-soft transition-opacity delay-250 duration-900",
              !revealed && "opacity-0",
            )}
          >
            Štiri discipline.{" "}
            <span className="font-medium text-ink">
              Ena ekipa od prve skice do zadnje posodobitve.
            </span>
          </p>
        </div>

        {/* Full-Width Interactive Kinetic Services Accordion */}
        <div ref={listRef} className="relative flex flex-col border-b border-ink/14">
          {/* Hidden off-flow width measurer for pixel-accurate desktop expansion */}
          <span
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute font-display text-[100px] font-extrabold tracking-[-.055em] whitespace-nowrap"
          />

          {SERVICES.map((service, index) => {
            const isActive = index === active;
            const cfg = DISPLAY_TITLES[index];

            return (
              <div
                key={service.name}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                data-cursor="link"
                onMouseEnter={() => {
                  if (!isMobile) selectService(index, true);
                }}
                onClick={() => selectService(index, true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectService(index, true);
                  }
                }}
                className={cn(
                  "relative cursor-pointer border-t border-ink/14 outline-none transition-[padding] duration-500 ease-smooth focus-visible:ring-1 focus-visible:ring-brand",
                  isActive
                    ? "pt-12 pb-10 nav:pt-14 nav:pb-12"
                    : "py-[clamp(14px,1.6vw,24px)]",
                )}
              >
                {/* Live orange top progress bar */}
                <div
                  data-prog={index}
                  aria-hidden
                  className="pointer-events-none absolute -top-px left-0 h-[2px] w-0 bg-brand"
                />

                {/* Title Row */}
                <div className="grid grid-cols-[clamp(38px,5vw,96px)_minmax(0,1fr)_auto] items-start gap-3">
                  <span
                    className={cn(
                      "pt-[0.35em] transition-colors duration-300",
                      isActive ? "text-brand" : "text-ink-muted",
                    )}
                  >
                    <cfg.Icon size={20} />
                  </span>

                  <div data-tcol="" className="min-w-0">
                    <span
                      data-title={index}
                      className={cn(
                        "relative inline-block font-display text-[clamp(26px,4vw,72px)] leading-[.95] font-extrabold tracking-[-.055em] whitespace-nowrap",
                        "transition-[font-size,color] duration-700 ease-smooth",
                        isActive ? "text-ink" : "text-ink-muted hover:text-ink/80",
                      )}
                    >
                      {cfg.code && (
                        <span className="font-medium text-brand">&lt;</span>
                      )}
                      <span>{cfg.title}</span>
                      {cfg.code && (
                        <span className="font-medium text-brand"> /&gt;</span>
                      )}

                      {/* 01 · Design: Figma selection frame with live pixel dimensions + OBLIKOVALEC cursor */}
                      {isActive && index === 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -top-[0.06em] -right-[0.08em] -bottom-[0.02em] -left-[0.08em] border-[1.5px] border-brand"
                        >
                          <span className="absolute -top-[5px] -left-[5px] size-[9px] border-[1.5px] border-brand bg-white" />
                          <span className="absolute -top-[5px] -right-[5px] size-[9px] border-[1.5px] border-brand bg-white" />
                          <span className="absolute -bottom-[5px] -left-[5px] size-[9px] border-[1.5px] border-brand bg-white" />
                          <span className="absolute -right-[5px] -bottom-[5px] size-[9px] border-[1.5px] border-brand bg-white" />
                          <span className="absolute bottom-full -left-[1.5px] mb-2 bg-brand px-2 py-1 font-mono text-[10px] font-bold tracking-[.08em] whitespace-nowrap text-ink nav:text-[11px]">
                            OKVIR · <span data-dim="">—</span>
                          </span>
                          <span className="absolute top-full -right-[1.5px] mt-2.5 hidden items-center gap-1.5 font-mono text-[10.5px] font-bold tracking-[.08em] text-ink sm:flex">
                            <span className="size-0 -rotate-30 border-r-[6px] border-b-[11px] border-l-[6px] border-r-transparent border-b-ink border-l-transparent" />
                            <span className="rounded-full bg-ink px-2.5 py-0.5 text-paper">
                              OBLIKOVALEC
                            </span>
                          </span>
                        </span>
                      )}

                      {/* 02 · Code: Function signature + blinking caret */}
                      {isActive && index === 1 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute bottom-full left-0 mb-1.5 font-mono text-[10.5px] font-medium tracking-[.02em] whitespace-nowrap text-ink-soft nav:text-[12px]"
                        >
                          <span className="text-brand">export default</span> function SpletniRazvoj() {"{"}
                          <span
                            data-caret=""
                            className="ml-1 inline-block h-[12px] w-[7px] align-[-2px] bg-brand"
                          />
                        </span>
                      )}

                      {/* 03 · E-commerce: Live cart counter badge + checkout pipeline */}
                      {isActive && index === 2 && (
                        <>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -top-[0.02em] left-full ml-[0.1em] flex size-[0.48em] items-center justify-center rounded-full bg-brand leading-none tracking-normal text-ink"
                          >
                            <span
                              data-cart=""
                              className="font-mono text-[0.22em] font-bold tabular-nums"
                            >
                              1
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute top-full left-0 mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[.14em] whitespace-nowrap text-ink-soft nav:text-[11px]"
                          >
                            <span>KOŠARICA</span>
                            <ArrowRightIcon size={11} className="text-brand" />
                            <span>DOSTAVA</span>
                            <ArrowRightIcon size={11} className="text-brand" />
                            <span>PLAČILO</span>
                          </span>
                        </>
                      )}

                      {/* 04 · Maintenance: Live Lighthouse 100 score + progress meter */}
                      {isActive && index === 3 && (
                        <>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute right-0 bottom-full mb-1.5 font-mono text-[10px] font-bold tracking-[.14em] whitespace-nowrap text-ink-soft nav:text-[11px]"
                          >
                            LIGHTHOUSE{" "}
                            <span data-score="" className="tabular-nums text-ink">
                              100
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute top-full right-0 left-0 mt-2 block h-[5px] bg-ink/10"
                          >
                            <span data-meter="" className="block h-full w-full bg-brand" />
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <span
                    aria-hidden
                    className={cn(
                      "pt-[0.35em] transition-colors duration-300",
                      isActive ? "text-brand" : "text-ink-muted",
                    )}
                  >
                    {isActive ? <ArrowRightIcon size={20} /> : <ArrowUpRightIcon size={20} />}
                  </span>
                </div>

                {/* Expanded Description & CTA */}
                {isActive && (
                  <div className="mt-8 grid grid-cols-[clamp(38px,5vw,96px)_minmax(0,1fr)] gap-3 nav:mt-11">
                    <span aria-hidden />
                    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
                      <div className="flex max-w-[540px] flex-col gap-3">
                        <p className="m-0 text-[clamp(15.5px,1.2vw,19.5px)] leading-[1.52] text-pretty text-ink-soft">
                          {service.description}
                        </p>
                        <span className="font-mono text-[11px] font-bold tracking-[.16em] text-brand-dark">
                          {service.tags}
                        </span>
                      </div>

                      <a
                        href="#kontakt"
                        data-cursor="link"
                        onClick={(e) => e.stopPropagation()}
                        className="group inline-flex h-[50px] shrink-0 items-center gap-2.5 rounded-full bg-ink px-6 font-display text-[14.5px] font-extrabold text-paper transition-colors duration-300 hover:bg-brand hover:text-ink"
                      >
                        <span>Začnimo projekt</span>
                        <ArrowRightIcon
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
