import Image from "next/image";
import logo from "@/assets/pg-logo.png";

type LogoProps = {
  /** Rendered height in px; width follows the aspect ratio. */
  height: number;
  alt?: string;
  /** Load immediately — use for instances above the fold. */
  eager?: boolean;
};

export function Logo({ height, alt = "PG INŽENIRING", eager }: LogoProps) {
  return (
    <Image
      src={logo}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      style={{ height, width: "auto" }}
      className="block"
    />
  );
}
