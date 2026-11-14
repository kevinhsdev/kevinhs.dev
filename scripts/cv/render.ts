/**
 * The CV, written from the site's own content (src/content and the certificates on About), so
 * the two never disagree. Change a fact there and `npm run cv` rebuilds every CV; a test fails
 * while a committed CV is out of date.
 *
 * Only the CV's own chrome (section names, date words) lives here.
 */
import pt from "../../messages/pt.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { certificateFolders } from "@/components/about/data";
import { featuredProjects, pick, profile, skills, timeline, type TimelineItem } from "@/content";

export const CV_LOCALES = ["pt", "en", "es"] as const;
export type CvLocale = (typeof CV_LOCALES)[number];

const MESSAGES = { pt, en, es };

const CHROME = {
  pt: {
    lang: "pt-BR",
    title: "Currículo",
    summary: "Resumo",
    experience: "Experiência",
    education: "Formação",
    projects: "Projetos",
    skills: "Competências",
    certificates: "Certificações",
    ongoing: "Em andamento",
    events: "Eventos",
    languages: "Idiomas",
    present: "atual",
    expected: "previsto",
    team: (n: number) => `equipe de ${n}`,
    courses: (n: number) => `${n} cursos`,
    months: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
    month: (m: string, y: string) => `${m}/${y}`,
  },
  en: {
    lang: "en",
    title: "Résumé",
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    certificates: "Certifications",
    ongoing: "In progress",
    events: "Events",
    languages: "Languages",
    present: "present",
    expected: "expected",
    team: (n: number) => `team of ${n}`,
    courses: (n: number) => `${n} courses`,
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    month: (m: string, y: string) => `${m} ${y}`,
  },
  es: {
    lang: "es",
    title: "Currículum",
    summary: "Resumen",
    experience: "Experiencia",
    education: "Formación",
    projects: "Proyectos",
    skills: "Competencias",
    certificates: "Certificaciones",
    ongoing: "En curso",
    events: "Eventos",
    languages: "Idiomas",
    present: "actual",
    expected: "previsto",
    team: (n: number) => `equipo de ${n}`,
    courses: (n: number) => `${n} cursos`,
    months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    month: (m: string, y: string) => `${m}/${y}`,
  },
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export function renderCv(locale: CvLocale): string {
  const c = CHROME[locale];
  const m = MESSAGES[locale];
  const t = (v: Parameters<typeof pick>[0]) => esc(pick(v, locale));

  const date = (d: string) => {
    const [y, mo] = d.split("-");
    return mo ? c.month(c.months[Number(mo) - 1]!, y!) : y!;
  };
  const span = (item: TimelineItem) => {
    if (!item.start) return "";
    const end = item.end === "present" ? c.present : item.end ? date(item.end) : null;
    const range = end ? `${date(item.start)} – ${end}` : date(item.start);
    return item.endIsExpected ? `${range} (${c.expected})` : range;
  };
  const section = (title: string, body: string, cls = "") =>
    `<section>\n  <h2>${title}</h2>\n  <div${cls ? ` class="${cls}"` : ""}>\n${body}\n  </div>\n</section>`;

  const work = timeline.filter((i) => i.kind === "work");
  const degrees = timeline.filter((i) => i.kind === "study" && i.endIsExpected);
  const ongoing = timeline.filter((i) => i.inProgress);
  const events = timeline.filter((i) => i.kind === "event");

  const experience = work
    .map(
      (i) => `    <article>
      <div class="row"><h3>${t(i.title)}</h3><time>${span(i)}</time></div>
      <p class="muted">${esc(i.org)}${i.location ? ` · ${t(i.location)}` : ""}</p>
      <ul>
${i.highlights.map((h) => `        <li>${t(h)}</li>`).join("\n")}
      </ul>
    </article>`,
    )
    .join("\n");

  const education = degrees
    .map(
      (i) => `    <article>
      <div class="row"><h3>${esc(i.org)}</h3><time>${span(i)}</time></div>
      <p class="muted">${t(i.title)}</p>
${i.highlights.map((h) => `      <p>${t(h)}</p>`).join("\n")}
    </article>`,
    )
    .join("\n");

  const projects = featuredProjects
    .map((p) => {
      const tags = [m.projects.status[p.status], p.teamSize ? c.team(p.teamSize) : null]
        .filter(Boolean)
        .join(" · ");
      const metrics = p.metrics.length
        ? `\n      <p>${p.metrics.map((x) => `<b>${esc(x.value)}</b> ${t(x.label)}`).join(" · ")}</p>`
        : "";
      // X-Y-Z: what it is, what it achieved (impact + numbers), how (stack)
      // the numbers already say it when there are metrics
      const impact = p.impact && !p.metrics.length ? ` ${t(p.impact)}.` : "";
      return `    <article>
      <p><b>${t(p.title)}</b> <span class="muted">· ${esc(tags)}</span></p>
      <p>${t(p.tagline)}.${impact}</p>${metrics}
      <p class="muted">${p.stack.map(esc).join(" · ")}</p>
    </article>`;
    })
    .join("\n");

  const skillLines = skills
    .map(
      (g) =>
        `    <p><b>${esc(m.skills.tiers[g.tier])}:</b> ${g.items.map((s) => t(s)).join(", ")}</p>`,
    )
    .join("\n");

  // a folder of many courses (Alura) is one line: count, total hours, then the names
  const hoursOf = (meta: string) => Number(/(\d+)h\b/.exec(meta)?.[1] ?? 0);
  const certLine = (x: { name: string; meta: string }) =>
    `    <p>${esc(x.name)} <span class="muted">· ${esc(x.meta)}</span></p>`;
  const certLines = certificateFolders(locale)
    .filter((f) => f.key !== "events")
    .map((f) => {
      if (f.files.length <= 2) return f.files.map(certLine).join("\n");
      const hours = f.files.reduce((sum, x) => sum + hoursOf(x.meta), 0);
      const label = (m.about as Record<string, string>)[f.key] ?? f.key;
      const names = f.files.map((x) => esc(x.name)).join("; ");
      return `    <p><b>${esc(label)}</b> <span class="muted">· ${c.courses(f.files.length)} · ${hours}h</span>: ${names}</p>`;
    })
    .join("\n");

  const ongoingLines = ongoing
    .map((i) => `    <p>${t(i.title)} <span class="muted">· ${esc(i.org)}</span></p>`)
    .join("\n");

  const eventLines = events
    .map((i) => `    <p>${t(i.title)} <span class="muted">· ${span(i)}</span></p>`)
    .join("\n");

  const languages = profile.languages.map((l) => `${t(l.name)}: ${t(l.level)}`).join(" · ");

  return `<!doctype html>
<!-- Generated by scripts/cv/build.mjs from the site's content. Do not edit: change src/content. -->
<html lang="${c.lang}">
<head>
  <meta charset="utf-8" />
  <title>${esc(profile.fullName)} — ${c.title}</title>
  <link rel="stylesheet" href="cv.css" />
</head>
<body>
<header>
  <h1>${esc(profile.fullName)}</h1>
  <p class="role">${t(profile.role)}</p>
  <hr />
  <p class="contacts">
    <a href="mailto:${profile.email}">${profile.email}</a>
    <a href="${profile.links.site}">${bare(profile.links.site)}</a>
    <a href="${profile.links.linkedin}">${bare(profile.links.linkedin)}</a>
    <a href="${profile.links.github}">${bare(profile.links.github)}</a>
    <span class="muted">${t(profile.location)}</span>
  </p>
</header>
${section(c.summary, `    <p>${t(profile.aboutShort)}</p>\n    <p>${esc(m.meta.description)}</p>`)}
${section(c.experience, experience)}
${section(c.education, education)}
${section(c.projects, projects)}
${section(c.skills, skillLines, "list")}
${section(c.certificates, certLines, "list")}
${section(c.ongoing, ongoingLines, "list")}
${section(c.events, eventLines, "list")}
${section(c.languages, `    <p>${languages}</p>`)}
</body>
</html>
`;
}
