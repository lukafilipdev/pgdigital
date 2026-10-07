"use client";

import { useCallback, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS, SECTION_IDS } from "@/content/site";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useActiveSection, useScrolledPast } from "@/hooks/useScrollState";
import { cn } from "@/lib/cn";
import { MOBILE_MENU_ID, MobileMenu } from "./MobileMenu";

const navText = "font-mono text-[10.5px] font-semibold tracking-[.14em]";

export function Header() {
  const scrolled = useScrolledPast(40);
  const activeId = useActiveSection(SECTION_IDS);
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const ctaRef = useRef<HTMLAnchorElement>(null);
  const ctaInnerRef = useRef<HTMLSpanElement>(null);
  useMagnetic(ctaRef, {
    radius: 110,
    strength: { x: 0.32, y: 0.4 },
    easing: 0.15,
    innerRef: ctaInnerRef,
  });

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-6 px-[clamp(18px,3vw,40px)]",
          "border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled && "border-white/7 bg-black/62 backdrop-blur-[14px]",
        )}
      >
        <a
          href="#domov"
          onClick={closeMenu}
          data-cursor="link"
          aria-label="PG INŽENIRING — domov"
          className="flex items-center"
        >
          <Logo height={24} alt="" eager />
        </a>

        <nav
          aria-label="Glavna navigacija"
          className="hidden items-center gap-[clamp(18px,2.4vw,34px)] nav:flex"
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
                  "flex items-center gap-[7px] transition-colors duration-300 hover:text-white",
                  isActive ? "text-white" : "text-muted",
                )}
              >
                {isActive && <span aria-hidden className="size-1 rounded-full bg-brand" />}
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
            navText,
            "hidden h-[38px] items-center rounded-full border border-white/22 px-[18px] text-white will-change-transform nav:inline-flex",
            "transition-colors duration-350 hover:border-brand hover:bg-brand hover:text-black",
          )}
        >
          <span ref={ctaInnerRef} className="inline-block will-change-transform">
            ZAČNIMO PROJEKT →
          </span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Zapri meni" : "Odpri meni"}
          aria-expanded={menuOpen}
          aria-controls={MOBILE_MENU_ID}
          className="flex h-10 min-w-[92px] items-center justify-center gap-2.5 rounded-full border border-white/22 px-4 font-mono text-[10.5px] tracking-[.16em] text-white nav:hidden"
        >
          <span
            aria-hidden
            className={cn(
              "size-[5px] rounded-full bg-brand transition-transform duration-300",
              menuOpen && "scale-150",
            )}
          />
          {menuOpen ? "ZAPRI" : "MENI"}
        </button>
      </header>

      <MobileMenu open={menuOpen && !isDesktop} onClose={closeMenu} />
    </>
  );
}
