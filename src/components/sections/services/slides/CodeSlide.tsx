import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

const Keyword = ({ children }: { children: ReactNode }) => (
  <span className="text-brand">{children}</span>
);

const LINES: { indent: number; bright?: boolean; content: ReactNode }[] = [
  {
    indent: 0,
    content: (
      <>
        <Keyword>export function</Keyword> <span className="text-white">Hero</span>({"{ naslov }"}){" "}
        {"{"}
      </>
    ),
  },
  { indent: 1, content: "const ref = useRef(null);" },
  {
    indent: 1,
    content: (
      <>
        useScroll(ref, {"{"} pin: <Keyword>true</Keyword> {"}"});
      </>
    ),
  },
  {
    indent: 1,
    content: (
      <>
        <span className="text-white">return</span> (
      </>
    ),
  },
  { indent: 2, bright: true, content: "<section ref={ref}>" },
  { indent: 3, bright: true, content: "<h1>{naslov}</h1>" },
  { indent: 2, bright: true, content: "</section>" },
  { indent: 1, content: ");" },
  { indent: 0, content: "}" },
];

type RevealLineProps = {
  active: boolean;
  index: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function RevealLine({ active, index, className, style, children }: RevealLineProps) {
  return (
    <div
      className={cn(
        "transition-[opacity,translate] duration-[400ms,600ms] ease-smooth",
        !active && "-translate-x-3.5 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${index * 70}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** Web development: a typed Next.js component paired with responsive viewport wireframes. */
export function CodeSlide({ active }: { active: boolean }) {
  return (
    <div className="flex size-full flex-col justify-between gap-3 nav:gap-5">
      <div className="flex flex-col gap-0.5 rounded-[12px] border border-white/10 bg-[#18181c]/80 px-3.5 py-2.5 font-mono text-[10.5px] leading-[1.45] text-muted nav:gap-1 nav:px-5 nav:py-4 nav:text-[13px] nav:leading-[1.75]">
        {LINES.map(({ indent, bright, content }, index) => (
          <RevealLine
            key={index}
            active={active}
            index={index}
            className={cn("flex gap-3.5", bright && "text-white")}
          >
            <span className="w-3 shrink-0 select-none text-white/25">{index + 1}</span>
            <span style={{ paddingLeft: `${indent * 1.5}ch` }}>{content}</span>
          </RevealLine>
        ))}
      </div>

      {/* Responsive breakpoint wireframes (375 / 768 / 1440) */}
      <div className="flex items-end gap-3 nav:gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span className="h-9 w-6 rounded-[5px] border-[1.5px] border-brand nav:h-[54px] nav:w-8" />
          <span className="font-mono text-[9.5px] tracking-[.1em] text-white/45">375</span>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span className="h-12 w-11 rounded-[5px] border-[1.5px] border-white/35 nav:h-[72px] nav:w-16" />
          <span className="font-mono text-[9.5px] tracking-[.1em] text-white/45">768</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <span className="h-14 w-full rounded-[5px] border-[1.5px] border-white/35 nav:h-[86px]" />
          <span className="font-mono text-[9.5px] tracking-[.1em] text-white/45">1440</span>
        </div>
      </div>
    </div>
  );
}
