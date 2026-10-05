import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Text } from "@/components/shared/text";
import { gallery, pick, profile } from "@/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { creativeButton } from "./hero";

/**
 * The home's "About" block: three polaroids stacked (they fan out on hover)
 * beside a short summary and the way into /about. The photos repeat on that
 * page, so here they are decorative.
 */
export async function AboutTeaser({ locale }: { locale: Locale }) {
  const t = await getTranslations("aboutPage");
  const photos = gallery.slice(0, 3);

  return (
    <div className="about-teaser grid items-center gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
      <div aria-hidden className="polaroid-stack">
        {photos.map((photo, index) => (
          <figure key={photo.id} className="polaroid" data-i={index}>
            {/* Local, already-resized photos; next/image adds nothing for three thumbnails. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ objectPosition: photo.focus }}
            />
            <figcaption>{pick(photo.caption, locale)}</figcaption>
          </figure>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        <Text as="p" className="max-w-2xl text-xl leading-relaxed text-pretty sm:text-2xl">
          {pick(profile.aboutShort, locale)}
        </Text>
        <Link href="/about" className={`${creativeButton.primary} self-start`}>
          {t("more")}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </div>
  );
}
