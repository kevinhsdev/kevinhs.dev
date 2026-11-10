"use client"

import * as React from "react"

/**
 * Liquid Glass Dock — uma dock de ícones de vidro líquido, como a do macOS, que entorta o que passa atrás dela.
 *
 * O vidro são três camadas por baixo dos ícones. A de baixo pega o que está atrás da dock, desfoca (backdrop-filter) e
 * passa o resultado por um filtro SVG (filter: url()): um ruído fractal bem esticado, desfocado, desloca os pixels
 * (feDisplacementMap), e o fundo atrás do vidro se estica em riscos verticais e entorta, como através de uma lente
 * grossa. Por cima, um véu branco e um fio de luz por dentro da borda (duas sombras internas).
 *
 * No hover, a dock cresce 4 px de cada lado e o canto arredonda mais, e o ícone sob o mouse cresce 10%, os dois numa
 * curva que passa do ponto e volta, como uma mola. Só com mouse ou caneta: no toque, nada fica preso crescido. Pelo
 * teclado, o ícone com foco cresce do mesmo jeito, com um contorno branco.
 *
 * Cada ícone é um link (com href), um botão (com onClick) ou só a imagem, com o nome no aria-label e no title. Numa
 * largura menor que a dock, os ícones encolhem juntos para ela caber.
 *
 * Só os navegadores Chromium (Chrome, Edge, Arc, Opera) entortam o fundo. No Safari o filtro SVG apagaria o desfoque
 * inteiro (o fundo passaria nítido pelo vidro), então lá e no Firefox o vidro fica só fosco.
 *
 * Posição, margem, largura e as variáveis --lgd-* aceitam as classes do projeto (Tailwind, CSS Modules, CSS comum).
 * Autocontido: o React é o único import. Sem Tailwind, sem bibliotecas, sem arquivo CSS.
 */

export interface LiquidGlassDockItem {
  /** O nome do app: o que o leitor de tela lê e o balão do navegador mostra. */
  title: string
  /** Um <img> ou um <svg> quadrado: ele ocupa o ícone inteiro. */
  icon: React.ReactNode
  /** Com href, o ícone é um link. */
  href?: string
  /** O link abre numa aba nova. */
  external?: boolean
  /** O link baixa o arquivo (portfolio: the CV). */
  download?: boolean
  /** Sem href, o clique faz do ícone um botão. */
  onClick?: React.MouseEventHandler<HTMLElement>
}

export interface LiquidGlassDockProps extends Omit<React.ComponentPropsWithoutRef<"nav">, "children"> {
  items: LiquidGlassDockItem[]
  /** O nome da dock para o leitor de tela. */
  label?: string
}

// O React 19 sobe uma <style> com href e precedence para o <head>, uma vez só para todas as docks (fora da dock). O
// React 18 não conhece isso: lá ela vai ao lado da dock, escondida e com o CSS cru, porque como filho de texto o SSR do
// 18 escaparia as aspas e quebraria os seletores.
const HOISTS_STYLES = Number(React.version.split(".")[0]) >= 19

function LiquidGlassDockStyles() {
  if (HOISTS_STYLES) {
    const hoist = { href: "liquid-glass-dock", precedence: "default" } as React.StyleHTMLAttributes<HTMLStyleElement>
    return <style {...hoist}>{LGD_CSS}</style>
  }
  return <style hidden dangerouslySetInnerHTML={{ __html: LGD_CSS }} />
}

export function LiquidGlassDock({ items, label = "Apps", className, style, ...props }: LiquidGlassDockProps) {
  // um filtro por dock: com duas na página, cada uma aponta para o seu
  const filter = "lgd-glass-" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  return (
    <>
      <LiquidGlassDockStyles />
      <nav
        aria-label={label}
        {...props}
        className={"lgd" + (className ? " " + className : "")}
        style={{ "--lgd-filter": 'url("#' + filter + '")', ...style } as React.CSSProperties}
      >
        <span className="lgd__glass" aria-hidden="true" />
        <span className="lgd__tint" aria-hidden="true" />
        <span className="lgd__rim" aria-hidden="true" />
        <ul className="lgd__icons">
          {items.map((item, i) => (
            <li key={i + item.title} className="lgd__slot">
              <DockIcon item={item} />
            </li>
          ))}
        </ul>
        <svg className="lgd__defs" aria-hidden="true" focusable="false">
          <filter id={filter} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            {/* ruído fractal quase sem variação na horizontal (um ciclo a cada 1000 px) e devagar na vertical (200 px) */}
            <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
            {/* o ruído desfocado, para a distorção sair lisa */}
            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
            {/* desloca o vidro (o fundo desfocado) pelo ruído: o vermelho empurra na horizontal, o verde na vertical */}
            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      </nav>
    </>
  )
}

