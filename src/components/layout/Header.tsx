"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS, SECTION_IDS } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useActiveSection, useHeaderTone, useScrolledPast } from "@/hooks/useScrollState";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/math";
import { MobileMenu } from "./MobileMenu";

const navText = "font-display text-[13.5px] font-bold tracking-[.06em]";

export function Header() {
  const scrolled = useScrolledPast(40);
  const activeId = useActiveSection(SECTION_IDS);
  const tone = useHeaderTone();
  const isLight = tone === "light";
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const [menuOpen, setMenuOpen] = useState(false);

  const ctaRef = useRef<HTMLAnchorElement>(null);
  const ctaInnerRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);

  useMagnetic(ctaRef, {
    radius: 90,
    strength: { x: 0.16, y: 0.22 },
    easing: 0.15,
    innerRef: ctaInnerRef,
  });

  // Global 2px architectural scroll-progress indicator (zero React re-renders).
  useFrame(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0;
    bar.style.transform = `scaleX(${progress.toFixed(4)})`;
  }, true);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between gap-6 px-[clamp(18px,3vw,44px)] nav:h-[80px]",
          "border-b transition-[background-color,border-color,color,backdrop-filter] duration-500",
          !scrolled && "border-transparent bg-transparent",
          scrolled && !isLight && "border-white/10 bg-black/78 backdrop-blur-[14px]",
          scrolled && isLight && "border-ink-line bg-paper/90 backdrop-blur-[14px]",
        )}
      >
        <a
          href="#domov"
          data-cursor="link"
          aria-label="PG DIGITAL — domov"
          className="group flex shrink-0 items-center py-1 transition-opacity duration-300 hover:opacity-85"
        >
          <Logo
            tone={isLight ? "light" : "dark"}
            alt="PG DIGITAL"
            eager
            className="h-[34px] nav:h-[42px]"
          />
        </a>

        <nav
          aria-label="Glavna navigacija"
          className="hidden items-center gap-[clamp(22px,2.8vw,38px)] nav:flex"
        >
          {NAV_LINKS.map(({ id, label }) => {
            const isActive = id === activeId;
            return (
              <a
                key={id}
                href={`#${id}`}
                data-cursor="link"
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  navText,
                  "group relative flex items-center py-2 transition-colors duration-350 ease-smooth",
                  isLight
                    ? isActive
                      ? "font-extrabold text-ink"
                      : "text-ink/65 hover:text-ink focus-visible:text-ink"
                    : isActive
                      ? "font-extrabold text-white"
                      : "text-white/70 hover:text-white focus-visible:text-white",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 -left-[12px] size-1.5 -translate-y-1/2 rounded-full transition-[scale,background-color] duration-350 ease-smooth",
                    isActive
                      ? "scale-100 bg-brand"
                      : isLight
                        ? "scale-0 bg-ink/45 group-hover:scale-100 group-focus-visible:scale-100"
                        : "scale-0 bg-white/50 group-hover:scale-100 group-focus-visible:scale-100",
                  )}
                />
                {label}
              </a>
            );
          })}
        </nav>

        <a
          ref={ctaRef}
          href="#kontakt"
          data-cursor="link"
          className={cn(
            "group relative hidden h-[44px] items-center overflow-hidden rounded-full border-2 px-6 font-display text-[13px] font-extrabold tracking-[.06em] will-change-transform nav:inline-flex",
            "transition-[border-color,background-color,color] duration-350 ease-smooth hover:border-brand focus-visible:border-brand",
            isLight
              ? "border-ink bg-ink text-white"
              : "border-white bg-white text-black",
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
            ZAČNIMO PROJEKT
            <span
              aria-hidden
              className="inline-block transition-transform duration-500 ease-smooth group-hover:translate-x-[5px] group-focus-visible:translate-x-[5px]"
            >
              →
            </span>
          </span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Odpri meni"
          aria-expanded={menuOpen}
          className={cn(
            "flex h-11 items-center gap-2.5 rounded-full border-[1.5px] px-5 font-display text-[12px] font-extrabold tracking-[.1em] transition-colors duration-350 nav:hidden",
            isLight ? "border-ink/45 bg-ink/[0.04] text-ink" : "border-white/45 bg-white/[0.06] text-white",
          )}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          MENI
        </button>

        {/* Global bold orange scroll-progress bar */}
        <span
          ref={progressBarRef}
          aria-hidden
          className="pointer-events-none absolute right-0 -bottom-px left-0 h-[2px] origin-left bg-brand"
          style={{ transform: "scaleX(0)" }}
        />
      </header>

      {menuOpen && !isDesktop && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
