import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { LinkedInIcon } from "@/components/shared/brand-icons";
import { ContactForm } from "@/components/shared/contact-form";
import { CopyEmailButton, CvButton, LinkedInButton } from "@/components/shared/ctas";
import { Text } from "@/components/shared/text";
import { pick, profile } from "@/content";
import type { Locale } from "@/i18n/routing";
import { creativeButton } from "./hero";

export function Block({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28"
    >
      <div className="mb-12 flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">{kicker}</p>
        <h2 id={`${id}-title`} data-split className="font-display text-6xl sm:text-8xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export async function CreativeAbout({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-6 text-lg leading-relaxed text-muted lg:grid-cols-3 lg:gap-10">
      {profile.about.map((paragraph) => (
        <Text key={paragraph.en} as="p" className="text-pretty">
          {pick(paragraph, locale)}
        </Text>
      ))}
    </div>
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
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
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
          </div>
        </div>
        <div className="flex flex-col gap-4" data-print="hide">
          <h3 className="font-mono text-xs tracking-widest text-muted uppercase">
            {t("contact.orForm")}
          </h3>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export async function CreativeFooter({ locale, updatedAt }: { locale: Locale; updatedAt: Date }) {
  const t = await getTranslations("footer");
  const date = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    dateStyle: "long",
  }).format(updatedAt);
  return (
    <footer
      id="site-footer"
      className="flex flex-col gap-4 border-t border-border px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:px-8"
    >
      {/* Decorative: drawn as generated content so it is not text for screen readers or axe. */}
      <span
        aria-hidden
        data-text={profile.name}
        className="font-display text-7xl text-foreground/10 after:content-[attr(data-text)] sm:text-9xl"
      />
      <div className="flex flex-col gap-1 sm:items-end">
        <a
          href={profile.links.siteRepo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 transition-colors duration-150 hover:text-foreground"
        >
          {t("builtWith")} <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
        <p>
          © {updatedAt.getFullYear()} {profile.fullName} · {t("updated", { date })}
        </p>
      </div>
    </footer>
  );
}
