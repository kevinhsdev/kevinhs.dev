import { getLocale, getTranslations } from "next-intl/server";
import { BrandLente } from "@/components/shell/brand-lente";
import { profile } from "@/content";

/** 404: the K revealed by a drop of glass, a short line and the way back home. */
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  return (
    <main
      id="main"
      className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center px-5 pt-28 pb-20 text-center"
    >
      <BrandLente label={profile.name} className="h-[min(22rem,45svh)] w-full max-w-md" />
      <p className="mt-6 font-mono text-xs tracking-widest text-accent uppercase">404</p>
      <h1 className="mt-3 font-display text-5xl leading-none uppercase sm:text-7xl">
        {t("title")}
      </h1>
      <p className="mt-5 max-w-md text-lg text-muted">{t("text")}</p>
      <a
        href={`/${locale}`}
        className="mt-8 font-semibold underline underline-offset-[0.3em] hover:text-accent"
      >
        {t("back")} →
      </a>
    </main>
  );
}
