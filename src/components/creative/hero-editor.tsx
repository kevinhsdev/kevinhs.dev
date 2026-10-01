import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { pick, profile } from "@/content";
import type { Locale } from "@/i18n/routing";

type Token = "comment" | "keyword" | "name" | "key" | "string" | "punct" | "plain";
type Segment = [Token, string];

const tokenClass: Record<Token, string> = {
  comment: "text-muted italic",
  keyword: "text-accent",
  name: "text-foreground font-semibold",
  key: "text-link",
  string: "text-positive",
  punct: "text-muted",
  plain: "text-foreground",
};

// Typing speed: fast enough to read along, capped so long lines don't drag.
const MS_PER_CHAR = 14;
const MAX_LINE_MS = 360;
const LINE_GAP_MS = 40;

const str = (value: string): Segment => ["string", `"${value}"`];

function array(values: string[]): Segment[] {
  return [
    ["punct", "["],
    ...values.flatMap((value, index): Segment[] =>
      index === 0 ? [str(value)] : [["punct", ", "], str(value)],
    ),
    ["punct", "]"],
  ];
}

const property = (key: string, value: Segment[]): Segment[] => [
  ["plain", "  "],
  ["key", key],
  ["punct", ": "],
  ...value,
  ["punct", ","],
];

/**
 * The hero's code editor: Kevin's profile written as a TypeScript object, typed
 * out line by line with CSS only (each line is unclipped in steps, one per
 * character). The text is real and readable by assistive tech; the window
 * chrome and line numbers are decorative.
 */
export async function HeroEditor({ locale }: { locale: Locale }) {
  const t = await getTranslations("creative");

  const lines: Segment[][] = [
    [["comment", `// ${t("editorComment")}`]],
    [
      ["keyword", "const "],
      ["name", "kevin"],
      ["punct", " = {"],
    ],
    property("role", [str(pick(profile.role, locale))]),
    property("location", [str(pick(profile.location, locale))]),
    property("stack", array(profile.stackLine.split(" · "))),
    property("exploring", array(profile.exploring.map((item) => pick(item, locale)))),
    property("status", [str(pick(profile.status, locale))]),
    [
      ["punct", "} "],
      ["keyword", "satisfies "],
      ["name", "Engineer"],
      ["punct", ";"],
    ],
    [],
    [
      ["keyword", "export default "],
      ["name", "kevin"],
      ["punct", ";"],
    ],
  ];

  let at = 0;
  const timed = lines.map((segments) => {
    const chars = segments.reduce((sum, [, text]) => sum + text.length, 0);
    const duration = Math.min(chars * MS_PER_CHAR, MAX_LINE_MS);
    const line = { segments, chars, at, duration };
    at += duration + LINE_GAP_MS;
    return line;
  });

  return (
    <figure
      aria-label={t("editorLabel")}
      className="hero-rise-block overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--accent)_45%,transparent)] backdrop-blur-md"
      style={{ ["--i" as string]: 2 }}
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
        <span className="-mb-px border-b-2 border-accent py-3 text-foreground">kevin.ts</span>
        <span className="py-3">projects.ts</span>
      </div>

      <pre className="py-4 font-mono text-[11.5px] leading-[1.75] break-words whitespace-pre-wrap sm:text-[13px]">
        <code className="grid grid-cols-[auto_1fr]">
          {timed.map(({ segments, chars, at, duration }, index) => (
            <span key={index} className="contents">
              <span aria-hidden className="pr-4 pl-4 text-right text-muted/60 select-none">
                {index + 1}
              </span>
              <span
                className={chars > 0 ? "type-line justify-self-start pr-4" : "pr-4"}
                style={
                  {
                    // chars + 1 positions (0…chars) with jump-none: the last one is always the full line.
                    "--steps": chars + 1,
                    "--at": `${at}ms`,
                    "--dur": `${duration}ms`,
                  } as CSSProperties
                }
              >
                {segments.map(([token, text], segment) => (
                  <span key={segment} className={tokenClass[token]}>
                    {text}
                  </span>
                ))}
                {index === timed.length - 1 && (
                  <span
                    aria-hidden
                    className="type-caret ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-accent"
                    style={{ "--at": `${at + duration}ms` } as CSSProperties}
                  />
                )}
              </span>
            </span>
          ))}
        </code>
      </pre>

      <div
        aria-hidden
        className="flex justify-between border-t border-border px-4 py-2 font-mono text-[10px] tracking-wider text-muted uppercase"
      >
        <span>main ✓</span>
        <span>TypeScript · UTF-8</span>
      </div>
    </figure>
  );
}
