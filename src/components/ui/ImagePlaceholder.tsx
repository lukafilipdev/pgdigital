import Image from "next/image";
import { cn } from "@/lib/cn";

type ImagePlaceholderProps = {
  /** Shown as the alt text, or as the caption while no image is set. */
  label: string;
  src?: string;
  sizes?: string;
  className?: string;
};

/**
 * Fills its (relatively positioned) parent with an image, or with a neutral
 * placeholder until real photography is supplied via `src`.
 */
export function ImagePlaceholder({
  label,
  src,
  sizes = "100vw",
  className,
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <Image src={src} alt={label} fill sizes={sizes} className={cn("object-cover", className)} />
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-[#111]",
        "bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgba(255,255,255,.025)_14px_15px)]",
        className,
      )}
    >
      <span className="eyebrow px-4 text-center text-dim">{label}</span>
    </div>
  );
}
