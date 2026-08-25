import { describe, expect, it } from 'vitest'
import { Brand, Option } from 'effect'
import type { SegmentId } from '../document/types.js'
import { editorRows } from './editor-rows.js'
import { nextUnapproved } from './next-unapproved.js'
import { rowIndexOf } from './row-index-of.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const project = buildProject({
  blocks: [{ text: 'One thing happened. Then another.' }, { text: 'Alone here.' }],
  entries: { 'b0.s0': entry(machine('Одно.'), true) },
})
const id = Brand.nominal<SegmentId>()
const rows = editorRows(project)('all', new Set())

describe('nextUnapproved', () => {
  it('skips approved sentences and paragraph headers', () => {
    expect(nextUnapproved(rows)(Option.none())).toStrictEqual(Option.some('b0.s1'))
  })

  it('searches from after the current position', () => {
    const from = rowIndexOf(rows)(id('b0.s1'))
    expect(nextUnapproved(rows)(from)).toStrictEqual(Option.some('b1.s0'))
  })

  it('wraps around rather than stopping at the end', () => {
    const from = rowIndexOf(rows)(id('b1.s0'))
    expect(nextUnapproved(rows)(from)).toStrictEqual(Option.some('b0.s1'))
  })

  it('reports nothing when every sentence is approved', () => {
    const done = buildProject({
      blocks: [{ text: 'Alone here.' }],
      entries: { 'b0.s0': entry(machine('Один.'), true) },
    })
    expect(nextUnapproved(editorRows(done)('all', new Set()))(Option.none())).toStrictEqual(Option.none())
  })
})

describe('rowIndexOf', () => {
  it('finds a shown segment', () => {
    expect(rowIndexOf(rows)(id('b1'))).toStrictEqual(Option.some(3))
  })

  it('reports nothing for a segment that is not currently shown', () => {
    expect(rowIndexOf(rows)(id('b9.s9'))).toStrictEqual(Option.none())
  })
})
