"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

/*
 * The case studies' hands-on bits, used straight from the MDX: a before/after
 * switch, "what would you do?" decisions, and one small playground per
 * project that runs a simplified version of the real idea in the browser.
 * The prose comes from the MDX props; UI labels from `caseStudy.demo`.
 */

const card = "my-10 rounded-3xl border border-border bg-surface p-5 sm:p-8";
const kicker = "font-mono text-xs tracking-widest text-accent uppercase";
const chip =
  "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-150";

type Flow = { label: string; time: string; steps: string[] };

/** The same job, before and after the project: flip between the two. */
export function BeforeAfter({ before, after }: { before: Flow; after: Flow }) {
  const [showAfter, setShowAfter] = useState(false);
  const flow = showAfter ? after : before;
  return (
    <figure className={card}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          className="inline-flex rounded-full border border-border bg-background p-1"
        >
          {[before, after].map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={showAfter === (index === 1)}
              onClick={() => setShowAfter(index === 1)}
              className={cn(
                "min-h-10 rounded-full px-5 text-sm font-semibold transition-colors duration-150",
                showAfter === (index === 1)
                  ? "bg-accent text-accent-contrast"
                  : "text-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p
          className={cn(
            "font-display text-4xl sm:text-5xl",
            showAfter ? "text-positive" : "text-danger",
          )}
        >
          {flow.time}
        </p>
      </div>
      <ol key={flow.label} className="cs-steps mt-6 flex flex-col gap-2" aria-live="polite">
        {flow.steps.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 rounded-2xl bg-background p-3 leading-snug"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs",
                showAfter ? "bg-positive/15 text-positive" : "bg-danger/10 text-danger",
              )}
            >
              {showAfter ? <Check className="size-4" /> : index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

type Option = { label: string; note: string };

/**
 * A real decision from the project as a quick question: the reader picks,
 * then sees what Kevin picked and why, with the trade-off of every option.
 */
export function Decision({
  question,
  options,
  pick,
  why,
}: {
  question: string;
  options: Option[];
  pick: number;
  why: string;
}) {
  const t = useTranslations("caseStudy.demo");
  const [answer, setAnswer] = useState<number | null>(null);
  const done = answer !== null;
  return (
    <fieldset className={cn(card, "cs-decision")}>
      <legend className="sr-only">{question}</legend>
      <p className={kicker}>{t("decide")}</p>
      <p aria-hidden className="mt-2 text-xl leading-snug font-semibold text-pretty sm:text-2xl">
        {question}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {options.map((option, index) => {
          const isPick = index === pick;
          return (
            <button
              key={option.label}
              type="button"
              disabled={done}
              aria-pressed={answer === index}
              onClick={() => setAnswer(index)}
              className={cn(
                "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors duration-150",
                !done && "border-border bg-background hover:border-accent",
                done && isPick && "border-positive bg-positive/10",
                done && !isPick && "border-border bg-background opacity-80",
              )}
            >
              <span className="flex items-center gap-2 font-semibold">
                {done &&
                  (isPick ? (
                    <Check aria-hidden className="size-4 text-positive" />
                  ) : (
                    <X aria-hidden className="size-4 text-muted" />
                  ))}
                {option.label}
                {done && isPick && (
                  <span className="rounded-full bg-positive px-2 py-0.5 font-mono text-[10px] tracking-widest text-background uppercase">
                    {t("mine")}
                  </span>
                )}
                {answer === index && !isPick && (
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] tracking-widest text-muted uppercase">
                    {t("yours")}
                  </span>
                )}
              </span>
              {done && <span className="text-sm leading-relaxed text-muted">{option.note}</span>}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {done ? (
          <div className="mt-5 rounded-2xl border-l-4 border-accent bg-background p-4">
            <p className="font-semibold">
              {answer === pick ? t("same") : answer === -1 ? t("reveal") : t("different")}
            </p>
            <p className="mt-1 leading-relaxed text-muted">{why}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAnswer(-1)}
            className="mt-4 text-sm text-muted underline underline-offset-4 hover:text-foreground"
          >
            {t("skip")}
          </button>
        )}
      </div>
    </fieldset>
  );
}

/* ---------- PDF Renamer: the classifier, live ---------- */

/** Simplified example rules in the real format: [keyword, weight]. */
type DocType = "rg" | "historico" | "certidao" | "residencia" | "atestado";
const RULES: { id: DocType; kw: [string, number][] }[] = [
  {
    id: "rg",
    kw: [
      ["REGISTRO GERAL", 3],
      ["RG", 2],
      ["IDENTIDADE", 2],
      ["SSP", 1],
    ],
  },
  {
    id: "historico",
    kw: [
      ["HISTORICO ESCOLAR", 4],
      ["HISTORICO", 2],
      ["CARGA HORARIA", 1],
      ["APROVADO", 1],
    ],
  },
  {
    id: "certidao",
    kw: [
      ["CERTIDAO DE NASCIMENTO", 4],
      ["NASCIMENTO", 2],
      ["CARTORIO", 2],
      ["REGISTRO CIVIL", 2],
    ],
  },
  {
    id: "residencia",
    kw: [
      ["COMPROVANTE", 2],
      ["RESIDENCIA", 2],
      ["ENDERECO", 1],
      ["CEP", 1],
      ["FATURA", 1],
    ],
  },
  {
    id: "atestado",
    kw: [
      ["ATESTADO", 3],
      ["MEDICO", 2],
      ["CRM", 2],
      ["CID", 1],
    ],
  },
];
const THRESHOLD = 3;
const SAMPLES: Record<"rg" | "historico" | "atestado" | "vago", string> = {
  rg: "REPUBLICA FEDERATIVA DO BRASIL - CARTEIRA DE IDENTIDADE - REGISTRO GERAL 12.345.678-9 SSP/SP",
  historico:
    "HISTÓRICO ESCOLAR - Ensino Fundamental. Carga horária anual: 800h. Situação: APROVADO",
  atestado: "ATESTADO MÉDICO: atesto que o aluno esteve em consulta. Dr. Fulano, CRM 000000",
  vago: "Segue em anexo o documento solicitado pela secretaria.",
};

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

function matches(text: string, kw: string) {
  // short terms need a whole word, so "RG" doesn't match inside another word
  return kw.length <= 3 ? new RegExp(`\\b${kw}\\b`).test(text) : text.includes(kw);
}

export function ClassifierDemo() {
  const t = useTranslations("caseStudy.demo.classifier");
  const [text, setText] = useState(SAMPLES.rg);
  const clean = normalize(text);
  const scores = RULES.map((rule) => ({
    id: rule.id,
    hits: rule.kw.filter(([kw]) => matches(clean, kw)),
  })).map((r) => ({ ...r, score: r.hits.reduce((sum, [, w]) => sum + w, 0) }));
  const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
  const sure = best.score >= THRESHOLD;
  const top = Math.max(THRESHOLD + 2, ...scores.map((s) => s.score));

  return (
    <figure className={card}>
      <p className={kicker}>{t("title")}</p>
      <p className="mt-2 text-muted">{t("intro")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setText(SAMPLES[key])}
            className={cn(chip, "border-border hover:border-accent")}
          >
            {t(`samples.${key}`)}
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="sr-only">{t("input")}</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-border bg-background p-4 font-mono text-sm leading-relaxed focus:border-accent focus:outline-none"
        />
      </label>
      <ul className="mt-4 flex flex-col gap-2" aria-label={t("scores")}>
        {scores.map((s) => (
          <li
            key={s.id}
            className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr_2rem]"
          >
            <span className={cn("truncate", s === best && sure && "font-semibold text-foreground")}>
              {t(`types.${s.id}`)}
            </span>
            <span className="relative h-3 overflow-hidden rounded-full bg-background">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-[width] duration-300",
                  s === best && sure ? "bg-accent" : "bg-muted/40",
                )}
                style={{ width: `${(s.score / top) * 100}%` }}
              />
              <span
                aria-hidden
                className="absolute inset-y-0 w-px bg-foreground/50"
                style={{ left: `${(THRESHOLD / top) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono">{s.score}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[11px] tracking-widest text-muted uppercase">
        {t("threshold", { n: THRESHOLD })}
      </p>
      <div
        aria-live="polite"
        className={cn("mt-4 rounded-2xl p-4", sure ? "bg-positive/10" : "bg-danger/10")}
      >
        {sure ? (
          <>
            <p className="font-semibold">{t("suggest")}</p>
            <p className="mt-1 font-mono text-sm break-all">
              {`${t(`files.${best.id}`)}_2026.pdf`}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t("because")} {best.hits.map(([kw, w]) => `${kw} (+${w})`).join(", ")}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">{t("unsure")}</p>
            <p className="mt-1 text-sm text-muted">{t("unsureText")}</p>
          </>
        )}
      </div>
    </figure>
  );
}

/* ---------- SEK: two people editing the same record ---------- */

const FIELDS = ["phone", "group"] as const;
type Field = (typeof FIELDS)[number];
type StudentRecord = { [K in Field]: string };
type Pane = {
  name: string;
  /** the version and data this screen loaded */
  loaded: number;
  base: StudentRecord;
  draft: StudentRecord;
  message: { kind: "ok" | "merge" | "conflict"; text: string } | null;
};

const START: StudentRecord = { phone: "(11) 90000-0000", group: "7º A" };

export function ConflictDemo() {
  const t = useTranslations("caseStudy.demo.conflict");
  const [server, setServer] = useState({
    data: START,
    version: 1,
    changedAt: { phone: 1, group: 1 } as { [K in Field]: number },
    by: "",
  });
  const [panes, setPanes] = useState<Pane[]>([
    { name: "Ana", loaded: 1, base: START, draft: START, message: null },
    { name: t("you"), loaded: 1, base: START, draft: START, message: null },
  ]);

  function update(index: number, field: Field, value: string) {
    setPanes((all) =>
      all.map((p, i) =>
        i === index ? { ...p, draft: { ...p.draft, [field]: value }, message: null } : p,
      ),
    );
  }

  function save(index: number) {
    const pane = panes[index];
    if (!pane) return;
    // only the fields this person changed go to the server
    const mine = FIELDS.filter((f) => pane.draft[f] !== pane.base[f]);
    // someone else saved one of those same fields after this screen loaded: 409
    const clash = mine.find((f) => server.changedAt[f] > pane.loaded);
    if (clash) {
      const message = {
        kind: "conflict" as const,
        text: t("conflict", { name: server.by, field: t(`fields.${clash}`) }),
      };
      setPanes((all) => all.map((p, i) => (i === index ? { ...p, message } : p)));
      return;
    }
    const version = server.version + 1;
    const data = { ...server.data };
    const changedAt = { ...server.changedAt };
    for (const f of mine) {
      data[f] = pane.draft[f];
      changedAt[f] = version;
    }
    const fresh = pane.loaded === server.version;
    const message = {
      kind: fresh ? ("ok" as const) : ("merge" as const),
      text: fresh ? t("saved") : t("merged"),
    };
    setServer({ data, version, changedAt, by: pane.name });
    setPanes((all) =>
      all.map((p, i) =>
        i === index ? { ...p, loaded: version, base: data, draft: data, message } : p,
      ),
    );
  }

  function reload(index: number) {
    setPanes((all) =>
      all.map((p, i) =>
        i === index
          ? { ...p, loaded: server.version, base: server.data, draft: server.data, message: null }
          : p,
      ),
    );
  }

  function reset() {
    setServer({ data: START, version: 1, changedAt: { phone: 1, group: 1 }, by: "" });
    setPanes((all) =>
      all.map((p) => ({ ...p, loaded: 1, base: START, draft: START, message: null })),
    );
  }

  return (
    <figure className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={kicker}>{t("title")}</p>
          <p className="mt-2 text-muted">{t("intro")}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className={cn(chip, "border-border hover:border-accent")}
        >
          <RotateCcw aria-hidden className="size-4" />
          {t("reset")}
        </button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {panes.map((pane, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4"
          >
            <p className="flex items-center justify-between font-semibold">
              {t("screen", { name: pane.name })}
              <span className="font-mono text-xs text-muted">v{pane.loaded}</span>
            </p>
            {FIELDS.map((field) => (
              <label key={field} className="flex flex-col gap-1 text-sm">
                <span className="text-muted">{t(`fields.${field}`)}</span>
                <input
                  value={pane.draft[field]}
                  onChange={(event) => update(index, field, event.target.value)}
                  className="min-h-10 rounded-xl border border-border bg-surface px-3 focus:border-accent focus:outline-none"
                />
              </label>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => save(index)}
                className={cn(chip, "border-accent bg-accent text-accent-contrast")}
              >
                {t("save")}
              </button>
              {pane.message?.kind === "conflict" && (
                <button
                  type="button"
                  onClick={() => reload(index)}
                  className={cn(chip, "border-border hover:border-accent")}
                >
                  {t("reload")}
                </button>
              )}
            </div>
            <p
              aria-live="polite"
              className={cn(
                "min-h-[3em] text-sm leading-snug",
                pane.message?.kind === "conflict" && "text-danger",
                pane.message?.kind === "merge" && "text-link",
                pane.message?.kind === "ok" && "text-positive",
              )}
            >
              {pane.message && (pane.message.kind === "conflict" ? "409 · " : "200 · ")}
              {pane.message?.text}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs text-muted">
        {t("server", { version: server.version })}{" "}
        {FIELDS.map((f) => `${t(`fields.${f}`)}: ${server.data[f]}`).join(" · ")}
      </p>
    </figure>
  );
}

/* ---------- Blood bank: who can donate to whom, and the trigger keeping stock ---------- */

const TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;

/** ABO and Rh: the donor's antigens must all exist in the patient. */
function compatible(donor: string, patient: string) {
  const abo = (type: string) => type.replace(/[+-]/, "");
  const d = abo(donor);
  const p = abo(patient);
  const aboOk = d === "O" || d === p || p === "AB";
  const rhOk = donor.endsWith("-") || patient.endsWith("+");
  return aboOk && rhOk;
}

export function BloodMatch() {
  const t = useTranslations("caseStudy.demo.blood");
  const [donor, setDonor] = useState<string>("O-");
  const [patient, setPatient] = useState<string>("A+");
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(TYPES.map((type, i) => [type, 3 + ((i * 5) % 7)])),
  );
  const [flash, setFlash] = useState<string | null>(null);
  const ok = compatible(donor, patient);
  const max = Math.max(12, ...Object.values(stock));

  return (
    <figure className={card}>
      <p className={kicker}>{t("title")}</p>
      <p className="mt-2 text-muted">{t("intro")}</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="overflow-x-auto">
            <table className="cs-grid border-separate border-spacing-1 text-center font-mono text-xs">
              <caption className="pb-2 text-left text-sm text-muted">{t("grid")}</caption>
              <thead>
                <tr>
                  <th scope="col" className="p-1 text-[10px] text-muted">
                    {t("donorShort")}↓ {t("patientShort")}→
                  </th>
                  {TYPES.map((p) => (
                    <th key={p} scope="col" className={cn("p-1", p === patient && "text-accent")}>
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TYPES.map((d) => (
                  <tr key={d}>
                    <th scope="row" className={cn("p-1", d === donor && "text-accent")}>
                      {d}
                    </th>
                    {TYPES.map((p) => {
                      const yes = compatible(d, p);
                      const here = d === donor && p === patient;
                      return (
                        <td key={p} className="p-0">
                          <button
                            type="button"
                            onClick={() => {
                              setDonor(d);
                              setPatient(p);
                            }}
                            aria-label={`${d} → ${p}: ${yes ? t("yes") : t("no")}`}
                            aria-pressed={here}
                            className={cn(
                              "grid size-8 place-items-center rounded-md transition-transform duration-150",
                              yes ? "bg-positive/20 text-positive" : "bg-background text-muted/50",
                              (d === donor || p === patient) && "ring-1 ring-accent/50",
                              here && "scale-110 ring-2 ring-accent",
                            )}
                          >
                            {yes ? "✓" : "·"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            aria-live="polite"
            className={cn(
              "mt-3 rounded-2xl p-3 font-semibold",
              ok ? "bg-positive/10 text-positive" : "bg-danger/10 text-danger",
            )}
          >
            {ok ? t("can", { donor, patient }) : t("cannot", { donor, patient })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted">{t("stockIntro")}</p>
          <ul className="mt-3 flex flex-col gap-1.5" aria-label={t("stock")}>
            {TYPES.map((type) => (
              <li
                key={type}
                className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-2 font-mono text-xs"
              >
                <span>{type}</span>
                <span className="h-3 overflow-hidden rounded-full bg-background">
                  <span
                    className={cn(
                      "block h-full rounded-full transition-[width,background-color] duration-500",
                      flash === type ? "bg-accent" : "bg-danger/70",
                    )}
                    style={{ width: `${((stock[type] ?? 0) / max) * 100}%` }}
                  />
                </span>
                <span className="text-right">{stock[type]}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setStock((s) => ({ ...s, [donor]: (s[donor] ?? 0) + 1 }));
              setFlash(donor);
            }}
            className={cn(chip, "mt-4 border-accent bg-accent text-accent-contrast")}
          >
            {t("donate", { type: donor })}
          </button>
          <p
            aria-live="polite"
            className="mt-3 min-h-[3em] font-mono text-xs leading-relaxed text-muted"
          >
            {flash && t("trigger", { type: flash })}
          </p>
        </div>
      </div>
    </figure>
  );
}
