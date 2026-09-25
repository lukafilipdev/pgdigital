import type { Ref } from "react";
import { cn } from "@/lib/cn";
import { MockFooter, MockHeroCopy, MockNav, MockPage, SunsetArt, microLabel } from "./MockParts";

const dashed = "border-[1.5px] border-dashed";

/** Step 1 — Ideja: a hand-drawn wireframe (always visible underneath). */
export function SketchLayer() {
  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-[5%] p-[7%] font-mono text-[clamp(9px,.9vw,12px)] text-muted">
      <div className={cn(dashed, "col-span-full -rotate-[.6deg] rounded-[10px] border-[#444] p-2.5")}>
        logo · meni · kontakt?
      </div>
      <div className={cn(dashed, "flex rotate-[.8deg] flex-col gap-2 rounded-xl border-[#444] p-3")}>
        <span className="text-white">GLAVNO SPOROČILO</span>
        <span>kratko, jasno, samozavestno</span>
        <span className="text-brand">→ gumb</span>
      </div>
      <div className={cn(dashed, "flex -rotate-[1.2deg] items-center justify-center rounded-[14px] border-[#444]")}>
        slika / gibanje?
      </div>
      <div className="col-span-full flex gap-[5%]">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn(dashed, "h-10 flex-1 rounded-lg border-edge")} />
        ))}
      </div>
    </div>
  );
}

/** Step 2 — Oblika: the design, with the headline selected. */
export function DesignLayer({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <MockPage ref={ref}>
      <MockNav />
      <MockHeroCopy selected />
      <SunsetArt />
      <MockFooter>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-black shadow-[inset_0_0_0_1px_#333]" />
          <span className="size-3 rounded-full bg-white" />
          <span className="size-3 rounded-full bg-brand" />
          <span className="size-3 rounded-full bg-[#171717] shadow-[inset_0_0_0_1px_#333]" />
        </span>
        <span className={cn(microLabel, "text-dim")}>DISPLAY 96 · H1 56 · BESEDILO 16</span>
      </MockFooter>
    </MockPage>
  );
}

/** Step 3 — Razvoj: the same page next to its source code. */
export function DevelopmentLayer({ ref }: { ref?: Ref<HTMLDivElement> }) {
  const tag = "text-white";
  const attr = "text-muted";
  return (
    <MockPage ref={ref}>
      <MockNav />
      <MockHeroCopy />
      <div className="relative flex flex-col overflow-hidden rounded-[5px] border border-[#1f1f1f] bg-[#070707]">
        <div className={cn(microLabel, "flex items-center gap-2.5 border-b border-[#1a1a1a] px-2.5 py-1.5 text-muted")}>
          <span className="text-white">Hero.tsx</span>
          <span>styles.css</span>
          <span className="ml-auto text-brand">● TS</span>
        </div>
        <div className="overflow-hidden px-2.5 py-2 font-mono text-[clamp(7px,.7vw,10.5px)] leading-[1.65] whitespace-nowrap text-muted">
          <div>
            <span className="text-brand">export function</span> <span className="text-white">Hero</span>(){" "}
            {"{"}
          </div>
          <div className="pl-[2ch]">
            <span className="text-brand">return</span> (
          </div>
          <div className={cn("pl-[4ch]", tag)}>
            &lt;section <span className={attr}>className=</span>&quot;hero&quot;&gt;
          </div>
          <div className={cn("pl-[6ch]", tag)}>&lt;h1&gt;Tu stoji vaša zgodba.&lt;/h1&gt;</div>
          <div className={cn("pl-[6ch]", tag)}>
            &lt;Gumb <span className={attr}>href=</span>&quot;/ponudba&quot; /&gt;
          </div>
          <div className={cn("pl-[6ch]", tag)}>
            &lt;Slika <span className={attr}>src=</span>
            {"{naslovna}"} /&gt;
          </div>
          <div className={cn("pl-[4ch]", tag)}>&lt;/section&gt;</div>
          <div className="pl-[2ch]">
            );
            <span className="ml-0.5 inline-block h-[1.05em] w-[.55em] bg-brand align-[-2px]" />
          </div>
          <div>{"}"}</div>
        </div>
      </div>
      <MockFooter>
        <span className={cn(microLabel, "text-brand")}>● BUILD 1,2 S</span>
        <span className={cn(microLabel, "text-dim")}>NEXT.JS · TYPESCRIPT · 0 NAPAK</span>
      </MockFooter>
    </MockPage>
  );
}

type LiveLayerProps = {
  ref?: Ref<HTMLDivElement>;
  /** The sun gently floats once the site is live. */
  sunRef?: Ref<HTMLSpanElement>;
};

/** Step 4 — Objava: the finished, live page. */
export function LiveLayer({ ref, sunRef }: LiveLayerProps) {
  return (
    <MockPage ref={ref}>
      <MockNav accentCta />
      <MockHeroCopy hovered />
      <SunsetArt sunRef={sunRef} />
      <MockFooter>
        <span className="flex gap-[clamp(10px,2vw,28px)] text-[clamp(7px,.72vw,11px)] font-semibold">
          <span>Vaša storitev →</span>
          <span className="text-muted">Vaš izdelek</span>
          <span className="text-muted">Vaša referenca</span>
        </span>
        <span className={cn(microLabel, "text-brand")}>● V ŽIVO</span>
      </MockFooter>
    </MockPage>
  );
}
