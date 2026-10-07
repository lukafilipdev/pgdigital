"use client";

import { useEffect, useEffectEvent } from "react";
import { NAV_LINKS } from "@/content/site";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/cn";

export const MOBILE_MENU_ID = "mobile-menu";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-screen menu that slides down underneath the fixed header, so the logo
 * and the MENI/ZAPRI toggle never move. Stays mounted to animate both ways.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  });
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => onEscape(event);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /** Items fade in one after another when opening, all at once when closing. */
  const stagger = (index: number) => ({
    className: cn(
      "transition-[opacity,translate] duration-500 ease-smooth motion-reduce:transition-none",
      !open && "translate-y-6 opacity-0",
    ),
    style: { transitionDelay: open ? `${180 + index * 55}ms` : "0ms" },
  });

  return (
    <div
      id={MOBILE_MENU_ID}
      inert={!open}
      className={cn(
        "fixed inset-0 z-40 flex flex-col bg-black px-[clamp(18px,3vw,40px)] pt-16 pb-7 nav:hidden",
        "transition-[clip-path] duration-600 ease-curtain motion-reduce:transition-none",
        open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]",
      )}
    >
      <nav aria-label="Meni" className="flex flex-1 flex-col justify-center gap-1.5">
        {NAV_LINKS.map(({ id, label }, index) => {
          const { className, style } = stagger(index);
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={onClose}
              style={style}
              className={cn(
                "flex items-baseline gap-3.5 text-[clamp(34px,10vw,56px)] leading-[1.08] font-bold tracking-[-.05em] text-white",
                className,
              )}
            >
              <span className="font-mono text-[10px] font-normal tracking-[.14em] text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </a>
          );
        })}
      </nav>

      <a
        href="#kontakt"
        onClick={onClose}
        style={stagger(NAV_LINKS.length).style}
        className={cn(
          "flex h-[54px] items-center justify-center rounded-full bg-brand font-mono text-[11px] tracking-[.16em] text-black",
          stagger(NAV_LINKS.length).className,
        )}
      >
        ZAČNIMO PROJEKT →
      </a>
    </div>
  );
}
