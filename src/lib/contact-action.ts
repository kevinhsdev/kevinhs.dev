"use server";

import { Resend } from "resend";
import { sendContact, type ContactResult } from "./contact";

/** Server entry for the contact form: RESEND_API_KEY / CONTACT_TO_EMAIL from the environment. */
export async function contactAction(input: unknown): Promise<ContactResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;
  return sendContact(input, {
    apiKey,
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
    send: resend ? (m) => resend.emails.send(m) : undefined,
  });
}
