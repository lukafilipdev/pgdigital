"use client";

import { useActionState, useState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/actions/contact";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { INQUIRY_SCOPES, INQUIRY_TIMELINES } from "@/content/site";
import { cn } from "@/lib/cn";

const INITIAL_STATE: InquiryState = { status: "idle" };

const inputClass =
  "w-full rounded-[12px] border border-white/14 bg-[#08080c] px-4 py-3.5 text-[15px] font-medium text-paper outline-none transition-colors placeholder:text-dim focus:border-brand";

export function ContactForm() {
  const [formKey, setFormKey] = useState(0);
  return <ContactFormCard key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function ContactFormCard({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE);
  const [scope, setScope] = useState<string>(INQUIRY_SCOPES[0]);
  const [timeline, setTimeline] = useState<string>(INQUIRY_TIMELINES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (state.status === "success") {
    const firstName = name.trim().split(/[ ,]/)[0];
    const resolvedScope = (state.scope || scope).toLowerCase();
    return (
      <div
        role="status"
        className="flex min-h-[480px] flex-col justify-center gap-6 rounded-[20px] border border-white/12 bg-[#121216] p-7 shadow-[0_36px_80px_rgba(0,0,0,0.5)] sm:p-10"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-brand text-[#08080c]">
          <CheckIcon size={28} strokeWidth={2.4} />
        </span>
        <h3 className="text-[clamp(32px,3.2vw,48px)] leading-none font-extrabold tracking-[-.04em] text-paper">
          {firstName ? `Hvala, ${firstName}.` : "Hvala za sporočilo."}
        </h3>
        <p className="max-w-[42ch] text-[16.5px] leading-relaxed text-soft">
          Povpraševanje za <span className="text-paper">{resolvedScope}</span> smo prejeli. Odgovor
          s predlogom naslednjih korakov prejmete
          {email ? (
            <>
              {" "}
              na <span className="text-paper">{email}</span>
            </>
          ) : null}{" "}
          v enem delovnem dnevu.
        </p>
        <button
          type="button"
          data-cursor="link"
          onClick={onReset}
          className="mt-2 inline-flex h-12 w-fit cursor-pointer items-center rounded-full border border-white/22 px-6 font-display text-[14px] font-bold text-paper transition-colors duration-250 hover:border-paper hover:bg-paper hover:text-[#08080c]"
        >
          Pošlji novo povpraševanje
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-7 rounded-[20px] border border-white/12 bg-[#121216] p-6 shadow-[0_36px_80px_rgba(0,0,0,0.5)] sm:p-10"
    >
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="timeline" value={timeline} />

      <div className="flex items-center justify-between gap-4">
        <span className="font-display text-[20px] font-bold tracking-[-.02em] text-paper sm:text-[22px]">
          Povejte nam o svojem projektu
        </span>
        <span className="eyebrow-sm shrink-0 text-muted">~ 2 MIN</span>
      </div>

      {/* Quick Scope Selector Pills */}
      <div className="flex flex-col gap-3">
        <span className="eyebrow-sm text-soft">VRSTA PROJEKTA</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Vrsta projekta">
          {INQUIRY_SCOPES.map((item) => {
            const active = item === scope;
            return (
              <button
                key={item}
                type="button"
                data-cursor="link"
                aria-pressed={active}
                onClick={() => setScope(item)}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2.5 font-display text-[14px] font-semibold transition-colors duration-200",
                  active
                    ? "border-brand bg-brand font-bold text-[#08080c]"
                    : "border-white/16 bg-transparent text-paper/90 hover:border-white/40",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Timeline Selector Pills */}
      <div className="flex flex-col gap-3">
        <span className="eyebrow-sm text-soft">ŽELENA ČASOVNICA</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Želena časovnica">
          {INQUIRY_TIMELINES.map((item) => {
            const active = item === timeline;
            return (
              <button
                key={item}
                type="button"
                data-cursor="link"
                aria-pressed={active}
                onClick={() => setTimeline(item)}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-2.5 font-display text-[14px] font-semibold transition-colors duration-200",
                  active
                    ? "border-brand bg-brand font-bold text-[#08080c]"
                    : "border-white/16 bg-transparent text-paper/90 hover:border-white/40",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="IME IN PODJETJE" required>
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Janez Novak, Podjetje d.o.o."
            className={inputClass}
          />
        </Field>
        <Field label="E-POŠTA" required>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="janez@podjetje.si"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="O PROJEKTU">
        <textarea
          name="message"
          rows={3}
          placeholder="Kaj želite doseči, obstoječa stran ali ključne zahteve …"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {state.status === "error" ? (
          <p role="alert" className="text-sm font-medium text-[#ff8a8d]">
            {state.error}
          </p>
        ) : (
          <span className="text-sm text-muted">Odgovorimo v 24 urah.</span>
        )}

        <button
          type="submit"
          disabled={pending}
          data-cursor="link"
          className="group inline-flex h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand px-7 font-display text-[15px] font-extrabold text-[#08080c] transition-colors duration-300 hover:bg-paper disabled:cursor-wait disabled:opacity-60"
        >
          <span>{pending ? "Pošiljam …" : "Pošlji povpraševanje"}</span>
          <ArrowRightIcon
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow-sm text-soft">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      {children}
    </label>
  );
}
