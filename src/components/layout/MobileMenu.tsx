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
      className="fixed inset-0 z-90 flex flex-col justify-between overflow-y-auto bg-black px-[clamp(18px,5vw,28px)] pb-6 text-white"
    >
      {/* Top bar matching Header height */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10">
        <Logo height={34} tone="dark" alt="PG DIGITAL" eager />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Zapri meni"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 font-display text-[12px] font-extrabold tracking-[.08em] text-white transition-colors hover:border-brand hover:text-brand"
        >
          <span>ZAPRI</span>
          <CloseIcon size={15} />
        </button>
      </div>

      {/* Full-bleed monumental editorial navigation list */}
      <nav aria-label="Meni" className="my-auto py-6">
        <div className="flex flex-col divide-y divide-white/[0.08]">
          {NAV_LINKS.map(({ id, label }, index) => {
            const isActive = id === activeId;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={onClose}
                aria-current={isActive ? "location" : undefined}
                className="group flex items-baseline justify-between gap-4 py-2.5 transition-colors"
              >
                <span className="flex items-baseline gap-3.5">
                  <span className="eyebrow-sm tabular-nums text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[clamp(36px,11vw,58px)] leading-[1.04] font-extrabold tracking-[-.045em] transition-colors",
                      isActive ? "text-brand" : "text-white group-hover:text-brand",
                    )}
                  >
                    {label}
                  </span>
                </span>

                <ArrowRightIcon
                  size={18}
                  className={cn(
                    "shrink-0 transition-transform duration-250 group-hover:translate-x-1",
                    isActive ? "text-brand" : "text-white/30 group-hover:text-brand",
                  )}
                />
              </a>
            );
          })}
        </div>
      </nav>

      {/* Bottom studio contact & primary CTA */}
      <div className="flex shrink-0 flex-col gap-4 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[.12em] uppercase text-muted">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-soft transition-colors hover:text-brand"
          >
            {CONTACT_EMAIL}
          </a>
          <span className="text-white/70">ODZIV V 24 URAH</span>
        </div>

        <a
          href="#kontakt"
          onClick={onClose}
          className="flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-brand font-display text-[15px] font-extrabold text-black transition-colors hover:bg-white"
        >
          <span>Začnimo projekt</span>
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </div>
  );
}
