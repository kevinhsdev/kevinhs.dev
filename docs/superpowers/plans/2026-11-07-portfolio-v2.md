# Portfolio v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build kevinhs.dev v2 from scratch in `C:\dev\portfolio-v2`: home (Kairo hero → globe journey → projects → daily skills → contact), one page per project, and an About page, with Profitize-level scroll motion.

**Architecture:** Next.js App Router with `[locale]` routes (pt/en). The content data and photos are copied from the old repo; the interface code is not. Motion is imperative: GSAP ScrollTrigger pins without scrub call a pure `render(s)`, Lenis handles smooth scroll, and titles play on their own clock. ProfitizeBuild components are copied verbatim into `src/components/ui/` and adapted from the outside with tokens.

**Tech Stack:** Next 16.3.8, React 19.2.8, TypeScript strict (`noUncheckedIndexedAccess`), Tailwind v4, next-intl 4, next-themes, GSAP 3.15.0, lenis 1.3, cobe 2.0.1, @paper-design/shaders 0.0.82, motion 13.4.6, zod 4, resend 6, geist 1.9.2, @next/mdx 16.3.8, lucide-react 1.49, sonner 2, vitest 5 + jsdom, @testing-library/react, Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-11-07-portfolio-v2-design.md` (copied into the repo in Task 1 from the session scratchpad).

## Global Constraints

- Never invent facts. Data comes only from the copied `src/content/*` and `public/*`. A missing piece becomes `TODO(kevin)`.
- Colors come only from tokens in `src/styles/tokens.css`: `:root` (light) and `.dark`, plus one `[data-accent="red"]` block that overrides only the accent variables. Canvas/shader colors are read from those tokens at runtime.
- Display text is Portuguese and English with identical message keys. Code, comments and commits are in English.
- Touch targets are ≥ 44px. CV, LinkedIn and copy e-mail are always one click away.
- `prefers-reduced-motion`: no Lenis, no swarm build, no pin travel. Each pin shows its chapters as plain stacked sections, and titles switch by cut.
- Text is never bound to scrub. Titles use `Title.show/hide` on their own clock.
- ProfitizeBuild files are copied verbatim from `docs/prompts/*.txt`. If strict TS complains, they get the top line `// @ts-nocheck -- ProfitizeBuild file kept verbatim; it predates this repo's noUncheckedIndexedAccess.` They are excluded from eslint and prettier. Never ship demo looks (white square frames, sunset sky, fake apps, Unsplash).
- Each piece of content lives in one place (spec §4.4). The hero numbers are the only allowed repeat (hero and project page).
- No file downloads without Kevin's explicit OK. No stock images.
- Dev server runs on port **7778**, because the old site is on 7777 and another app is on 3000.
- Commit only when Kevin asks. At the end of each phase, stop and send screenshots (desktop 1536×702 and mobile 390×844).

## Review Focus

1. **The user stops scrolling in the middle of a pin, or reverses direction.** No title is half-clipped, and the scene equals `render(s)` for that `s`. Pinned by `title.test.ts` (an interrupted show/hide settles) and by the `journeyState` purity tests.
2. **Resize or rotate mid-pin.** Pins refresh, the photos pinned to points stay on their points, and nothing overflows. Pinned by the `coverPoint` tests at two box sizes, plus the Task 9 manual check at 1536 and 390.
3. **WebGL unavailable or failing** (old GPU, battery saver). The shader and globe areas fall back to a static token gradient, and the page still reads. Pinned in `shader-stage.test.ts` (`supportsWebgl` false → `fallback`).
4. **Contact sent with no `RESEND_API_KEY`, a Resend error, or bad input.** The user gets a clear message and a `mailto:` path, and nothing is lost silently. Pinned in `contact.test.ts`.
5. **English visitor.** The CV falls back to the PT file with the label "CV (PT)", every page has English text, and no key is missing. Pinned in `messages.test.ts` and `ctas.test.ts`.

---

## Phase 0 — Foundation

### Task 1: Repository scaffold

**Files:**

- Create: `C:\dev\portfolio-v2\` with `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `vitest.config.mts`, `.gitignore`, `.env.example`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `docs/superpowers/specs/2026-11-07-portfolio-v2-design.md`, `docs/superpowers/plans/2026-11-07-portfolio-v2.md` (copied from the scratchpad), `docs/prompts/{prompts,glass,new-prompts}.txt` (copied from the scratchpad)
- Test: `tests/unit/smoke.test.ts`

**Interfaces:**

- Produces:
  - npm scripts `dev` (`next dev -p 7778`), `build`, `typecheck`, `lint`, `format:check`, `test`, `test:e2e`, `check`
  - the alias `@/* → src/*`
  - `.prettierignore` and eslint `globalIgnores` both contain `src/components/ui`

- [ ] **Step 1:** Create the folder, run `git init`, and write `package.json` with the exact versions from Tech Stack. Run `npm i`.
- [ ] **Step 2:** Write the configs: the tsconfig is strict and has `noUncheckedIndexedAccess`; vitest uses the node env and includes `tests/unit/**/*.test.ts`; `.env.example` lists `RESEND_API_KEY=` and `CONTACT_TO_EMAIL=`.
- [ ] **Step 3: Write the failing test** `tests/unit/smoke.test.ts`: `expect(1 + 1).toBe(2)`, plus `expect(existsSync("docs/prompts/new-prompts.txt")).toBe(true)`.
- [ ] **Step 4:** Copy the spec, the plan and the three prompt files into `docs/`.
- [ ] **Step 5: Verify** with `npm run check`. Expected: all green. Then run `npm run dev` and confirm `http://localhost:7778` renders the placeholder page.

