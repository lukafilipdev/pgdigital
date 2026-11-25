"use client";

import { useRef, useState } from "react";
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

const navText = "font-display text-[13px] font-semibold tracking-[.03em]";

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
          "fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between gap-6 px-[clamp(18px,3vw,44px)] nav:h-[82px]",
          "border-b transition-[background-color,border-color,color,backdrop-filter] duration-500",
          !scrolled && "border-transparent bg-transparent",
          scrolled && !isLight && "border-white/8 bg-black/72 backdrop-blur-[14px]",
          scrolled && isLight && "border-ink-line bg-paper/88 backdrop-blur-[14px]",
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

        {/* Floating architectural pill navigation container */}
        <nav
          aria-label="Glavna navigacija"
          className={cn(
            "hidden items-center gap-1 rounded-full border p-1.5 backdrop-blur-[12px] transition-[background-color,border-color] duration-400 nav:flex",
            isLight
              ? "border-ink/10 bg-white/65 shadow-[0_2px_12px_rgba(8,8,12,0.05)]"
              : "border-white/10 bg-[#141416]/75 shadow-[0_4px_20px_rgba(0,0,0,0.35)]",
          )}
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
                  "relative flex items-center gap-2 rounded-full px-4 py-2 transition-[background-color,color,box-shadow] duration-300 ease-smooth",
                  isLight
                    ? isActive
                      ? "bg-white font-bold text-ink shadow-[0_1px_3px_rgba(8,8,12,0.1)]"
                      : "text-ink/65 hover:bg-ink/[0.04] hover:text-ink focus-visible:text-ink"
                    : isActive
                      ? "bg-white/[0.11] font-bold text-white"
                      : "text-white/68 hover:bg-white/[0.05] hover:text-white focus-visible:text-white",
                )}
              >
                {isActive && <span aria-hidden className="size-1.5 rounded-full bg-brand" />}
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
            <ArrowRightIcon
              size={15}
              className="transition-transform duration-500 ease-smooth group-hover:translate-x-[4px] group-focus-visible:translate-x-[4px]"
            />
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

      {menuOpen && !isDesktop && (
        <MobileMenu activeId={activeId} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
