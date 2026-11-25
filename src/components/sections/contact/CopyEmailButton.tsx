"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/Icons";
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
        "eyebrow-sm inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 transition-colors duration-250",
        copied
          ? "border-brand bg-brand/10 text-brand"
          : "border-white/20 bg-black/40 text-paper/85 hover:border-brand hover:text-paper",
      )}
    >
      {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
      <span>{copied ? "KOPIRANO" : "KOPIRAJ"}</span>
    </button>
  );
}
