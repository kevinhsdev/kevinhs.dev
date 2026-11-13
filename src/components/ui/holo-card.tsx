// @ts-nocheck -- ProfitizeBuild file kept verbatim; it predates this repo's noUncheckedIndexedAccess.
"use client"

import * as React from "react"

/**
 * Holo Card — um cartão que inclina em 3D sob o ponteiro, como um passe de verdade com uma folha holográfica.
 *
 * Duas molas (rigidez 120, amortecimento 10) correm atrás do ponteiro: o cartão faz metade do caminho em uns 120 ms e,
 * ao soltar, passa uns 20% do ponto e volta. O brilho e a folha furta-cor, ao contrário, seguem o ponteiro na hora: a
 * luz é instantânea, o peso não. A sombra no chão anda para o lado contrário da inclinação. Sem o ponteiro, o cartão
 * balança de leve sozinho.
 *
 * Um laço de requestAnimationFrame por cartão, com o tempo entre os quadros, parado fora da tela e com a aba
 * escondida. Tudo o que se move é transform e variáveis CSS: o conteúdo do cartão não é redesenhado.
 *
 * Pelo teclado, o cartão pega o foco: as setas inclinam e o Esc nivela. Com "reduzir movimento" no sistema (ou a prop
 * reducedMotion), o cartão fica parado numa pose inclinada, com a luz num canto.
 *
 * O tema: claro por padrão, escuro com o sistema no escuro, e uma classe dark ou light (ou data-theme="dark" ou
 * "light") no cartão ou num pai decide. Posição, margem, largura e as variáveis --hc-* aceitam as classes do projeto
 * (Tailwind, CSS Modules, CSS comum).
 *
 * Autocontido: o React é o único import. Sem Tailwind, sem bibliotecas, sem arquivo CSS.
 */

/* ---- as primitivas de movimento ---- */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function onReducedMotionChange(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

/**
 * O "reduzir movimento" do sistema, seguro no SSR. No navegador, lê na hora, então quem pediu menos movimento não vê
 * nem um quadro de movimento. No servidor e na hidratação vale false (a preferência não é conhecida lá), e logo depois
 * entra a do sistema: o servidor e o primeiro render do navegador concordam no data-motion.
 */
function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    onReducedMotionChange,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

/**
 * Se vale a pena animar o elemento agora: ele está na tela E a aba está visível. Serve para parar o trabalho de cada
 * quadro quando o componente sai da tela ou a aba fica em segundo plano.
 */
function useVisibilityPause<T extends Element>(
  ref: React.RefObject<T | null>,
  { threshold = 0.1 }: { threshold?: number } = {},
): boolean {
  const [onScreen, setOnScreen] = React.useState(true)
  const [tabVisible, setTabVisible] = React.useState(true)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((e) => e.isIntersecting)),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])

  React.useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState !== "hidden")
    onVis()
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  return onScreen && tabVisible
}

/* ---- os tipos ---- */

export type HoloCardFoil = "azure" | "spectral" | "none"

export interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** O conteúdo do cartão, numa coluna da altura dele: com três blocos (topo, meio e pé), vira um passe. */
  children?: React.ReactNode
  /** A inclinação máxima, em graus, com o ponteiro na borda. Com 14: ±11° na vertical e ±15° na horizontal. */
  maxTilt?: number
  /** A mola da inclinação. Pouco amortecida de propósito (ζ ≈ 0,46): ao soltar, passa uns 20% do ponto e volta. */
  spring?: { stiffness?: number; damping?: number }
  /** A folha furta-cor, presa ao ponteiro: "spectral" (azul, ciano e verde-água), "azure" (só azuis) ou "none". */
  foil?: HoloCardFoil
  /** O brilho, um ponto de luz sob o ponteiro. */
  glare?: boolean
  /** A sombra no chão, que anda contra a inclinação. */
  shadow?: boolean
  /** O balanço de leve sem o ponteiro, antes e depois de mexer. */
  idleSway?: boolean
  /** A proporção do cartão (largura / altura); 1.586 é a de um cartão de crédito. Com 0, o conteúdo decide a altura. */
  aspect?: number
  /** O nome do cartão para o leitor de tela. */
  label?: string
  /** Chamado com os ângulos da mola (rotateX, rotateY) quando eles mudam. */
  onTilt?: (rx: number, ry: number) => void
  /** Para o laço de animação fora da tela e com a aba escondida. */
  pauseWhenHidden?: boolean
  /** A pose parada, sem movimento, qualquer que seja a preferência do sistema. */
  reducedMotion?: boolean
}

/* ---- a física ---- */

