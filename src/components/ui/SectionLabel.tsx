import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionLabelProps = {
  index: string;
  children: ReactNode;
  className?: string;
};

/** "02 —— STORITVE" style label that opens each section. */
export function SectionLabel({ index, children, className }: SectionLabelProps) {
  return (
    <div className={cn("eyebrow flex items-center gap-3.5 text-muted", className)}>
      <span className="text-brand">{index}</span>
      <span aria-hidden className="h-px w-6 bg-edge" />
      <span>{children}</span>
    </div>
  );
}
