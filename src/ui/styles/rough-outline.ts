import { unsafeCSS } from 'lit'
import type { CSSResult } from 'lit'
import { palette } from './palette.js'
import type { InkName } from './palette.js'

/**
 * Four inked rectangles, none of them straight. Adjacent controls take different
 * ones so the same wobble never repeats down a row and gives the game away.
 */
const HANDS: readonly string[] = [
  'M3.2,4.6 C26,2.4 54,4.3 96.8,3.1 C98.6,13.4 97.9,25.8 97.2,36.2 C69,38.4 33,36.9 3.6,37.9 C1.9,27.1 3.4,14.8 3.2,4.6Z',
  'M2.8,3.4 C31,5.2 61,2.8 97.4,4.2 C98.1,15.6 98.4,26.4 96.9,37.1 C64,35.6 31,38.3 3.1,36.8 C2.2,25.9 1.9,14.3 2.8,3.4Z',
  'M3.6,5.1 C22,3.1 58,2.6 96.4,3.6 C97.9,12.8 98.6,27.4 97.6,36.9 C72,37.9 29,38.1 2.9,37.2 C2.1,26.2 2.4,13.6 3.6,5.1Z',
  'M2.6,4.1 C35,2.9 68,4.8 97.1,3.4 C98.4,14.9 97.6,27.9 96.8,36.6 C61,37.4 28,36.4 3.4,37.6 C2.6,26.8 1.8,13.9 2.6,4.1Z',
]

const drawn = (stroke: InkName, hand: number, fill: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" preserveAspectRatio="none">`
  + `<path d="${HANDS[hand % HANDS.length] ?? ''}" fill="${fill}" stroke="${palette[stroke]}"`
  + ` stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`

const asUrl = (svg: string): CSSResult =>
  unsafeCSS(`url("data:image/svg+xml,${encodeURIComponent(svg)}")`)

export type Body = 'filled' | 'hollow'

const FILLS: Readonly<Record<Body, (stroke: InkName) => string>> = {
  filled: (stroke) => palette[stroke],
  hollow: () => 'none',
}

/**
 * An outline that wanders, as a stretched SVG rather than a live filter.
 *
 * `feTurbulence` behind every control is a full-surface repaint on every scroll
 * frame, which a mid-range phone pays for in dropped frames. This costs one
 * decode and nothing after it, and renders identically in a test browser and on
 * a device. Filling from the same path is what keeps the one committing control
 * from being a printed rectangle among drawn ones.
 */
export const roughOutline = (stroke: InkName, hand: number, body: Body = 'hollow'): CSSResult =>
  asUrl(drawn(stroke, hand, FILLS[body](stroke)))
