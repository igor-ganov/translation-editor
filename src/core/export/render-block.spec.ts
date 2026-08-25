import { describe, expect, it } from 'vitest'
import { renderBlock } from './render-block.js'
import { exportReport } from './export-report.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const source = 'One thing happened. Then another.'
const rendered = (project: ReturnType<typeof buildProject>, mode: 'all' | 'approvedOnly') =>
  project.source.map((block) => renderBlock(project)(mode)(block))

describe('renderBlock in "all" mode', () => {
  it('emits the effective translation when one exists', () => {
    const project = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('Одно.')), 'b0.s1': entry(machine('Другое.')) },
    })
    expect(rendered(project, 'all')).toStrictEqual([{ text: 'Одно. Другое.', fallback: false }])
  })

  it('prefers a paragraph override over the sentences', () => {
    const project = buildProject({
      blocks: [{ text: source }],
      entries: { b0: entry(machine('Слитно.')), 'b0.s0': entry(machine('Одно.')) },
    })
    expect(rendered(project, 'all')).toStrictEqual([{ text: 'Слитно.', fallback: false }])
  })

  it('falls back to source text, marked, when nothing is translated', () => {
    const project = buildProject({ blocks: [{ text: source }] })
    expect(rendered(project, 'all')).toStrictEqual([{ text: source, fallback: true }])
  })
})

describe('renderBlock in "approvedOnly" mode', () => {
  it('emits the translation only once the paragraph is approved', () => {
    const unapproved = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('Одно.'), true), 'b0.s1': entry(machine('Другое.'), false) },
    })
    const approved = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('Одно.'), true), 'b0.s1': entry(machine('Другое.'), true) },
    })
    expect(rendered(unapproved, 'approvedOnly')).toStrictEqual([{ text: source, fallback: true }])
    expect(rendered(approved, 'approvedOnly')).toStrictEqual([{ text: 'Одно. Другое.', fallback: false }])
  })

  it('never omits a paragraph, so the document keeps its shape', () => {
    const project = buildProject({ blocks: [{ text: source }, { text: 'Alone here.' }] })
    expect(rendered(project, 'approvedOnly')).toHaveLength(2)
  })
})

describe('exportReport', () => {
  it('counts only translatable paragraphs and how many fall back', () => {
    const project = buildProject({
      blocks: [{ text: source }, { text: 'Alone here.' }, { text: '', translatable: false }],
      entries: { 'b0.s0': entry(machine('Одно.')), 'b0.s1': entry(machine('Другое.')) },
    })
    expect(exportReport(project)('all')).toStrictEqual({ total: 2, translated: 1, fallback: 1 })
  })

  it('reports everything as fallback in approved-only mode when nothing is approved', () => {
    const project = buildProject({
      blocks: [{ text: source }],
      entries: { 'b0.s0': entry(machine('Одно.')), 'b0.s1': entry(machine('Другое.')) },
    })
    expect(exportReport(project)('approvedOnly')).toStrictEqual({ total: 1, translated: 0, fallback: 1 })
  })
})
