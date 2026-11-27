"use client";

import { useEffect, useEffectEvent } from "react";
import {
  ArrowRightIcon,
  BespokeLayersIcon,
  CalendarIcon,
  ClockIcon,
  DesignSystemIcon,
  GlobeIcon,
  HomeIcon,
  MailIcon,
} from "@/components/ui/Icons";
import { CONTACT_EMAIL } from "@/content/site";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/cn";

type MobileMenuProps = {
  open: boolean;
  activeId?: string;
  onClose: () => void;
};

const MENU_ITEMS = [
  { id: "domov", label: "Domov", Icon: HomeIcon },
  { id: "o-nas", label: "O nas", Icon: BespokeLayersIcon },
  { id: "storitve", label: "Storitve", Icon: DesignSystemIcon },
  { id: "projekti", label: "Projekti", Icon: GlobeIcon },
  { id: "proces", label: "Proces", Icon: CalendarIcon },
  { id: "kontakt", label: "Kontakt", Icon: MailIcon },
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
        "fixed inset-0 z-90 flex flex-col justify-between overflow-y-auto bg-black/95 px-[clamp(20px,5.5vw,32px)] pt-[88px] pb-[max(26px,env(safe-area-inset-bottom))] text-white backdrop-blur-2xl",
        "transition-[clip-path,opacity] duration-550 ease-smooth",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{
        clipPath: open
          ? "circle(150% at calc(100% - 40px) 40px)"
          : "circle(0% at calc(100% - 40px) 40px)",
      }}
    >
      {/* Subtle top divider beneath the persistent morphing header */}
      <div className="h-px w-full shrink-0 bg-white/10" />

      {/* Staggered Modern Navigation List with Crisp Icons */}
      <nav aria-label="Meni" className="my-auto py-5">
        <div className="flex flex-col gap-1.5">
          {MENU_ITEMS.map(({ id, label, Icon }, index) => {
            const isActive = id === activeId;
            return (
              <a
                key={id}
                href={`#${id}`}
                tabIndex={open ? 0 : -1}
                onClick={onClose}
                aria-current={isActive ? "location" : undefined}
                style={{
                  transitionDelay: open ? `${90 + index * 45}ms` : "0ms",
                }}
                className={cn(
                  "group flex items-center justify-between gap-4 rounded-2xl px-3.5 py-3 transition-[opacity,transform,background-color,color] duration-500 ease-smooth",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                )}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
                      isActive
                        ? "border-brand/50 bg-brand/15 text-brand"
                        : "border-white/12 bg-white/[0.03] text-white/65 group-hover:border-brand/40 group-hover:text-brand",
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <span
                    className={cn(
                      "font-display text-[clamp(28px,8.5vw,44px)] leading-none font-extrabold tracking-[-.04em] transition-colors duration-300",
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
                    isActive ? "text-brand" : "text-white/30 group-hover:text-brand",
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
            className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-brand"
          >
            <MailIcon size={13} className="text-brand" />
            <span>{CONTACT_EMAIL}</span>
          </a>
          <span className="inline-flex items-center gap-1.5 text-white/65">
            <ClockIcon size={13} className="text-brand" />
            <span>ODZIV V 24 URAH</span>
          </span>
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
