import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { UI_PALETTE } from '../src/shared/config/theme/palette.ts'

const target = fileURLToPath(new URL('../src/shared/config/theme/palette.css', import.meta.url))

const toChannels = (hex) => {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? [...value].map((part) => part + part).join('') : value
  return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16)).join(' ')
}

const entries = Object.entries(UI_PALETTE)
if (entries.length === 0) throw new Error('UI_PALETTE is empty')

const lines = entries.map(([name, hex]) => `    --palette-${name}: ${toChannels(hex)};`)

writeFileSync(target, `@layer tokens {\n  :root {\n${lines.join('\n')}\n  }\n}\n`)

console.log(`generated ${entries.length} palette tokens -> ${target}`)
