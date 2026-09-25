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

/** Web development: a component that types itself in, line by line. */
export function CodeSlide({ active }: { active: boolean }) {
  return (
    <div className="flex size-full flex-col gap-1.5 font-mono text-[clamp(11px,1vw,14px)] leading-[1.7] text-muted">
      <div className="eyebrow mb-3.5">STRUKTURA · KOMPONENTE</div>
      {LINES.map(({ indent, bright, content }, index) => (
        <RevealLine
          key={index}
          active={active}
          index={index}
          className={cn(bright && "text-white")}
          style={{ paddingLeft: `${indent * 2}ch` }}
        >
          {content}
        </RevealLine>
      ))}
      <RevealLine
        active={active}
        index={LINES.length}
        className="mt-auto flex flex-wrap gap-[18px]"
      >
        <span className="text-brand">● build 1,2 s</span>
        <span>TypeScript · 0 napak</span>
        <span>Next.js</span>
      </RevealLine>
    </div>
  );
}
