import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTACT_EMAIL } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { MagneticCta } from "./MagneticCta";

export function Contact() {
  return (
    <section
      id="kontakt"
      aria-labelledby="kontakt-h"
      className="flex min-h-screen flex-col gap-[clamp(48px,8vh,90px)] border-t border-line-soft px-[clamp(18px,3vw,40px)] pt-[clamp(110px,18vh,200px)]"
    >
      <SectionLabel index="05">KONTAKT</SectionLabel>
      <h2
        id="kontakt-h"
        className="text-[clamp(64px,13vw,260px)] leading-[.86] font-extrabold tracking-[-.065em]"
      >
        Začnimo
        <br />
        <span className="text-brand">projekt.</span>
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(40px,6vw,100px)]">
        <div className="flex flex-col items-start gap-7">
          <p className="max-w-[420px] text-lg leading-normal text-pretty text-soft">
            Povejte nam, kaj gradite. Odgovorimo v enem delovnem dnevu s predlogom naslednjih
            korakov.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-cursor="link"
            className="border-b-2 border-brand pb-1 text-[clamp(22px,2.6vw,40px)] font-bold tracking-[-.04em] transition-colors hover:text-brand"
          >
            {CONTACT_EMAIL}
          </a>
          <MagneticCta href={`mailto:${CONTACT_EMAIL}`} />
        </div>
        <ContactForm />
      </div>

      <Footer />
    </section>
  );
}
