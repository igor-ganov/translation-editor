// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { parseDocx } from './parse-docx.js'
import { italianFixture, italianParagraphs } from '../../../tests/support/italian-fixture.js'

const parse = async () => await Effect.runPromise(parseDocx('it')(await italianFixture()))

const allSentences = async () => {
  const blocks = await parse()
  return blocks.flatMap((block) =>
    block.sentences.map((sentence) => block.text.slice(sentence.start, sentence.end).trim()),
  )
}

describe('segmenting Italian punctuation', () => {
  it('keeps every paragraph and marks the empty one untranslatable', async () => {
    const blocks = await parse()
    expect(blocks).toHaveLength(italianParagraphs.length + 1)
    expect(blocks.filter((block) => block.translatable)).toHaveLength(italianParagraphs.length)
  })

  it('keeps a guillemet quotation together with the attribution that follows it', async () => {
    expect(await allSentences()).toContain(
      '«Senza teoria rivoluzionaria non c’è movimento rivoluzionario», recita l’assioma citato dal Dott. Bianchi in apertura.',
    )
  })

  it('does not split inside a nested curly quotation', async () => {
    expect(await allSentences()).toContain(
      'Il pensiero corrente attribuisce le crisi a “shock esterni”, ma il Sig. Rossi obietta che la causa è interna al sistema.',
    )
  })

  it('does not split on a decimal or on a trailing abbreviation', async () => {
    const sentences = await allSentences()
    expect(sentences).toContain('Il saggio di profitto scende al 3.14 per cento.')
    expect(sentences).toContain('Nessuna riforma lo risolleva, ecc.')
  })

  it('does split a paragraph that genuinely holds two sentences', async () => {
    const sentences = await allSentences()
    expect(sentences).toContain('Nell’epoca dell’automazione, il paradosso resta immutato.')
    expect(sentences).toContain('Il capitale eccedente e la popolazione eccedente convivono.')
  })

  it('tiles each paragraph exactly, so the source can always be rebuilt', async () => {
    for (const block of await parse()) {
      const rebuilt = block.sentences.map((s) => block.text.slice(s.start, s.end)).join('')
      expect(rebuilt).toBe(block.sentences.length === 0 ? '' : block.text)
    }
  })
})
