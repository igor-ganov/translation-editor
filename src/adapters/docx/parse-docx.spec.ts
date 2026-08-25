// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { Effect, Exit } from 'effect'
import { parseDocx } from './parse-docx.js'
import { heading, listItem, makeDocx, paragraph, run, table } from '../../../tests/support/make-docx.js'

const parse = async (bodyXml: string) =>
  await Effect.runPromise(parseDocx('en')(await makeDocx(bodyXml)))

const failureOf = async (bytes: Uint8Array) =>
  Exit.causeOption(await Effect.runPromiseExit(parseDocx('en')(bytes)))

describe('parseDocx', () => {
  it('reads paragraphs in document order', async () => {
    const blocks = await parse([paragraph(run('First.')), paragraph(run('Second.'))].join(''))
    expect(blocks.map((block) => block.text)).toStrictEqual(['First.', 'Second.'])
    expect(blocks.map((block) => block.id)).toStrictEqual(['b0', 'b1'])
  })

  it('recognises heading levels', async () => {
    const blocks = await parse(
      [paragraph(run('Title'), heading(1)), paragraph(run('Sub'), heading(3))].join(''),
    )
    expect(blocks.map((block) => block.kind)).toStrictEqual([
      { tag: 'heading', level: 1 },
      { tag: 'heading', level: 3 },
    ])
  })

  it('recognises list items and their nesting depth', async () => {
    const blocks = await parse(
      [paragraph(run('Top'), listItem(0)), paragraph(run('Nested'), listItem(2))].join(''),
    )
    expect(blocks.map((block) => block.kind)).toStrictEqual([
      { tag: 'listItem', ordered: true, depth: 0 },
      { tag: 'listItem', ordered: true, depth: 2 },
    ])
  })

  it('reports table cells with their grid position', async () => {
    const blocks = await parse(table([['A1', 'B1'], ['A2', 'B2']]))
    expect(blocks.map((block) => block.kind)).toStrictEqual([
      { tag: 'tableCell', row: 0, column: 0 },
      { tag: 'tableCell', row: 0, column: 1 },
      { tag: 'tableCell', row: 1, column: 0 },
      { tag: 'tableCell', row: 1, column: 1 },
    ])
    expect(blocks.map((block) => block.text)).toStrictEqual(['A1', 'B1', 'A2', 'B2'])
  })

  it('keeps inline formatting as ranges over the paragraph text', async () => {
    const blocks = await parse(paragraph([run('Plain '), run('bold', { b: true })].join('')))
    expect(blocks[0]?.text).toBe('Plain bold')
    expect(blocks[0]?.runs).toStrictEqual([
      { start: 0, end: 6, bold: false, italic: false, underline: false },
      { start: 6, end: 10, bold: true, italic: false, underline: false },
    ])
  })

  it('keeps an empty paragraph in order but marks it untranslatable', async () => {
    const blocks = await parse([paragraph(run('Text.')), paragraph(''), paragraph(run('More.'))].join(''))
    expect(blocks).toHaveLength(3)
    expect(blocks.map((block) => block.translatable)).toStrictEqual([true, false, true])
    expect(blocks[1]?.sentences).toStrictEqual([])
  })

  it('segments each paragraph into sentences', async () => {
    const blocks = await parse(paragraph(run('Dr. Ellison waited. Then he spoke.')))
    const first = blocks[0]
    expect(first?.sentences.map((s) => first.text.slice(s.start, s.end).trim())).toStrictEqual([
      'Dr. Ellison waited.',
      'Then he spoke.',
    ])
  })

  it('handles Cyrillic and accented Latin text', async () => {
    const blocks = await parse(
      [paragraph(run('Привет, мир.')), paragraph(run('Perché è così.'))].join(''),
    )
    expect(blocks.map((block) => block.text)).toStrictEqual(['Привет, мир.', 'Perché è così.'])
  })

  it('renders tabs and soft breaks as whitespace', async () => {
    const blocks = await parse(paragraph('<w:r><w:t>A</w:t><w:tab/><w:t>B</w:t><w:br/><w:t>C</w:t></w:r>'))
    expect(blocks[0]?.text).toBe('A\tB\nC')
  })

  it('fails with a typed error when the file is not a zip', async () => {
    const failure = await failureOf(new Uint8Array([1, 2, 3, 4]))
    expect(JSON.stringify(failure)).toContain('notAZip')
  })

  it('fails with a typed error when the package has no main document', async () => {
    const empty = await Effect.runPromise(
      Effect.promise(async () => {
        const { default: JSZip } = await import('jszip')
        return await new JSZip().generateAsync({ type: 'uint8array' })
      }),
    )
    expect(JSON.stringify(await failureOf(empty))).toContain('missingDocument')
  })
})
