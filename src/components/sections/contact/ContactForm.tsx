"use client";

import { useActionState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/actions/contact";

const INITIAL_STATE: InquiryState = { status: "idle" };

const inputClass =
  "border-0 border-b border-edge bg-transparent py-2 text-xl font-medium text-white outline-none transition-colors placeholder:text-placeholder focus:border-brand";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col gap-3.5 border-t border-brand pt-[22px]">
        <span className="eyebrow text-brand">PREJETO</span>
        <span className="text-[clamp(26px,2.6vw,40px)] leading-[1.05] font-bold tracking-[-.045em]">
          Hvala. Oglasimo se v enem delovnem dnevu.
        </span>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[26px]">
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
      <Field label="O PROJEKTU">
        <textarea
          name="message"
          rows={3}
          placeholder="Nova spletna stran, prenova, spletna trgovina …"
          className={`${inputClass} resize-y`}
        />
      </Field>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-brand">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        data-cursor="link"
        className="h-[52px] cursor-pointer self-start rounded-full border border-white bg-white px-[26px] font-mono text-[10.5px] font-bold tracking-[.18em] text-black transition-colors duration-300 hover:border-brand hover:bg-brand disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "POŠILJAM …" : "POŠLJI POVPRAŠEVANJE →"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="eyebrow text-muted">{label}</span>
      {children}
    </label>
  );
}
