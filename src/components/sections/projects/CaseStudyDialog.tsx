"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PROJECTS } from "@/content/site";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useScrollLock } from "@/hooks/useScrollLock";
import { padNumber } from "@/lib/math";
import { LivePreview } from "./LivePreview";

/** Must match the `duration-750` clip-path transition below. */
const CURTAIN_MS = 750;
const FULLSCREEN = "inset(0px 0px 0px 0px)";

const clipFromRect = (rect: DOMRect) =>
  `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px)`;

type CaseStudyDialogProps = {
  index: number;
  /** Rect of the card that was clicked; the dialog grows out of it. */
  origin: DOMRect;
  onNext: () => void;
  /** Called once the closing animation has finished. */
  onClose: () => void;
};

export function CaseStudyDialog({ index, origin, onNext, onClose }: CaseStudyDialogProps) {
  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useScrollLock(true);

  const close = () => {
    if (reducedMotion) {
      onClose();
      return;
    }
    setExpanded(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, CURTAIN_MS);
  };
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus({ preventScroll: true });

    // Let the initial (card-sized) clip paint before expanding.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setExpanded(true));
    });
    const handleKeyDown = (event: KeyboardEvent) => onKeyDown(event);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(closeTimer.current);
      window.removeEventListener("keydown", handleKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, []);

  const showNext = () => {
    onNext();
    dialogRef.current?.scrollTo(0, 0);
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      className="fixed inset-0 z-95 overflow-y-auto bg-black transition-[clip-path] duration-750 ease-curtain motion-reduce:transition-none"
      style={{ clipPath: expanded || reducedMotion ? FULLSCREEN : clipFromRect(origin) }}
    >
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.08] bg-black/85 px-[clamp(18px,3vw,40px)] backdrop-blur-md">
        <span className="eyebrow flex items-center gap-3 text-muted">
          <span className="text-brand">
            {padNumber(index + 1, 2)} / {padNumber(PROJECTS.length, 2)}
          </span>
          <span aria-hidden className="h-px w-5 bg-edge" />
          <span className="text-white">{project.title}</span>
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          data-cursor="link"
          className="eyebrow h-10 shrink-0 cursor-pointer rounded-full border border-white/25 bg-black/70 px-[18px] whitespace-nowrap text-white transition-colors hover:border-brand hover:text-brand"
        >
          ZAPRI ×
        </button>
      </div>

      <div className="h-[min(78vh,740px)] min-h-[420px] px-[clamp(18px,3vw,40px)] pt-5 pb-4">
        <LivePreview key={project.slug} project={project} />
      </div>

      <div className="flex flex-col gap-[clamp(36px,6vh,64px)] px-[clamp(18px,3vw,40px)] pt-[clamp(40px,8vh,90px)] pb-[120px]">
        <div className="eyebrow flex flex-wrap gap-3.5 text-muted">
          <span className="text-brand">
            {padNumber(index + 1, 2)} / {padNumber(PROJECTS.length, 2)}
          </span>
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>

        <h2
          id="case-study-title"
          className="text-[clamp(56px,10vw,190px)] leading-[.9] font-extrabold tracking-[-.065em]"
        >
          {project.title}
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-[clamp(28px,5vw,80px)]">
          <div className="flex flex-col items-start gap-8">
            <p className="text-[clamp(20px,1.8vw,26px)] leading-[1.4] font-medium tracking-[-.02em] text-pretty">
              {project.summary}
            </p>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="eyebrow inline-flex h-12 items-center rounded-full border border-white/22 px-6 text-white transition-colors duration-300 hover:border-brand hover:bg-brand hover:text-black"
            >
              OBIŠČI SPLETNO STRAN ↗
            </a>
          </div>
          <dl className="eyebrow flex flex-col border-b border-line-strong text-muted">
            {[
              ["STORITVE", project.services],
              ["LETO", project.year],
              ["VLOGA", "OD IDEJE DO OBJAVE"],
            ].map(([term, detail]) => (
              <div key={term} className="flex justify-between gap-5 border-t border-line-strong py-3.5">
                <dt>{term}</dt>
                <dd className="text-right text-white">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          type="button"
          onClick={showNext}
          data-cursor="link"
          className="flex cursor-pointer flex-col gap-3 border-t border-line-strong pt-7 text-left"
        >
          <span className="eyebrow text-muted">NASLEDNJI PROJEKT</span>
          <span className="text-[clamp(34px,5vw,90px)] leading-[.95] font-extrabold tracking-[-.06em]">
            {next.title} →
          </span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
