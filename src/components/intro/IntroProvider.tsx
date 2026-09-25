"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

type IntroContextValue = {
  /** `performance.now()` timestamp at which the intro animation began. */
  startedAt: number | null;
  start: () => void;
};

const IntroContext = createContext<IntroContextValue | null>(null);

/** Coordinates the page loader with the hero's entrance animation. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const start = useCallback(() => setStartedAt((prev) => prev ?? performance.now()), []);
  const value = useMemo(() => ({ startedAt, start }), [startedAt, start]);

  return <IntroContext value={value}>{children}</IntroContext>;
}

export function useIntro() {
  const context = use(IntroContext);
  if (!context) throw new Error("useIntro must be used inside <IntroProvider>");
  return context;
}
