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

  return (
    <section
      id="storitve"
      ref={sectionRef}
      aria-labelledby="storitve-h"
      className="relative border-t border-line-soft px-[clamp(18px,3vw,40px)] pt-[clamp(110px,18vh,200px)] pb-[clamp(90px,14vh,160px)]"
    >
      <div className="mb-[clamp(48px,8vh,90px)] flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-[26px]">
          <SectionLabel index="02">STORITVE</SectionLabel>
          <h2
            id="storitve-h"
            className="overflow-hidden pb-[.06em] text-[clamp(48px,8vw,150px)] leading-[.92] font-bold tracking-[-.058em]"
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
            "max-w-[340px] text-base leading-normal text-pretty text-subtle transition-opacity delay-500 duration-1000",
            !revealed && "opacity-0",
          )}
        >
          Štiri discipline. Ena ekipa od prve skice do zadnje posodobitve.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[clamp(32px,5vw,80px)]">
        <ul className="flex flex-col border-b border-line">
          {SERVICES.map((service, index) => {
            const isActive = index === active;
            const select = () => setActive(index);
            return (
              <li
                key={service.name}
                className={cn(
                  "transition-[opacity,translate] duration-[900ms,1100ms] ease-smooth",
                  !revealed && "translate-y-[46px] opacity-0",
                )}
                style={{ transitionDelay: `${0.15 + index * 0.09}s` }}
              >
                <button
                  type="button"
                  data-cursor="link"
                  aria-pressed={isActive}
                  onMouseEnter={select}
                  onFocus={select}
                  onClick={select}
                  className="relative grid w-full cursor-pointer grid-cols-[52px_minmax(0,1fr)] gap-x-3 border-t border-line py-[clamp(18px,2.6vh,28px)] text-left"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -top-px left-0 h-px bg-brand transition-[width] duration-800 ease-smooth",
                      isActive ? "w-full" : "w-0",
                    )}
                  />
                  <span className={cn("eyebrow pt-[.9em]", isActive ? "text-brand" : "text-[#6b6b6b]")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 flex-col gap-3">
                    <span
                      className={cn(
                        "text-[clamp(26px,3.5vw,58px)] leading-none font-bold tracking-[-.05em]",
                        "transition-[color,translate] duration-[400ms,600ms] ease-smooth",
                        isActive ? "translate-x-2.5 text-white" : "text-[#5e5e5e]",
                      )}
                    >
                      {service.name}
                    </span>
                    {isActive && (
                      <span className="flex max-w-[440px] flex-col gap-3">
                        <span className="text-base leading-normal text-pretty text-soft">
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
    </section>
  );
}
