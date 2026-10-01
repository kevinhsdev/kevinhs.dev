import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CreativeHeader } from "@/components/creative/hero";
import { MissingPath } from "@/components/creative/missing-path";
import { CreativeShell } from "@/components/creative/shell";
import { CvButton } from "@/components/shared/ctas";
import { Link } from "@/i18n/navigation";
import { HOME_PATH } from "@/lib/site";

export default async function NotFound() {
  const t = await getTranslations();
  const button =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide uppercase transition-[scale,opacity,border-color] duration-150 active:scale-[0.97]";

  return (
    <CreativeShell>
      <CreativeHeader />
      <main
        id="main"
        className="relative isolate flex min-h-dvh flex-col justify-center gap-8 overflow-hidden px-4 pt-24 pb-12 sm:px-8"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_80%_100%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_60%)]"
        />
        <p
          aria-hidden
          className="font-display text-[clamp(8rem,38vw,30rem)] leading-[0.8] text-accent"
        >
          404
        </p>
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="font-display text-5xl sm:text-7xl">{t("notFound.title")}</h1>
          <p className="text-lg text-pretty text-muted">{t("notFound.description")}</p>
        </div>
        <div className="max-w-2xl">
          <MissingPath />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={HOME_PATH}
            className={`${button} bg-accent text-accent-contrast hover:opacity-90`}
          >
            <ArrowLeft aria-hidden className="size-4" />
            {t("notFound.back")}
          </Link>
          <Link
            href={`${HOME_PATH}#projects`}
            className={`${button} border border-foreground/25 hover:border-foreground`}
          >
            {t("notFound.projects")}
          </Link>
          <CvButton
            source="not-found"
            className={`${button} border border-foreground/25 hover:border-foreground`}
          />
        </div>
      </main>
    </CreativeShell>
  );
}
