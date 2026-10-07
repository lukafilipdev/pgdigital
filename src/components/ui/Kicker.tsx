import type { Ref } from "react";
import { cn } from "@/lib/cn";

type KickerProps = {
  left: string;
  right: string;
  className?: string;
  /** Applied to the left phrase and the rule, e.g. to hide them on small screens. */
  leftClassName?: string;
  ref?: Ref<HTMLDivElement>;
};

/** Two monospace phrases separated by a short orange rule. */
export function Kicker({ left, right, className, leftClassName, ref }: KickerProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3.5 font-mono text-[10.5px] tracking-[.2em] text-muted",
        className,
      )}
    >
      <span className={leftClassName}>{left}</span>
      <span aria-hidden className={cn("h-px w-[18px] bg-brand", leftClassName)} />
      <span>{right}</span>
    </div>
  );
}
