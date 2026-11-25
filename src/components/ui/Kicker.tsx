import type { Ref } from "react";
import { cn } from "@/lib/cn";

type KickerProps = {
  left: string;
  right: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

/** Two monospace phrases separated by a short orange rule. */
export function Kicker({ left, right, className, ref }: KickerProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3.5 font-mono text-[11.5px] tracking-[.18em] text-subtle",
        className,
      )}
    >
      <span>{left}</span>
      <span aria-hidden className="h-px w-[18px] shrink-0 bg-brand" />
      <span>{right}</span>
    </div>
  );
}
