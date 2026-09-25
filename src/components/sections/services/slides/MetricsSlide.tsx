import { QUALITY_METRICS } from "@/content/site";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Maintenance & optimisation: Lighthouse-style score gauges that fill when active. */
export function MetricsSlide({ active }: { active: boolean }) {
  return (
    <div className="flex size-full flex-col justify-between">
      <div className="eyebrow text-muted">MERITVE · PO VSAKI OBJAVI</div>
      <div className="grid grid-cols-3 gap-[6%]">
        {QUALITY_METRICS.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-3.5">
            <svg viewBox="0 0 100 100" aria-hidden className="w-full max-w-[130px] -rotate-90">
              <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#1f1f1f" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={active ? CIRCUMFERENCE * (1 - value / 100) : CIRCUMFERENCE}
                className="text-brand transition-[stroke-dashoffset] duration-1200 ease-smooth"
              />
            </svg>
            <span className="-mt-1 text-[clamp(22px,2.4vw,36px)] font-bold tracking-[-.04em]">
              {value}
            </span>
            <span className="eyebrow-sm text-muted">{label}</span>
          </div>
        ))}
      </div>
      <div className="eyebrow-sm text-muted">POSODOBITVE · VARNOSTNE KOPIJE · NADZOR</div>
    </div>
  );
}
