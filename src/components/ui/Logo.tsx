import Image from "next/image";
import logoDark from "@/assets/pg-digital-logo-dark.png";
import logoLight from "@/assets/pg-digital-logo-light.png";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** Rendered height in px; width follows the 2:1 aspect ratio. Omit when sizing via className. */
  height?: number;
  /** Surface tone behind the logo: "dark" uses the white wordmark, "light" uses charcoal. */
  tone?: "dark" | "light";
  alt?: string;
  /** Load immediately — use for instances above the fold. */
  eager?: boolean;
  className?: string;
};

export function Logo({ height, tone = "dark", alt = "PG DIGITAL", eager, className }: LogoProps) {
  return (
    <Image
      src={tone === "light" ? logoLight : logoDark}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      style={height != null ? { height, width: "auto" } : undefined}
      className={cn("block w-auto select-none", className)}
    />
  );
}
