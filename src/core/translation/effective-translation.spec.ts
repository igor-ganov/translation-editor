import { describe, expect, it } from 'vitest'
import { Option } from 'effect'
import { effectiveTranslation } from './effective-translation.js'
import { translationText } from './translation-text.js'
import { absent, buildProject, edited, entry, failed, machine } from '../../../tests/support/build-project.js'

const twoSentenceBlock = 'The signal was faint. It was unmistakable.'

const effectiveOf = (project: ReturnType<typeof buildProject>) =>
  project.source.map((block) => Option.getOrUndefined(effectiveTranslation(project)(block)))[0]

describe('translationText', () => {
  it('exposes text for machine and edited states', () => {
    expect(translationText(machine('x'))).toStrictEqual(Option.some('x'))
    expect(translationText(edited('y'))).toStrictEqual(Option.some('y'))
  })

  it('treats absent, failed and whitespace-only as no translation', () => {
    expect(translationText(absent)).toStrictEqual(Option.none())
    expect(translationText(failed('rate limited'))).toStrictEqual(Option.none())
    expect(translationText(machine('   '))).toStrictEqual(Option.none())
  })
})

describe('effectiveTranslation', () => {
  it('composes sentence translations in order when there is no block override', () => {
    const project = buildProject({
      blocks: [{ text: twoSentenceBlock }],
      entries: { 'b0.s0': entry(machine('Сигнал был слабым.')), 'b0.s1': entry(machine('Он был безошибочным.')) },
    })
    expect(effectiveOf(project)).toBe('Сигнал был слабым. Он был безошибочным.')
  })

  it('lets a block override win over its sentence translations', () => {
    const project = buildProject({
      blocks: [{ text: twoSentenceBlock }],
      entries: {
        b0: entry(edited('Слабый, но безошибочный сигнал.')),
        'b0.s0': entry(machine('Сигнал был слабым.')),
        'b0.s1': entry(machine('Он был безошибочным.')),
      },
    })
    expect(effectiveOf(project)).toBe('Слабый, но безошибочный сигнал.')
  })

  it('ignores an empty block override and falls back to the sentences', () => {
    const project = buildProject({
      blocks: [{ text: twoSentenceBlock }],
      entries: { b0: entry(machine('   ')), 'b0.s0': entry(machine('Сигнал.')), 'b0.s1': entry(machine('Точно.')) },
    })
    expect(effectiveOf(project)).toBe('Сигнал. Точно.')
  })

  it('keeps sentence translations available so removing the override restores them', () => {
    const withOverride = buildProject({
      blocks: [{ text: twoSentenceBlock }],
      entries: { b0: entry(edited('Слитно.')), 'b0.s0': entry(machine('Сигнал.')), 'b0.s1': entry(machine('Точно.')) },
    })
    const removed = { ...withOverride, entries: new Map([...withOverride.entries].filter(([key]) => key !== 'b0')) }
    expect(effectiveOf(withOverride)).toBe('Слитно.')
    expect(effectiveOf(removed)).toBe('Сигнал. Точно.')
  })

  it('falls back to source text for untranslated sentences when some siblings are translated', () => {
    const project = buildProject({
      blocks: [{ text: twoSentenceBlock }],
      entries: { 'b0.s0': entry(machine('Сигнал был слабым.')) },
    })
    expect(effectiveOf(project)).toBe('Сигнал был слабым. It was unmistakable.')
  })

  it('reports no translation at all when nothing in the block is translated', () => {
    const project = buildProject({ blocks: [{ text: twoSentenceBlock }] })
    expect(effectiveOf(project)).toBeUndefined()
  })

  it('reports no translation for a non-translatable block', () => {
    const project = buildProject({ blocks: [{ text: '', translatable: false }] })
    expect(effectiveOf(project)).toBeUndefined()
  })

  it('does not treat a failed sentence as translated', () => {
    const project = buildProject({
      blocks: [{ text: twoSentenceBlock }],
      entries: { 'b0.s0': entry(failed('429')), 'b0.s1': entry(failed('429')) },
    })
    expect(effectiveOf(project)).toBeUndefined()
  })
})