function DockIcon({ item }: { item: LiquidGlassDockItem }) {
  const { title, icon, href, external, download, onClick } = item
  if (href) {
    return (
      <a
        className="lgd__item"
        href={href}
        aria-label={title}
        title={title}
        onClick={onClick}
        download={download || undefined}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {icon}
      </a>
    )
  }
  if (onClick) {
    return (
      <button type="button" className="lgd__item" aria-label={title} title={title} onClick={onClick}>
        {icon}
      </button>
    )
  }
  return (
    <span className="lgd__item" role="img" aria-label={title} title={title}>
      {icon}
    </span>
  )
}

const LGD_CSS = `
/* o que o projeto pode trocar com uma classe (posição, margem, largura e as variáveis): na camada base, que vem antes
   das classes de componente e dos utilitários (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada
   (Tailwind v3, CSS Modules, CSS comum) */
@layer base {
  .lgd {
    --lgd-icon: 64px; /* o ícone */
    --lgd-gap: 8px; /* entre os ícones */
    --lgd-tint: rgba(255, 255, 255, .25); /* o véu por cima do vidro */
    --lgd-blur: 3px; /* o desfoque do fundo */
    position: relative;
    width: fit-content;
    max-width: 100%;
    margin: 0;
  }
}
.lgd[hidden] { display: none; }
.lgd {
  box-sizing: border-box;
  display: flex;
  overflow: hidden;
  padding: 12px;
  border: 0;
  border-radius: 24px;
  box-shadow: 0 6px 6px rgba(0, 0, 0, .2), 0 0 20px rgba(0, 0, 0, .1);
  -webkit-tap-highlight-color: transparent;
  /* a mola: a curva passa do ponto e volta */
  transition: padding .7s cubic-bezier(.175, .885, .32, 2.2), border-radius .7s cubic-bezier(.175, .885, .32, 2.2);
}
@media (hover: hover) {
  .lgd:hover { padding: 16px; border-radius: 32px; }
  .lgd__item:hover { scale: 1.1; }
}
.lgd:has(.lgd__item:focus-visible) { padding: 16px; border-radius: 32px; }

/* as três camadas cobrem a dock inteira, e a dock as recorta no canto dela */
.lgd__glass, .lgd__tint, .lgd__rim {
  position: absolute;
  inset: 0;
  margin: 0;
  pointer-events: none;
}
/* o vidro: o que está atrás, desfocado. No Chromium, entortado pelo filtro SVG (o url() vem na --lgd-filter da dock) */
.lgd__glass {
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  isolation: isolate;
  -webkit-backdrop-filter: blur(var(--lgd-blur));
  backdrop-filter: blur(var(--lgd-blur));
}
@supports (-webkit-app-region: drag) and (not (font: -apple-system-body)) {
  .lgd__glass { filter: var(--lgd-filter); }
}
.lgd__tint { z-index: 1; background: var(--lgd-tint); }
/* o fio de luz por dentro da borda: forte em cima e à esquerda, mais fino embaixo e à direita */
.lgd__rim {
  z-index: 2;
  border-radius: inherit;
  box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, .5), inset -1px -1px 1px 1px rgba(255, 255, 255, .5);
}

.lgd__icons {
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  display: flex;
  flex: 0 1 auto;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: var(--lgd-gap);
  margin: 0;
  padding: 0 2px;
  border-radius: 24px;
  overflow: hidden;
  list-style: none;
}
/* numa largura menor que a dock, os ícones encolhem juntos. A width é para o Safari, que senão mede a dock pelo tamanho
   real das imagens */
.lgd__slot { flex: 0 1 var(--lgd-icon); width: var(--lgd-icon); min-width: 0; margin: 0; padding: 0; list-style: none; }
.lgd__item {
  box-sizing: border-box;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 18px;
  background: none;
  color: inherit;
  font: inherit;
  line-height: 0;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transform-origin: center;
  transition: scale .7s cubic-bezier(.175, .885, .32, 2.2);
}
span.lgd__item { cursor: default; }
/* o contorno do foco fica por dentro do ícone, colado no desenho: por fora (e mesmo por dentro, crescido), a fileira o
   cortaria */
.lgd__item:focus { outline: none; }
.lgd__item:focus-visible { outline: 2px solid #fff; outline-offset: -5px; scale: 1.1; }
.lgd__item > img, .lgd__item > svg {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: contain;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
}
/* o filtro fica num <svg> que não aparece: só o Chromium usa, e ele lê filtros de um <svg> com display: none */
.lgd__defs { display: none; }

@media (prefers-reduced-motion: reduce) {
  .lgd, .lgd__item { transition: none; }
}
`
