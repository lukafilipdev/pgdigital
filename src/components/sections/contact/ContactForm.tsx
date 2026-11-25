"use client";

import { useActionState, useState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/actions/contact";
import { INQUIRY_SCOPES, INQUIRY_TIMELINES } from "@/content/site";
import { cn } from "@/lib/cn";

const INITIAL_STATE: InquiryState = { status: "idle" };

const inputClass =
  "border-0 border-b border-edge bg-transparent py-3 text-base font-medium text-white outline-none transition-colors placeholder:text-placeholder focus:border-brand";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE);
  const [scope, setScope] = useState<string>(INQUIRY_SCOPES[0]);
  const [timeline, setTimeline] = useState<string>(INQUIRY_TIMELINES[0]);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col gap-4 border-t border-brand pt-6">
        <span className="eyebrow flex items-center gap-2 text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          PREJETO · {state.scope || scope}
        </span>
        <span className="text-[clamp(26px,2.6vw,40px)] leading-[1.05] font-bold tracking-[-.045em] text-white">
          Hvala. Oglasimo se v enem delovnem dnevu.
        </span>
        <p className="text-sm text-soft">
          Pripravili bomo kratek predlog naslednjih korakov in predlagali termin za uvodni pogovor.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="timeline" value={timeline} />

      {/* Quick Scope Selector Pills */}
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-muted">VRSTA PROJEKTA</span>
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
                  "eyebrow-sm cursor-pointer rounded-full border px-4 py-2 transition-colors duration-250",
                  active
                    ? "border-brand bg-brand font-bold text-black"
                    : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/40 hover:text-white",
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
        <span className="eyebrow text-muted">ŽELENA ČASOVNICA</span>
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
                  "eyebrow-sm cursor-pointer rounded-full border px-3.5 py-2 transition-colors duration-250",
                  active
                    ? "border-white bg-white font-bold text-black"
                    : "border-white/15 bg-white/[0.03] text-soft hover:border-white/40 hover:text-white",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="IME IN PODJETJE">
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="Janez Novak, Podjetje d.o.o."
            className={inputClass}
          />
        </Field>
        <Field label="E-POŠTA">
          <input
            required
            type="email"
            name="email"
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

      {state.status === "error" && (
        <p role="alert" className="text-sm font-medium text-brand">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        data-cursor="link"
        className="h-[52px] w-full cursor-pointer self-start justify-center rounded-full border border-brand bg-brand px-[26px] font-mono text-[10.5px] font-bold tracking-[.18em] text-black transition-colors duration-300 hover:border-brand-light hover:bg-brand-light disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "POŠILJAM …" : "POŠLJI POVPRAŠEVANJE →"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted">{label}</span>
      {children}
    </label>
  );
}
