import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionLabelProps = {
  icon?: ReactNode;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
};

/** Clean icon + mono label that opens each section on dark or light surfaces (no AI numbering or dashes). */
export function SectionLabel({ icon, children, tone = "dark", className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "eyebrow inline-flex items-center gap-2.5",
        tone === "light" ? "text-ink-muted" : "text-white/65",
        className,
      )}
    >
      {icon ? (
        <span className="inline-flex shrink-0 text-brand">{icon}</span>
      ) : (
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
      )}
      <span>{children}</span>
    </div>
  );
}
