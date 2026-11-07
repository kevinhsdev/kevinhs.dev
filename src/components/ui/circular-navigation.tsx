// @ts-nocheck -- ProfitizeBuild file kept verbatim; it predates this repo's noUncheckedIndexedAccess.
"use client"

import * as React from "react"

/**
 * Circular Navigation — um menu que abre por cima da página inteira: um círculo de vidro no centro, com os itens em
 * volta (ícone e nome) e o botão de fechar no meio.
 *
 * - Abre crescendo do centro em 0,4 s, com o fundo escurecendo e desfocando a página; fecha encolhendo, do mesmo jeito.
 * - Fecha pelo X, pelo Esc, por um clique fora do círculo e pela escolha de um item.
 * - Os itens ficam espaçados por igual no círculo, o primeiro à direita, em sentido horário. No hover e no foco o item
 *   fica branco; o da página atual (activeHref) fica marcado.
 * - Ao abrir, o foco vai para o X e o Tab anda só dentro do menu; ao fechar, ele volta para onde estava.
 * - O círculo tem 420 px e nunca passa da tela menos 16 px de cada lado; os itens acompanham. A variável --cnav-size
 *   troca o tamanho.
 *
 * O menu é position: fixed, então fica fora de qualquer pai com transform, filter ou perspective (eles prenderiam o
 * fixed dentro deles). Os itens são links comuns; linkAs troca pelo componente de link do projeto (o Link do next/link).
 * Os ícones são os do Lucide (licença ISC), desenhados aqui, e vão pelo nome; um componente de ícone seu (do
 * lucide-react, por exemplo) também serve.
 *
 * Autocontido: o React é o único import. Sem Tailwind, sem bibliotecas, sem arquivo CSS.
 */

export type CircularNavIconName = keyof typeof ICONS

export type CircularNavIconProps = {
  className?: string
  strokeWidth?: number
  "aria-hidden"?: boolean
}

export interface NavItem {
  name: string
  /** O nome de um dos ícones daqui ou um componente de ícone seu, que recebe className e strokeWidth. */
  icon: CircularNavIconName | React.ComponentType<CircularNavIconProps>
  href: string
}

export interface CircularNavigationProps {
  navItems: NavItem[]
  isOpen: boolean
  /** Abre e fecha. Com o menu aberto, o X, o Esc, o clique fora e a escolha de um item chamam esta função. */
  toggleMenu: () => void
  /** O href da página atual: o item dela fica marcado (aria-current="page"). */
  activeHref?: string
  /** A escolha de um item, antes de o menu fechar. Com event.preventDefault() o link não navega, e o router do projeto
   *  entra aqui: router.push(item.href) no Next.js, navigate(item.href) no react-router. */
  onNavigate?: (item: NavItem, event: React.MouseEvent<HTMLAnchorElement>) => void
  /** O elemento dos itens: "a" (o padrão) ou o componente de link do projeto, que recebe href, className, aria-current,
   *  onClick e children. O Link do next/link serve direto. */
  linkAs?: React.ElementType
  /** O nome do menu para o leitor de tela. */
  label?: string
  /** O nome do botão de fechar para o leitor de tela. */
  closeLabel?: string
  className?: string
}

// O React 19 sobe uma <style> com href e precedence para o <head>, uma vez só para a página toda. O React 18 não conhece
// isso: lá ela vai junto do menu, escondida e com o CSS cru, porque como filho de texto o SSR do 18 escaparia as aspas.
const HOISTS_STYLES = Number(React.version.split(".")[0]) >= 19

function CircularNavStyles() {
  if (HOISTS_STYLES) {
    const hoist = { href: "circular-navigation", precedence: "default" } as React.StyleHTMLAttributes<HTMLStyleElement>
    return <style {...hoist}>{CNAV_CSS}</style>
  }
  return <style hidden dangerouslySetInnerHTML={{ __html: CNAV_CSS }} />
}

