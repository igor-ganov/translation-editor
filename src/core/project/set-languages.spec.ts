import { describe, expect, it } from 'vitest'
import { Brand } from 'effect'
import type { SegmentId } from '../document/types.js'
import { setLanguages } from './set-languages.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const id = Brand.nominal<SegmentId>()
const project = buildProject({
  blocks: [{ text: 'One thing. Then another.' }],
  entries: { 'b0.s0': entry(machine('a translation'), true) },
})

describe('setLanguages', () => {
  it('changes the pair a document is translated under', () => {
    expect(setLanguages({ from: 'it', to: 'ru' })(project).languages).toStrictEqual({ from: 'it', to: 'ru' })
  })

  it('keeps every translation already made', () => {
    // The document that prompted this had 73 of them and no way to fix its pair.
    const changed = setLanguages({ from: 'it', to: 'ru' })(project)
    expect(changed.entries.get(id('b0.s0'))?.translation).toStrictEqual({ tag: 'machine', text: 'a translation' })
    expect(changed.entries.get(id('b0.s0'))?.approved).toBe(true)
  })

  it('leaves the sentence boundaries alone, since they may have been set by hand', () => {
    expect(setLanguages({ from: 'it', to: 'ru' })(project).source).toStrictEqual(project.source)
  })
})
