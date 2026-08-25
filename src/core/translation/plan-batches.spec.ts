import { describe, expect, it } from 'vitest'
import { Brand, Either } from 'effect'
import type { SegmentId } from '../document/types.js'
import { selectUntranslated } from './select-untranslated.js'
import { planBatches } from './plan-batches.js'
import { reconcileBatch } from './reconcile-batch.js'
import { absent, buildProject, edited, entry, failed, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const source = 'One thing happened. Then another.'

describe('selectUntranslated', () => {
  it('selects sentences with no translation', () => {
    const project = buildProject({ blocks: [{ text: source }] })
    expect(selectUntranslated(project).map((s) => s.id)).toStrictEqual([id('b0.s0'), id('b0.s1')])
  })

  it('selects a failed sentence so it can be retried', () => {
    const project = buildProject({ blocks: [{ text: source }], entries: { 'b0.s0': entry(failed('429')) } })
    expect(selectUntranslated(project).map((s) => s.id)).toStrictEqual([id('b0.s0'), id('b0.s1')])
  })

  it('never selects an edited sentence, so the user is not overwritten', () => {
    const project = buildProject({ blocks: [{ text: source }], entries: { 'b0.s0': entry(edited('mine')) } })
    expect(selectUntranslated(project).map((s) => s.id)).toStrictEqual([id('b0.s1')])
  })

  it('never selects an approved sentence', () => {
    const project = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('done'), true), 'b0.s1': entry(absent, false) },
    })
    expect(selectUntranslated(project).map((s) => s.id)).toStrictEqual([id('b0.s1')])
  })

  it('skips non-translatable blocks', () => {
    const project = buildProject({ blocks: [{ text: '', translatable: false }, { text: 'Alone.' }] })
    expect(selectUntranslated(project).map((s) => s.id)).toStrictEqual([id('b1.s0')])
  })

  it('carries the source text of each sentence', () => {
    const project = buildProject({ blocks: [{ text: source }] })
    expect(selectUntranslated(project).map((s) => s.text)).toStrictEqual([
      'One thing happened.',
      'Then another.',
    ])
  })
})

describe('planBatches', () => {
  const pending = selectUntranslated(
    buildProject({ blocks: [{ text: source }, { text: 'Third one here.' }] }),
  )

  it('packs several paragraphs into one batch when they fit', () => {
    const batches = planBatches(10_000)(pending)
    expect(batches).toHaveLength(1)
    expect(batches[0]?.sentences).toHaveLength(3)
  })

  it('never splits a paragraph across two batches', () => {
    const batches = planBatches(6)(pending)
    for (const batch of batches) {
      expect(new Set(batch.sentences.map((s) => s.blockId)).size).toBe(1)
    }
  })

  it('gives an oversized paragraph its own batch rather than dropping it', () => {
    const huge = selectUntranslated(buildProject({ blocks: [{ text: 'x'.repeat(4000) + '.' }] }))
    const batches = planBatches(10)(huge)
    expect(batches).toHaveLength(1)
    expect(batches[0]?.sentences).toHaveLength(1)
  })

  it('produces no batches for no work', () => {
    expect(planBatches(1000)([])).toStrictEqual([])
  })
})

describe('reconcileBatch', () => {
  const requested = [id('b0.s0'), id('b0.s1')]

  it('accepts a reply covering exactly the requested ids', () => {
    const result = reconcileBatch(requested)([
      { id: 'b0.s0', text: 'Одно.' },
      { id: 'b0.s1', text: 'Другое.' },
    ])
    expect(Either.getOrThrow(result).get(id('b0.s0'))).toBe('Одно.')
  })

  it('rejects the whole batch when a segment is missing', () => {
    const result = reconcileBatch(requested)([{ id: 'b0.s0', text: 'Одно.' }])
    expect(Either.flip(result).pipe(Either.getOrThrow)).toStrictEqual({
      tag: 'idMismatch', missing: ['b0.s1'], unexpected: [],
    })
  })

  it('rejects the whole batch when the model invents an id', () => {
    const result = reconcileBatch(requested)([
      { id: 'b0.s0', text: 'a' },
      { id: 'b0.s1', text: 'b' },
      { id: 'b0.s9', text: 'ghost' },
    ])
    expect(Either.flip(result).pipe(Either.getOrThrow)).toStrictEqual({
      tag: 'idMismatch', missing: [], unexpected: ['b0.s9'],
    })
  })

  it('rejects a reply that merged two segments into one', () => {
    const result = reconcileBatch(requested)([{ id: 'b0.s0', text: 'Одно. Другое.' }])
    expect(Either.isLeft(result)).toBe(true)
  })
})