### Task 2: Content, i18n routing and messages

**Files:**

- Copy from `C:\dev\portfolio`:
  - `src/content/*` and `src/content/case-studies/*`
  - `public/{about,journey,projects,skills,cv}/**`
  - `src/assets/fonts/{anton-latin.woff2,OFL-Anton.txt}`
- Create:
  - `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`
  - `src/proxy.ts` (Next 16 middleware)
  - `src/app/[locale]/layout.tsx`
  - `messages/pt.json`, `messages/en.json`
- Test: `tests/unit/content.test.ts`, `tests/unit/messages.test.ts`

**Interfaces:**

- Produces:
  - `Locale = "pt" | "en"` (from `@/i18n/routing`)
  - `routing` with `localePrefix: "always"` and `defaultLocale: "pt"`
  - `Link`, `useRouter`, `getPathname`
  - from `@/content`: `profile`, `projects`, `featuredProjects`, `otherProjects`, `skills`, `gallery`, `timeline`, `about`, `now`, `getProject(slug)`, `pick(value, locale)`
  - message namespaces: `nav`, `cta`, `hero`, `journey`, `projects`, `skills`, `contact`, `about`, `project`, `menu`, `meta`

- [ ] **Step 1: Write the failing tests:**
  - `content.test.ts`: `featuredProjects.map(p=>p.slug)` equals `["sek","pdf-renamer","blood-bank"]`, and `otherProjects` has length 4.
  - `content.test.ts`: every `gallery[i].src` and every `presentation.poster` exists under `public/`.
  - `messages.test.ts`: the flattened key sets of `pt.json` and `en.json` are equal, and no value is an empty string.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Copy the content and assets. Write the routing, the proxy and the locale layout (`generateStaticParams` for pt/en, `setRequestLocale`). Write the message files with the namespaces above. Display copy comes from the old site's messages only where it states facts; new copy follows the spec.
- [ ] **Step 4:** Run `npm test`. Expected: PASS. Then `/pt` and `/en` respond with 200.

### Task 3: Tokens, theme, fonts

**Files:**

- Create: `src/styles/tokens.css`, `src/styles/globals.css`, `src/components/theme/theme-provider.tsx`, `src/components/theme/theme-toggle.tsx`, `src/lib/color.ts`
- Test: `tests/unit/contrast.test.ts`, `tests/unit/color.test.ts`

**Interfaces:**

