import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { InstagramIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { ContactForm } from "@/components/shared/contact-form";
import {
  CopyEmailButton,
  CvButton,
  InstagramButton,
  LinkedInButton,
} from "@/components/shared/ctas";
import { profile } from "@/content";
import type { Locale } from "@/i18n/routing";
import { BuildFooter } from "./build-footer";
import { creativeButton } from "./hero";

export function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28"
    >
      <h2
        id={`${id}-title`}
        data-split
        className="font-display mb-12 text-6xl sm:mb-16 sm:text-8xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export async function CreativeContact() {
  const t = await getTranslations();
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-20 px-4 py-24 sm:px-8 sm:py-32"
    >
      <h2 id="contact-title" data-split className="font-display text-[clamp(4rem,16vw,14rem)]">
        {t("creative.talk")}
      </h2>
      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="max-w-lg text-lg leading-relaxed text-pretty text-muted">
            {t("contact.intro")}
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="link-underline self-start text-2xl font-semibold break-all text-accent sm:text-4xl"
          >
            {profile.email}
          </a>
          <div className="flex flex-wrap gap-2" data-print="hide">
            <CopyEmailButton source="creative-contact" className={creativeButton.primary} />
            <CvButton source="creative-contact" className={creativeButton.secondary} />
            <LinkedInButton source="creative-contact" className={creativeButton.secondary}>
              <LinkedInIcon className="size-4" />
              {t("cta.linkedin")}
            </LinkedInButton>
            <InstagramButton source="creative-contact" className={creativeButton.secondary}>
              <InstagramIcon className="size-4" />
              {t("cta.instagram")}
            </InstagramButton>
          </div>
        </div>
        {/* The form as a file being written, in the same editor chrome as the hero. */}
        <div
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--accent)_40%,transparent)]"
          data-print="hide"
        >
          <div
            aria-hidden
            className="flex items-center gap-4 border-b border-border px-4 font-mono text-xs text-muted"
          >
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
            </span>
            <span className="-mb-px border-b-2 border-accent py-3 text-foreground">
              {t("creative.formFile")}
            </span>
          </div>
          <div className="flex flex-col gap-5 p-5 sm:p-8">
            <h3 className="text-lg font-semibold">{t("contact.orForm")}</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Server wrapper: formats the "Finished at" date in the page's language. */
export function CreativeFooter({ locale, updatedAt }: { locale: Locale; updatedAt: Date }) {
  const finishedAt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    dateStyle: "long",
  }).format(updatedAt);
  return <BuildFooter finishedAt={finishedAt} year={updatedAt.getFullYear()} />;
}
