@AGENTS.md

# Portfolio — conventions for AI sessions

Personal portfolio of Kevin Henrique da Silva (Software Engineering student, looking for an
internship). Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4.
Read the version-matched Next.js docs in `node_modules/next/dist/docs/` before using any Next API
(middleware is `src/proxy.ts`, `params` are Promises, Turbopack is the default).

## Talking to Kevin

- Reply in **Portuguese (pt-BR)**. Code, identifiers, commits and comments are in **English**.
- Work in the phases of `PROMPT-PORTFOLIO.md` (kept outside the repo). **Stop at the end of each
  phase**, show screenshots, and wait for approval.
- **Commit or push only when Kevin asks.**
- Design taste: bold, animated, art-directed. Metaphors must come from **code / software
  engineering** (git log, file explorer, README…), never from cars or racing.

## Non-negotiable rules

1. **Never invent facts.** No made-up metrics, employers, titles, testimonials or certifications.
   Missing information is written as `TODO(kevin): …` inside the content; it renders highlighted
   (`<Text>` / `.todo`). Case-study text Kevin must confirm goes in a `<Review>` block. Both are
   listed by `npm run todos`.
2. **Privacy / LGPD.** Never publish a phone number, an address, or names of students, families,
   colleagues or school staff. School projects appear only with fictional data or mockups.
   SEK (repo `secretaria-iel`) and OASE · Lar code is **never linked** (`privateCode: true`).
3. **Honest seniority.** Student looking for an internship. Confident, never inflated. SEK (the
   school system, formerly "Secretaria IEL") is in use by the whole school office (confirmed by Kevin,
   Oct 2026), but its time savings are the team's report, not a measurement: never invent numbers.
4. **Content is separate from design.** All copy lives in `src/content/*.ts` (validated by Zod in
   `src/content/schema.ts`) and `src/content/case-studies/*.mdx`; UI strings live in
   `messages/{pt,en}.json`. Components never hard-code copy.
5. **Truly bilingual.** Every `Localized` value and every case study has natural PT-BR and EN —
   rewrite, don't translate literally. `messages/pt.json` and `en.json` keep identical keys (tested).

## Layout

```
src/app/[locale]/                 home (page.tsx), now/, projects/[slug]/ (case studies), not-found
src/components/creative/          the site's sections, hero, motion, preloader, skills explorer
src/components/case-study/        <Diagram>, <Tldr>, <Review> used inside the MDX
src/components/shared/            CTAs, toggles, ⌘K palette, site menu drawer, CTA dock, JSON-LD
src/components/motion/            useLazyMotion (GSAP + Lenis, loaded after idle) and shared reveals
src/content/                      profile, timeline, projects, skills, now + case-studies/*.mdx
src/i18n/                         next-intl routing, request config, navigation, resolveLocale()
src/lib/                          analytics, contact action, rate limit, case studies, view models,
                                  og.tsx (shared Open Graph card; repeats the dark palette — keep in sync)
src/app/sitemap.ts, robots.ts     SEO; opengraph-image.tsx lives next to the home and case studies
src/styles/                       tokens.css (light/dark palette) and creative.css (site styles)
messages/                         UI strings
tests/unit, tests/e2e             Vitest, Playwright + axe
```

## Conventions

- **Colors only through tokens** (`bg-background`, `text-muted`, `text-accent`…). Never hex in
  components. `tests/unit/contrast.test.ts` parses `tokens.css` and enforces WCAG AA for every pair.
- Theme = `.dark` on `<html>` (next-themes). Every route renders inside `<CreativeShell>` (fonts +
  styles).
- Server Components by default. Client components import raw content (`@/content/profile`), not
  `@/content`, to keep Zod out of the browser bundle.
- Pages call `resolveLocale(params)` first (404 on bad locale + static rendering).
- Motion: CSS transitions for UI; GSAP/Lenis only through `useLazyMotion`, which loads them after
  the page is idle and never hides content that is already on screen. Every animation respects
  `prefers-reduced-motion`. Keyboard-triggered UI (⌘K) never animates.
- Text masks for reveals need accent headroom (`.mask-line`, `.split-line-mask`) — Portuguese has
  Ó, Ã, Ç in uppercase.
- Touch targets ≥ 44px (`size-11` / `h-11`), no horizontal scroll at 360px, `100dvh`, safe areas.
- No `any`. Validate external data (form input) with Zod.
- The three primary CTAs (CV, LinkedIn, copy email) are one click away everywhere (hero, CTA dock,
  site menu, footer) and tracked with `trackCta()`.

## Before handing work back

```
npm run check        # typecheck + lint + prettier + unit tests
npm run build
npm run test:e2e     # needs a build; uses local Edge, 2 workers
npm run todos        # what is still missing from Kevin
```

## Environment gotchas (Windows)

- The machine has little free RAM: run one server at a time and stop it when done. Animation
  e2e tests can time out when it's overloaded; re-run with `--last-failed` before assuming a bug.
- Project lives in `C:\dev\portfolio` (outside OneDrive on purpose — sync locks `node_modules`).
- Removed design versions (Modern, Studio, Editorial, Terminal) are archived in
  `C:\dev\portfolio-arquivo\` (not in git).
