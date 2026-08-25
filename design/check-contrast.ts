/**
 * Measures every ink colour against the paper.
 *
 * Written because a review found the marker for "not translated yet" — the most
 * load-bearing state in the editor — sitting at 2.8:1, which is unreadable for
 * a lot of people and was judged by eye rather than measured.
 */
const channel = (value: number): number => {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string): number => {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  const r = channel((n >> 16) & 255)
  const g = channel((n >> 8) & 255)
  const b = channel(n & 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const ratio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

const paper = process.env['PAPER'] ?? '#f7f4ec'

const inks: Readonly<Record<string, string>> = {
  '--ink': '#211d17',
  '--ink-soft': '#5a5347',
  '--ink-faint': '#6f6759',
  '--mark-untouched': '#6b6455',
  '--mark-machine': '#4a6fa5',
  '--mark-hand': '#8a5a1e',
  '--mark-settled': '#3c6b42',
  '--mark-trouble': '#a33a2a',
}

process.stdout.write(`against ${paper}\n\n`)
for (const [name, hex] of Object.entries(inks)) {
  const value = ratio(paper, hex)
  const verdict = value >= 4.5 ? 'AA' : value >= 3 ? 'large text only' : 'FAILS'
  process.stdout.write(`${name.padEnd(18)} ${hex}  ${value.toFixed(2).padStart(6)}:1  ${verdict}\n`)
}
