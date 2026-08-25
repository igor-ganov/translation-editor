import { describe, expect, it } from 'vitest'
import { Brand } from 'effect'
import type { SegmentId } from '../document/types.js'
import { makeBlockId } from '../document/make-block-id.js'
import type { Project } from '../project/types.js'
import { mergeWithNext } from './merge-with-next.js'
import { splitSentence } from './split-sentence.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const source = 'One thing happened. Then another. And a third!'
const block = (project: Project) => project.source[0]
const sentences = (project: Project) => block(project)?.sentences ?? []
const sliced = (project: Project) =>
  sentences(project).map((s) => block(project)?.text.slice(s.start, s.end) ?? '')

/** The invariant that makes source text safe to treat as immutable. */
const expectRebuildsSource = (project: Project) => {
  expect(sliced(project).join('')).toBe(block(project)?.text)
}

const base = () =>
  buildProject({
    blocks: [{ text: source }],
    entries: {
      'b0.s0': entry(machine('Одно случилось.'), true),
      'b0.s1': entry(machine('Потом другое.'), true),
      'b0.s2': entry(machine('И третье!'), true),
    },
  })

describe('mergeWithNext', () => {
  it('joins a sentence with the one after it', () => {
    const merged = mergeWithNext(base())(id('b0.s0'))
    expect(sliced(merged)).toStrictEqual(['One thing happened. Then another. ', 'And a third!'])
  })

  it('concatenates the two translations in order', () => {
    const merged = mergeWithNext(base())(id('b0.s0'))
    expect(merged.entries.get(id('b0.s0'))?.translation).toStrictEqual({
      tag: 'edited',
      text: 'Одно случилось. Потом другое.',
    })
  })

  it('clears approval on the merged sentence', () => {
    expect(mergeWithNext(base())(id('b0.s0')).entries.get(id('b0.s0'))?.approved).toBe(false)
  })

  it('retires the absorbed sentence and its entry', () => {
    const merged = mergeWithNext(base())(id('b0.s0'))
    expect(sentences(merged).map((s) => s.id)).toStrictEqual(['b0.s0', 'b0.s2'])
    expect(merged.entries.has(id('b0.s1'))).toBe(false)
  })

  it('is a no-op on the last sentence, which has nothing to merge with', () => {
    const merged = mergeWithNext(base())(id('b0.s2'))
    expect(sentences(merged).map((s) => s.id)).toStrictEqual(['b0.s0', 'b0.s1', 'b0.s2'])
  })

  it('is a no-op for an unknown sentence id', () => {
    expect(sentences(mergeWithNext(base())(id('b0.s9')))).toHaveLength(3)
  })

  it('preserves the source text exactly', () => {
    expectRebuildsSource(mergeWithNext(base())(id('b0.s0')))
  })
})

describe('splitSentence', () => {
  it('splits at the given offset into the block text', () => {
    const split = splitSentence(base())(id('b0.s0'))(4)
    expect(sliced(split).slice(0, 2)).toStrictEqual(['One ', 'thing happened. '])
  })

  it('gives the whole existing translation to the first half and leaves the second empty', () => {
    const split = splitSentence(base())(id('b0.s0'))(4)
    expect(split.entries.get(id('b0.s0'))?.translation).toStrictEqual({
      tag: 'machine',
      text: 'Одно случилось.',
    })
    expect(split.entries.get(id('b0.s3'))?.translation).toStrictEqual({ tag: 'absent' })
  })

  it('clears approval on both halves', () => {
    const split = splitSentence(base())(id('b0.s0'))(4)
    expect(split.entries.get(id('b0.s0'))?.approved).toBe(false)
    expect(split.entries.get(id('b0.s3'))?.approved).toBe(false)
  })

  it('allocates a fresh ordinal rather than reusing a position', () => {
    const split = splitSentence(base())(id('b0.s0'))(4)
    expect(sentences(split).map((s) => s.id)).toStrictEqual(['b0.s0', 'b0.s3', 'b0.s1', 'b0.s2'])
    expect(split.nextSentenceOrdinal.get(makeBlockId(0))).toBe(4)
  })

  it('never reissues a retired id', () => {
    const merged = mergeWithNext(base())(id('b0.s0'))
    const split = splitSentence(merged)(id('b0.s0'))(4)
    expect(sentences(split).map((s) => s.id)).not.toContain('b0.s1')
  })

  it.each([0, 20, 45, -1, 999])('is a no-op at a non-interior offset %i', (offset) => {
    expect(sentences(splitSentence(base())(id('b0.s0'))(offset))).toHaveLength(3)
  })

  it('preserves the source text exactly', () => {
    expectRebuildsSource(splitSentence(base())(id('b0.s0'))(4))
  })
})

describe('merge and split invariants', () => {
  /** Deterministic pseudo-random walk: every sequence must rebuild the source. */
  const nextSeed = (seed: number) => (seed * 1103515245 + 12345) % 2147483648

  it('rebuilds the source text after any sequence of merges and splits', () => {
    const walk = Array.from({ length: 60 }).reduce<{ project: Project; seed: number }>(
      (state) => {
        const seed = nextSeed(state.seed)
        const list = sentences(state.project)
        const target = list[seed % Math.max(list.length, 1)]
        const project = ((): Project => {
          switch (seed % 2) {
            case 0:
              return mergeWithNext(state.project)(target?.id ?? id('b0.s0'))
            default:
              return splitSentence(state.project)(target?.id ?? id('b0.s0'))(
                (target?.start ?? 0) + 1 + (seed % 5),
              )
          }
        })()
        expectRebuildsSource(project)
        return { project, seed }
      },
      { project: base(), seed: 7 },
    )
    expect(sentences(walk.project).length).toBeGreaterThan(0)
  })

  it('has unique sentence ids after any sequence', () => {
    const once = splitSentence(mergeWithNext(base())(id('b0.s0')))(id('b0.s0'))(4)
    const ids = sentences(once).map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
