// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { buildDocx } from './build-docx.js'
import { parseDocx } from './parse-docx.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer())

const roundTrip = async (project: ReturnType<typeof buildProject>, mode: 'all' | 'approvedOnly') => {
  const blob = await Effect.runPromise(buildDocx(project)(mode))
  return await Effect.runPromise(parseDocx('ru')(await bytesOf(blob)))
}

describe('buildDocx', () => {
  it('produces a package that parses back with the same paragraph order', async () => {
    const project = buildProject({
      blocks: [{ text: 'One thing happened.' }, { text: 'Then another.' }],
      entries: { 'b0.s0': entry(machine('Одно случилось.')), 'b1.s0': entry(machine('Потом другое.')) },
    })
    const blocks = await roundTrip(project, 'all')
    expect(blocks.map((block) => block.text)).toStrictEqual(['Одно случилось.', 'Потом другое.'])
  })

  it('preserves heading levels through the round trip', async () => {
    const project = buildProject({
      blocks: [{ text: 'Title', kind: { tag: 'heading', level: 2 } }],
      entries: { 'b0.s0': entry(machine('Заголовок')) },
    })
    expect((await roundTrip(project, 'all')).map((block) => block.kind)).toStrictEqual([
      { tag: 'heading', level: 2 },
    ])
  })

  it('preserves list items and their depth', async () => {
    const project = buildProject({
      blocks: [
        { text: 'Top', kind: { tag: 'listItem', ordered: false, depth: 0 } },
        { text: 'Nested', kind: { tag: 'listItem', ordered: false, depth: 1 } },
      ],
      entries: { 'b0.s0': entry(machine('Верх')), 'b1.s0': entry(machine('Вложенный')) },
    })
    const blocks = await roundTrip(project, 'all')
    expect(blocks.map((block) => block.kind)).toStrictEqual([
      { tag: 'listItem', ordered: true, depth: 0 },
      { tag: 'listItem', ordered: true, depth: 1 },
    ])
  })

  it('rebuilds a table with its grid intact', async () => {
    const project = buildProject({
      blocks: [
        { text: 'A1', kind: { tag: 'tableCell', row: 0, column: 0 } },
        { text: 'B1', kind: { tag: 'tableCell', row: 0, column: 1 } },
        { text: 'A2', kind: { tag: 'tableCell', row: 1, column: 0 } },
        { text: 'B2', kind: { tag: 'tableCell', row: 1, column: 1 } },
      ],
    })
    const blocks = await roundTrip(project, 'all')
    expect(blocks.map((block) => block.kind)).toStrictEqual([
      { tag: 'tableCell', row: 0, column: 0 },
      { tag: 'tableCell', row: 0, column: 1 },
      { tag: 'tableCell', row: 1, column: 0 },
      { tag: 'tableCell', row: 1, column: 1 },
    ])
    expect(blocks.map((block) => block.text)).toStrictEqual(['A1', 'B1', 'A2', 'B2'])
  })

  it('emits source text for untranslated paragraphs rather than dropping them', async () => {
    const project = buildProject({ blocks: [{ text: 'Untranslated paragraph.' }] })
    expect((await roundTrip(project, 'all')).map((block) => block.text)).toStrictEqual([
      'Untranslated paragraph.',
    ])
  })

  it('emits source text for unapproved paragraphs in approved-only mode', async () => {
    const project = buildProject({
      blocks: [{ text: 'One thing happened.' }],
      entries: { 'b0.s0': entry(machine('Одно случилось.'), false) },
    })
    expect((await roundTrip(project, 'approvedOnly')).map((block) => block.text)).toStrictEqual([
      'One thing happened.',
    ])
  })

  it('encodes Cyrillic and accented Latin text correctly', async () => {
    const project = buildProject({
      blocks: [{ text: 'a' }, { text: 'b' }],
      entries: { 'b0.s0': entry(machine('Ёжик, ЩЁЛК!')), 'b1.s0': entry(machine('Perché è così')) },
    })
    expect((await roundTrip(project, 'all')).map((block) => block.text)).toStrictEqual([
      'Ёжик, ЩЁЛК!',
      'Perché è così',
    ])
  })
})
