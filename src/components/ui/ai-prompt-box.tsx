// @ts-nocheck -- ProfitizeBuild file kept verbatim; it predates this repo's noUncheckedIndexedAccess.
"use client"

import * as React from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

/**
 * AI Prompt Box — a caixa de mensagem de um chat de IA: o texto cresce com o que se escreve (até 240 px, depois
 * rola), três modos ligam e desligam (Pesquisar, Pensar e Canvas), uma imagem entra pelo clipe, colada ou arrastada,
 * e o botão redondo da direita é o microfone com a caixa vazia, a seta de enviar com texto e o quadrado de parar
 * enquanto a IA responde.
 *
 * - Enter envia e Shift+Enter quebra a linha. O onSend recebe o texto e a imagem; com um modo ligado, o texto vai
 *   entre colchetes com o nome dele ("[Pensar: …]").
 * - Pesquisar e Pensar não ficam ligados juntos; o Canvas liga com qualquer um.
 * - A imagem (só imagem, até 10 MB) aparece em miniatura, abre em tela cheia no clique e sai no X.
 * - O microfone grava de mentira: um cronômetro e barras que pulsam. Ao parar, o onSend recebe
 *   "[Mensagem de voz - N segundos]".
 * - Com isLoading a borda fica vermelha e o botão vira o de parar, que chama o onStop.
 * - As cores vêm de variáveis CSS (--apb-bg, --apb-border, --apb-search…).
 *
 * Posição, margem e largura aceitam as classes do projeto (Tailwind, CSS Modules, CSS comum). Os ícones são os do
 * Lucide (licença ISC), desenhados aqui.
 *
 * O React e o Motion são os únicos imports. Sem Tailwind, sem Radix, sem arquivo CSS.
 */

export type PromptInputBoxProps = {
  /** O envio: o texto (com o modo entre colchetes, se houver) e a imagem anexada. */
  onSend?: (message: string, files?: File[]) => void
  /** O clique no botão de parar, enquanto isLoading. */
  onStop?: () => void
  /** A IA está respondendo: borda vermelha, texto travado e o botão de parar. */
  isLoading?: boolean
  /** O texto da caixa vazia, sem modo ligado. */
  placeholder?: string
  /** A classe da caixa. */
  className?: string
}

// O React 19 sobe uma <style> com href e precedence para o <head>, uma vez só para todas as caixas. O React 18 não
// conhece isso: lá ela vai dentro da caixa, escondida e com o CSS cru, porque como filho de texto o SSR do 18 escaparia
// as aspas e quebraria os seletores.
const HOISTS_STYLES = Number(React.version.split(".")[0]) >= 19

function PromptBoxStyles() {
  if (HOISTS_STYLES) {
    const hoist = { href: "ai-prompt-box", precedence: "default" } as React.StyleHTMLAttributes<HTMLStyleElement>
    return <style {...hoist}>{APB_CSS}</style>
  }
  return <style hidden dangerouslySetInnerHTML={{ __html: APB_CSS }} />
}

function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ")
}

const MAX_HEIGHT = 240
const MAX_FILE_SIZE = 10 * 1024 * 1024

const MODES = {
  search: { label: "Pesquisar", prefix: "Pesquisar", placeholder: "Pesquisar na web...", icon: <IconGlobe /> },
  think: { label: "Pensar", prefix: "Pensar", placeholder: "Pensar a fundo...", icon: <IconBrainCog /> },
  canvas: { label: "Canvas", prefix: "Canvas", placeholder: "Criar no canvas...", icon: <IconFolderCode /> },
}
type Mode = keyof typeof MODES

