import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTACT_EMAIL } from "@/content/site";
import { ContactForm } from "./ContactForm";

export function Contact() {
  return (
    <section
      id="kontakt"
      aria-labelledby="kontakt-h"
      className="relative flex min-h-svh flex-col overflow-hidden bg-black px-[clamp(18px,3.2vw,48px)] pt-[clamp(96px,13vh,152px)] text-white"
    >
      {/* Subtle warm radial ambient light behind the closing statement */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-[480px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(245,117,30,0.09),transparent_68%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-12">
        <SectionLabel index="06">KONTAKT</SectionLabel>

        <div className="grid flex-1 grid-cols-1 items-start gap-12 pb-12 nav:grid-cols-[1.05fr_1fr] nav:gap-[7vw] nav:pb-16">
          <div className="flex flex-col items-start">
            <h2
              id="kontakt-h"
              className="text-[clamp(56px,7.8vw,138px)] leading-[.94] font-extrabold tracking-[-.05em]"
            >
              Začnimo
              <br />
              <span className="text-brand">projekt.</span>
            </h2>

            <p className="mt-7 max-w-[400px] text-base leading-relaxed text-pretty text-soft">
              Povejte nam, kaj gradite. Odgovorimo v enem delovnem dnevu z jasnim predlogom
              naslednjih korakov.
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              data-cursor="link"
              className="mt-9 inline-flex items-center gap-4 border-b border-edge pb-3 text-[clamp(19px,2vw,28px)] font-medium tracking-[-.03em] transition-colors hover:border-brand hover:text-brand"
            >
              {CONTACT_EMAIL}
              <span aria-hidden className="text-brand">
                ↗
              </span>
            </a>

            {/* Studio location & response metadata */}
            <div className="mt-10 grid w-full max-w-[420px] grid-cols-2 gap-6 border-t border-white/[0.08] pt-6">
              <div>
                <div className="eyebrow-sm text-dim">LOKACIJA</div>
                <div className="mt-1.5 text-sm font-medium text-white/90">Prekmurje, Slovenija</div>
                <div className="mt-0.5 text-xs text-muted">Projekti po celi SI in EU</div>
              </div>
              <div>
                <div className="eyebrow-sm text-dim">ODZIVNOST</div>
                <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-white/90">
                  <span className="size-1.5 rounded-full bg-brand" />
                  V 24 urah
                </div>
                <div className="mt-0.5 text-xs text-muted">Prosti termini 2026</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/[0.09] bg-[#070709] p-6 sm:p-8 nav:p-10">
            <p className="eyebrow mb-7 text-muted">POVEJTE NAM O SVOJEM PROJEKTU</p>
            <ContactForm />
          </div>
        </div>

        <Footer />
      </div>
    </section>
  );
}
