import { getTranslations } from "next-intl/server";

export async function SkipLink({ target = "main" }: { target?: string }) {
  const t = await getTranslations("a11y");
  return (
    <a
      href={`#${target}`}
      className="sr-only z-50 rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-contrast focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
    >
      {t("skipToContent")}
    </a>
  );
}
