import { profile } from "@/content/profile";
import { contactSchema } from "./contact-schema";

type Mail = { from: string; to: string; replyTo: string; subject: string; text: string };
export type ContactResult =
  { ok: true } | { ok: false; reason: "invalid" | "unconfigured" | "failed"; mailto: string };

function mailto(input: unknown): string {
  const i = (input ?? {}) as Partial<Record<"name" | "message", unknown>>;
  const subject = `Portfólio · ${typeof i.name === "string" ? i.name : ""}`.trim();
  const body = typeof i.message === "string" ? i.message : "";
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Validates and sends the contact message. Without a key (or when the provider fails) it
 * answers with a mailto link carrying the message, so nothing typed is lost.
 */
export async function sendContact(
  input: unknown,
  deps: {
    apiKey?: string;
    to?: string;
    from?: string;
    send?: (m: Mail) => Promise<{ error?: unknown }>;
  } = {},
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid", mailto: mailto(input) };
  if (!deps.apiKey || !deps.send)
    return { ok: false, reason: "unconfigured", mailto: mailto(input) };
  const { name, email, message } = parsed.data;
  try {
    const { error } = await deps.send({
      from: deps.from ?? "Portfólio <onboarding@resend.dev>",
      to: deps.to ?? profile.email,
      replyTo: email,
      subject: `Portfólio · ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });
    if (error) throw error;
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed", mailto: mailto(input) };
  }
}
