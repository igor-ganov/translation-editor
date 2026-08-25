import { describe, expect, it } from 'vitest'
import { Brand } from 'effect'
import type { SegmentId } from '../document/types.js'
import { applyEdit } from './apply-edit.js'
import { absent, buildProject, edited, entry, failed, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const text = 'The signal was faint. It was unmistakable.'

describe('applyEdit', () => {
  it.each([
    ['absent', absent],
    ['machine', machine('previous')],
    ['edited', edited('previous')],
    ['failed', failed('429')],
  ])('replaces a %s translation with an edited one', (_label, previous) => {
    const project = buildProject({ blocks: [{ text }], entries: { 'b0.s0': entry(previous, true) } })
    const next = applyEdit(project)(id('b0.s0'))('новый перевод')
    expect(next.entries.get(id('b0.s0'))?.translation).toStrictEqual({ tag: 'edited', text: 'новый перевод' })
  })

  it('always clears approval, because the approved text no longer exists', () => {
    const project = buildProject({ blocks: [{ text }], entries: { 'b0.s0': entry(machine('a'), true) } })
    expect(applyEdit(project)(id('b0.s0'))('b').entries.get(id('b0.s0'))?.approved).toBe(false)
  })

  it('creates an entry for a segment that had none', () => {
    const project = buildProject({ blocks: [{ text }] })
    const next = applyEdit(project)(id('b0.s1'))('late arrival')
    expect(next.entries.get(id('b0.s1'))).toStrictEqual({
      translation: { tag: 'edited', text: 'late arrival' },
      approved: false,
    })
  })

  it('leaves other entries untouched', () => {
    const project = buildProject({
      blocks: [{ text }],
      entries: { 'b0.s0': entry(machine('a'), true), 'b0.s1': entry(machine('b'), true) },
    })
    const next = applyEdit(project)(id('b0.s0'))('changed')
    expect(next.entries.get(id('b0.s1'))).toStrictEqual(entry(machine('b'), true))
  })
})
