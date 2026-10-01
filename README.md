# Kevin Henrique — Portfolio

Personal portfolio of **Kevin Henrique da Silva**, a Software Engineering student in São Paulo,
Brazil, looking for an internship in backend (Java/Spring), DevOps/Cloud and applied AI.

> 🇧🇷 Portfólio pessoal, bilíngue (PT-BR/EN). Todo o conteúdo fica em `src/content/`.

## What's inside

- **Home** with a kinetic headline, live telemetry of real projects, stacked project cards, a
  `git log` timeline and a file-explorer view of skills.
- **Case studies** (`/projects/[slug]`) in MDX: problem, constraints, a decision → alternative → why
  table, an architecture diagram, real code excerpts and what I'd do differently.
- **/now** page, an animated **site menu**, a **⌘K / Ctrl+K command palette** and a 404 with a git
  joke.
- **SEO**: per-locale metadata with `hreflang`, `sitemap.xml`, `robots.txt` and generated Open
  Graph images (home and each case study, Anton font vendored in `src/assets/fonts`).
- **Print**: Ctrl+P on the home prints a one-page résumé built from the same content.

## Stack

| Layer     | Choice                                                                       |
| --------- | ---------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict              |
| Styling   | Tailwind CSS v4 + CSS-variable design tokens (light/dark)                    |
| Motion    | CSS first; GSAP + ScrollTrigger + Lenis lazy-loaded after the page is idle   |
| i18n      | next-intl — `/pt` and `/en`, detected from the browser                       |
| Content   | Typed modules validated with Zod at build time; MDX + Shiki for case studies |
| UI        | Radix Dialog (site menu), cmdk (palette), sonner (toasts), next-themes       |
| Contact   | Server Action + Resend, honeypot and rate limit; falls back to `mailto:`     |
| Quality   | ESLint, Prettier, Vitest, Playwright + axe, GitHub Actions                   |
| Hosting   | Vercel (Analytics + Speed Insights)                                          |

## Engineering decisions

- **Content is data.** Copy lives in `src/content/*.ts`, validated by Zod. A wrong date or a
  missing translation fails the build instead of shipping.
- **Missing facts are loud.** Unknown information is written as `TODO(kevin): …` and renders
  highlighted; `npm run todos` lists every one.
- **Animation never blocks content.** The hero is in the HTML and visible on the first frame. GSAP
  and Lenis load after the page is idle, nothing already on screen is hidden to be revealed again,
  and `prefers-reduced-motion` turns it all off.
- **Accessibility is tested.** A unit test parses `src/styles/tokens.css` and checks WCAG AA contrast
  for every token pair; Playwright runs axe on every page, locale and theme.
- **Privacy by default.** No phone number is published, school systems are never linked, and their
  screens appear only as mockups with fictional data.

## Getting started

Requires Node.js 20.9+ (`.nvmrc` pins 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script             | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `npm run check`    | Typecheck, lint, Prettier and unit tests              |
| `npm run build`    | Production build                                      |
| `npm run test:e2e` | Playwright end-to-end + accessibility (after a build) |
| `npm run todos`    | Lists content still waiting for information           |

### Environment variables

All optional — see `.env.example`.

| Variable               | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and OG images |
| `RESEND_API_KEY`       | Sends contact-form messages (otherwise `mailto:`) |
| `CONTACT_TO_EMAIL`     | Where contact-form messages go                    |

## Deploy (Vercel)

1. Push this repository to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repository. The defaults are right
   (framework Next.js, `npm run build`, Node from `.nvmrc`).
3. In **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to the final URL
   (`https://kevinhs.dev`) and, for the contact form, `RESEND_API_KEY` and
   `CONTACT_TO_EMAIL`. Redeploy after changing them.
4. Optional custom domain: **Settings → Domains → Add**, then create the DNS records Vercel shows
   (an `A` record for the apex, a `CNAME` for `www`). HTTPS is automatic.
5. After the first deploy, run PageSpeed Insights / Lighthouse against the live URL and check
   that `/sitemap.xml`, `/robots.txt` and the social card (`/pt/opengraph-image`) load.

Vercel Analytics and Speed Insights turn on by themselves on Vercel (enable them in the project's
**Analytics** tab).

## Editing content

| To change…                       | Edit                                           |
| -------------------------------- | ---------------------------------------------- |
| Name, headline, links, CV, about | `src/content/profile.ts`                       |
| Work, education, events          | `src/content/timeline.ts`                      |
| Projects                         | `src/content/projects.ts`                      |
| A case study                     | `src/content/case-studies/<slug>.<pt\|en>.mdx` |
| Skills                           | `src/content/skills.ts`                        |
| The /now page                    | `src/content/now.ts`                           |
| Interface labels                 | `messages/pt.json`, `messages/en.json`         |

Every text field takes both languages: `{ pt: "…", en: "…" }`.

### Adding a project with a case study

1. Add it to `src/content/projects.ts` with `hasCaseStudy: true`.
2. Write `src/content/case-studies/<slug>.pt.mdx` and `<slug>.en.mdx` (copy an existing one for the
   section structure).
3. Optional: add a mockup to `src/components/shared/mockups.tsx`.
4. Run `npm run check && npm run build` — the new page is generated statically.

## License

Content (texts, CV, photos) © Kevin Henrique da Silva — all rights reserved.
