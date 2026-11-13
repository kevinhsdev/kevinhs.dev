// @ts-nocheck -- ProfitizeBuild file kept verbatim; it predates this repo's noUncheckedIndexedAccess.
"use client"

import * as React from "react"

/**
 * Interactive Selector — uma faixa de fotos lado a lado em que a escolhida abre e as outras viram tiras estreitas.
 *
 * Clicar numa tira (ou andar com as setas do teclado) abre a foto dela: a moldura fica branca, a foto se afasta de
 * 120% para 100%, uma sombra sobe do pé e o título e a descrição entram deslizando ao lado do ícone. As fotos entram
 * uma depois da outra, vindas da esquerda, quando a faixa aparece na tela.
 *
 * Numa largura de 560 px ou mais as fotos ficam lado a lado, em 400 px de altura; abaixo disso elas se empilham e a
 * escolhida abre para baixo. A medida é a largura da faixa, não a da tela (container query), então ela funciona numa
 * coluna estreita de um desktop também.
 *
 * Para o leitor de tela e o teclado é um grupo de opções (radiogroup): Tab entra na escolhida, as setas trocam, Home
 * e End vão para as pontas. Posição, margem e largura aceitam as classes do projeto (Tailwind, CSS Modules, CSS comum);
 * a faixa ocupa a largura do pai, até 900 px.
 *
 * Autocontido: o React é o único import. Sem Tailwind, sem bibliotecas, sem arquivo CSS.
 */

export type SelectorOption = {
  title: string
  description?: string
  /** A foto. Ela cobre a tira inteira (object-fit: cover), recortada no centro. */
  image: string
  /** Um ícone de 24 px, que pinta com currentColor (branco). */
  icon?: React.ReactNode
}

export type InteractiveSelectorProps = Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> & {
  options: SelectorOption[]
  /** A opção aberta no começo (sem index). */
  defaultIndex?: number
  /** A opção aberta, para controlar de fora; com ela, a troca chega por onIndexChange. */
  index?: number
  onIndexChange?: (index: number) => void
  /** O nome do grupo para o leitor de tela. */
  label?: string
}

// O React 19 sobe uma <style> com href e precedence para o <head>, uma vez só para todas as faixas (fora da faixa e do
// textContent dela). O React 18 não conhece isso: lá ela vai dentro da faixa, escondida e com o CSS cru, porque como
// filho de texto o SSR do 18 escaparia as aspas e quebraria os seletores.
const HOISTS_STYLES = Number(React.version.split(".")[0]) >= 19

function InteractiveSelectorStyles() {
  if (HOISTS_STYLES) {
    const hoist = { href: "interactive-selector", precedence: "default" } as React.StyleHTMLAttributes<HTMLStyleElement>
    return <style {...hoist}>{ISEL_CSS}</style>
  }
  return <style hidden dangerouslySetInnerHTML={{ __html: ISEL_CSS }} />
}

