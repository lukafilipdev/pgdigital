"use client";

import { useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SERVICES } from "@/content/site";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";
import { ServiceShowcase } from "./ServiceShowcase";

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useInViewOnce(sectionRef);
  const [active, setActive] = useState(0);

  const activeService = SERVICES[active];

  return (
    <section
      id="storitve"
      data-theme="light"
      ref={sectionRef}
      aria-labelledby="storitve-h"
      className="relative bg-paper px-[clamp(18px,3.2vw,48px)] py-[clamp(64px,8.5vh,96px)] text-ink nav:py-[clamp(96px,14vh,168px)]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 nav:mb-[clamp(36px,5vh,64px)] nav:gap-6">
          <div className="flex flex-col gap-3 nav:gap-4">
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
              "hidden max-w-[360px] text-base leading-relaxed text-pretty text-ink-soft transition-opacity delay-300 duration-1000 nav:block",
              !revealed && "opacity-0",
            )}
          >
            Štiri discipline. Ena ekipa od prve skice do zadnje posodobitve.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 nav:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] nav:gap-[clamp(36px,5vw,84px)]">
          {/* Mobile single-screen selector: all 4 services tappable above the live preview with zero scrolling */}
          <div className="flex flex-col gap-3.5 nav:hidden">
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Storitve">
              {SERVICES.map((service, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={service.name}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(index)}
                    className={cn(
                      "flex min-h-[54px] cursor-pointer flex-col justify-between rounded-sm border px-3 py-2 text-left transition-colors duration-250",
                      isActive
                        ? "border-ink bg-ink text-white"
                        : "border-ink-line bg-paper-soft/75 text-ink/80 hover:border-ink/40",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[9.5px] font-semibold tracking-[.16em]",
                        isActive ? "text-brand" : "text-ink-muted",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
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

          {/* Desktop editorial list */}
          <ul className="hidden flex-col border-b border-ink-line nav:flex">
            {SERVICES.map((service, index) => {
              const isActive = index === active;
              const select = () => setActive(index);
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
                    onMouseEnter={select}
                    onFocus={select}
                    onClick={select}
                    className="relative grid w-full cursor-pointer grid-cols-[52px_minmax(0,1fr)] gap-x-3 border-t border-ink-line py-[clamp(20px,2.8vh,30px)] text-left nav:py-[clamp(16px,2.2vh,24px)]"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -top-px left-0 h-[1.5px] bg-brand transition-[width] duration-700 ease-smooth",
                        isActive ? "w-full" : "w-0",
                      )}
                    />
                    <span
                      className={cn(
                        "eyebrow pt-[.85em] transition-colors duration-300",
                        isActive ? "text-brand" : "text-ink-muted",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-col gap-3">
                      <span
                        className={cn(
                          "font-display text-[clamp(26px,3.5vw,56px)] leading-none font-extrabold tracking-[-.04em] nav:text-[clamp(26px,2.5vw,42px)]",
                          "transition-colors duration-400 ease-smooth",
                          isActive ? "text-ink" : "text-ink/55 hover:text-ink/85",
                        )}
                      >
                        {service.name}
                      </span>
                      {isActive && (
                        <span className="flex max-w-[460px] flex-col gap-3">
                          <span className="text-base leading-relaxed text-pretty text-ink-soft nav:text-[15px]">
                            {service.description}
                          </span>
                          <span className="eyebrow text-brand">{service.tags}</span>
                        </span>
                      )}
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
