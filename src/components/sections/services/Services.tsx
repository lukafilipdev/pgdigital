"use client";

import { useEffect, useRef, useState } from "react";
import { SectionCodeField } from "@/components/effects/SectionCodeField";
import {
  ArrowRightIcon,
  CodeEngineIcon,
  CommerceBagIcon,
  DesignSystemIcon,
  SpeedShieldIcon,
} from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SERVICES } from "@/content/site";
import { useInViewOnce, useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { ServiceShowcase } from "./ServiceShowcase";

const AUTO_CYCLE_MS = 6000;

const SERVICE_ICONS = [
  DesignSystemIcon,
  CodeEngineIcon,
  CommerceBagIcon,
  SpeedShieldIcon,
] as const;

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInViewOnce(sectionRef);
  const inViewport = useInViewport(sectionRef);
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inViewport || paused || reducedMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ratio = (now - start) / AUTO_CYCLE_MS;
      if (ratio >= 1) {
        setProgress(0);
        setActive((prev) => (prev + 1) % SERVICES.length);
        return;
      }
      setProgress(ratio * 100);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, inViewport, paused, reducedMotion]);

  const choose = (index: number) => {
    setPaused(true);
    setProgress(100);
    setActive(index);
  };

  const activeService = SERVICES[active];

  return (
    <section
      id="storitve"
      data-theme="light"
      ref={sectionRef}
      aria-labelledby="storitve-h"
      className="relative overflow-hidden bg-paper bg-mesh-light px-[clamp(18px,3.2vw,48px)] py-[clamp(64px,8.5vh,96px)] text-ink nav:py-[clamp(96px,14vh,168px)]"
    >
      <SectionCodeField tone="light" />
      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 nav:mb-[clamp(28px,4vh,48px)] nav:gap-6">
          <div className="flex flex-col gap-3 rounded-[16px] border border-ink/10 bg-paper/95 px-5 py-4 shadow-[0_12px_36px_rgba(11,11,12,0.05)] backdrop-blur-[8px] nav:gap-4 nav:px-7 nav:py-5">
            <SectionLabel index="03" tone="light">
              STORITVE
            </SectionLabel>
            <h2
              id="storitve-h"
              className="overflow-hidden pb-[.06em] text-[clamp(38px,10.5vw,56px)] leading-[.92] font-extrabold tracking-[-.048em] text-ink nav:text-[clamp(56px,6vw,108px)]"
            >
              <span
                className={cn(
                  "block transition-transform duration-1100 ease-smooth",
                  !revealed && "translate-y-[105%]",
                )}
              >
                Kaj gradimo.
              </span>
            </h2>
          </div>
          <p
            className={cn(
              "hidden max-w-[380px] rounded-[14px] border border-ink/10 bg-paper/95 px-5 py-4 text-base leading-relaxed text-pretty text-ink-soft shadow-[0_12px_32px_rgba(11,11,12,0.05)] backdrop-blur-[8px] transition-opacity delay-300 duration-1000 nav:block",
              !revealed && "opacity-0",
            )}
          >
            Štiri discipline.{" "}
            <span className="font-medium text-ink">
              Ena ekipa od prve skice do zadnje posodobitve.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 nav:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] nav:gap-[clamp(28px,4vw,64px)]">
          {/* Mobile single-screen selector: solid floating card so code never overlaps text */}
          <div className="flex flex-col gap-3.5 rounded-[14px] border border-ink/12 bg-paper/95 p-3.5 shadow-[0_14px_36px_rgba(11,11,12,0.06)] backdrop-blur-[8px] nav:hidden">
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Storitve">
              {SERVICES.map((service, index) => {
                const isActive = index === active;
                const Icon = SERVICE_ICONS[index];
                return (
                  <button
                    key={service.name}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => choose(index)}
                    className={cn(
                      "flex min-h-[56px] cursor-pointer flex-col justify-between rounded-[8px] border px-3 py-2 text-left transition-colors duration-250",
                      isActive
                        ? "border-ink bg-ink text-white"
                        : "border-ink-line bg-paper/90 text-ink/80 hover:border-ink/40",
                    )}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span
                        className={cn(
                          "font-mono text-[9.5px] font-semibold tracking-[.16em]",
                          isActive ? "text-brand" : "text-ink-muted",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon
                        size={14}
                        className={isActive ? "text-brand" : "text-ink-muted"}
                      />
                    </span>
                    <span className="mt-1 font-display text-[13px] leading-[1.15] font-extrabold tracking-[-0.02em]">
                      {service.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-[62px] flex-col justify-center gap-1.5 border-l-2 border-brand pl-3">
              <p className="text-[13.5px] leading-snug text-pretty text-ink-soft">
                {activeService.description}
              </p>
              <span className="eyebrow-sm text-brand">{activeService.tags}</span>
            </div>
          </div>

          {/* Desktop editorial list floating cleanly above the interactive code layer */}
          <ul className="hidden flex-col rounded-[18px] border border-ink/12 bg-paper/95 px-7 py-2 shadow-[0_24px_60px_rgba(11,11,12,0.07)] backdrop-blur-[8px] nav:flex">
            {SERVICES.map((service, index) => {
              const isActive = index === active;
              const Icon = SERVICE_ICONS[index];
              const barWidth = isActive ? (paused || reducedMotion ? 100 : progress) : 0;
              return (
                <li
                  key={service.name}
                  className={cn(
                    "transition-[opacity,translate] duration-[900ms,1100ms] ease-smooth",
                    !revealed && "translate-y-[42px] opacity-0",
                  )}
                  style={{ transitionDelay: `${0.12 + index * 0.08}s` }}
                >
                  <button
                    type="button"
                    data-cursor="link"
                    aria-pressed={isActive}
                    onMouseEnter={() => choose(index)}
                    onFocus={() => choose(index)}
                    onClick={() => choose(index)}
                    className={cn(
                      "relative grid w-full cursor-pointer grid-cols-[54px_minmax(0,1fr)_44px] items-center gap-x-4 py-[clamp(18px,2.2vh,26px)] text-left",
                      index > 0 && "border-t border-ink-line",
                    )}
                  >
                    <span
                      aria-hidden
                      className="absolute -top-px left-0 h-[2px] bg-brand transition-[width] duration-100 ease-linear"
                      style={{ width: `${barWidth}%` }}
                    />
                    <span className="flex flex-col items-start gap-2 self-start pt-1">
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-[10px] border transition-colors duration-300",
                          isActive
                            ? "border-brand/40 bg-brand/12 text-brand"
                            : "border-ink/12 bg-paper/80 text-ink-muted",
                        )}
                      >
                        <Icon size={17} />
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-col gap-3.5">
                      <span className="flex items-baseline gap-3">
                        <span
                          className={cn(
                            "eyebrow-sm transition-colors duration-300",
                            isActive ? "text-brand" : "text-ink-muted",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "font-display text-[clamp(26px,2.6vw,42px)] leading-[1.02] font-extrabold tracking-[-.04em]",
                            "transition-colors duration-350 ease-smooth",
                            isActive ? "text-ink" : "text-ink/55 hover:text-ink/85",
                          )}
                        >
                          {service.name}
                        </span>
                      </span>
                      {isActive && (
                        <span className="flex max-w-[460px] flex-col gap-3.5 pt-0.5">
                          <span className="text-[15.5px] leading-[1.58] text-pretty text-ink-soft">
                            {service.description}
                          </span>
                          <span className="flex flex-wrap gap-2">
                            {service.tagList.map((tag) => (
                              <span
                                key={tag}
                                className="eyebrow-sm rounded-full border border-brand/40 bg-paper/80 px-3 py-1 text-[#b4500c]"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center self-start rounded-full border transition-[background-color,border-color,color,transform] duration-350 ease-smooth",
                        isActive
                          ? "rotate-0 border-ink bg-ink text-paper"
                          : "-rotate-45 border-ink/20 bg-paper/75 text-ink/70",
                      )}
                    >
                      <ArrowRightIcon size={17} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <ServiceShowcase active={active} revealed={revealed} />
        </div>
      </div>
    </section>
  );
}
