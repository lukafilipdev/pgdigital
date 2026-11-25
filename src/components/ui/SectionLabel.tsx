import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionLabelProps = {
  index: string;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
};

/** "03 —— STORITVE" style label that opens each section on dark or light surfaces. */
export function SectionLabel({ index, children, tone = "dark", className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "eyebrow flex items-center gap-3.5",
        tone === "light" ? "text-ink-muted" : "text-muted",
        className,
      )}
    >
      <span className="text-brand">{index}</span>
      <span
        aria-hidden
        className={cn("h-px w-6", tone === "light" ? "bg-ink-line-strong" : "bg-edge")}
      />
      <span>{children}</span>
    </div>
  );
}