export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>(function PromptInputBox(
  { onSend, onStop, isLoading = false, placeholder = "Digite sua mensagem aqui...", className },
  ref,
) {
  const [input, setInput] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [filePreviews, setFilePreviews] = React.useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  // o instante em que a gravação começou (performance.now), ou null fora dela
  const [recordingStart, setRecordingStart] = React.useState<number | null>(null)
  const [modes, setModes] = React.useState<Record<Mode, boolean>>({ search: false, think: false, canvas: false })
  const uploadInputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const isRecording = recordingStart !== null
  const disabled = isLoading || isRecording
  const hasContent = input.trim() !== "" || files.length > 0

  // o texto cresce com as linhas até 240 px; depois disso, rola
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [input])

  // Pesquisar e Pensar se excluem; o Canvas liga com qualquer um
  const toggleMode = (mode: Mode) =>
    setModes(m =>
      mode === "canvas" ? { ...m, canvas: !m.canvas } : { ...m, search: false, think: false, [mode]: !m[mode] },
    )

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) return
    setFiles([file])
    const reader = new FileReader()
    reader.onload = e => setFilePreviews({ [file.name]: e.target?.result as string })
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = () => {
    setFiles([])
    setFilePreviews({})
  }

  // colar uma imagem com o foco na caixa anexa ela (o texto colado continua indo para o campo)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return
    for (const item of Array.from(e.clipboardData.items)) {
      if (!item.type.startsWith("image/")) continue
      const file = item.getAsFile()
      if (file) {
        e.preventDefault()
        processFile(file)
        break
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const image = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"))
    if (image && !disabled) processFile(image)
  }

  const handleSubmit = () => {
    if (!hasContent) return
    const mode = modes.search ? "search" : modes.think ? "think" : modes.canvas ? "canvas" : null
    onSend?.(mode ? `[${MODES[mode].prefix}: ${input}]` : input, files)
    setInput("")
    setFiles([])
    setFilePreviews({})
  }

  const startRecording = () => setRecordingStart(performance.now())

  // os segundos contam do mesmo instante que o cronômetro: a mensagem diz o que ele mostrava
  const stopRecording = () => {
    const seconds = Math.floor((performance.now() - (recordingStart ?? performance.now())) / 1000)
    setRecordingStart(null)
    onSend?.(`[Mensagem de voz - ${seconds} ${seconds === 1 ? "segundo" : "segundos"}]`, [])
  }

  const handleAction = () => {
    if (isRecording) stopRecording()
    else if (isLoading) onStop?.()
    else if (hasContent) handleSubmit()
    else startRecording()
  }

  const actionLabel = isLoading
    ? "Parar geração"
    : isRecording
      ? "Parar gravação"
      : hasContent
        ? "Enviar mensagem"
        : "Mensagem de voz"

  const activePlaceholder = modes.search
    ? MODES.search.placeholder
    : modes.think
      ? MODES.think.placeholder
      : modes.canvas
        ? MODES.canvas.placeholder
        : placeholder

  return (
    <MotionConfig reducedMotion="user">
      <PromptBoxStyles />
      <div
        ref={ref}
        className={cx("apb-root", className)}
        data-state={isLoading ? "loading" : isRecording ? "recording" : undefined}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragOver}
        onDrop={handleDrop}
      >
        {files.length > 0 && !isRecording && (
          <div className="apb-files">
            {files.map(file =>
              filePreviews[file.name] ? (
                <div key={file.name} className="apb-file">
                  <button
                    type="button"
                    className="apb-file__thumb"
                    onClick={() => setSelectedImage(filePreviews[file.name])}
                    aria-label={`Ver ${file.name}`}
                  >
                    <img src={filePreviews[file.name]} alt="" />
                  </button>
                  <button type="button" className="apb-file__remove" onClick={handleRemoveFile} aria-label="Remover a imagem">
                    <IconX />
                  </button>
                </div>
              ) : null,
            )}
          </div>
        )}

        <div className="apb-input" data-hidden={isRecording || undefined}>
          <textarea
            ref={textareaRef}
            className="apb-textarea"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={activePlaceholder}
            aria-label="Mensagem"
            disabled={disabled}
          />
        </div>

        {recordingStart !== null && <VoiceRecorder startedAt={recordingStart} />}

        <div className="apb-actions">
          <div className="apb-tools" data-hidden={isRecording || undefined}>
            <Tip label="Anexar imagem">
              <button
                type="button"
                className="apb-icon-btn"
                onClick={() => uploadInputRef.current?.click()}
                disabled={isRecording}
                aria-label="Anexar imagem"
              >
                <IconPaperclip />
              </button>
            </Tip>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              hidden
              tabIndex={-1}
              onChange={e => {
                if (e.target.files?.length) processFile(e.target.files[0])
                e.target.value = ""
              }}
            />

            <div className="apb-modes">
              <ModeToggle mode="search" active={modes.search} onToggle={toggleMode} />
              <Divider />
              <ModeToggle mode="think" active={modes.think} onToggle={toggleMode} />
              <Divider />
              <ModeToggle mode="canvas" active={modes.canvas} onToggle={toggleMode} />
            </div>
          </div>

          <Tip label={actionLabel}>
            <button
              type="button"
              className="apb-send"
              data-state={isRecording ? "recording" : isLoading ? "loading" : hasContent ? "send" : "voice"}
              onClick={handleAction}
              disabled={isLoading && !isRecording && !onStop}
              aria-label={actionLabel}
            >
              {isLoading ? <IconSquare /> : isRecording ? <IconCircleStop /> : hasContent ? <IconArrowUp /> : <IconMic />}
            </button>
          </Tip>
        </div>
      </div>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </MotionConfig>
  )
})

