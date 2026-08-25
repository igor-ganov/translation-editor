import { describe, expect, it } from 'vitest'
import { Brand, Either } from 'effect'
import type { SegmentId } from '../document/types.js'
import { diffImport } from './diff-import.js'
import { applyImport } from './apply-import.js'
import { parseMarkup } from './parse-markup.js'
import { serialiseMarkup } from './serialise-markup.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const source = 'One thing happened. Then another.'

const project = buildProject({
  blocks: [{ text: source }],
  entries: { 'b0.s0': entry(machine('Первое.'), true), 'b0.s1': entry(machine('Второе.')) },
})

const file = (body: string) =>
  Either.getOrThrow(parseMarkup(`#!translation-editor v1\n#!doc hash-fixture\n#!lang en>ru\n#!kind translation\n\n${body}`))

describe('diffImport', () => {
  it('separates added, changed and unchanged segments', () => {
    const diff = diffImport(project)(file('⟦b0⟧A whole paragraph.\n⟦b0.s0⟧Первое.\n⟦b0.s1⟧Изменённое.\n'))
    expect(diff.added).toStrictEqual([id('b0')])
    expect(diff.changed).toStrictEqual([id('b0.s1')])
    expect(diff.unchanged).toStrictEqual([id('b0.s0')])
  })

  it('counts unknown ids without applying them', () => {
    const diff = diffImport(project)(file('⟦b9.s9⟧Ghost.\n'))
    expect(diff.unknownIds).toStrictEqual([id('b9.s9')])
    expect(diff.added).toStrictEqual([])
  })

  it('counts ids the file failed to mention', () => {
    const diff = diffImport(project)(file('⟦b0.s0⟧Первое.\n'))
    expect(diff.missingIds).toStrictEqual([id('b0'), id('b0.s1')])
  })

  it('treats an empty incoming value as not supplied, not as an erasure', () => {
    const diff = diffImport(project)(file('⟦b0.s0⟧\n⟦b0.s1⟧\n'))
    expect(diff.changed).toStrictEqual([])
    expect(diff.unchanged).toStrictEqual([id('b0.s0'), id('b0.s1')])
  })

  it('warns which approvals a change would cost', () => {
    const diff = diffImport(project)(file('⟦b0.s0⟧Другое.\n⟦b0.s1⟧Тоже другое.\n'))
    expect(diff.changed).toStrictEqual([id('b0.s0'), id('b0.s1')])
    expect(diff.approvalsToClear).toStrictEqual([id('b0.s0')])
  })

  it('flags a file belonging to a different document', () => {
    const foreign = Either.getOrThrow(
      parseMarkup('#!translation-editor v1\n#!doc other\n#!lang en>ru\n#!kind translation\n\n⟦b0.s0⟧x\n'),
    )
    expect(diffImport(project)(foreign).documentMatches).toBe(false)
    expect(diffImport(project)(file('⟦b0.s0⟧x\n')).documentMatches).toBe(true)
  })
})

describe('applyImport', () => {
  it('writes added and changed segments as user-authored text', () => {
    const next = applyImport(project)(file('⟦b0.s1⟧Изменённое.\n'))
    expect(next.entries.get(id('b0.s1'))?.translation).toStrictEqual({ tag: 'edited', text: 'Изменённое.' })
  })

  it('clears approval on segments it changed', () => {
    const next = applyImport(project)(file('⟦b0.s0⟧Другое.\n'))
    expect(next.entries.get(id('b0.s0'))?.approved).toBe(false)
  })

  it('leaves approval alone on segments it did not change', () => {
    const next = applyImport(project)(file('⟦b0.s1⟧Изменённое.\n'))
    expect(next.entries.get(id('b0.s0'))?.approved).toBe(true)
  })

  it('ignores unknown ids entirely', () => {
    const next = applyImport(project)(file('⟦b9.s9⟧Ghost.\n'))
    expect(next.entries.has(id('b9.s9'))).toBe(false)
  })

  it('leaves the source document untouched', () => {
    expect(applyImport(project)(file('⟦b0.s1⟧x\n')).source).toStrictEqual(project.source)
  })

  it('round-trips: exporting then importing changes nothing', () => {
    const exported = Either.getOrThrow(parseMarkup(serialiseMarkup(project)('translation')))
    const diff = diffImport(project)(exported)
    expect(diff.added).toStrictEqual([])
    expect(diff.changed).toStrictEqual([])
  })
})
