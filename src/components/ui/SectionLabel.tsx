import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionLabelProps = {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
};

/** Clean dot + mono eyebrow that opens each section on dark or light surfaces. */
export function SectionLabel({ children, tone = "dark", className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "eyebrow inline-flex items-center gap-2.5",
        tone === "light" ? "text-ink-muted" : "text-white/65",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
      <span>{children}</span>
    </div>
  );
}
