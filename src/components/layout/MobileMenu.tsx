"use client";

import { useEffect, useEffectEvent } from "react";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { CONTACT_EMAIL } from "@/content/site";
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
        "fixed inset-0 z-90 flex flex-col justify-between overflow-y-auto bg-black/96 px-[clamp(20px,5.5vw,32px)] pt-[88px] pb-[max(26px,env(safe-area-inset-bottom))] text-white backdrop-blur-2xl",
        "transition-[clip-path,opacity] duration-550 ease-smooth",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{
        clipPath: open
          ? "circle(150% at calc(100% - 40px) 40px)"
          : "circle(0% at calc(100% - 40px) 40px)",
      }}
    >
      <div className="h-px w-full shrink-0 bg-white/10" />

      {/* Clean Editorial Staggered Navigation List */}
      <nav aria-label="Meni" className="my-auto py-5">
        <div className="flex flex-col divide-y divide-white/[0.08]">
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
                  transitionDelay: open ? `${80 + index * 45}ms` : "0ms",
                }}
                className={cn(
                  "group flex items-center justify-between gap-4 py-3.5 transition-[opacity,transform,color] duration-500 ease-smooth",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <span className="flex items-center gap-3">
                  {isActive && <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />}
                  <span
                    className={cn(
                      "font-display text-[clamp(32px,9.5vw,52px)] leading-none font-extrabold tracking-[-.045em] transition-colors duration-300",
                      isActive ? "text-brand" : "text-white group-hover:text-brand",
                    )}
                  >
                    {label}
                  </span>
                </span>

                <ArrowRightIcon
                  size={18}
                  className={cn(
                    "shrink-0 transition-transform duration-300 group-hover:translate-x-1",
                    isActive ? "text-brand" : "text-white/25 group-hover:text-brand",
                  )}
                />
              </a>
            );
          })}
        </div>
      </nav>

      {/* Bottom Studio Contact & Primary CTA */}
      <div
        style={{ transitionDelay: open ? "340ms" : "0ms" }}
        className={cn(
          "flex shrink-0 flex-col gap-4 border-t border-white/10 pt-5 transition-[opacity,transform] duration-500 ease-smooth",
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px] tracking-[.12em] text-white/60">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            tabIndex={open ? 0 : -1}
            className="text-white/80 transition-colors hover:text-brand"
          >
            {CONTACT_EMAIL}
          </a>
          <span className="text-white/65">ODZIV V 24 URAH</span>
        </div>

        <a
          href="#kontakt"
          tabIndex={open ? 0 : -1}
          onClick={onClose}
          className="flex h-[54px] items-center justify-center gap-2.5 rounded-full bg-brand font-display text-[15.5px] font-extrabold text-black transition-colors hover:bg-white"
        >
          <span>Začnimo projekt</span>
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </div>
  );
}
