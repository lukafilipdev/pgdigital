import { CheckIcon } from "@/components/ui/Icons";
import { QUALITY_METRICS } from "@/content/site";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CARE_LOG = [
  { task: "Varnostna posodobitev", when: "DANES" },
  { task: "Varnostna kopija", when: "DANES" },
  { task: "Pregled hitrosti", when: "VČERAJ" },
] as const;

/** Maintenance & optimisation: 4 Lighthouse 100 gauges paired with a live maintenance log. */
export function MetricsSlide({ active }: { active: boolean }) {
  return (
    <div className="flex size-full flex-col justify-between gap-3 nav:gap-5">
      <div className="grid grid-cols-4 gap-2 pt-1 nav:gap-3 nav:pt-2">
        {QUALITY_METRICS.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 nav:gap-2.5">
            <div className="relative flex w-full max-w-[60px] items-center justify-center nav:max-w-[78px]">
              <svg viewBox="0 0 100 100" aria-hidden className="size-full -rotate-90">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#1f1f24" strokeWidth="5" />
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={active ? CIRCUMFERENCE * (1 - value / 100) : CIRCUMFERENCE}
                  className="text-brand transition-[stroke-dashoffset] duration-1200 ease-smooth"
                />
              </svg>
              <span className="font-display absolute text-[14px] font-extrabold tracking-[-.04em] text-paper nav:text-[20px]">
                {value}
              </span>
            </div>
            <span className="text-center font-mono text-[8.5px] font-semibold tracking-[.08em] text-white/65 nav:text-[10px]">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col border-t border-white/10">
        {CARE_LOG.map(({ task, when }, idx) => (
          <div
            key={task}
            className={
              "flex items-center justify-between gap-3 py-2 text-[12px] nav:py-3.5 nav:text-[14.5px] " +
              (idx < CARE_LOG.length - 1 ? "border-b border-white/10" : "")
            }
          >
            <span className="flex items-center gap-2.5 text-paper/90">
              <span className="flex size-5 items-center justify-center rounded-full bg-brand/15 text-brand">
                <CheckIcon size={12} />
              </span>
              {task}
            </span>
            <span className="font-mono text-[9.5px] tracking-[.12em] text-white/45 nav:text-[11px]">
              {when}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
