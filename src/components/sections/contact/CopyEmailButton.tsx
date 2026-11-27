"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard API may be unavailable on non-secure contexts; still show feedback safely.
    }
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      data-cursor="link"
      onClick={handleCopy}
      className={cn(
        "inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border px-4 font-mono text-[10px] font-bold tracking-[.16em] transition-colors duration-250",
        copied
          ? "border-brand text-brand"
          : "border-white/20 bg-transparent text-white hover:border-brand hover:text-brand",
      )}
    >
      {copied && <CheckIcon size={12} strokeWidth={2.4} />}
      <span>{copied ? "KOPIRANO" : "KOPIRAJ"}</span>
    </button>
  );
}
