import { describe, expect, it } from 'vitest'
import { editorRows } from './editor-rows.js'
import { paginate } from './paginate.js'
import { pageOfSegment } from './page-of-segment.js'
import { pageBudget } from './page-budget.js'
import { buildProject } from '../../../tests/support/build-project.js'

const paragraph = (sentences: number): { readonly text: string } => ({
  text: Array.from({ length: sentences }, (_unused, index) => `Sentence ${String(index)} here.`).join(' '),
})

const pagesOf = (blocks: readonly { readonly text: string }[]) =>
  paginate(editorRows(buildProject({ blocks }))('all', new Set()))

describe('paginate', () => {
  it('cuts a long document into more than one page', () => {
    expect(pagesOf([paragraph(6), paragraph(6), paragraph(6)]).length).toBeGreaterThan(1)
  })

  it('never splits a paragraph across a page turn', () => {
    // The paragraph translation overrides its sentences, so a reader who cannot
    // see both together cannot judge either.
    const pages = pagesOf([paragraph(4), paragraph(4), paragraph(4), paragraph(4)])
    const openings = pages.map((page) => page[0]?.tag)
    expect(openings.every((tag) => tag === 'block')).toBe(true)
  })

  it('gives a paragraph longer than a whole page a page to itself', () => {
    const pages = pagesOf([paragraph(pageBudget * 3)])
    expect(pages).toHaveLength(1)
    expect(pages[0]?.length).toBeGreaterThan(pageBudget)
  })

  it('keeps every row, losing none at the cuts', () => {
    const rows = editorRows(buildProject({ blocks: [paragraph(5), paragraph(5), paragraph(5)] }))('all', new Set())
    expect(paginate(rows).flat()).toStrictEqual(rows)
  })

  it('packs collapsed paragraphs together rather than giving each a page', () => {
    const project = buildProject({ blocks: Array.from({ length: 8 }, () => paragraph(3)) })
    const collapsed = new Set(project.source.map((block) => String(block.id)))
    expect(paginate(editorRows(project)('all', collapsed))).toHaveLength(1)
  })

  it('has no pages at all for an empty document', () => {
    expect(pagesOf([])).toStrictEqual([])
  })
})

describe('pageOfSegment', () => {
  it('finds the page holding the bookmarked segment', () => {
    const pages = pagesOf([paragraph(6), paragraph(6), paragraph(6)])
    const target = pages[1]?.[0]?.id
    expect(pageOfSegment(pages)(target)).toBe(1)
  })

  it('falls back to the first page when the bookmark is filtered out of sight', () => {
    expect(pageOfSegment(pagesOf([paragraph(3)]))('b99.s0')).toBe(0)
  })

  it('falls back to the first page when there is no bookmark', () => {
    expect(pageOfSegment(pagesOf([paragraph(3)]))(undefined)).toBe(0)
  })
})
