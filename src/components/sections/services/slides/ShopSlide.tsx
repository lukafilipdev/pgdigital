"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/cn";

const SIZES = ["S", "M", "L"] as const;

/** E-commerce: an interactive dark-studio product detail card with live cart state. */
export function ShopSlide() {
  const [selectedSize, setSelectedSize] = useState<(typeof SIZES)[number]>("M");
  const [cartCount, setCartCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleAdd = () => {
    setCartCount((c) => c + 1);
    setJustAdded(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 2400);
  };

  return (
    <div className="grid size-full grid-cols-[minmax(0,0.92fr)_minmax(0,1.12fr)] items-center gap-[5%] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:gap-[6%]">
      <div className="relative aspect-[4/5] max-h-[215px] w-full justify-self-center overflow-hidden rounded-sm border border-white/10 bg-[#0d0d10] sm:max-h-none">
        <ImagePlaceholder
          label="Tehnična srajčna jakna — mat črna"
          src="/images/services/ecommerce-product.jpg"
          sizes="(min-width: 900px) 25vw, 50vw"
        />
        <span className="eyebrow-sm pointer-events-none absolute top-2 left-2 rounded-xs bg-black/75 px-2 py-0.5 text-white/90 backdrop-blur-xs sm:top-2.5 sm:left-2.5 sm:py-1">
          NA ZALOGI
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="eyebrow-sm whitespace-nowrap text-muted sm:eyebrow">E-TRGOVINA</span>
          {cartCount > 0 && (
            <span
              role="status"
              className="eyebrow-sm whitespace-nowrap rounded-full bg-brand/15 px-2 py-0.5 text-brand tabular-nums"
            >
              KOŠARICA ({cartCount})
            </span>
          )}
        </div>
        <div className="text-[clamp(20px,2.2vw,34px)] leading-none font-bold tracking-[-.04em]">
          Vaš izdelek
        </div>
        <div className="text-[clamp(16px,1.6vw,24px)] font-semibold tabular-nums">129,00 €</div>
        <div className="flex gap-1.5 sm:gap-2" role="group" aria-label="Velikost">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              data-cursor="link"
              aria-pressed={size === selectedSize}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "eyebrow-sm cursor-pointer px-2.5 py-1.5 transition-colors duration-200 sm:eyebrow sm:py-2",
                size === selectedSize
                  ? "bg-white text-black"
                  : "border border-edge text-white hover:border-white/50",
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-cursor="link"
          onClick={handleAdd}
          className={cn(
            "eyebrow-sm flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-full font-bold transition-colors duration-300 sm:eyebrow sm:h-[46px]",
            justAdded ? "bg-white text-black" : "bg-brand text-black hover:bg-brand-light",
          )}
        >
          {justAdded ? (
            <>
              <span>DODANO ({selectedSize})</span>
              <CheckIcon size={14} />
            </>
          ) : (
            <>
              <span>V KOŠARICO</span>
              <ArrowRightIcon size={14} />
            </>
          )}
        </button>
        <div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-[.1em] text-muted sm:eyebrow-sm">
          <span className="text-brand">KOŠARICA</span>
          <ArrowRightIcon size={11} className="text-white/35" />
          <span>DOSTAVA</span>
          <ArrowRightIcon size={11} className="text-white/35" />
          <span>PLAČILO</span>
        </div>
      </div>
    </div>
  );
}
