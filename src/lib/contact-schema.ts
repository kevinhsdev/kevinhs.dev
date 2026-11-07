import { z } from "zod";

/** The contact form; `website` is a honeypot people never see, so it must stay empty. */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0),
});
export type ContactInput = z.infer<typeof contactSchema>;
