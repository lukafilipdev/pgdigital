"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useFrame } from "@/hooks/useFrame";
import { cn } from "@/lib/cn";
import { clamp, easeOutQuart, padNumber } from "@/lib/math";
import { useIntro } from "./IntroProvider";

const MIN_DURATION_MS = 720;
const FONT_TIMEOUT_MS = 1500;

type Phase = "loading" | "leaving" | "done";

/** Full-screen loader shown until fonts are ready, then hands off to the hero intro. */
export function Loader() {
  const { start } = useIntro();
  const [phase, setPhase] = useState<Phase>("loading");
  const lineRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef<number | null>(null);
  const fontsReady = useRef(false);

  useEffect(() => {
    const timeout = new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT_MS));
    Promise.race([document.fonts.ready, timeout]).then(() => {
      fontsReady.current = true;
    });
  }, []);

  useFrame((now) => {
    mountedAt.current ??= now;
    const progress = clamp((now - mountedAt.current) / MIN_DURATION_MS);
    const eased = easeOutQuart(progress);

    if (lineRef.current) lineRef.current.style.transform = `scaleX(${eased})`;
    if (percentRef.current) percentRef.current.textContent = padNumber(eased * 100, 3);

    if (progress >= 1 && fontsReady.current) {
      setPhase("leaving");
      start();
    }
  }, phase === "loading");

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      onTransitionEnd={() => setPhase("done")}
      className={cn(
        "fixed inset-0 z-100 flex flex-col items-center justify-center gap-[22px] bg-black",
        "transition-opacity duration-450 ease-smooth",
        phase === "leaving" && "pointer-events-none opacity-0",
      )}
    >
      <Logo height={38} alt="" eager />
      <div className="h-px w-[132px] overflow-hidden bg-line">
        <div
          ref={lineRef}
          className="size-full origin-left bg-brand"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <div ref={percentRef} className="font-mono text-[10px] tracking-[.18em] text-dim">
        000
      </div>
    </div>
  );
}
