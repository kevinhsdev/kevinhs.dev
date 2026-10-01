import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Lightweight HTML mockups of the school systems, drawn with design tokens so
 * they follow the active version and theme. All data is fictional: real
 * screenshots would expose student data (LGPD). Replace with demo-mode
 * screenshots when available.
 */

type MockupProps = { label: string; demoNote: string; className?: string };

function Frame({
  title,
  badge,
  demoNote,
  label,
  className,
  children,
}: MockupProps & { title: string; badge?: string; children: ReactNode }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border border-border bg-background text-[10px] leading-tight select-none",
        className,
      )}
    >
      <div aria-hidden className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="flex gap-1">
          <i className="size-2 rounded-full bg-border" />
          <i className="size-2 rounded-full bg-border" />
          <i className="size-2 rounded-full bg-border" />
        </span>
        <span className="truncate font-mono text-muted">{title}</span>
        {badge && (
          <span className="ml-auto rounded-full border border-border px-1.5 py-px font-mono text-positive">
            {badge}
          </span>
        )}
      </div>
      <div aria-hidden className="flex min-h-0 flex-1 pb-6">
        {children}
      </div>
      <p
        aria-hidden
        className="absolute right-2 bottom-2 rounded bg-surface/90 px-1.5 py-0.5 font-mono text-[9px] text-muted"
      >
        {demoNote}
      </p>
    </div>
  );
}

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-border/70">
      <span
        className={cn("block h-full rounded-full bg-accent", className)}
        style={{ width: `${value}%` }}
      />
    </span>
  );
}

export function SecretariaMockup(props: MockupProps) {
  const classes = [
    ["1º A", 92],
    ["3º B", 78],
    ["5º A", 96],
    ["8º A", 64],
    ["1ª EM", 71],
  ] as const;
  return (
    <Frame {...props} title="SEK · v5.8" badge="offline ✓">
      <div className="flex w-9 flex-col items-center gap-2 border-r border-border py-3">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={cn("size-3.5 rounded", i === 1 ? "bg-accent" : "bg-border")} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-foreground">Rematrícula 2027</span>
          <span className="font-mono text-muted">Placar</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["312", "Confirmadas"],
            ["41", "Pendências"],
            ["18", "Contratos"],
          ].map(([value, text]) => (
            <div key={text} className="rounded-md border border-border bg-surface p-2">
              <div className="text-[13px] font-semibold text-foreground tabular-nums">{value}</div>
              <div className="text-muted">{text}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {classes.map(([name, value]) => (
            <div key={name} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-2">
              <span className="font-mono text-muted">{name}</span>
              <Bar value={value} />
              <span className="text-right text-muted tabular-nums">{value}%</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Tarefas de hoje · 4", "Autorizações de saída · 2", "Boletos a conferir · 7"].map(
            (task) => (
              <span key={task} className="rounded-full border border-border px-2 py-0.5 text-muted">
                {task}
              </span>
            ),
          )}
        </div>
      </div>
    </Frame>
  );
}

export function PdfRenamerMockup(props: MockupProps) {
  const rows = [
    ["scan_0412.pdf", "Historico_Escolar_5A.pdf", "ok"],
    ["scan_0413.pdf", "Declaracao_Matricula_5A.pdf", "ok"],
    ["scan_0414.pdf", "RG_Responsavel_5A.pdf", "ok"],
    ["scan_0415.pdf", "Historico_Escolar_5A.pdf", "dup"],
    ["scan_0416.pdf", "…", "run"],
  ] as const;
  return (
    <Frame {...props} title="PDF Renamer v2" badge="18 / 40">
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <Bar value={45} />
        <div className="flex flex-col gap-1">
          {rows.map(([from, to, state], i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[1fr_auto_1.4fr_auto] items-center gap-2 rounded-md border border-border px-2 py-1.5",
                state === "run" && "bg-surface",
              )}
            >
              <span className="truncate font-mono text-muted">{from}</span>
              <span className="text-muted">→</span>
              <span className="truncate font-mono text-foreground">{to}</span>
              <span
                className={cn(
                  "rounded px-1 font-mono",
                  state === "ok" && "text-positive",
                  state === "dup" && "text-danger",
                  state === "run" && "text-accent",
                )}
              >
                {state === "ok" ? "✓" : state === "dup" ? "dup" : "OCR"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden w-[34%] flex-col gap-1.5 border-l border-border bg-surface p-3 sm:flex">
        <span className="h-2 w-3/4 rounded bg-border" />
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className="h-1.5 rounded bg-border/60"
            style={{ width: `${90 - i * 7}%` }}
          />
        ))}
        <span className="mt-2 self-start rounded border border-accent px-1 font-mono text-accent">
          Histórico escolar
        </span>
      </div>
    </Frame>
  );
}

export function BloodBankMockup(props: MockupProps) {
  const stock = [
    ["A+", 82],
    ["A−", 34],
    ["B+", 58],
    ["B−", 21],
    ["AB+", 47],
    ["AB−", 15],
    ["O+", 90],
    ["O−", 28],
  ] as const;
  return (
    <Frame {...props} title="Hemocentro · Estoque">
      <div className="grid min-w-0 flex-1 grid-cols-4 gap-2 p-3">
        {stock.map(([type, level]) => (
          <div
            key={type}
            className="flex flex-col justify-between gap-2 rounded-md border border-border bg-surface p-2"
          >
            <span className="text-[12px] font-semibold text-foreground">{type}</span>
            <div className="relative h-10 overflow-hidden rounded bg-border/70">
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0",
                  level < 30 ? "bg-danger" : "bg-accent",
                )}
                style={{ height: `${level}%` }}
              />
            </div>
            <span className="text-muted tabular-nums">{level}%</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export const mockups = {
  sek: SecretariaMockup,
  "pdf-renamer": PdfRenamerMockup,
  "blood-bank": BloodBankMockup,
} as const;

export function hasMockup(slug: string): slug is keyof typeof mockups {
  return slug in mockups;
}
