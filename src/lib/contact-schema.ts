import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(160),
  message: z.string().trim().min(10).max(4000),
  /** Honeypot: real people never see or fill this field. */
  company: z.string().max(0).optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult =
  | { status: "sent" }
  | { status: "fallback"; mailto: string }
  | { status: "invalid"; fields: string[] }
  | { status: "rate-limited" }
  | { status: "error" };

export function buildMailto(to: string, input: Pick<ContactInput, "name" | "message">): string {
  const subject = encodeURIComponent(`Portfolio · ${input.name}`);
  const body = encodeURIComponent(input.message);
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
