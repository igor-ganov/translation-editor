import { describe, expect, it } from 'vitest'
import { Brand } from 'effect'
import type { Block, SegmentId } from '../document/types.js'
import { makeBlockId } from '../document/make-block-id.js'
import { canApprove } from './can-approve.js'
import { deriveBlockApproval } from './derive-block-approval.js'
import { setBlockApproval } from './set-block-approval.js'
import { blockUnits } from './block-units.js'
import { projectProgress } from './project-progress.js'
import { absent, buildProject, edited, entry, failed, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const twoSentences = 'The signal was faint. It was unmistakable.'
const b0 = makeBlockId(0)
const firstBlock = (project: ReturnType<typeof buildProject>): Block =>
  project.source[0] ?? { id: b0, kind: { tag: 'paragraph' }, text: '', runs: [], sentences: [], translatable: false }

describe('canApprove', () => {
  it('permits approval only when a usable translation exists', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: {
        'b0.s0': entry(machine('Сигнал.')),
        'b0.s1': entry(absent),
      },
    })
    expect(canApprove(project)(id('b0.s0'))).toBe(true)
    expect(canApprove(project)(id('b0.s1'))).toBe(false)
  })

  it('refuses approval for failed and whitespace-only translations', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { 'b0.s0': entry(failed('429')), 'b0.s1': entry(machine('   ')) },
    })
    expect(canApprove(project)(id('b0.s0'))).toBe(false)
    expect(canApprove(project)(id('b0.s1'))).toBe(false)
  })
})

describe('deriveBlockApproval', () => {
  it('shows a non-overridden block approved once every sentence is approved', () => {
    const partial = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { 'b0.s0': entry(machine('a'), true), 'b0.s1': entry(machine('b'), false) },
    })
    const complete = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { 'b0.s0': entry(machine('a'), true), 'b0.s1': entry(machine('b'), true) },
    })
    expect(deriveBlockApproval(partial)(firstBlock(partial))).toBe(false)
    expect(deriveBlockApproval(complete)(firstBlock(complete))).toBe(true)
  })

  it('derives an overridden block from its own approval, ignoring its sentences', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: {
        b0: entry(edited('Слитно.'), true),
        'b0.s0': entry(machine('a'), false),
        'b0.s1': entry(absent),
      },
    })
    expect(deriveBlockApproval(project)(firstBlock(project))).toBe(true)
  })

  it('is false for a block with nothing translated', () => {
    const project = buildProject({ blocks: [{ text: twoSentences }] })
    expect(deriveBlockApproval(project)(firstBlock(project))).toBe(false)
  })
})

describe('setBlockApproval', () => {
  const base = buildProject({
    blocks: [{ text: twoSentences }],
    entries: { 'b0.s0': entry(machine('a')), 'b0.s1': entry(machine('b')) },
  })

  it('cascades approval to every sentence of a non-overridden block', () => {
    const next = setBlockApproval(base)(b0)(true)
    expect(next.entries.get(id('b0.s0'))?.approved).toBe(true)
    expect(next.entries.get(id('b0.s1'))?.approved).toBe(true)
  })

  it('cascades un-approval symmetrically', () => {
    const approved = setBlockApproval(base)(b0)(true)
    const cleared = setBlockApproval(approved)(b0)(false)
    expect(cleared.entries.get(id('b0.s0'))?.approved).toBe(false)
    expect(cleared.entries.get(id('b0.s1'))?.approved).toBe(false)
  })

  it('never approves a sentence that has no translation', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { 'b0.s0': entry(machine('a')), 'b0.s1': entry(absent) },
    })
    const next = setBlockApproval(project)(b0)(true)
    expect(next.entries.get(id('b0.s0'))?.approved).toBe(true)
    expect(next.entries.get(id('b0.s1'))?.approved).toBe(false)
  })

  it('approves only the block itself when it overrides its sentences', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { b0: entry(edited('Слитно.')), 'b0.s0': entry(machine('a')), 'b0.s1': entry(machine('b')) },
    })
    const next = setBlockApproval(project)(b0)(true)
    expect(next.entries.get(id('b0'))?.approved).toBe(true)
    expect(next.entries.get(id('b0.s0'))?.approved).toBe(false)
  })
})

describe('blockUnits', () => {
  it('counts a non-overridden block by its sentences', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { 'b0.s0': entry(machine('a'), true), 'b0.s1': entry(absent) },
    })
    expect(blockUnits(project)(firstBlock(project))).toStrictEqual({ total: 2, translated: 1, approved: 1 })
  })

  it('counts an overridden block as a single unit', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }],
      entries: { b0: entry(edited('x'), true), 'b0.s0': entry(machine('a')), 'b0.s1': entry(machine('b')) },
    })
    expect(blockUnits(project)(firstBlock(project))).toStrictEqual({ total: 1, translated: 1, approved: 1 })
  })

  it('counts a non-translatable block as nothing', () => {
    const project = buildProject({ blocks: [{ text: '', translatable: false }] })
    expect(blockUnits(project)(firstBlock(project))).toStrictEqual({ total: 0, translated: 0, approved: 0 })
  })
})

describe('projectProgress', () => {
  it('reports zero ratios for a document with nothing translatable, without dividing by zero', () => {
    const project = buildProject({ blocks: [{ text: '', translatable: false }] })
    expect(projectProgress(project)).toStrictEqual({
      total: 0, translated: 0, approved: 0, approvedRatio: 0, coverageRatio: 0,
    })
  })

  it('aggregates across blocks, mixing overridden and plain ones', () => {
    const project = buildProject({
      blocks: [{ text: twoSentences }, { text: 'Alone here.' }],
      entries: {
        b0: entry(edited('x'), true),
        'b0.s0': entry(machine('a')),
        'b1.s0': entry(machine('b'), false),
      },
    })
    expect(projectProgress(project)).toStrictEqual({
      total: 2, translated: 2, approved: 1, approvedRatio: 0.5, coverageRatio: 1,
    })
  })
})