- Produces:
  - CSS variables: `--background`, `--surface`, `--foreground`, `--muted`, `--border`, `--accent`, `--accent-strong`, `--accent-soft`, `--accent-contrast`, the shader sets `--fluxo-{light,rim,blue,deep}`, `--tipos-{1..4}`, `--nebula-{1..4,back}`.
  - Light theme: background `#eef2f9`, accent `#1f4fd6`. Dark theme: background `#070d1f`, accent `#4d8dff`. Tipos: `#4d8dff #d6e4ff #1c3a9e #04070f`.
  - `[data-accent="red"]` overrides only `--accent*`, `--fluxo-blue` and `--tipos-1/3`.
  - `cssColorToRgb01(value: string): [number, number, number]` and `readToken(name: string, el?: Element): [number, number, number]` in `src/lib/color.ts`.
  - Fonts: `GeistSans` / `GeistMono` (geist package) and Anton via `next/font/local` as `--font-display`.

- [ ] **Step 1: Write the failing tests:**
  - `color.test.ts`: `cssColorToRgb01("#4d8dff")` ≈ `[0.302, 0.553, 1]`, and `cssColorToRgb01("rgb(7 13 31)")` ≈ `[0.027, 0.051, 0.122]`.
  - `contrast.test.ts`: parse `tokens.css`. In each of light, dark, dark+red: foreground on background ≥ 4.5, accent-contrast on accent ≥ 4.5, muted on background ≥ 4.5.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the tokens, `color.ts`, the theme provider (class strategy, default dark) and the toggle (button with `aria-label`, 44px).
- [ ] **Step 4:** Run. Expected: PASS. **Phase 0 stop:** screenshot `/pt` in light and dark.

## Phase 1 — Motion core and shell

### Task 4: Motion primitives

**Files:**

- Create: `src/motion/math.ts`, `src/motion/cover.ts`, `src/motion/title.ts`, `src/motion/pin.ts`, `src/motion/smooth.ts`, `src/motion/reduced.ts`
- Test: `tests/unit/math.test.ts`, `tests/unit/cover.test.ts`, `tests/unit/title.test.ts`

**Interfaces:**

- Produces:
  - `clamp(v,min,max)`, `lerp(a,b,t)`, `range(s,a,b): number` (0..1 clamped progress of `s` between a and b), `inOutCubic(t)`, `monotone(points: [number,number][]): (x:number)=>number` (monotone cubic interpolation)
  - `coverPoint(media:{w:number;h:number}, box:{w:number;h:number}, fx:number, fy:number, focusX?:number): {x:number;y:number;scale:number}`: where a point (fx, fy, 0..1 of the media) lands under `object-fit: cover`
  - `class Title { constructor(el: HTMLElement); show(dir?: 1|-1): void; hide(dir?: 1|-1): void; readonly visible: boolean }`, built on GSAP tweens; a call interrupts the running tween and settles to the end state
  - `switcher(titles: Title[]): (index: number | null) => void`
  - `createPin(opts:{el:HTMLElement; screens:number; render:(s:number)=>void; smoothTouch?:boolean}): {kill():void; refresh():void}`: ScrollTrigger `pin:true`, `end: +=screens*innerHeight`, no scrub; `onUpdate → render(progress*screens)`; on touch, exponential smoothing at about 0.25 s through `gsap.ticker`
  - `startSmooth(): Lenis | null` (returns null when reduced), `stopSmooth()`, `prefersReduced(): boolean`

- [ ] **Step 1: Write the failing tests:**
  - `range(1.5,1,2)===0.5`, `range(0,1,2)===0`, `range(3,1,2)===1`
  - `monotone([[0,0],[1,10],[2,10]])` is non-decreasing on [0,2] and equals 10 at 1.5
  - `coverPoint({w:1600,h:900},{w:390,h:844},0.5,0.5)` returns `{x:195,y:422}`
  - `coverPoint({w:1600,h:900},{w:1536,h:702},0,0)` has `x≈0`, and y is negative or 0 (cropped top)
  - `title.test.ts` (jsdom env via `// @vitest-environment jsdom`): `show()` then `hide()` immediately, then `gsap.globalTimeline.progress(1)` leaves `visible===false` with opacity 0
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. `monotone` uses Fritsch–Carlson slopes.
- [ ] **Step 4:** Run. Expected: PASS.

### Task 5: Shell — header, menu, CTAs, dock, footer

**Files:**

