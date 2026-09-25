"use client";

import { useEffect, useEffectEvent } from "react";
import { subscribeFrame, type FrameCallback } from "@/lib/frame-loop";

/**
 * Runs `callback` on every animation frame while `enabled` is true.
 * The callback always sees the latest props/state without resubscribing.
 */
export function useFrame(callback: FrameCallback, enabled = true) {
  const onFrame = useEffectEvent(callback);

  useEffect(() => {
    if (!enabled) return;
    return subscribeFrame((now) => onFrame(now));
  }, [enabled]);
}
