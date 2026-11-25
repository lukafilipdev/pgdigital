import { SectionCodeField } from "@/components/effects/SectionCodeField";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTACT_EMAIL } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { CopyEmailButton } from "./CopyEmailButton";

export function Contact() {
  return (
    <section
      id="kontakt"
      aria-labelledby="kontakt-h"
      className="relative flex min-h-svh flex-col overflow-hidden bg-[#08080c] bg-mesh-dark px-[clamp(18px,3.2vw,48px)] pt-[clamp(96px,13vh,152px)] text-paper"
    >
      <SectionCodeField tone="dark" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8">
        <div className="grid flex-1 grid-cols-1 items-start gap-8 pb-10 nav:grid-cols-[0.95fr_1.05fr] nav:gap-[4vw] nav:pb-14">
          <div className="flex flex-col items-start rounded-[20px] border border-white/12 bg-[#111115]/96 p-6 shadow-[0_36px_80px_rgba(0,0,0,0.55)] backdrop-blur-[10px] sm:p-10">
            <SectionLabel index="06">KONTAKT</SectionLabel>

            <h2
              id="kontakt-h"
              className="mt-6 text-[clamp(48px,7vw,122px)] leading-[.9] font-extrabold tracking-[-.05em]"
            >
              Začnimo
              <br />
              <span className="text-brand">projekt.</span>
            </h2>

            <p className="mt-7 max-w-[420px] text-[16.5px] leading-relaxed text-pretty text-soft">
              Povejte nam, kaj gradite.{" "}
              <span className="text-paper">
                Odgovorimo v enem delovnem dnevu z jasnim predlogom naslednjih korakov.
              </span>
            </p>

            <div className="mt-9 flex flex-col gap-2.5">
              <span className="eyebrow-sm text-muted">ALI PIŠITE NEPOSREDNO</span>
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  data-cursor="link"
                  className="inline-flex items-center gap-3 border-b border-white/25 pb-2 font-display text-[clamp(20px,2.1vw,30px)] font-bold tracking-[-.03em] text-paper transition-colors hover:border-brand hover:text-brand"
                >
                  {CONTACT_EMAIL}
                </a>
                <CopyEmailButton email={CONTACT_EMAIL} />
              </div>
            </div>

            {/* Studio location & response metadata */}
            <div className="mt-10 grid w-full max-w-[440px] grid-cols-2 gap-6 border-t border-white/10 pt-6">
              <div>
                <div className="eyebrow-sm text-muted">LOKACIJA</div>
                <div className="mt-1.5 text-[15px] font-semibold text-paper">Prekmurje, Slovenija</div>
                <div className="mt-0.5 text-xs text-soft">Projekti po celi SI in EU</div>
              </div>
              <div>
                <div className="eyebrow-sm text-muted">ODZIVNOST</div>
                <div className="mt-1.5 flex items-center gap-2 text-[15px] font-semibold text-paper">
                  <span className="size-1.5 rounded-full bg-brand" />
                  V 24 urah
                </div>
                <div className="mt-0.5 text-xs text-soft">Prosti termini 2026</div>
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
