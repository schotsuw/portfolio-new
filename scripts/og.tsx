/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const fontDir = fileURLToPath(new URL('./fonts/', import.meta.url))

// satori does not read woff2, so the build uses the OpenRunde OTF sources.
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 600; style: 'normal' }[]> | undefined
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(`${fontDir}OpenRunde-Regular.otf`),
    readFile(`${fontDir}OpenRunde-Semibold.otf`),
  ]).then(([regular, semibold]) => [
    { name: 'Open Runde', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Open Runde', data: semibold, weight: 600 as const, style: 'normal' as const },
  ])
  return fontsPromise
}

export interface OgInput {
  name: string
  title: string
  tagline: string
}

export async function renderOgPng({ name, title, tagline }: OgInput): Promise<Buffer> {
  const svg = await satori(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        boxSizing: 'border-box',
        background: '#f0f0f0',
        color: '#121212',
        fontFamily: 'Open Runde',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 600 }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#ff6b4a', marginRight: 16 }} />
        {name}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: title.length > 40 ? 64 : 88, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>
          {title}
        </div>
        <div style={{ fontSize: 32, color: '#666666', marginTop: 28, lineHeight: 1.3 }}>{tagline}</div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: await loadFonts() },
  )
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng())
}