export const InteractiveSelector = React.forwardRef<HTMLDivElement, InteractiveSelectorProps>(function InteractiveSelector(
  { options, defaultIndex = 0, index, onIndexChange, label = "Opções", className, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultIndex)
  const [shown, setShown] = React.useState(false)
  const root = React.useRef<HTMLDivElement | null>(null)
  const items = React.useRef<(HTMLButtonElement | null)[]>([])
  const active = Math.min(Math.max(index ?? inner, 0), options.length - 1)

  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      root.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  // a entrada espera a faixa aparecer na tela
  React.useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const select = (i: number) => {
    if (i === active) return
    if (index === undefined) setInner(i)
    onIndexChange?.(i)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const n = options.length
    let next: number
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (active + 1) % n
        break
      case "ArrowLeft":
      case "ArrowUp":
        next = (active - 1 + n) % n
        break
      case "Home":
        next = 0
        break
      case "End":
        next = n - 1
        break
      default:
        return
    }
    e.preventDefault()
    select(next)
    items.current[next]?.focus()
  }

  return (
    <div ref={setRoot} className={"isel" + (className ? " " + className : "")} data-shown={shown || undefined} {...props}>
      <InteractiveSelectorStyles />
      <div className="isel__list" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
        {options.map((option, i) => (
          <button
            key={i}
            ref={el => {
              items.current[i] = el
            }}
            className="isel__option"
            type="button"
            role="radio"
            aria-checked={i === active}
            tabIndex={i === active ? 0 : -1}
            style={{ "--isel-i": i } as React.CSSProperties}
            onClick={() => select(i)}
          >
            <img className="isel__img" src={option.image} alt="" decoding="async" draggable={false} />
            <span className="isel__shade" aria-hidden="true" />
            <span className="isel__label">
              <span className="isel__icon" aria-hidden="true">
                {option.icon}
              </span>
              <span className="isel__info">
                <span className="isel__title">{option.title}</span>
                {option.description != null && <span className="isel__desc">{option.description}</span>}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
})

export default InteractiveSelector

const ISEL_CSS = `
/* o que o projeto pode trocar com uma classe (posição, margem, largura): na camada base, que vem antes das classes de
   componente e dos utilitários (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS
   Modules, CSS comum) */
@layer base {
  .isel { position: relative; width: 100%; max-width: 900px; margin: 0; }
}
.isel[hidden] { display: none; }
.isel {
  box-sizing: border-box;
  display: block;
  /* as medidas de baixo são da largura da faixa, não da tela */
  container-type: inline-size;
  /* nada de texto herdado da página: a faixa fica igual em qualquer projeto */
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-style: normal;
  font-variant: normal;
  font-feature-settings: normal;
  font-variation-settings: normal;
  letter-spacing: normal;
  word-spacing: normal;
  text-align: left;
  text-transform: none;
  text-indent: 0;
  text-shadow: none;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.isel *, .isel *::before, .isel *::after { box-sizing: border-box; }

.isel__list {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 400px;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* cada foto: uma tira estreita (1 parte) ou aberta (7 partes), com moldura de 2 px */
.isel__option {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 60px;
  min-height: 60px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 2px solid #292929;
  border-radius: 0;
  background: #18181b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .3);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  backface-visibility: hidden;
  will-change: flex-grow;
  transition-property: flex-grow, border-color, box-shadow;
  transition-duration: .7s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
  /* a entrada: da esquerda, uma depois da outra, quando a faixa aparece */
  animation: isel-enter .7s cubic-bezier(.4, 0, .2, 1) both;
  animation-delay: calc(var(--isel-i, 0) * 180ms);
  animation-play-state: paused;
}
.isel[data-shown] .isel__option { animation-play-state: running; }
@keyframes isel-enter {
  from { opacity: 0; translate: -60px 0; }
  to { opacity: 1; translate: 0 0; }
}
.isel__option[aria-checked="true"] {
  z-index: 10;
  flex-grow: 7;
  border-color: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .5);
  cursor: default;
}
/* o anel de foco do teclado, por dentro da moldura */
.isel__option:focus { outline: none; }
.isel__option:focus-visible { outline: 2px solid rgba(255, 255, 255, .9); outline-offset: -8px; }

/* a foto cobre a tira inteira; fechada, ela fica 20% mais perto */
.isel__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: cover;
  object-position: center;
  scale: 1.2;
  user-select: none;
  pointer-events: none;
  transition: scale .7s cubic-bezier(.4, 0, .2, 1);
}
.isel__option[aria-checked="true"] .isel__img { scale: 1; }

/* a sombra que sobe do pé da aberta, atrás do texto. As sombras partem do pé da camada; os 240 px de altura são a folga
   para o desfoque de 120 px sumir antes do topo dela (com menos, ele é cortado ali e fica uma linha na foto) */
.isel__shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -40px;
  display: block;
  height: 240px;
  margin: 0;
  pointer-events: none;
  box-shadow: inset 0 -120px 0 -120px #000, inset 0 -120px 0 -80px #000;
  transition-property: bottom, box-shadow;
  transition-duration: .7s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.isel__option[aria-checked="true"] .isel__shade {
  bottom: 0;
  box-shadow: inset 0 -120px 120px -120px #000, inset 0 -120px 120px -80px #000;
}

/* o ícone e, ao lado, o título e a descrição */
.isel__label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: 100%;
  height: 48px;
  margin: 0;
  padding: 0 16px;
  pointer-events: none;
  transition: bottom .7s cubic-bezier(.4, 0, .2, 1);
}
.isel__icon {
  display: flex;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0;
  border: 2px solid #444;
  border-radius: 999px;
  background: rgba(32, 32, 32, .85);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, .18);
  color: #fff;
}
.isel__icon svg { display: block; flex-shrink: 0; width: 24px; height: 24px; }
.isel__info { position: relative; display: flex; flex-direction: column; min-width: 0; margin: 0; white-space: pre; color: #fff; }
.isel__title, .isel__desc {
  display: block;
  margin: 0;
  opacity: 0;
  translate: 25px 0;
  transition-property: opacity, translate;
  transition-duration: .7s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.isel__title { font-size: 18px; font-weight: 700; line-height: 28px; color: #fff; }
.isel__desc { font-size: 16px; font-weight: 400; line-height: 24px; color: #d1d5db; }
.isel__option[aria-checked="true"] .isel__title,
.isel__option[aria-checked="true"] .isel__desc { opacity: 1; translate: 0 0; }

/* no mouse, a tira fechada acende a moldura */
@media (hover: hover) {
  .isel__option[aria-checked="false"]:hover { border-color: #52525b; }
}

/* estreita (abaixo de 560 px): as fotos se empilham e a escolhida abre para baixo; nas tiras fechadas o ícone desce
   para caber nos 60 px */
@container (max-width: 559.98px) {
  .isel__list { flex-direction: column; height: 560px; }
  .isel__option { min-width: 0; }
  .isel__option[aria-checked="false"] .isel__label { bottom: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  .isel__option { animation: none; }
  .isel__option, .isel__option * { transition-duration: .01ms !important; }
}
`