- Create:
  - `src/components/ui/circular-navigation.tsx` and `src/components/ui/liquid-glass-dock.tsx` (verbatim from `docs/prompts/new-prompts.txt`)
  - `src/components/shell/{header.tsx,site-menu.tsx,ctas.tsx,cta-dock.tsx,footer.tsx,locale-toggle.tsx}`
  - `src/lib/ctas.ts`
- Test: `tests/unit/ctas.test.ts`

**Interfaces:**

- Consumes: `profile`, `Locale`, `Link`
- Produces:
  - `cvHref(locale: Locale): { href: string; fallback: boolean }`
  - `<CvButton source compact? className? />`, `<LinkedInButton/>`, `<InstagramButton/>`, `<CopyEmailButton/>`
  - `<SiteMenu items={{label,href}[]}/>` (Circular Navigation with lucide icons; anchors scroll through Lenis)
  - `<CtaDock watch={string[]}/>`: fixed bottom-right, `--lgd-icon:44px`, glyph-only icons in `--foreground`, hidden and `inert` while any watched id is on screen
  - `<SiteHeader/>`: logo, `<SiteMenu/>` trigger, locale and theme toggles

- [ ] **Step 1: Write the failing tests:** `cvHref("pt").href` equals `profile.cv.pt`; when `profile.cv.en` is falsy, `cvHref("en")` deep-equals `{href: profile.cv.pt, fallback: true}`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Copy the two ui files verbatim. Write the shell components. Copying the e-mail uses `navigator.clipboard` with a toast, and falls back to `mailto:` when it fails.
- [ ] **Step 4:** Run tests. Manual check: the dock sits bottom-right and is ≤ 240px wide; the menu opens and closes with Esc and returns focus. **Phase 1 stop:** screenshots of the menu open and of the dock.

## Phase 2 — Hero

### Task 6: Shader stage

**Files:**

