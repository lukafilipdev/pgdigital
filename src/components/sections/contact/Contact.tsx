"use client";

import { useCallback, useEffect, useRef } from "react";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTACT_EMAIL } from "@/content/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ContactForm } from "./ContactForm";
import { CopyEmailButton } from "./CopyEmailButton";

export function Contact() {
  const headRef = useRef<HTMLDivElement>(null);
  const lastFitKeyRef = useRef("");
  const isStacked = useMediaQuery("(max-width: 1099px)");

  const fitHeadline = useCallback((force: boolean) => {
    const box = headRef.current;
    if (!box) return;
    const W = box.clientWidth;
    if (!W) return;
    const els = Array.from(box.querySelectorAll<HTMLElement>("[data-fit]"));
    if (!els.length) return;
    const key = `${W}|${els.length}`;
    if (!force && lastFitKeyRef.current === key) return;
    lastFitKeyRef.current = key;

    els.forEach((el) => {
      el.style.fontSize = "100px";
      const measured = el.offsetWidth || 1;
      el.style.fontSize = `${((100 * W) / measured).toFixed(2)}px`;
    });
  }, []);

  useEffect(() => {
    const box = headRef.current;
    if (!box) return;
    fitHeadline(true);
    const observer = new ResizeObserver(() => fitHeadline(true));
    observer.observe(box);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) fitHeadline(true);
    });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [fitHeadline]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => fitHeadline(true));
    return () => cancelAnimationFrame(frame);
  }, [isStacked, fitHeadline]);

  return (
    <section
      id="kontakt"
      aria-labelledby="kontakt-h"
      className="relative flex min-h-svh flex-col overflow-hidden bg-black px-[clamp(18px,3vw,64px)] pt-[clamp(100px,13vh,144px)] pb-7 text-white"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-[clamp(32px,5vh,64px)]">
        {/* Full-Width Auto-Fitted Section Header */}
        <div className="flex flex-col gap-[clamp(16px,2vw,24px)]">
          <SectionLabel>KONTAKT</SectionLabel>

          <div
            ref={headRef}
            className="w-full font-display leading-[.9] font-extrabold tracking-[-.055em]"
          >
            <h2 id="kontakt-h" className="m-0">
              {isStacked ? (
                <>
                  <span className="block">
                    <span
                      data-fit=""
                      className="inline-block pt-[0.06em] whitespace-nowrap text-[24vw]"
                    >
                      Začnimo
                    </span>
                  </span>
                  <span className="block">
                    <span
                      data-fit=""
                      className="inline-block pb-[0.04em] whitespace-nowrap text-[24vw] text-brand"
                    >
                      projekt.
                    </span>
                  </span>
                </>
              ) : (
                <span
                  data-fit=""
                  className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[14vw]"
                >
                  Začnimo <span className="text-brand">projekt.</span>
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Two-Column Editorial Contact Details + Unboxed Underline Form */}
        <div className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-[clamp(32px,6vw,120px)] gap-y-12 border-t border-white/12 pt-[clamp(24px,3vw,40px)]">
          {/* Left Column: Intro, Direct Email & Studio Metadata */}
          <div className="flex flex-col gap-9">
            <p className="m-0 max-w-[480px] text-[clamp(17px,1.3vw,21px)] leading-[1.5] text-pretty text-white/70">
              Povejte nam, kaj gradite.{" "}
              <span className="text-white">
                Odgovorimo v enem delovnem dnevu z jasnim predlogom naslednjih korakov.
              </span>
            </p>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] font-bold tracking-[.18em] text-white/60">
                ALI PIŠITE NEPOSREDNO
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  data-cursor="link"
                  className="font-display text-[clamp(22px,2.2vw,36px)] font-extrabold tracking-[-.04em] text-white transition-colors duration-250 hover:text-brand"
                >
                  {CONTACT_EMAIL}
                </a>
                <CopyEmailButton email={CONTACT_EMAIL} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-bold tracking-[.18em] text-white/60">
                  LOKACIJA
                </span>
                <span className="font-display text-[17px] font-extrabold text-white">
                  Prekmurje, Slovenija
                </span>
                <span className="text-[14px] text-white/60">Projekti po celi SI in EU</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-bold tracking-[.18em] text-white/60">
                  ODZIVNOST
                </span>
                <span className="font-display text-[17px] font-extrabold text-white">V 24 urah</span>
                <span className="text-[14px] text-white/60">Prosti termini 2026</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <ContactForm />
        </div>

        <Footer />
      </div>
    </section>
  );
}
