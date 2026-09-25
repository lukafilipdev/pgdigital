"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/content/site";
import { useScrollLock } from "@/hooks/useScrollLock";

type MobileMenuProps = {
  onClose: () => void;
};

export function MobileMenu({ onClose }: MobileMenuProps) {
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
      className="fixed inset-0 z-90 flex flex-col bg-black px-[22px] pt-[18px] pb-7"
    >
      <div className="flex h-[46px] items-center justify-between">
        <Logo height={24} eager />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Zapri meni"
          className="h-10 rounded-full border border-white/22 px-4 font-mono text-[10.5px] tracking-[.16em] text-white"
        >
          ZAPRI
        </button>
      </div>

      <nav aria-label="Meni" className="flex flex-1 flex-col justify-center gap-1.5">
        {NAV_LINKS.map(({ id, label }, index) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={onClose}
            className="flex items-baseline gap-3.5 text-[clamp(34px,10vw,56px)] leading-[1.08] font-bold tracking-[-.05em] text-white"
          >
            <span className="font-mono text-[10px] font-normal tracking-[.14em] text-brand">
              {String(index + 1).padStart(2, "0")}
            </span>
            {label}
          </a>
        ))}
      </nav>

      <a
        href="#kontakt"
        onClick={onClose}
        className="flex h-[54px] items-center justify-center rounded-full bg-brand font-mono text-[11px] tracking-[.16em] text-black"
      >
        ZAČNIMO PROJEKT →
      </a>
    </div>
  );
}