/** Uma mola feita à mão, pelo tempo entre os quadros: o componente fica sem dependências. */
class Spring {
  x: number
  v = 0
  target: number
  k: number
  d: number
  constructor(value: number, k: number, d: number) {
    this.x = value
    this.target = value
    this.k = k
    this.d = d
  }
  step(dt: number): number {
    const a = this.k * (this.target - this.x) - this.d * this.v
    this.v += a * dt
    this.x += this.v * dt
    return this.x
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** O envelope da inclinação: rotateX ±11° e rotateY ±15° com maxTilt = 14. */
const TILT_X_RATIO = 11 / 14
const TILT_Y_RATIO = 15 / 14
/** A pose parada, com "reduzir movimento": continua em 3D, sem nenhum movimento. */
const REST = { rx: -6, ry: 8, px: 0.62, py: 0.3 }

function foilBackground(foil: HoloCardFoil): string | undefined {
  if (foil === "none") return undefined
  // um risco de 1 px que se repete dá a textura de folha impressa por baixo da cônica
  const rake =
    "repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 5px)"
  const at = "at calc(var(--hc-px, 0.5) * 100%) calc(var(--hc-py, 0.5) * 100%)"
  if (foil === "azure") {
    return `${rake}, conic-gradient(from 210deg ${at}, var(--hc-accent) 0deg, var(--hc-accent-text) 120deg, var(--hc-accent) 240deg, var(--hc-accent-text) 360deg)`
  }
  const mint = "color-mix(in srgb, var(--hc-cyan) 52%, #ffffff)"
  const deep = "color-mix(in srgb, var(--hc-accent) 78%, #000000)"
  return `${rake}, conic-gradient(from 210deg ${at}, var(--hc-accent) 0deg, var(--hc-cyan) 90deg, ${mint} 160deg, var(--hc-accent) 230deg, ${deep} 300deg, var(--hc-accent) 360deg)`
}

// O React 19 sobe uma <style> com href e precedence para o <head>, uma vez só para todos os cartões (fora do cartão). O
// React 18 não conhece isso: lá ela vai ao lado do cartão, escondida e com o CSS cru, porque como filho de texto o SSR do
// 18 escaparia as aspas e quebraria os seletores.
const HOISTS_STYLES = Number(React.version.split(".")[0]) >= 19

function HoloCardStyles() {
  if (HOISTS_STYLES) {
    const hoist = { href: "holo-card", precedence: "default" } as React.StyleHTMLAttributes<HTMLStyleElement>
    return <style {...hoist}>{HC_CSS}</style>
  }
  return <style hidden dangerouslySetInnerHTML={{ __html: HC_CSS }} />
}

/* ---- o componente ---- */

export function HoloCard({
  children,
  maxTilt = 14,
  spring,
  foil = "spectral",
  glare = true,
  shadow = true,
  idleSway = true,
  aspect = 1.586,
  label = "Cartão interativo",
  onTilt,
  pauseWhenHidden = true,
  reducedMotion,
  className,
  style,
  ...props
}: HoloCardProps) {
  const hintId = "hc-hint-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "")

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const cardRef = React.useRef<HTMLDivElement | null>(null)
  const shadowRef = React.useRef<HTMLDivElement | null>(null)

  const systemReduced = useReducedMotion()
  const staticMode = reducedMotion === true || systemReduced
  const onScreen = useVisibilityPause(rootRef, { threshold: 0.05 })
  const paused = pauseWhenHidden && !onScreen
  const animate = !staticMode && !paused

  const maxY = Math.abs(maxTilt) * TILT_Y_RATIO
  const maxX = Math.abs(maxTilt) * TILT_X_RATIO

  const stiffness = spring?.stiffness ?? 120
  const damping = spring?.damping ?? 10

  // o estado do movimento mora em refs: o laço nunca faz o React renderizar
  const springsRef = React.useRef({ sx: new Spring(0, stiffness, damping), sy: new Spring(0, stiffness, damping) })
  const lightRef = React.useRef({ px: 0.5, py: 0.5, hovering: false })
  const emittedRef = React.useRef({ rx: 0, ry: 0 })
  const liveRef = React.useRef({ maxX, maxY, idleSway, onTilt, staticMode })
  // as props que o laço e os eventos leem, sempre as do último render (este efeito vem antes dos que as usam)
  React.useEffect(() => {
    liveRef.current = { maxX, maxY, idleSway, onTilt, staticMode }
  })

  React.useEffect(() => {
    springsRef.current.sx.k = stiffness
    springsRef.current.sy.k = stiffness
    springsRef.current.sx.d = damping
    springsRef.current.sy.d = damping
  }, [stiffness, damping])

  const render = React.useCallback((rx: number, ry: number) => {
    const card = cardRef.current
    if (!card) return
    const { px, py } = lightRef.current
    const { maxX: mx, maxY: my, onTilt: cb } = liveRef.current
    card.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`
    card.style.setProperty("--hc-px", px.toFixed(4))
    card.style.setProperty("--hc-py", py.toFixed(4))
    // a cor da folha gira com a inclinação E com a posição na largura: a folha muda de cor enquanto a luz anda, em vez
    // de só se mover
    card.style.setProperty("--hc-hue", (ry * 4 + (px - 0.5) * 40).toFixed(2))
    const lean = (Math.abs(rx) + Math.abs(ry)) / Math.max(1, mx + my)
    card.style.setProperty("--hc-glare-o", (0.22 + lean * 0.4).toFixed(3))
    const sh = shadowRef.current
    if (sh) {
      sh.style.transform = `translate3d(${(-ry * 1.8).toFixed(2)}px, ${(rx * 1.2).toFixed(2)}px, 0) scale(${(1 + lean * 0.08).toFixed(3)})`
      sh.style.opacity = (0.75 + lean * 0.25).toFixed(3)
    }
    const prev = emittedRef.current
    if (cb && (Math.abs(prev.rx - rx) > 0.05 || Math.abs(prev.ry - ry) > 0.05)) {
      emittedRef.current = { rx, ry }
      cb(rx, ry)
    }
  }, [])

  React.useEffect(() => {
    if (!animate) return
    let raf = 0
    let last = 0
    let t = 0
    const frame = (now: number) => {
      if (!last) last = now
      const dt = clamp((now - last) / 1000, 0, 0.05)
      last = now
      t += dt
      const { sx, sy } = springsRef.current
      const light = lightRef.current
      const { maxX: mx, maxY: my, idleSway: sway } = liveRef.current
      if (!light.hovering) {
        if (sway) {
          sy.target = clamp(Math.sin(t * 0.5) * 4, -my, my)
          sx.target = clamp(Math.cos(t * 0.37) * 3, -mx, mx)
        } else {
          sy.target = 0
          sx.target = 0
        }
        // a luz volta para o centro mais rápido do que o cartão se desenrola
        const rate = Math.min(1, dt * 2)
        light.px += (0.5 - light.px) * rate
        light.py += (0.5 - light.py) * rate
      }
      render(sx.step(dt), sy.step(dt))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [animate, render])

  // a pose parada: uma foto pensada, não um cartão achatado
  React.useEffect(() => {
    if (!staticMode) return
    const { sx, sy } = springsRef.current
    sx.x = sx.target = REST.rx
    sy.x = sy.target = REST.ry
    sx.v = 0
    sy.v = 0
    lightRef.current = { px: REST.px, py: REST.py, hovering: false }
    render(REST.rx, REST.ry)
  }, [staticMode, render])

  const trackPointer = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (liveRef.current.staticMode) return
      const card = cardRef.current
      if (!card) return
      const r = card.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const px = clamp((e.clientX - r.left) / r.width, 0, 1)
      const py = clamp((e.clientY - r.top) / r.height, 0, 1)
      const light = lightRef.current
      light.px = px
      light.py = py
      light.hovering = true
      const { maxX: mx, maxY: my } = liveRef.current
      springsRef.current.sy.target = (px - 0.5) * 2 * my
      springsRef.current.sx.target = -(py - 0.5) * 2 * mx
    },
    [],
  )

  const release = React.useCallback(() => {
    lightRef.current.hovering = false
  }, [])

  const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (liveRef.current.staticMode) return
    const { sx, sy } = springsRef.current
    const { maxX: mx, maxY: my } = liveRef.current
    const step = 4
    let used = true
    if (e.key === "ArrowLeft") sy.target = Math.max(-my, sy.target - step)
    else if (e.key === "ArrowRight") sy.target = Math.min(my, sy.target + step)
    else if (e.key === "ArrowUp") sx.target = Math.min(mx, sx.target + step)
    else if (e.key === "ArrowDown") sx.target = Math.max(-mx, sx.target - step)
    else if (e.key === "Escape") {
      sx.target = 0
      sy.target = 0
    } else used = false
    if (used) {
      lightRef.current.hovering = true
      // a tecla é do cartão: a página não rola com as setas, e o Esc não fecha o modal em volta
      e.preventDefault()
    }
  }, [])

  const foilBg = foilBackground(foil)

  return (
    <div
      ref={rootRef}
      data-motion={staticMode ? "static" : "animated"}
      data-paused={paused ? "true" : "false"}
      className={"hc" + (className ? " " + className : "")}
      style={{ perspective: "1100px", ...style }}
      onPointerMove={trackPointer}
      onPointerDown={trackPointer}
      onPointerLeave={release}
      onPointerCancel={release}
      onPointerUp={(e) => {
        // no toque, tirar o dedo encerra; o mouse continua mexendo no cartão até sair dele
        if (e.pointerType !== "mouse") release()
      }}
      {...props}
    >
      <HoloCardStyles />

      {shadow ? <div ref={shadowRef} aria-hidden="true" className="hc__shadow" /> : null}

      <div
        ref={cardRef}
        role="group"
        aria-label={label}
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={release}
        className="hc__card"
        style={{ aspectRatio: aspect > 0 ? String(aspect) : undefined }}
      >
        {foilBg ? <div aria-hidden="true" className="hc__foil" style={{ background: foilBg }} /> : null}

        <div className="hc__body">{children}</div>

        {glare ? <div aria-hidden="true" className="hc__glare" /> : null}
      </div>

      <span id={hintId} className="hc__hint">
        Use as setas para inclinar o cartão e o Esc para deixá-lo reto.
      </span>
    </div>
  )
}

export default HoloCard

const HC_LIGHT = `
    --hc-accent: #315fea; /* o azul da folha */
    --hc-accent-text: #244fd1; /* o segundo azul da folha (e o de textos de destaque) */
    --hc-cyan: #009fb3; /* o ciano da folha "spectral" */
    --hc-surface: #ffffff; /* o miolo do cartão */
    --hc-surface-2: #f8fafd; /* os cantos do cartão */
    --hc-border: #c5d1e1; /* a borda */
    --hc-fg: #101828; /* para o conteúdo: o texto principal */
    --hc-muted: #667085; /* para o conteúdo: o texto apagado */
    --hc-blend: soft-light; /* como a folha se mistura com o cartão */
    --hc-foil-o: 0.5; /* a força da folha */
    --hc-glare: rgba(255, 255, 255, 0.75); /* a cor do brilho */
    --hc-shadow: rgba(16, 24, 40, 0.22); /* a sombra no chão */
    --hc-stroke: rgba(255, 255, 255, 0.85); /* o fio de luz na borda de cima */`

const HC_DARK = `
    --hc-accent: #4f7cff;
    --hc-accent-text: #7f9fff;
    --hc-cyan: #22c7d9;
    --hc-surface: #111827;
    --hc-surface-2: #192337;
    --hc-border: #354863;
    --hc-fg: #f8fafc;
    --hc-muted: #9caabd;
    --hc-blend: color-dodge;
    --hc-foil-o: 0.32;
    --hc-glare: rgba(255, 255, 255, 0.5);
    --hc-shadow: rgba(2, 5, 12, 0.65);
    --hc-stroke: rgba(255, 255, 255, 0.16);`

const HC_CSS = `
/* o que o projeto pode trocar com uma classe (posição, margem, largura e as variáveis): na camada base, que vem antes
   das classes de componente e dos utilitários (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada
   (Tailwind v3, CSS Modules, CSS comum). O tema: claro, escuro com o sistema no escuro, e a classe ou o data-theme no
   cartão ou num pai decide */
@layer base {
  .hc {${HC_LIGHT}
    position: relative;
    width: 100%;
  }
  @media (prefers-color-scheme: dark) {
    .hc {${HC_DARK}
    }
  }
  :is(.dark, [data-theme="dark"]) .hc, .hc:is(.dark, [data-theme="dark"]) {${HC_DARK}
  }
  :is(.light, [data-theme="light"]) .hc, .hc:is(.light, [data-theme="light"]) {${HC_LIGHT}
  }
}
.hc__shadow {
  position: absolute;
  right: 8%;
  bottom: -26px;
  left: 8%;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(50% 50% at 50% 50%, var(--hc-shadow), transparent 70%);
  pointer-events: none;
  will-change: transform;
}
/* o cartão achata o 3D dele (overflow: hidden), então a folha e o brilho se misturam com o fundo do próprio cartão */
.hc__card {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--hc-border);
  border-radius: 16px;
  outline: none;
  background: linear-gradient(145deg, var(--hc-surface-2), var(--hc-surface) 55%, var(--hc-surface-2));
  box-shadow: inset 0 1px 0 var(--hc-stroke);
  transform-style: preserve-3d;
  will-change: transform;
  /* o dedo inclina o cartão em vez de rolar a página */
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.hc__card:focus-visible {
  outline: 2px solid var(--hc-accent);
  outline-offset: 2px;
}
.hc__foil, .hc__glare {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  transform: translateZ(0);
}
.hc__foil {
  mix-blend-mode: var(--hc-blend);
  opacity: var(--hc-foil-o);
  filter: hue-rotate(calc(var(--hc-hue, 0) * 1deg)) saturate(1.25);
}
.hc__glare {
  background: radial-gradient(200px circle at calc(var(--hc-px, 0.5) * 100%) calc(var(--hc-py, 0.5) * 100%), var(--hc-glare), transparent 65%);
  mix-blend-mode: screen;
  opacity: var(--hc-glare-o, 0.35);
}
.hc__body {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 20px;
  transform: translateZ(1px);
}
/* a dica das setas: só para o leitor de tela */
.hc__hint {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@media (forced-colors: active) {
  .hc__foil, .hc__glare, .hc__shadow { display: none; }
}
`
