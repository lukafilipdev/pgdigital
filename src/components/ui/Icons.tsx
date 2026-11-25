import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function SvgIcon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </SvgIcon>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </SvgIcon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </SvgIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12.5 9.5 17 19 7.5" />
    </SvgIcon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </SvgIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

/** 01 · Spletno oblikovanje — architectural layout & modular grid. */
export function DesignSystemIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </SvgIcon>
  );
}

/** 02 · Spletni razvoj — precision engineering code brackets. */
export function CodeEngineIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m13.5 5-3 14" />
    </SvgIcon>
  );
}

/** 03 · E-commerce — sleek geometric retail bag. */
export function CommerceBagIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6 8h12l1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </SvgIcon>
  );
}

/** 04 · Vzdrževanje in optimizacija — performance pulse & uptime shield. */
export function SpeedShieldIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3 5 6v6c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </SvgIcon>
  );
}

/** O nas pillar 01 — architectural ruler / precision compass. */
export function PrecisionIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
    </SvgIcon>
  );
}

/** O nas pillar 02 — bespoke stacked architectural planes. */
export function BespokeLayersIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
      <path d="m3 12 9 4.5 9-4.5" />
      <path d="m3 16.5 9 4.5 9-4.5" />
    </SvgIcon>
  );
}

/** O nas pillar 03 — long-term responsibility & partnership. */
export function PartnershipShieldIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2.5 4.5 6v5.5c0 4.8 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.7 7.5-9.5V6L12 2.5Z" />
      <path d="M9 12.2 11.2 14.4 15.5 9.8" />
    </SvgIcon>
  );
}
