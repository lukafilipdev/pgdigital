"use client";

import { useActionState, useState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/actions/contact";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { INQUIRY_SCOPES } from "@/content/site";
import { cn } from "@/lib/cn";

const INITIAL_STATE: InquiryState = { status: "idle" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [formKey, setFormKey] = useState(0);
  return <ContactFormInner key={formKey} onReset={() => setFormKey((k) => k + 1)} />;
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE);
  const [scope, setScope] = useState<string>(INQUIRY_SCOPES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [tried, setTried] = useState(false);

  const nameOk = name.trim().length > 1;
  const emailOk = EMAIL_PATTERN.test(email.trim());
  const showInvalid = tried || state.status === "error";
  const nameInvalid = showInvalid && !nameOk;
  const emailInvalid = showInvalid && !emailOk;

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col justify-center gap-5 py-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[.18em] text-brand">
          <CheckIcon size={14} strokeWidth={2.4} />
          <span>POVPRAŠEVANJE POSLANO</span>
        </span>
        <h3 className="m-0 font-display text-[clamp(36px,3.6vw,64px)] leading-[.95] font-extrabold tracking-[-.05em] text-pretty text-white">
          Hvala. <span className="text-brand">Odgovorimo v 24 urah.</span>
        </h3>
        <div className="flex pt-1">
          <button
            type="button"
            data-cursor="link"
            onClick={onReset}
            className="inline-flex min-h-[50px] cursor-pointer items-center rounded-full border border-white/22 bg-transparent px-6 font-display text-[15px] font-extrabold text-white transition-colors duration-250 hover:border-white hover:bg-white hover:text-black"
          >
            Novo povpraševanje
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(e) => {
        if (!nameOk || !emailOk) {
          e.preventDefault();
          setTried(true);
        }
      }}
      className="flex flex-col gap-[26px]"
    >
      <input type="hidden" name="scope" value={scope} />

      {/* Project Type Pills */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] font-bold tracking-[.18em] text-white/60">
          VRSTA PROJEKTA
        </span>
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
                  "min-h-[46px] cursor-pointer rounded-full border px-[18px] font-display text-[15px] font-bold transition-colors duration-200",
                  active
                    ? "border-brand bg-brand text-black"
                    : "border-white/20 bg-transparent text-white hover:border-white/45",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name + Email Minimal Hairline Inputs */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-x-6 gap-y-[26px]">
        <Field label="IME IN PODJETJE" required>
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Janez Novak, Podjetje d.o.o."
            aria-invalid={nameInvalid}
            className={cn(
              "min-h-[50px] w-full border-0 border-b bg-transparent p-0 font-sans text-[18px] text-white caret-brand outline-none transition-colors duration-200 placeholder:text-white/32 focus:border-brand",
              nameInvalid ? "border-brand" : "border-white/20",
            )}
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
            aria-invalid={emailInvalid}
            className={cn(
              "min-h-[50px] w-full border-0 border-b bg-transparent p-0 font-sans text-[18px] text-white caret-brand outline-none transition-colors duration-200 placeholder:text-white/32 focus:border-brand",
              emailInvalid ? "border-brand" : "border-white/20",
            )}
          />
        </Field>
      </div>

      {/* Project Description Textarea */}
      <Field label="O PROJEKTU">
        <textarea
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Kaj želite doseči, obstoječa stran ali ključne zahteve …"
          className="w-full resize-y border-0 border-b border-white/20 bg-transparent py-3 font-sans text-[18px] leading-[1.5] text-white caret-brand outline-none transition-colors duration-200 placeholder:text-white/32 focus:border-brand"
        />
      </Field>

      {/* Status Note + Primary CTA */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5">
        {nameInvalid || emailInvalid ? (
          <span
            role="alert"
            className="font-mono text-[11px] font-bold tracking-[.14em] text-brand"
          >
            IZPOLNITE OZNAČENA POLJA
          </span>
        ) : state.status === "error" && state.error ? (
          <span
            role="alert"
            className="font-mono text-[11px] font-bold tracking-[.14em] text-brand"
          >
            {state.error.toUpperCase()}
          </span>
        ) : (
          <span className="font-mono text-[11px] font-bold tracking-[.14em] text-white/60">
            ODGOVORIMO V 24 URAH
          </span>
        )}

        <button
          type="submit"
          disabled={pending}
          data-cursor="link"
          className="group inline-flex min-h-[56px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand px-[30px] font-display text-[17px] font-extrabold text-black transition-colors duration-250 hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          <span>{pending ? "Pošiljam …" : "Pošlji povpraševanje"}</span>
          <ArrowRightIcon
            size={17}
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
      <span className="font-mono text-[10px] font-bold tracking-[.18em] text-white/60">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      {children}
    </label>
  );
}
