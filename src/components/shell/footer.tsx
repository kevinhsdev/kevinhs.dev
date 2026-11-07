import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  return (
    <footer
      id="site-footer"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-8 text-sm text-muted sm:px-8"
    >
      <span>{t("rights", { year: new Date().getFullYear() })}</span>
      <a href="#main" className="inline-flex min-h-11 items-center hover:text-foreground">
        {t("top")} ↑
      </a>
    </footer>
  );
}
