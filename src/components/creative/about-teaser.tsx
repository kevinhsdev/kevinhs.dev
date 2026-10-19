import {
  ArrowRight,
  ChevronRight,
  Dumbbell,
  Gamepad2,
  Languages,
  Music,
  Sparkles,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Text } from "@/components/shared/text";
import { gallery, now, pick, profile } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { creativeButton } from "./hero";

export const hobbyIcons: Record<(typeof profile.hobbies)[number]["icon"], LucideIcon> = {
  music: Music,
  volleyball: Volleyball,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
};

const tile = "flex flex-col rounded-3xl border border-border bg-surface p-6 sm:p-8";
const tileTitle = "flex items-center gap-2 text-lg font-semibold";

/** A real photo filling its tile, with the caption on a strip below (never over the image). */
function PhotoTile({ id, locale, className }: { id: string; locale: Locale; className?: string }) {
  const photo = gallery.find((item) => item.id === id);
  if (!photo) return null;
  return (
    <figure
      data-reveal
      className={cn(
        "about-photo m-0 flex min-h-72 flex-col overflow-hidden rounded-3xl border border-border bg-surface",
        className,
      )}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Local, already-resized photos; next/image adds nothing for two tiles. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={pick(photo.alt, locale)}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: photo.focus }}
        />
      </div>
      <figcaption className="border-t border-border px-5 py-3 font-mono text-xs text-muted">
        {pick(photo.caption, locale)}
      </figcaption>
    </figure>
  );
}

/**
 * The home's About section as a bento of real facts: who Kevin is, two real
 * photos, when he started coding, his languages, life away from the screen and
 * what he's learning now. Every tile reads from src/content; nothing is copy
 * made up for the layout. Seven tiles, seven facts: two 12-column rows on wide
 * screens after the 7/5 opener, one column on phones.
 */
export async function AboutTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations();

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div data-reveal className={cn(tile, "justify-between gap-10 lg:col-span-7 lg:row-span-2")}>
        <Text as="p" className="text-2xl leading-snug font-medium text-pretty sm:text-3xl">
          {pick(profile.aboutShort, locale)}
        </Text>
        <Link href="/about" className={`${creativeButton.primary} self-start`}>
          {t("aboutPage.more")}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <PhotoTile id="adesivos" locale={locale} className="lg:col-span-5 lg:row-span-2" />

      <div
        data-reveal
        className={cn(
          tile,
          "justify-between gap-6 border-accent bg-accent text-accent-contrast lg:col-span-3",
        )}
      >
        <p className="font-display text-[clamp(6rem,10vw,8.5rem)] leading-[0.8]">
          {profile.startedCoding.age}
        </p>
        <p className="text-lg leading-snug font-semibold text-pretty">
          {t("aboutTeaser.startedLabel")}, {pick(profile.startedCoding.how, locale)}.
        </p>
      </div>

      <div data-reveal className={cn(tile, "gap-5 lg:col-span-4")}>
        <h3 className={tileTitle}>
          <Languages aria-hidden className="size-5 text-accent" />
          {t("aboutTeaser.languages")}
        </h3>
        <dl className="flex flex-col gap-4">
          {profile.languages.map((language) => (
            <div key={language.code} className="grid grid-cols-[2.25rem_1fr] items-baseline gap-3">
              <dt className="font-mono text-xs text-accent uppercase">{language.code}</dt>
              <dd className="flex flex-col">
                <span className="font-semibold">{pick(language.name, locale)}</span>
                <span className="text-sm text-muted">{pick(language.level, locale)}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div data-reveal className={cn(tile, "gap-5 lg:col-span-5")}>
        <h3 className={tileTitle}>{t("aboutTeaser.offScreen")}</h3>
        <ul className="flex flex-col gap-3">
          {profile.hobbies.map((hobby) => {
            const Icon = hobbyIcons[hobby.icon];
            return (
              <li key={hobby.icon} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="pt-2 text-sm leading-snug text-pretty">
                  {pick(hobby.label, locale)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <PhotoTile id="guitarra" locale={locale} className="lg:col-span-5 lg:min-h-[23rem]" />

      <div data-reveal className={cn(tile, "gap-5 lg:col-span-7")}>
        <h3 className={tileTitle}>
          <Sparkles aria-hidden className="size-5 text-accent" />
          {t("aboutTeaser.learning")}
        </h3>
        <ul className="flex flex-col gap-3">
          {now.learning.map((item) => (
            <li key={item.en} className="flex gap-3 leading-relaxed text-pretty text-muted">
              <ChevronRight aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              {pick(item, locale)}
            </li>
          ))}
        </ul>
        <Link
          href="/now"
          className="link-underline mt-auto inline-flex min-h-11 items-center gap-1.5 self-start font-medium text-link"
        >
          {t("aboutTeaser.nowLink")}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </div>
  );
}
