"use client";

import { useEffect } from "react";
import { pointer, trackPointer } from "@/lib/pointer";

/** Returns the shared pointer state and keeps it updated while mounted. */
export function usePointer() {
  useEffect(() => trackPointer(), []);
  return pointer;
}
