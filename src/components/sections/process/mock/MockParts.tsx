import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

/** Tiny monospace label used inside the mock website. */
export const microLabel = "font-mono text-[clamp(7px,.6vw,9px)] font-semibold tracking-[.14em]";

/** Shared frame of the three rendered mock layers. */
export function MockPage({ ref, children }: { ref?: Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div
      ref={ref}
      className="absolute inset-0 grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] grid-rows-[auto_1fr_auto] gap-x-[6%] gap-y-[7%] bg-[#0b0b0b] px-[6%] py-[5%]"
      style={{ clipPath: "inset(0 100% 0 0)" }}
    >
      {children}
    </div>
  );
}

export function MockNav({ accentCta = false }: { accentCta?: boolean }) {
  return (
    <div className="col-span-full flex items-center justify-between gap-2.5">
      <span className="flex items-center gap-[7px] text-[clamp(9px,.95vw,14px)] font-extrabold tracking-[-.04em]">
        <span className="relative size-[.9em] rounded-full border-2 border-white">
          <span className="absolute inset-[22%] rounded-full bg-brand" />
        </span>
        Vaša znamka
      </span>
      <span className="flex items-center gap-[clamp(8px,1vw,16px)] text-[clamp(7px,.65vw,10px)] text-[#bdbdbd]">
        <span>Ponudba</span>
        <span>O nas</span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-semibold text-black",
            accentCta ? "bg-brand" : "bg-white",
          )}
        >
          Pišite nam
        </span>
      </span>
    </div>
  );
}

type MockHeroCopyProps = {
  /** Shows the headline as selected in a design tool. */
  selected?: boolean;
  /** Primary button in white with a hovering pointer (the "live" state). */
  hovered?: boolean;
};

export function MockHeroCopy({ selected = false, hovered = false }: MockHeroCopyProps) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-[clamp(6px,1vh,12px)]">
      <span className={cn(microLabel, "text-muted")}>VAŠA DEJAVNOST · VAŠE MESTO</span>
      <span
        className={cn(
          "relative self-start pt-[3px] pb-[5px] text-[clamp(16px,2.3vw,38px)] leading-[.9] font-extrabold tracking-[-.055em]",
          selected && "mt-3.5 px-[5px] outline outline-brand",
        )}
      >
        Tu stoji
        <br />
        vaša
        <br />
        zgodba<span className="text-brand">.</span>
        {selected && <SelectionChrome />}
      </span>
      <span className="text-[clamp(7px,.72vw,11px)] leading-[1.4] text-subtle">
        Kratko, jasno sporočilo o tem, kaj ponujate in komu.
      </span>
      <span className="flex items-center gap-2.5 text-[clamp(7px,.68vw,10px)] font-semibold">
        <span
          className={cn(
            "relative rounded-full px-[11px] py-[5px] whitespace-nowrap text-black",
            hovered ? "bg-white" : "bg-brand",
          )}
        >
          Poglej ponudbo →{hovered && <PointerIcon />}
        </span>
        <span className="border-b border-white/50">O nas</span>
      </span>
    </div>
  );
}

function SelectionChrome() {
  const handle = "absolute size-1.5 border border-brand bg-white";
  return (
    <>
      <span className={cn(handle, "-top-[3px] -left-[3px]")} />
      <span className={cn(handle, "-top-[3px] -right-[3px]")} />
      <span className={cn(handle, "-bottom-[3px] -left-[3px]")} />
      <span className={cn(handle, "-right-[3px] -bottom-[3px]")} />
      <span
        className={cn(
          microLabel,
          "absolute -top-[17px] -left-px bg-brand px-[5px] py-0.5 tracking-[.08em] whitespace-nowrap text-black",
        )}
      >
        NASLOV · GEIST 800
      </span>
    </>
  );
}

function PointerIcon() {
  return (
    <svg viewBox="0 0 12 16" aria-hidden className="absolute -right-2 -bottom-3.5 h-4 w-3">
      <path d="M1 1v12l3.2-3 2.3 5 2-1-2.2-4.8H10z" fill="#fff" stroke="#000" strokeWidth="1" />
    </svg>
  );
}

/** Placeholder "photo": a sunset behind a building. */
export function SunsetArt({ sunRef }: { sunRef?: Ref<HTMLSpanElement> }) {
  return (
    <div className="relative overflow-hidden rounded-[5px] bg-[linear-gradient(#0f0f0f_0%,#23140a_40%,#5c2b0c_64%)]">
      <span
        ref={sunRef}
        className="absolute top-[36%] left-[42%] aspect-square w-[48%] rounded-full bg-[radial-gradient(circle_at_36%_34%,#ffb275,#F5751E_50%,#b9490c)]"
      />
      <span className="absolute inset-x-0 top-[64%] bottom-0 bg-[#080808]" />
      <span className="absolute top-[49%] left-[10%] h-[15%] w-[44%] bg-[#050505]" />
      <span className="absolute top-[47%] left-[7.5%] h-[2.2%] w-[49%] bg-[#050505]" />
      <span className="absolute top-[54.5%] left-[15%] h-[4.5%] w-[18.5%] bg-[rgba(255,178,117,.92)]" />
      <span className={cn(microLabel, "absolute bottom-2 left-2.5 text-white")}>VAŠA FOTOGRAFIJA</span>
    </div>
  );
}

export function MockFooter({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-full flex items-center justify-between gap-3 border-t border-[#1f1f1f] pt-2.5">
      {children}
    </div>
  );
}
