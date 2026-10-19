"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition, type FormEvent } from "react";
import { reportForm } from "@/components/shared/arcade-state";
import { profile } from "@/content/profile";
import { sendContact } from "@/lib/contact-action";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground placeholder:text-muted transition-colors duration-150 hover:border-muted focus-visible:border-accent aria-invalid:border-danger sm:text-sm";

export function ContactForm({ className }: { className?: string }) {
  const t = useTranslations("contact");
  const [pending, startTransition] = useTransition();
  const [invalid, setInvalid] = useState<string[]>([]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await sendContact(data);
      setInvalid(result.status === "invalid" ? result.fields : []);
      switch (result.status) {
        case "sent":
          void notify(t("sent"), { kind: "success" });
          form.reset();
          break;
        case "fallback":
          void notify(t("fallback"));
          window.location.href = result.mailto;
          break;
        case "invalid":
          void notify(t("invalid"), { kind: "error" });
          form.querySelector<HTMLElement>(`[name="${result.fields[0]}"]`)?.focus();
          break;
        case "rate-limited":
          void notify(t("rateLimited"), { kind: "error" });
          break;
        case "error":
          void notify(t("error", { email: profile.email }), { kind: "error" });
          break;
      }
    });
  }

  const isInvalid = (name: string) => invalid.includes(name) || undefined;

  return (
    <form
      onSubmit={onSubmit}
      // the arcade theme's boss takes damage as the fields fill in
      onInput={(event) => reportForm(event.currentTarget)}
      noValidate
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          {t("name")}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            aria-invalid={isInvalid("name")}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          {t("email")}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={160}
            aria-invalid={isInvalid("email")}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        {t("message")}
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          aria-invalid={isInvalid("message")}
          className={cn(fieldClass, "resize-y")}
        />
      </label>
      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <label aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        {t("honeypot")}
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-full bg-accent px-6 text-sm font-semibold tracking-wide text-accent-contrast uppercase transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? t("sending") : t("send")}
        <ArrowRight aria-hidden className="size-4" />
      </button>
    </form>
  );
}
