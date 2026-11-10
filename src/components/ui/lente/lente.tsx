// @ts-nocheck -- ProfitizeBuild file kept verbatim; it predates this repo's noUncheckedIndexedAccess.
'use client'

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { mountLente, type LenteOptions } from './lente-shader'

type Props = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & LenteOptions

/**
 * A marca revelada por uma gota de vidro. O canvas preenche o div inteiro e o ladrilho fica no meio, então o tamanho
 * vem do className ou do style: dê largura e altura ao bloco. O resto é do lente-shader.ts. O clique toca de novo.
 */
export function Lente({ logo, look, background, logoColor, plateColor, iconPlate, keepPlate, originalColors, tileSize, logoScale, finalScale, logoOffset, loop, hold, speed, time, tuning, label = 'Vedra', ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const lente = useRef<ReturnType<typeof mountLente> | null>(null)
  // As opções passam por JSON: objetos e listas escritos no JSX não refazem nada a cada render.
  const key = JSON.stringify({ logo, look, background, logoColor, plateColor, iconPlate, keepPlate, originalColors, tileSize, logoScale, finalScale, logoOffset, loop, hold, speed, time, tuning, label })
  const first = useRef(key)

  useEffect(() => {
    const l = mountLente(ref.current!, JSON.parse(first.current) as LenteOptions)
    lente.current = l
    return () => {
      lente.current = null
      l.destroy()
    }
  }, [])

  useEffect(() => {
    lente.current?.update(JSON.parse(key) as LenteOptions)
  }, [key])

  return <div ref={ref} role="img" aria-label={label} {...props} />
}
