"use client";

import { useEffect, useEffectEvent } from "react";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/cn";

type MobileMenuProps = {
  open: boolean;
  activeId?: string;
  onClose: () => void;
};

const MENU_ITEMS = [
  { id: "domov", label: "Domov" },
  { id: "o-nas", label: "O nas" },
  { id: "storitve", label: "Storitve" },
  { id: "projekti", label: "Projekti" },
  { id: "proces", label: "Proces" },
  { id: "kontakt", label: "Kontakt" },
] as const;

export function MobileMenu({ open, activeId, onClose }: MobileMenuProps) {
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

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label="Meni"
      className={cn(
        "fixed inset-0 z-90 flex flex-col justify-between overflow-y-auto bg-black px-[clamp(18px,3vw,64px)] pt-[92px] pb-[max(32px,env(safe-area-inset-bottom))] text-white",
        "transition-[clip-path,opacity] duration-550 ease-smooth",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{
        clipPath: open
          ? "circle(155% at calc(100% - 58px) 42px)"
          : "circle(0% at calc(100% - 58px) 42px)",
      }}
    >
      {/* Monumental Editorial Navigation List (Navbar_Mobile inspiration, zero numbering) */}
      <nav aria-label="Meni" className="flex flex-1 flex-col justify-center gap-1.5 py-6">
        {MENU_ITEMS.map(({ id, label }, index) => {
          const isActive = id === activeId;
          return (
            <a
              key={id}
              href={`#${id}`}
              tabIndex={open ? 0 : -1}
              onClick={onClose}
              aria-current={isActive ? "location" : undefined}
              style={{
                transitionDelay: open ? `${70 + index * 40}ms` : "0ms",
              }}
              className={cn(
                "group flex items-baseline justify-between gap-4 border-b border-white/[0.08] py-2 font-display text-[clamp(40px,11.5vw,64px)] leading-[1.06] font-extrabold tracking-[-.045em]",
                "transition-[opacity,transform,color] duration-500 ease-smooth",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                isActive ? "text-brand" : "text-white hover:text-brand",
              )}
            >
              <span className="inline-flex items-center gap-3.5">
                {isActive && <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />}
                <span>{label}</span>
              </span>

              <ArrowRightIcon
                size={20}
                className={cn(
                  "shrink-0 transition-transform duration-300 group-hover:translate-x-1",
                  isActive ? "text-brand" : "text-white/20 group-hover:text-brand",
                )}
              />
            </a>
          );
        })}
      </nav>

      {/* Full-Width Primary Orange CTA */}
      <a
        href="#kontakt"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        style={{ transitionDelay: open ? "310ms" : "0ms" }}
        className={cn(
          "flex min-h-[56px] shrink-0 items-center justify-center gap-2.5 rounded-full bg-brand font-display text-[16px] font-extrabold text-black",
          "transition-[opacity,transform,background-color] duration-500 ease-smooth hover:bg-white",
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <span>Začnimo projekt</span>
        <ArrowRightIcon size={17} />
      </a>
    </div>
  );
}
