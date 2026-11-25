"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { ArrowRightIcon, CloseIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { CONTACT_EMAIL, NAV_LINKS } from "@/content/site";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/cn";

type MobileMenuProps = {
  activeId?: string;
  onClose: () => void;
};

export function MobileMenu({ activeId, onClose }: MobileMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") onClose();
  });
  useScrollLock(true);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => onEscape(event);
    closeRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meni"
      className="fixed inset-0 z-90 flex flex-col justify-between overflow-y-auto bg-[#08080c] bg-mesh-dark px-[18px] pb-6 text-paper"
    >
      {/* Top Bar matching Header height & official PG DIGITAL logo */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10">
        <Logo height={34} tone="dark" alt="PG DIGITAL" eager />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Zapri meni"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/22 bg-[#141418]/90 px-4 font-display text-[12px] font-extrabold tracking-[.08em] text-paper transition-colors hover:border-brand hover:text-brand"
        >
          <span>ZAPRI</span>
          <CloseIcon size={15} />
        </button>
      </div>

      {/* Main Architectural Navigation Card */}
      <nav
        aria-label="Meni"
        className="my-auto py-5"
      >
        <div className="flex flex-col divide-y divide-white/[0.08] rounded-[18px] border border-white/12 bg-[#0e0e13]/95 px-5 py-1 shadow-[0_28px_64px_rgba(0,0,0,0.65)] backdrop-blur-[10px]">
          {NAV_LINKS.map(({ id, label }, index) => {
            const isActive = id === activeId;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={onClose}
                aria-current={isActive ? "location" : undefined}
                className="group flex items-center justify-between gap-4 py-3.5 transition-colors"
              >
                <span className="flex items-baseline gap-3.5">
                  <span
                    className={cn(
                      "eyebrow-sm tabular-nums transition-colors",
                      isActive ? "text-brand" : "text-muted group-hover:text-brand",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[clamp(22px,6.8vw,30px)] leading-none font-extrabold tracking-[-.035em] transition-colors",
                      isActive ? "text-paper" : "text-paper/80 group-hover:text-paper",
                    )}
                  >
                    {label}
                  </span>
                  {isActive && <span aria-hidden className="size-1.5 rounded-full bg-brand" />}
                </span>

                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-250",
                    isActive
                      ? "border-brand bg-brand text-[#08080c]"
                      : "border-white/15 bg-white/[0.03] text-paper/70 group-hover:border-brand group-hover:text-brand",
                  )}
                >
                  <ArrowRightIcon size={15} />
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Bottom Studio Metadata & Primary CTA Card */}
      <div className="flex shrink-0 flex-col gap-3.5 rounded-[18px] border border-white/12 bg-[#0e0e13]/95 p-4 backdrop-blur-[10px]">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[10px] tracking-[.12em] uppercase text-muted">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-soft transition-colors hover:text-brand"
          >
            {CONTACT_EMAIL}
          </a>
          <span className="inline-flex items-center gap-1.5 text-paper/80">
            <span className="size-1.5 rounded-full bg-brand" />
            V 24 URAH
          </span>
        </div>

        <a
          href="#kontakt"
          onClick={onClose}
          className="flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-brand font-display text-[15px] font-extrabold text-[#08080c] transition-colors hover:bg-paper"
        >
          <span>Začnimo projekt</span>
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </div>
  );
}