- Create:
  - `src/lib/webgl-stage.ts` and `src/lib/shaders/{fluxo,tipos,nebulosa}.ts` (from `C:\dev\portfolio\src\lib\`, the allowed exception)
  - `src/components/stage/shader-stage.tsx`
- Test: `tests/unit/shader-stage.test.ts`

**Interfaces:**

- Consumes: `readToken`
- Produces:
  - `type ShaderKind = "fluxo" | "tipos" | "nebulosa"`
  - `<ShaderStage kind className? children?/>`: lazy-loads the shader, reads its colors from tokens on mount and on theme or accent change, pauses offscreen, and renders `data-fallback` with a token radial gradient when WebGL is missing
  - `supportsWebgl(): boolean`

- [ ] **Step 1: Write the failing test** (jsdom): with `HTMLCanvasElement.prototype.getContext` stubbed to return null, rendering `<ShaderStage kind="fluxo"/>` produces an element with `data-fallback="true"`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.

### Task 7: Kairo hero and agent swarm

**Files:**

- Create:
  - `src/components/hero/hero.tsx` and `src/components/hero/hero.css`
  - `src/components/hero/swarm.tsx`
  - `src/components/hero/engine/{enxame.js,barra.js,agentes.js,...}`: ported from `C:\dev\kairo-demo\src\motion`, with `dispensa()` removing the agents about 2.6 s after the end and setting the bar to `saiu`
  - `src/components/hero/boot.ts`
- Test: `tests/unit/boot.test.ts`

**Interfaces:**

- Consumes: `ShaderStage`, the CTAs, `profile`, `getProject` (for the three hero numbers: pdf-renamer metrics 0 and 1, sek metric 0)
- Produces:
  - `bootMode(pathname: string, search: string, reduced: boolean): "monta" | "pronto" | null`, which returns null outside `/`, `/pt`, `/en`
  - `<Hero locale/>` with every layer marked `data-camada`, plus `<Swarm labels/>`

- [ ] **Step 1: Write the failing tests:**
  - `bootMode("/pt","",false)==="monta"`
  - `bootMode("/pt","?pronto",false)==="pronto"`
  - `bootMode("/en","",true)==="pronto"`
  - `bootMode("/pt/about","",false)===null`
  - `bootMode("/pt","?prontoX",false)==="monta"` (word boundary)
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the layout from spec §4.1.1:
  - left column: hello / KEVIN. / role / tagline / CTAs / location
  - right glass card with the 3 numbers
  - status pill at the top
  - full-bleed Fluxo with a left scrim built from `--background` via `color-mix`
  - a 5 s safeguard that forces `pronto`
- [ ] **Step 4:** Run the tests. Manual check: the agents build the hero, then leave, and the bar fades out; `?pronto` opens already built. **Phase 2 stop:** screenshots of the build in the middle and at the end, on desktop and mobile.

## Phase 3 — The globe journey (main piece)

### Task 8: Journey state (pure)

**Files:**

- Create: `src/lib/journey.ts`
- Test: `tests/unit/journey.test.ts`

**Interfaces:**

- Produces:
  - `SCREENS = 9`
  - `type Chapter = "intro" | "sp" | "flight" | "malta" | "plans" | "outro"`
  - `journeyState(s: number): { chapter: Chapter; globe: { phi: number; theta: number; scale: number }; scene: "globe" | "sp" | "malta"; iris: number; arc: { spMalta: number; planned: number }; titleIndex: number | null }`
  - Constants: `SP = [-23.5505, -46.6333]`, `MALTA = [35.9187, 14.489]`, `SPAIN = [40.4168, -3.7038]` and `USA = [39.8283, -98.5795]`, both marked `TODO(kevin)`
  - Chapter ranges in screens:
    - intro 0–0.8
    - sp 0.8–3.4
    - flight 3.4–4.6
    - malta 4.6–6.8
    - plans 6.8–7.9
    - outro 7.9–9
  - SP titles (one each): `oase-apprentice`, `umc`, and the school (gallery `luterano`). Malta title: `ef-malta`.

- [ ] **Step 1: Write the failing tests:**
  - `journeyState(0).scene==="globe"`, and `journeyState(0).globe.scale` < `journeyState(0.8).globe.scale`
  - `journeyState(2).chapter==="sp"` and `.scene==="sp"`
  - `journeyState(4).arc.spMalta` is in (0,1), and it is monotone non-decreasing on [3.4, 4.6] sampled every 0.05
  - `journeyState(5).scene==="malta"`
  - `journeyState(7.5).arc.planned` > 0
  - `journeyState(8.9).globe.scale` < `journeyState(4).globe.scale`
  - purity: the same `s` gives a deep-equal result twice; `s` outside [0,9] is clamped
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement as piecewise curves using `range`, `inOutCubic` and `monotone`.
- [ ] **Step 4:** Run. Expected: PASS.

### Task 9: Journey section

**Files:**

- Create:
  - `src/components/ui/cobe-globe.tsx` and `src/components/ui/polaroid-line-carousel.tsx` (verbatim from `docs/prompts/prompts.txt`)
  - `src/components/journey/journey.tsx`, `src/components/journey/scene-sp.tsx`, `src/components/journey/scene-malta.tsx`, `src/components/journey/journey.css`
- Test: e2e check in Task 15. The logic is covered by Task 8.

**Interfaces:**

- Consumes: `journeyState`, `createPin`, `Title`/`switcher`, `coverPoint`, `readToken`, `gallery`, `timeline`, `pick`
- Produces: `<Journey locale labels/>`, a section with `id="journey"`

- [ ] **Step 1:** Build the static markup:
  - globe layer, SP scene (photos `luterano`, `umc`, `notebook`, each with a point and an SVG line), Malta scene (Polaroid Line with `malta`, `st-julians`, `malta-rotunda`, `malta-rua`, `malta-noite`, `malta-jornal`)
  - one `Title` element per chapter, with copy built from the timeline and messages (facts only)
  - outro line + CTA to `#contact`
- [ ] **Step 2:** Wire `createPin({el, screens: SCREENS, render})`. `render(s)` applies the following, all from `journeyState(s)`:
  - globe phi, theta and scale
  - iris `clip-path: circle()` into the scenes
  - the arcs' `stroke-dashoffset`
  - the switcher index
- [ ] **Step 3:** Handle the reduced-motion branch: no pin, and the chapters are stacked sections showing a static globe frame.
- [ ] **Step 4:** Mobile: the scenes stack the photos vertically, and the globe stays centered at 90vw.
- [ ] **Step 5: Verify manually** at 1536 and 390 widths:
  - stop at s = 2, 4 and 5.5 and reverse: no clipped text, and the photos stay on their points after a resize
  - the console is clean
  - **Phase 3 stop:** a GIF of the full journey, plus screenshots of each chapter

## Phase 4 — Rest of the home

### Task 10: Projects section

**Files:**

- Create: `src/components/home/projects.tsx`

**Interfaces:**

- Consumes: `featuredProjects`, `otherProjects`, `pick`, `Link`
- Produces: `<HomeProjects locale/>` (`id="projects"`)
  - 3 large rows for the featured projects: poster, or a `TODO(kevin)` token panel for blood-bank; title, one-liner, first metric
  - 4 compact rows for the others
  - every row links to `/projects/[slug]`; the rows enter with Title-style reveals on their own clock

- [ ] **Step 1:** Implement. **Step 2:** Manual check: each project appears exactly once on the home (`document.querySelectorAll('[data-project]')` gives 7 unique slugs).

### Task 11: Daily skills (Esteira)

**Files:**

- Create: `src/components/ui/esteira.tsx` (verbatim) and `src/components/home/skills.tsx`

**Interfaces:**

- Consumes: `skills` (tier `"daily"`), the `public/skills/*.svg` logos (dark variants when present)
- Produces: `<HomeSkills locale/>` (`id="skills"`): two rows running in opposite directions with scroll, cards on `--surface` with a `--border` border

- [ ] **Step 1:** Implement. **Step 2:** Manual check: only daily-tier items, every logo resolves, and with reduced motion the rows are static.

### Task 12: Contact

**Files:**

- Create:
  - `src/components/ui/mercurio.tsx` and `src/components/ui/ai-prompt-box.tsx` (verbatim)
  - `src/components/home/contact.tsx`
  - `src/lib/contact.ts` (server action) and `src/lib/contact-schema.ts`
- Test: `tests/unit/contact.test.ts`

**Interfaces:**

- Consumes: `ShaderStage kind="nebulosa"`, the CTAs, `profile.email`
- Produces:
  - `contactSchema = z.object({ name: z.string().trim().min(1).max(100), email: z.email(), message: z.string().trim().min(10).max(4000), website: z.string().max(0) })`, where `website` is a honeypot
  - `sendContact(input: unknown, deps?: { apiKey?: string; to?: string; send?: (m) => Promise<{error?: unknown}> }): Promise<{ ok: true } | { ok: false; reason: "invalid" | "unconfigured" | "failed"; mailto: string }>`
  - `<Contact locale/>` (`id="contact"`): big e-mail, CTAs, Mercúrio as the primary CTA (copy e-mail), and the AI Prompt Box as the message field in the site palette, with name and e-mail inputs above it

- [ ] **Step 1: Write the failing tests:**
  - an empty message gives `{ok:false, reason:"invalid"}`
  - a filled honeypot gives `"invalid"`
  - valid input without `apiKey` gives `reason:"unconfigured"`, and `mailto` starts with `mailto:` and contains the encoded message
  - `send` rejecting gives `"failed"`
  - `send` resolving gives `{ok:true}`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. The production entry is a `"use server"` wrapper that reads `process.env.RESEND_API_KEY` / `CONTACT_TO_EMAIL`.
- [ ] **Step 4:** Run. Expected: PASS. Compose the home: Hero → Journey → Projects → Skills → Contact → Footer; the dock watches `hero` and `contact`. **Phase 4 stop:** full-home screenshots, desktop and mobile.

## Phase 5 — Project pages

### Task 13: `/[locale]/projects/[slug]`

**Files:**

- Create: `src/app/[locale]/projects/[slug]/page.tsx`, `src/components/project/{video.tsx,problem.tsx,metrics.tsx,case-study.tsx}`; MDX config in `next.config.ts` (`@next/mdx`)
- Test: `tests/unit/project-routes.test.ts`

**Interfaces:**

- Consumes: `projects`, `getProject`, the case-studies MDX (sek, pdf-renamer, blood-bank, in pt/en), `ShaderStage kind="tipos"`
- Produces:
  - `projectParams(): { slug: string }[]` (all 7 slugs), used by `generateStaticParams`; an unknown slug calls `notFound()`
  - page order:
    1. Tipos header with title
    2. presentation video (self-hosted `<video>` with poster, no autoplay with sound), or the problem first when there is no video
    3. the problem it solved
    4. what was built (MDX when present)
    5. metrics that count up on entry
    6. stack
    7. links (repo/demo, or a "private code" note when `privateCode`)
    8. previous/next project

- [ ] **Step 1: Write the failing test:** `projectParams().map(p=>p.slug).sort()` equals the sorted slugs of `projects`, and has length 7.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Relevo is not rendered yet (`TODO(kevin)`: real panel content).
- [ ] **Step 4:** Run. Expected: PASS. **Phase 5 stop:** screenshots of SEK and API de Controle Financeiro.

## Phase 6 — About

### Task 14: `/[locale]/about`

**Files:**

- Create:
  - verbatim `src/components/ui/{card-fan-carousel,holo-card,glass-folder,interactive-selector}.tsx`
  - `src/app/[locale]/about/page.tsx`
  - `src/components/about/{intro.tsx,photos.tsx,certificates.tsx,events.tsx,studying.tsx,all-skills.tsx,about.css}`
- Test: `tests/unit/about-content.test.ts`

**Interfaces:**

- Consumes: `about`, `gallery`, `timeline`, `skills`, `now`, `profile`
- Produces:
  - `certificateFolders(locale)` returns `[{label, art, tone?, files: {name, meta}[]}]`:
    - Idiomas: `cna-c1` "CNA · 2024", `ef-malta` "EF · Malta · 2025"; pale-blue streak art
    - Cursos: `dio-ai` "DIO · 09/2026", `alura` "Alura · 2026"; deep-blue marble art; tone dark
    - each file's href is `TODO(kevin)` until the PDFs arrive
  - `eventOptions(locale)`: gallery ids `gdg-cloud-sp` ("FIAP · 09/2026"), `soujava-oracle` ("SouJava · Oracle · 09/2026"), `claude-oracle`, `palestra-carreira-codigo`, `coffee-break`
  - Card Fan photos: `guitarra-luz`, `teclado`, `guitarra`, `instrumentos`, `volei`, `volei-jogo`, `aviao`, `adesivos`
  - Holo Card: name, role, location, and links from `profile`
  - the page holds, in order: intro + Holo Card → Card Fan → certificates → events → studying now (`now`) → all skills by tier

- [ ] **Step 1: Write the failing tests:**
  - `certificateFolders("pt").flatMap(f=>f.files).length===4`, and no folder includes `aws-cert`, `bootcamp-itau` or `bootcamp-santander`
  - `eventOptions("pt").map(e=>e.id)` equals the 5 ids above
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. The Interactive Selector gets a scoped override class: radius 20px, `--border` border, accent border when open, `max-width:none`, height 520px (600px on mobile).
- [ ] **Step 4:** Run. Expected: PASS. **Phase 6 stop:** screenshots of the About page.

## Phase 7 — Polish

### Task 15: E2E, accessibility, mobile, red accent, build

**Files:**

- Create: `playwright.config.ts` (baseURL `http://localhost:7778`), `tests/e2e/pages.spec.ts`

**Interfaces:**

- Consumes: everything

- [ ] **Step 1: Write the e2e tests:**
  - for `/pt`, `/en`, `/pt/about` and `/pt/projects/sek`: status 200, no console errors, an axe scan with no serious or critical violations
  - the CV, LinkedIn and copy-e-mail controls are visible on every page within one click (hero or dock or header)
  - with `reducedMotion: "reduce"`, `/pt` has no `.lenis` class and the journey chapters are all in the DOM, visible
- [ ] **Step 2:** Run `npm run test:e2e`. Fix the failures.
- [ ] **Step 3:** Manual pass:
  - 390×844 on every page
  - `document.documentElement.dataset.accent="red"` screenshots of the home
  - the DevTools performance panel during the journey scroll shows no long frames > 50 ms on desktop
- [ ] **Step 4: Verify** with `npm run check && npm run build`. Expected: all green. **Phase 7 stop:** final screenshots, desktop and mobile, blue and red.
