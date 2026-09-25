"use client";

import { useRef } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";

/** Large round call-to-action that is pulled towards the pointer. */
export function MagneticCta({ href }: { href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);

  return (
    <a
      ref={ref}
      href={href}
      data-cursor="link"
      className="mt-3 flex aspect-square w-[clamp(130px,13vw,180px)] items-center justify-center rounded-full bg-brand text-center font-mono text-[10.5px] font-bold tracking-[.18em] text-black will-change-transform"
    >
      PIŠITE
      <br />
      NAM →
    </a>
  );
}
