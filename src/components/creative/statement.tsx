import { getTranslations } from "next-intl/server";

/** Three short lines that tell the story before the details. */
export async function Statement() {
  const t = await getTranslations("creative");
  const lines = t.raw("statement") as string[];
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-24">
      <p className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-[1.12]">
        {lines.map((line, index) => (
          <span
            key={line}
            data-split
            className={index === lines.length - 1 ? "block text-accent" : "block"}
          >
            {line}
          </span>
        ))}
      </p>
    </section>
  );
}
