import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { palette } from './palette.js'
import type { InkName } from './palette.js'

const stylesheet = readFileSync(fileURLToPath(new URL('./global.css', import.meta.url)), 'utf8')

const PROPERTIES: readonly (readonly [InkName, string])[] = [
  ['ink', '--ink'],
  ['inkSoft', '--ink-soft'],
  ['rule', '--rule'],
  ['trouble', '--mark-trouble'],
]

describe('palette', () => {
  // A drawn outline cannot read a custom property, so these values live in two
  // places. This is what stops them drifting apart unnoticed.
  it.each(PROPERTIES)('agrees with the stylesheet about %s', (name, property) => {
    expect(stylesheet).toContain(`${property}: ${palette[name]};`)
  })
})
