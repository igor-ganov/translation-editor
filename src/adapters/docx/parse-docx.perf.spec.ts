// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { parseDocx } from './parse-docx.js'
import { makeDocx, paragraph, run } from '../../../tests/support/make-docx.js'

const BLOCKS = 2000
const SENTENCES_PER_BLOCK = 10

/** A document at the size the requirements name: 2 000 paragraphs, 20 000 sentences. */
const largeBody = Array.from({ length: BLOCKS }, (_unused, index) =>
  paragraph(
    run(
      Array.from(
        { length: SENTENCES_PER_BLOCK },
        (_ignored, sentence) => `Paragraph ${String(index)} sentence ${String(sentence)} says something.`,
      ).join(' '),
    ),
  ),
).join('')

describe('parsing a large document', () => {
  it('parses and segments 2000 paragraphs within the time budget', { timeout: 120_000 }, async () => {
      const bytes = await makeDocx(largeBody)
      const started = performance.now()
      const blocks = await Effect.runPromise(parseDocx('en')(bytes))
      const elapsed = performance.now() - started

      expect(blocks).toHaveLength(BLOCKS)
      expect(blocks.flatMap((block) => block.sentences)).toHaveLength(BLOCKS * SENTENCES_PER_BLOCK)
      // The requirement allows 10s on a mid-range phone; a desktop CI machine
      // should be comfortably inside that, and a regression here is the signal.
      expect(elapsed).toBeLessThan(10_000)
  })
})
