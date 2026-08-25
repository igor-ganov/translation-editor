import { describe, expect, it } from 'vitest'
import { editorRows } from './editor-rows.js'
import { buildProject, edited, entry, failed, machine } from '../../../tests/support/build-project.js'

const source = 'One thing happened. Then another.'
const rows = (project: ReturnType<typeof buildProject>, filter: Parameters<ReturnType<typeof editorRows>>[0], collapsed: readonly string[] = []) =>
  editorRows(project)(filter, new Set(collapsed))

describe('editorRows', () => {
  const project = buildProject({
    blocks: [{ text: source }, { text: 'Alone here.' }],
    entries: { 'b0.s0': entry(machine('Одно.')) },
  })

  it('lists a paragraph header followed by its sentences, in order', () => {
    expect(rows(project, 'all').map((row) => row.id)).toStrictEqual(['b0', 'b0.s0', 'b0.s1', 'b1', 'b1.s0'])
  })

  it('hides the sentences of a collapsed paragraph but keeps its header', () => {
    expect(rows(project, 'all', ['b0']).map((row) => row.id)).toStrictEqual(['b0', 'b1', 'b1.s0'])
  })

  it('omits non-translatable paragraphs entirely', () => {
    const withEmpty = buildProject({ blocks: [{ text: '', translatable: false }, { text: 'Alone.' }] })
    expect(rows(withEmpty, 'all').map((row) => row.id)).toStrictEqual(['b1', 'b1.s0'])
  })

  it('marks a paragraph that overrides its sentences, and marks those sentences superseded', () => {
    const overridden = buildProject({
      blocks: [{ text: source }],
      entries: { b0: entry(edited('Слитно.')), 'b0.s0': entry(machine('Одно.')) },
    })
    const [header, first] = rows(overridden, 'all')
    expect(header?.tag === 'block' && header.overriding).toBe(true)
    expect(first?.tag === 'sentence' && first.superseded).toBe(true)
  })

  it('filters to untranslated sentences and drops paragraphs with none', () => {
    expect(rows(project, 'untranslated').map((row) => row.id)).toStrictEqual(['b0', 'b0.s1', 'b1', 'b1.s0'])
  })

  it('filters to failed sentences only', () => {
    const withFailure = buildProject({
      blocks: [{ text: source }, { text: 'Alone here.' }],
      entries: { 'b0.s1': entry(failed('429')) },
    })
    expect(rows(withFailure, 'failed').map((row) => row.id)).toStrictEqual(['b0', 'b0.s1'])
  })

  it('filters to unapproved sentences', () => {
    const partly = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('Одно.'), true), 'b0.s1': entry(machine('Другое.'), false) },
    })
    expect(partly.source[0]?.sentences).toHaveLength(2)
    expect(rows(partly, 'unapproved').map((row) => row.id)).toStrictEqual(['b0', 'b0.s1'])
  })

  it('carries each sentence its own source text', () => {
    const sentences = rows(project, 'all').filter((row) => row.tag === 'sentence')
    expect(sentences.map((row) => row.source)).toStrictEqual([
      'One thing happened.',
      'Then another.',
      'Alone here.',
    ])
  })

  it('reports how many sentences a paragraph header stands for', () => {
    const [header] = rows(project, 'all')
    expect(header?.tag === 'block' && header.sentenceCount).toBe(2)
  })
})
