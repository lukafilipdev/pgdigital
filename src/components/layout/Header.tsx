"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS, SECTION_IDS } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useActiveSection, useHeaderTone, useScrolledPast } from "@/hooks/useScrollState";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/math";
import { MobileMenu } from "./MobileMenu";

/**
 * Adaptive architectural navbar:
 * - Completely transparent at top over the live Hero mesh & X-ray
 * - Compresses cleanly on scroll with frosted dark / Warm Stone surface
 * - Cross-fades dark/light wordmarks + live flipping active section label
 * - Sliding pill indicator + hover architectural pixel caliper ("112 PX")
 * - Morphing animated mobile trigger paired with radial-expanding MobileMenu
 */
export function Header() {
  const scrolled = useScrolledPast(40);
  const activeId = useActiveSection(SECTION_IDS);
  const tone = useHeaderTone();
  const isLight = tone === "light";
  const isDesktop = useMediaQuery("(min-width: 900px)");

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeIndex = Math.max(
    0,
    NAV_LINKS.findIndex((item) => item.id === activeId),
  );
  const highlightedIndex = hoverIndex ?? activeIndex;

  const navRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const dimLabRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const ctaInnerRef = useRef<HTMLSpanElement>(null);

  useMagnetic(ctaRef, {
    radius: 90,
    strength: { x: 0.16, y: 0.22 },
    easing: 0.15,
    innerRef: ctaInnerRef,
  });

  // Sync sliding pill indicator & hover architectural caliper ("0 PX").
  const syncIndicator = useCallback(() => {
    const nav = navRef.current;
    const ind = indRef.current;
    if (!nav || !ind) return;
    const target = nav.querySelector<HTMLElement>(`[data-nav="${highlightedIndex}"]`);
    if (!target) return;

    ind.style.left = `${target.offsetLeft}px`;
    ind.style.width = `${target.offsetWidth}px`;
    ind.style.opacity = "1";

    const dim = dimRef.current;
    if (dim) {
      dim.style.left = `${target.offsetLeft}px`;
      dim.style.width = `${target.offsetWidth}px`;
      dim.style.opacity = hoverIndex != null ? "1" : "0";
    }
    if (dimLabRef.current) {
      const text = `${Math.round(target.offsetWidth)} PX`;
      if (dimLabRef.current.textContent !== text) dimLabRef.current.textContent = text;
    }
  }, [highlightedIndex, hoverIndex]);

  useEffect(() => {
    syncIndicator();
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(syncIndicator);
    observer.observe(nav);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) syncIndicator();
    });

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [syncIndicator, isDesktop]);

  // Update bottom hairline progress bar & exact section tick positions at 60 FPS (zero re-renders).
  useFrame(() => {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    if (progRef.current) {
      progRef.current.style.width = `${(clamp(y / max) * 100).toFixed(3)}%`;
    }

    SECTION_IDS.forEach((id, i) => {
      const tick = tickRefs.current[i];
      if (!tick) return;
      const section = document.getElementById(id);
      if (!section) return;
      const top = section.getBoundingClientRect().top + y;
      const pct = clamp(top / max) * 100;
      tick.style.left = `${pct.toFixed(2)}%`;
    });
  }, true);

  const mobileMenuActive = menuOpen && !isDesktop;
  const headerDarkForMenu = mobileMenuActive || !isLight;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-95 transition-colors duration-450",
          headerDarkForMenu ? "text-white" : "text-ink",
        )}
      >
        <div
          className={cn(
            "relative flex flex-nowrap items-center justify-between gap-4 px-[clamp(18px,3vw,64px)]",
            "transition-[padding,background-color,backdrop-filter] duration-500 ease-smooth",
            scrolled && !mobileMenuActive ? "py-2.5 backdrop-blur-[14px]" : "py-[18px] bg-transparent",
            scrolled && !mobileMenuActive && !isLight && "bg-black/78",
            scrolled && !mobileMenuActive && isLight && "bg-paper/84",
          )}
        >
          {/* Left: Cross-Fading Wordmark */}
          <a
            href="#domov"
            data-cursor="link"
            onClick={() => setMenuOpen(false)}
            aria-label="PG DIGITAL domov"
            className="group flex min-w-0 shrink-0 items-center transition-opacity duration-300 hover:opacity-90"
          >
            <span
              className={cn(
                "relative block aspect-[2/1] shrink-0 transition-[height] duration-500 ease-smooth",
                scrolled && !mobileMenuActive ? "h-[32px]" : "h-[34px] nav:h-[40px]",
              )}
            >
              <Logo
                tone="dark"
                alt="PG DIGITAL"
                eager
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-450",
                  headerDarkForMenu ? "opacity-100" : "opacity-0",
                )}
              />
              <Logo
                tone="light"
                alt=""
                eager
                className={cn(
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-450",
                  headerDarkForMenu ? "opacity-0" : "opacity-100",
                )}
              />
            </span>
          </a>

          {/* Center: Floating Pill Nav with Sliding Indicator & Architectural Caliper */}
          <div className="relative hidden min-w-0 flex-[0_1_auto] nav:block">
            <nav
              ref={navRef}
              aria-label="Glavna navigacija"
              onMouseLeave={() => setHoverIndex(null)}
              className={cn(
                "relative flex items-center gap-0.5 rounded-full border p-[5px] font-display text-[clamp(11px,0.9vw,13px)] font-bold tracking-[.02em] whitespace-nowrap transition-[background-color,border-color] duration-450",
                !scrolled
                  ? "border-white/14 bg-transparent"
                  : isLight
                    ? "border-ink/10 bg-white/75"
                    : "border-white/12 bg-[#0e0e0e]/72",
              )}
            >
              {/* Sliding Active/Hover Pill + Left-Anchored Orange Dot */}
              <span
                ref={indRef}
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-[5px] bottom-[5px] left-[5px] rounded-full opacity-0",
                  "transition-[left,width,background-color,opacity] duration-450 ease-smooth",
                  isLight
                    ? "bg-white shadow-[0_1px_3px_rgba(10,10,10,0.1)]"
                    : "bg-white/10",
                )}
              >
                <span className="absolute top-1/2 left-[11px] -mt-[3px] size-1.5 rounded-full bg-brand" />
              </span>

              {NAV_LINKS.map(({ id, label }, i) => {
                const isActive = i === activeIndex;
                const isHighlighted = i === highlightedIndex;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    data-nav={i}
                    data-cursor="link"
                    aria-current={isActive ? "location" : undefined}
                    onMouseEnter={() => setHoverIndex(i)}
                    onFocus={() => setHoverIndex(i)}
                    onBlur={() => setHoverIndex(null)}
                    className={cn(
                      "relative z-10 rounded-full py-2.5 pr-[clamp(10px,1vw,16px)] pl-[clamp(22px,1.9vw,26px)] transition-colors duration-300",
                      isLight
                        ? isHighlighted
                          ? "text-ink"
                          : "text-ink-muted hover:text-ink"
                        : isHighlighted
                          ? "text-white"
                          : "text-white/68 hover:text-white",
                    )}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>

            {/* Architectural Hover Caliper Dimension Line ("112 PX") */}
            <div
              ref={dimRef}
              aria-hidden
              className="pointer-events-none absolute top-full left-0 mt-2 h-[9px] w-[90px] opacity-0 transition-[left,width,opacity] duration-450 ease-smooth"
            >
              <span className="absolute inset-x-0 top-1 h-px bg-brand" />
              <span className="absolute top-0 left-0 h-[9px] w-px bg-brand" />
              <span className="absolute top-0 right-0 h-[9px] w-px bg-brand" />
              <span
                ref={dimLabRef}
                className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold tracking-[.14em] whitespace-nowrap tabular-nums text-brand"
              >
                0 PX
              </span>
            </div>
          </div>

          {/* Right: Desktop Magnetic Primary CTA */}
          <a
            ref={ctaRef}
            href="#kontakt"
            data-cursor="link"
            className={cn(
              "group relative hidden shrink-0 items-center overflow-hidden rounded-full px-[clamp(16px,1.6vw,24px)] font-display text-[13px] font-extrabold tracking-[.06em] whitespace-nowrap will-change-transform nav:inline-flex",
              "transition-[background-color,color,padding] duration-450 ease-smooth",
              scrolled ? "py-[11px]" : "py-[14px]",
              isLight ? "bg-ink text-paper" : "bg-white text-black",
            )}
          >
            <span
              aria-hidden
              className="absolute inset-0 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-machine group-hover:scale-x-100 group-focus-visible:scale-x-100"
            />
            <span
              ref={ctaInnerRef}
              className="relative inline-flex items-center gap-2 transition-colors duration-300 group-hover:text-black group-focus-visible:text-black"
            >
              <span>ZAČNIMO PROJEKT</span>
              <ArrowRightIcon
                size={15}
                className="transition-transform duration-500 ease-smooth group-hover:translate-x-1 group-focus-visible:translate-x-1"
              />
            </span>
          </a>

          {/* Right: Morphing Editorial Mobile MENI / ZAPRI Pill */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={mobileMenuActive ? "Zapri meni" : "Odpri meni"}
            aria-expanded={mobileMenuActive}
            className={cn(
              "inline-flex h-12 shrink-0 cursor-pointer items-center gap-3 rounded-full border pr-[18px] pl-5 font-display text-[13px] font-extrabold tracking-[.08em] transition-[background-color,color,border-color,transform] duration-400 ease-smooth active:scale-95 nav:hidden",
              mobileMenuActive
                ? "border-white/18 bg-transparent text-white hover:border-brand"
                : !scrolled
                  ? "border-white/18 bg-transparent text-white hover:border-brand"
                  : isLight
                    ? "border-ink/10 bg-white/75 text-ink hover:border-ink/35"
                    : "border-white/14 bg-[#0e0e0e]/75 text-white hover:border-brand",
            )}
          >
            <span>{mobileMenuActive ? "ZAPRI" : "MENI"}</span>
            <span aria-hidden className="relative flex h-4 w-[18px] items-center justify-end">
              <span
                className={cn(
                  "absolute h-[1.5px] rounded-full transition-all duration-400 ease-smooth",
                  mobileMenuActive
                    ? "w-[16px] translate-y-0 rotate-45 bg-brand"
                    : "w-[18px] -translate-y-[3.25px] bg-current",
                )}
              />
              <span
                className={cn(
                  "absolute h-[1.5px] rounded-full bg-brand transition-all duration-400 ease-smooth",
                  mobileMenuActive
                    ? "w-[16px] translate-y-0 -rotate-45"
                    : "w-[12px] translate-y-[3.25px]",
                )}
              />
            </span>
          </button>

          {/* Bottom Hairline Scroll Progress Bar + 6 Section Tick Marks */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-[background-color,opacity] duration-450",
              !scrolled || mobileMenuActive ? "opacity-0" : "opacity-100",
              isLight ? "bg-ink/10" : "bg-white/10",
            )}
          >
            <div ref={progRef} className="absolute top-0 left-0 h-px w-0 bg-brand" />
            {NAV_LINKS.map(({ id }, i) => (
              <span
                key={id}
                ref={(el) => {
                  tickRefs.current[i] = el;
                }}
                className={cn(
                  "absolute -top-[2px] left-0 h-[5px] w-px transition-colors duration-300",
                  i <= activeIndex
                    ? "bg-brand"
                    : isLight
                      ? "bg-ink/25"
                      : "bg-white/30",
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {!isDesktop && (
        <MobileMenu open={menuOpen} activeId={activeId} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
