import { describe, expect, it } from 'vitest'
import { estimateOutputTokens } from './estimate-output-tokens.js'
import { outputBudget } from '../../adapters/providers/output-budget.js'
import type { TranslatableSegment } from '../../ports/provider-port.js'
import { defaultSettings } from '../settings/default-settings.js'

/** What the cloud providers are asked for; a non-streaming reply has to fit in it. */
const CEILING = 16_000

const segments = (count: number, length: number): readonly TranslatableSegment[] =>
  Array.from({ length: count }, (_unused, index) => ({
    id: `b0.s${String(index)}`,
    text: 'x'.repeat(length),
  }))

const request = (count: number, length: number) => ({
  segments: segments(count, length),
  from: 'it' as const,
  to: 'ru' as const,
  context: '',
})

describe('estimateOutputTokens', () => {
  it('allows for the translation being longer than its source', () => {
    // 40 chars is ~10 source tokens; a Cyrillic rendering needs well over that.
    expect(estimateOutputTokens(segments(1, 40))).toBeGreaterThan(10)
  })

  it('grows with the amount of text, not just the number of segments', () => {
    expect(estimateOutputTokens(segments(1, 4000))).toBeGreaterThan(estimateOutputTokens(segments(1, 40)))
  })

  it('accounts for the JSON envelope around every segment', () => {
    const many = estimateOutputTokens(segments(50, 20))
    const one = estimateOutputTokens(segments(1, 1000))
    expect(many).toBeGreaterThan(one * 0.5)
  })
})

describe('outputBudget', () => {
  it('never asks for less than a usable floor, however small the batch', () => {
    expect(outputBudget(request(1, 10), 64000)).toBe(4096)
  })

  it('scales with the batch rather than sitting at a constant', () => {
    const small = outputBudget(request(5, 200), 64000)
    const large = outputBudget(request(60, 400), 64000)
    expect(large).toBeGreaterThan(small)
  })

  it('never exceeds what the provider will allow', () => {
    expect(outputBudget(request(500, 2000), 8192)).toBe(8192)
  })

  it('covers a full batch of the default size without reaching the ceiling', () => {
    // Two failures meet here. A reply cut off mid-JSON is rejected whole, which
    // is one way 117 sentences became 73 translated and 44 failed; and asking a
    // non-streaming request for an enormous reply is the documented way to have
    // it refused outright. The batch size and the ceiling have to be set together.
    const wholeBatch = request(60, defaultSettings.batchTokens * 4 / 60)
    const budget = outputBudget(wholeBatch, CEILING)
    expect(budget).toBeGreaterThan(estimateOutputTokens(wholeBatch.segments) * 0.99)
    expect(budget).toBeLessThan(CEILING)
  })
})
