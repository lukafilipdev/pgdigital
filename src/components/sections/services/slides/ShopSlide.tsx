import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/cn";

const SIZES = ["S", "M", "L"];
const SELECTED_SIZE = "M";

/** E-commerce: a product detail card. */
export function ShopSlide() {
  return (
    <div className="grid size-full grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-[6%]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#141414]">
        <ImagePlaceholder label="Fotografija izdelka" sizes="(min-width: 900px) 25vw, 50vw" />
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="eyebrow text-muted">E-TRGOVINA · IZDELEK</div>
        <div className="text-[clamp(22px,2.2vw,34px)] leading-none font-bold tracking-[-.04em]">
          Vaš izdelek
        </div>
        <div className="text-[clamp(18px,1.6vw,24px)] font-semibold">129,00 €</div>
        <div className="flex gap-2">
          {SIZES.map((size) => (
            <span
              key={size}
              className={cn(
                "eyebrow px-2.5 py-2",
                size === SELECTED_SIZE ? "bg-white text-black" : "border border-edge text-white",
              )}
            >
              {size}
            </span>
          ))}
        </div>
        <div className="eyebrow flex h-[46px] items-center justify-center rounded-full bg-brand text-black">
          V KOŠARICO →
        </div>
        <div className="eyebrow-sm text-muted">PLAČILO · DOSTAVA · ZALOGA V ŽIVO</div>
      </div>
    </div>
  );
}
