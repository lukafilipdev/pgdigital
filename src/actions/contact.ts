"use server";

export type InquiryState = {
  status: "idle" | "success" | "error";
  error?: string;
  scope?: string;
  timeline?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const timeline = String(formData.get("timeline") ?? "").trim();

  if (!name || !EMAIL_PATTERN.test(email)) {
    return { status: "error", error: "Vpišite ime in veljaven e-poštni naslov." };
  }

  // Delivery is not wired up yet: forward name, email, scope, timeline and message
  // to your email provider or CRM here, and return an error state if it fails.

  return { status: "success", scope, timeline };
}