/** Um modo (Pesquisar, Pensar, Canvas): o ícone gira ao ligar e o nome entra ao lado dele. */
function ModeToggle({ mode, active, onToggle }: { mode: Mode; active: boolean; onToggle: (mode: Mode) => void }) {
  const { label, icon } = MODES[mode]
  return (
    <button
      type="button"
      className="apb-mode"
      data-mode={mode}
      data-active={active || undefined}
      onClick={() => onToggle(mode)}
      aria-pressed={active}
      aria-label={label}
    >
      <span className="apb-mode__icon">
        <motion.span
          className="apb-mode__glyph"
          animate={{ rotate: active ? 360 : 0, scale: active ? 1.1 : 1 }}
          whileHover={{
            rotate: active ? 360 : 15,
            scale: 1.1,
            transition: { type: "spring", stiffness: 300, damping: 10 },
          }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
          {icon}
        </motion.span>
      </span>
      <AnimatePresence>
        {active && (
          <motion.span
            className="apb-mode__label"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

/** O traço entre os modos, aceso no meio. */
function Divider() {
  return (
    <span className="apb-divider" aria-hidden="true">
      <span />
    </span>
  )
}

/** A gravação de mentira: o ponto vermelho, o cronômetro e 32 barras que pulsam e mudam de altura a cada segundo. */
function VoiceRecorder({ startedAt, bars = 32 }: { startedAt: number; bars?: number }) {
  const [seconds, setSeconds] = React.useState(0)
  const [heights, setHeights] = React.useState(() => randomHeights(bars))
  const [durations] = React.useState(() => Array.from({ length: bars }, () => 0.5 + Math.random() * 0.5))

  // cada passo cai na virada do segundo, contado do começo da gravação
  React.useEffect(() => {
    let id = 0
    const wait = () => 1000 - ((performance.now() - startedAt) % 1000)
    const tick = () => {
      setSeconds(Math.floor((performance.now() - startedAt + 1) / 1000))
      setHeights(randomHeights(bars))
      id = window.setTimeout(tick, wait())
    }
    id = window.setTimeout(tick, wait())
    return () => window.clearTimeout(id)
  }, [startedAt, bars])

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  return (
    <div className="apb-recorder" role="timer" aria-label="Gravando">
      <div className="apb-recorder__time">
        <span className="apb-recorder__dot" />
        <span className="apb-recorder__clock">
          {mm}:{ss}
        </span>
      </div>
      <div className="apb-recorder__bars" aria-hidden="true">
        {heights.map((h, i) => (
          <span
            key={i}
            className="apb-recorder__bar"
            style={{ height: `${h}%`, animationDelay: `${i * 0.05}s`, animationDuration: `${durations[i]}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function randomHeights(n: number) {
  return Array.from({ length: n }, () => Math.max(15, Math.random() * 100))
}

// Os balões: abrem 700 ms depois de o mouse parar no botão, ou na hora se outro acabou de fechar (300 ms) ou pelo
// foco do teclado; fecham ao sair, no clique e no Esc
const TIP_DELAY = 700
const TIP_SKIP = 300
let lastTipClose = -Infinity

// centraliza o balão sobre o botão num pixel inteiro: no meio de um pixel o texto sai borrado
function centerTip(el: HTMLSpanElement | null) {
  const anchor = el?.parentElement
  if (!el || !anchor) return
  el.style.left = `${Math.round((anchor.offsetWidth - parseFloat(getComputedStyle(el).width)) / 2)}px`
}

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  const isOpen = React.useRef(false)

  const set = (next: boolean) => {
    window.clearTimeout(timer.current)
    if (isOpen.current && !next) lastTipClose = performance.now()
    isOpen.current = next
    setOpen(next)
  }
  const show = (e: React.SyntheticEvent<HTMLElement>, instant: boolean) => {
    if (e.currentTarget.querySelector("button:disabled")) return
    window.clearTimeout(timer.current)
    if (instant || performance.now() - lastTipClose < TIP_SKIP) set(true)
    else timer.current = window.setTimeout(() => set(true), TIP_DELAY)
  }
  const hide = () => set(false)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <span
      className="apb-tip-anchor"
      onPointerEnter={e => e.pointerType !== "touch" && show(e, false)}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={e => e.target.matches(":focus-visible") && show(e, true)}
      onBlur={hide}
      onKeyDown={e => {
        if (e.key === "Escape" && isOpen.current) {
          e.preventDefault()
          hide()
        }
      }}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            ref={el => centerTip(el)}
            className="apb-tip"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/** A imagem anexada em tela cheia, num <dialog> do navegador: fecha no X, no Esc e no clique fora. */
function ImageViewDialog({ imageUrl, onClose }: { imageUrl: string | null; onClose: () => void }) {
  const ref = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dialog = ref.current
    if (!dialog || !imageUrl) return
    if (!dialog.open) dialog.showModal()
    // a página não rola por trás enquanto ela está aberta
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = overflow
    }
  }, [imageUrl])

  if (!imageUrl) return null
  return (
    <dialog
      ref={ref}
      className="apb-dialog"
      aria-label="Prévia da imagem"
      onClose={e => {
        if (!e.currentTarget.open) onClose()
      }}
      onClick={e => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      <div className="apb-dialog__content">
        <div className="apb-dialog__frame">
          <img className="apb-dialog__img" src={imageUrl} alt="Imagem anexada" />
        </div>
        <button type="button" className="apb-dialog__close" onClick={() => ref.current?.close()} aria-label="Fechar">
          <IconX />
        </button>
      </div>
    </dialog>
  )
}

/* Os ícones do Lucide (licença ISC) */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

function IconPaperclip() {
  return (
    <Icon>
      <path d="M13.234 20.252 21 12.3" />
      <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486" />
    </Icon>
  )
}

function IconGlobe() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Icon>
  )
}

function IconBrainCog() {
  return (
    <Icon>
      <path d="m10.852 14.772-.383.923" />
      <path d="m10.852 9.228-.383-.923" />
      <path d="m13.148 14.772.382.924" />
      <path d="m13.531 8.305-.383.923" />
      <path d="m14.772 10.852.923-.383" />
      <path d="m14.772 13.148.923.383" />
      <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 0 0-5.63-1.446 3 3 0 0 0-.368 1.571 4 4 0 0 0-2.525 5.771" />
      <path d="M17.998 5.125a4 4 0 0 1 2.525 5.771" />
      <path d="M19.505 10.294a4 4 0 0 1-1.5 7.706" />
      <path d="M4.032 17.483A4 4 0 0 0 11.464 20c.18-.311.892-.311 1.072 0a4 4 0 0 0 7.432-2.516" />
      <path d="M4.5 10.291A4 4 0 0 0 6 18" />
      <path d="M6.002 5.125a3 3 0 0 0 .4 1.375" />
      <path d="m9.228 10.852-.923-.383" />
      <path d="m9.228 13.148-.923.383" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

function IconFolderCode() {
  return (
    <Icon>
      <path d="M10 10.5 8 13l2 2.5" />
      <path d="m14 10.5 2 2.5-2 2.5" />
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
    </Icon>
  )
}

function IconMic() {
  return (
    <Icon>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </Icon>
  )
}

function IconArrowUp() {
  return (
    <Icon>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </Icon>
  )
}

function IconSquare() {
  return (
    <Icon>
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </Icon>
  )
}

function IconCircleStop() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </Icon>
  )
}

function IconX() {
  return (
    <Icon>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  )
}

export default PromptInputBox

const APB_CSS = `
/* o que o projeto pode trocar com uma classe (largura, margem): na camada base, que vem antes das classes de
   componente e dos utilitários (Tailwind v4, Panda, Chakra) e perde para o CSS fora de camada (Tailwind v3, CSS
   Modules, CSS comum) */
@layer base {
  .apb-root { width: 100%; margin: 0; }
}

/* as cores: dá para trocar qualquer uma pelo tema do projeto */
.apb-root, .apb-dialog {
  --apb-bg: #1f2023;
  --apb-border: #444444;
  --apb-text: oklch(96.7% 0.003 264.542);
  --apb-placeholder: oklch(70.7% 0.022 261.325);
  --apb-icon: #9ca3af;
  --apb-icon-hover: #d1d5db;
  --apb-hover-bg: oklch(44.6% 0.03 256.802 / 0.3);
  --apb-busy: oklch(63.7% 0.237 25.331);
  --apb-search: #1eaedb;
  --apb-think: #8b5cf6;
  --apb-canvas: #f97316;
  --apb-divider: #9b87f5;
  --apb-button: #ffffff;
  --apb-button-icon: #1f2023;
  --apb-tip-bg: #1f2023;
  --apb-tip-border: #333333;
  --apb-tip-text: #ffffff;
  --apb-ring: #9b87f5;
}

/* nada de texto herdado da página: a caixa fica igual em qualquer projeto */
.apb-root, .apb-dialog {
  box-sizing: border-box;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: normal;
  text-align: left;
  text-transform: none;
  text-shadow: none;
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.apb-root *, .apb-root *::before, .apb-root *::after,
.apb-dialog *, .apb-dialog *::before, .apb-dialog *::after { box-sizing: border-box; }
.apb-root svg, .apb-dialog svg { display: block; flex-shrink: 0; }

/* os botões, sem nada do navegador nem da página */
.apb-root button, .apb-dialog button {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.apb-root button:focus-visible, .apb-dialog button:focus-visible {
  outline: 2px solid var(--apb-ring);
  outline-offset: 2px;
}

/* a caixa */
.apb-root {
  padding: 8px;
  border: 1px solid var(--apb-border);
  border-radius: 24px;
  background: var(--apb-bg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root[data-state] { border-color: color-mix(in oklab, var(--apb-busy) 70%, transparent); }

/* a imagem anexada */
.apb-files { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 0 4px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.apb-file { position: relative; }
.apb-root .apb-file__thumb {
  display: block;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-file__thumb img { display: block; width: 100%; height: 100%; max-width: none; margin: 0; object-fit: cover; }
.apb-root .apb-file__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
}
.apb-file__remove svg { width: 12px; height: 12px; }

/* o texto: cresce com as linhas, até 240 px */
.apb-input { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.apb-input[data-hidden] { height: 0; overflow: hidden; opacity: 0; }
.apb-textarea {
  display: block;
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  outline: none;
  background: transparent;
  box-shadow: none;
  color: var(--apb-text);
  font: inherit;
  letter-spacing: inherit;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
}
.apb-textarea::placeholder { color: var(--apb-placeholder); opacity: 1; }
.apb-textarea:disabled { cursor: not-allowed; opacity: 0.5; }
.apb-textarea::-webkit-scrollbar { width: 6px; }
.apb-textarea::-webkit-scrollbar-track { background: transparent; }
.apb-textarea::-webkit-scrollbar-thumb { background-color: #444444; border-radius: 3px; }
.apb-textarea::-webkit-scrollbar-thumb:hover { background-color: #555555; }

/* a fileira de baixo: o clipe e os modos à esquerda, o botão redondo à direita */
.apb-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 0 0; }
.apb-tools { display: flex; align-items: center; gap: 4px; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.apb-tools[data-hidden] { height: 0; opacity: 0; visibility: hidden; }
.apb-root .apb-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--apb-icon);
  transition: color 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root .apb-icon-btn:hover { background: var(--apb-hover-bg); color: var(--apb-icon-hover); }
.apb-icon-btn svg { width: 20px; height: 20px; }

/* os modos: só o ícone desligados; ligados, na cor deles, com o nome ao lado */
.apb-modes { display: flex; align-items: center; }
.apb-mode[data-mode="search"] { --apb-mode: var(--apb-search); }
.apb-mode[data-mode="think"] { --apb-mode: var(--apb-think); }
.apb-mode[data-mode="canvas"] { --apb-mode: var(--apb-canvas); }
.apb-root .apb-mode {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--apb-icon);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root .apb-mode:hover { color: var(--apb-icon-hover); }
.apb-root .apb-mode[data-active] {
  border-color: var(--apb-mode);
  background: color-mix(in srgb, var(--apb-mode) 15%, transparent);
  color: var(--apb-mode);
}
.apb-mode__icon { display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 20px; height: 20px; }
.apb-mode__glyph { display: block; }
.apb-mode__glyph svg { width: 16px; height: 16px; }
.apb-mode__label { display: block; flex-shrink: 0; overflow: hidden; font-size: 12px; line-height: 16px; white-space: nowrap; }
.apb-divider { position: relative; display: block; width: 1.5px; height: 24px; margin: 0 4px; }
.apb-divider > span {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, color-mix(in oklab, var(--apb-divider) 70%, transparent) 50%, rgba(0, 0, 0, 0) 100%);
  clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%);
}

/* o botão redondo: microfone, enviar, parar a gravação ou parar a resposta */
.apb-root .apb-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--apb-button);
  color: var(--apb-button-icon);
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-root .apb-send:hover { background: color-mix(in oklab, var(--apb-button) 80%, transparent); }
.apb-root .apb-send:disabled { opacity: 0.5; pointer-events: none; }
.apb-send svg { width: 20px; height: 20px; }
.apb-send[data-state="send"] svg { width: 16px; height: 16px; }
.apb-send[data-state="recording"] { color: var(--apb-busy); }
.apb-send[data-state="loading"] svg {
  width: 16px;
  height: 16px;
  color: #000000;
  fill: var(--apb-button-icon);
  animation: apb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* a gravação de mentira */
.apb-recorder { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 12px 0; }
.apb-recorder__time { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; }
.apb-recorder__dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--apb-busy);
  animation: apb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.apb-recorder__clock {
  color: rgba(255, 255, 255, 0.8);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  line-height: 20px;
}
.apb-recorder__bars { display: flex; align-items: center; justify-content: center; gap: 2px; width: 100%; height: 40px; padding: 0 16px; }
.apb-recorder__bar {
  display: block;
  width: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  animation: apb-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes apb-pulse { 50% { opacity: 0.5; } }

/* os balões, 4 px acima do botão */
.apb-tip-anchor { position: relative; display: inline-flex; }
.apb-tip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  z-index: 50;
  width: max-content;
  padding: 6px 12px;
  border: 1px solid var(--apb-tip-border);
  border-radius: 8px;
  background: var(--apb-tip-bg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  color: var(--apb-tip-text);
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  pointer-events: none;
}

/* a imagem em tela cheia */
.apb-dialog {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #ffffff;
  animation: apb-fade-in 0.15s ease;
}
.apb-dialog:not([open]) { display: none; }
.apb-dialog::backdrop { background: transparent; }
/* no centro da tela, pelo top e left em 50% e o translate */
.apb-dialog__content {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: 100%;
  max-width: 90vw;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  animation: apb-zoom-in 0.3s ease;
}
@media (min-width: 768px) {
  .apb-dialog__content { max-width: 800px; }
}
.apb-dialog__frame {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: var(--apb-bg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.apb-dialog__img { display: block; width: 100%; max-width: none; max-height: 80vh; margin: 0; border-radius: 16px; object-fit: contain; }
.apb-dialog .apb-dialog__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  padding: 8px;
  border-radius: 999px;
  background: rgba(46, 48, 51, 0.8);
  color: oklch(92.8% 0.006 264.531);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.apb-dialog .apb-dialog__close:hover { background: #2e3033; color: #ffffff; }
.apb-dialog__close svg { width: 20px; height: 20px; }
@keyframes apb-fade-in { from { opacity: 0; } }
@keyframes apb-zoom-in { from { opacity: 0; scale: 0.95; } }

@media (prefers-reduced-motion: reduce) {
  .apb-recorder__dot, .apb-recorder__bar, .apb-send[data-state="loading"] svg, .apb-dialog, .apb-dialog__content { animation: none; }
}
`
