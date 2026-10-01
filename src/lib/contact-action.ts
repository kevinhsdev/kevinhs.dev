"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { profile } from "@/content";
import { buildMailto, contactSchema, type ContactResult } from "./contact-schema";
import { createRateLimiter } from "./rate-limit";

const allow = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });

export async function sendContact(formData: FormData): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => String(issue.path[0]));
    // A filled honeypot means a bot: pretend it worked.
    if (fields.includes("company")) return { status: "sent" };
    return { status: "invalid", fields };
  }

  const to = process.env.CONTACT_TO_EMAIL ?? profile.email;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "fallback", mailto: buildMailto(to, parsed.data) };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) return { status: "rate-limited" };

  const { name, email, message } = parsed.data;
  const { error } = await new Resend(apiKey).emails.send({
    from: "Portfolio <onboarding@resend.dev>",
    to,
    replyTo: email,
    subject: `Portfolio · ${name}`,
    text: `${message}\n\n— ${name} <${email}>`,
  });

  if (error) {
    console.error("[contact] resend failed:", error.message);
    return { status: "error" };
  }
  return { status: "sent" };
}