/** Um ícone do Lucide pelo nome, em 24 × 24 e no traço de 2. */
export function CircularNavIcon({
  name,
  strokeWidth = 2,
  className,
}: {
  name: CircularNavIconName
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  )
}

function ItemIcon({ icon }: { icon: NavItem["icon"] }) {
  if (typeof icon === "string") return <CircularNavIcon name={icon} className="cnav-icon" />
  const Icon = icon
  return <Icon className="cnav-icon" strokeWidth={2} aria-hidden />
}

// O lugar de cada item, em % do círculo: no raio de 150 px de um círculo de 420, a partir da direita, em sentido horário.
// Arredondado, para o servidor e o navegador escreverem o mesmo número.
function itemPosition(index: number, count: number): React.CSSProperties {
  const angle = (2 * Math.PI * index) / count
  const radius = (150 / 420) * 100
  return {
    left: (50 + radius * Math.cos(angle)).toFixed(3) + "%",
    top: (50 + radius * Math.sin(angle)).toFixed(3) + "%",
  }
}

type Phase = "closed" | "opening" | "open" | "closing"

const FOCUSABLE = "a[href], button:not([disabled])"

export default function CircularNavigation({
  navItems,
  isOpen,
  toggleMenu,
  activeHref,
  onNavigate,
  linkAs: Link = "a",
  label = "Navegação",
  closeLabel = "Fechar navegação",
  className,
}: CircularNavigationProps) {
  // aberto já na primeira tela: aparece pronto, sem animação e sem puxar o foco
  const [phase, setPhase] = React.useState<Phase>(isOpen ? "open" : "closed")
  const [wasOpen, setWasOpen] = React.useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    setPhase(isOpen ? "opening" : "closing")
  }

  const overlay = React.useRef<HTMLDivElement>(null)
  const closeButton = React.useRef<HTMLButtonElement>(null)
  const returnFocus = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const root = overlay.current
    const active = document.activeElement as HTMLElement | null
    if (phase === "opening") {
      if (active && active !== document.body && !root?.contains(active)) returnFocus.current = active
      closeButton.current?.focus({ preventScroll: true })
    }
    if (phase === "closing" && (root?.contains(active) || active === document.body)) {
      returnFocus.current?.focus({ preventScroll: true })
      returnFocus.current = null
    }
    // a animação avisa quando termina (onAnimationEnd); isto é a garantia, se um CSS de fora desligar as animações
    if (phase !== "opening" && phase !== "closing") return
    const done = window.setTimeout(() => setPhase(p => (p === "opening" ? "open" : p === "closing" ? "closed" : p)), 1000)
    return () => window.clearTimeout(done)
  }, [phase])

  const onAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    setPhase(p => (p === "opening" ? "open" : p === "closing" ? "closed" : p))
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      // preventDefault: um modal ou uma gaveta por baixo não fecha junto
      event.preventDefault()
      if (isOpen) toggleMenu()
      return
    }
    if (event.key !== "Tab" || !overlay.current) return
    const focusable = Array.from(overlay.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.tabIndex >= 0)
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === overlay.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (phase === "closed") return <CircularNavStyles />

  const motion = phase === "opening" ? " is-opening" : phase === "closing" ? " is-closing" : ""
  return (
    <>
      <CircularNavStyles />
      <div
        ref={overlay}
        className={"cnav-overlay" + motion + (className ? " " + className : "")}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={event => {
          if (event.target === event.currentTarget && isOpen) toggleMenu()
        }}
        onKeyDown={onKeyDown}
      >
        <div className="cnav-circle" onAnimationEnd={onAnimationEnd}>
          <button
            ref={closeButton}
            type="button"
            className="cnav-close"
            onClick={() => {
              if (isOpen) toggleMenu()
            }}
            aria-label={closeLabel}
          >
            <CircularNavIcon name="x" className="cnav-icon" />
          </button>

          <ul className="cnav-list">
            {navItems.map((item, index) => (
              <li key={item.href + item.name} className="cnav-item" style={itemPosition(index, navItems.length)}>
                <Link
                  href={item.href}
                  className="cnav-link"
                  aria-current={item.href === activeHref ? "page" : undefined}
                  onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                    onNavigate?.(item, event)
                    if (isOpen) toggleMenu()
                  }}
                >
                  <ItemIcon icon={item.icon} />
                  <span className="cnav-label">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

// Lucide (lucide.dev), licença ISC: os mesmos desenhos, em 24 × 24
const ICONS = {
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  trophy:
    '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
  "file-text":
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  settings:
    '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
}

const CNAV_CSS = `
/* o fundo: a página inteira, escurecida e desfocada */
.cnav-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 16px;
  background: rgba(0, 0, 0, .8);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  outline: none;
  /* nada de texto herdado da página: o menu fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: center;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}
.cnav-overlay *, .cnav-overlay *::before, .cnav-overlay *::after { box-sizing: border-box; }

/* o círculo de vidro: 420 px, nunca maior que a tela menos o respiro */
.cnav-circle {
  position: relative;
  flex: none;
  width: min(var(--cnav-size, 420px), 100%, calc(100dvh - 32px));
  aspect-ratio: 1;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 50%;
  background: rgba(255, 255, 255, .05);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .5), inset -1px -1px 1px rgba(255, 255, 255, .3);
}

.cnav-icon { display: block; flex: none; width: 24px; height: 24px; }

/* o X, branco, no centro */
.cnav-close {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #fff;
  color: #000;
  font: inherit;
  cursor: pointer;
  translate: -50% -50%;
  -webkit-appearance: none;
  appearance: none;
  transition: scale .2s cubic-bezier(.4, 0, .2, 1);
}
.cnav-close:active { scale: .94; }
.cnav-close:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* os itens em volta: cada um centrado no seu ponto do círculo */
.cnav-list { position: absolute; inset: 0; margin: 0; padding: 0; list-style: none; }
.cnav-item { position: absolute; margin: 0; padding: 0; translate: -50% -50%; }
.cnav-item::marker { content: none; }
.cnav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  color: #fff;
  text-decoration: none;
  outline: none;
  transition: background-color .2s cubic-bezier(.4, 0, .2, 1), color .2s cubic-bezier(.4, 0, .2, 1);
}
.cnav-link .cnav-icon { margin-bottom: 4px; }
.cnav-label {
  display: block;
  max-width: 72px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;
}
/* a página atual */
.cnav-link[aria-current="page"] { background: rgba(255, 255, 255, .12); }
/* o hover (só com mouse: no toque ele ficaria preso depois do toque) e o foco do teclado */
@media (hover: hover) {
  .cnav-link:hover { background: #fff; color: #000; }
}
.cnav-link:focus-visible { background: #fff; color: #000; box-shadow: 0 0 0 2px rgba(0, 0, 0, .8), 0 0 0 4px #fff; }

/* abrir e fechar: o círculo cresce do centro e o fundo acende, e o contrário */
@keyframes cnav-grow { from { opacity: 0; scale: 0; } to { opacity: 1; scale: 1; } }
@keyframes cnav-shrink { from { opacity: 1; scale: 1; } to { opacity: 0; scale: 0; } }
@keyframes cnav-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cnav-fade-out { from { opacity: 1; } to { opacity: 0; } }
.cnav-overlay.is-opening { animation: cnav-fade-in .4s cubic-bezier(.42, 0, .58, 1) both; }
.cnav-overlay.is-closing { animation: cnav-fade-out .4s cubic-bezier(.42, 0, .58, 1) both; pointer-events: none; }
.cnav-overlay.is-opening .cnav-circle { animation: cnav-grow .4s cubic-bezier(.42, 0, .58, 1) both; }
.cnav-overlay.is-closing .cnav-circle { animation: cnav-shrink .4s cubic-bezier(.42, 0, .58, 1) both; }

@media (prefers-reduced-motion: reduce) {
  .cnav-overlay, .cnav-overlay * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`
