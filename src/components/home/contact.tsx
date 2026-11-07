"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CvButton, InstagramButton, LinkedInButton, useCopyEmail } from "@/components/shell/ctas";
import { ShaderStage } from "@/components/stage/shader-stage";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { MetalButton } from "@/components/ui/mercurio";
import { profile } from "@/content/profile";
import { contactAction } from "@/lib/contact-action";
import { contactSchema } from "@/lib/contact-schema";
import "./contact.css";

const pill =
  "inline-flex h-12 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] px-5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent";
const field =
  "h-12 w-full rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-[color-mix(in_srgb,var(--background)_55%,transparent)] px-4 text-sm outline-none placeholder:text-muted focus:border-accent";

/**
 * Contact, on the Nebulosa stage (always dark): the e-mail big, Mercúrio copies it, the CTAs,
 * and a message form whose message field is the AI Prompt Box in the site palette.
 */
export function Contact() {
  const t = useTranslations("contact");
  const email = useCopyEmail();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [website, setWebsite] = useState("");
  const [pending, start] = useTransition();

  // The prompt box clears itself on send, so a send the server would refuse is stopped
  // here (capture phase, before the box sees it) and the text stays.
  const guard = (e: React.SyntheticEvent, root: HTMLElement) => {
    const text = root.querySelector("textarea")?.value.trim() ?? "";
    const ok = contactSchema.safeParse({ name, email: from, message: text, website }).success;
    if (ok) return;
    e.preventDefault();
    e.stopPropagation();
    toast.error(t("invalid"));
  };

  const send = (message: string) =>
    start(async () => {
      const r = await contactAction({ name, email: from, message, website });
      if (r.ok) {
        toast.success(t("sent"));
        setName("");
        setFrom("");
        return;
      }
      toast.error(t(r.reason));
      if (r.reason !== "invalid") window.location.href = r.mailto;
    });

  return (
    <ShaderStage
      kind="nebulosa"
      as="section"
      id="contact"
      aria-labelledby="contact-title"
      className="dark"
    >
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-16 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h2
            id="contact-title"
            className="font-display text-7xl leading-[0.9] text-[var(--stage-ink)] uppercase sm:text-9xl"
          >
            {t("title")}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-[var(--stage-muted)]">{t("intro")}</p>
          <button
            type="button"
            onClick={() => void email.copy()}
            className="mt-10 block max-w-full truncate text-left font-display text-[clamp(1.75rem,8vw,3.75rem)] text-accent-strong underline-offset-8 hover:underline"
          >
            {profile.email}
          </button>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MetalButton onClick={() => void email.copy()}>{email.label}</MetalButton>
            <CvButton className={pill} />
            <LinkedInButton className={pill} />
            <InstagramButton className={pill} />
          </div>
        </div>

        <form
          className="contact-box lg:col-span-5"
          onSubmit={(e) => e.preventDefault()}
          aria-busy={pending}
        >
          <h3 className="mb-5 font-mono text-xs tracking-widest text-[var(--stage-muted)] uppercase">
            {t("orForm")}
          </h3>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <label className="sr-only" htmlFor="contact-name">
              {t("name")}
            </label>
            <input
              id="contact-name"
              className={field}
              placeholder={t("name")}
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="sr-only" htmlFor="contact-email">
              {t("email")}
            </label>
            <input
              id="contact-email"
              className={field}
              type="email"
              placeholder={t("email")}
              autoComplete="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          {/* honeypot: hidden from people, bots fill it */}
          <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              {t("honeypot")}
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
          <fieldset
            onKeyDownCapture={(e) => {
              if (e.key === "Enter" && !e.shiftKey) guard(e, e.currentTarget);
            }}
            onClickCapture={(e) => {
              const btn = (e.target as HTMLElement).closest(".apb-send");
              if (btn?.getAttribute("data-state") === "send") guard(e, e.currentTarget);
            }}
          >
            <legend className="sr-only">{t("message")}</legend>
            <PromptInputBox placeholder={t("placeholder")} isLoading={pending} onSend={send} />
          </fieldset>
        </form>
      </div>
    </ShaderStage>
  );
}
