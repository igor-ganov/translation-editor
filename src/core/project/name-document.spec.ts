import { describe, expect, it } from 'vitest'
import { nameDocument } from './name-document.js'
import { buildProject } from '../../../tests/support/build-project.js'

const source = buildProject({
  blocks: [{ text: 'Eccesso di capitale e sovrappopolazione' }, { text: 'Something after it.' }],
}).source

describe('nameDocument', () => {
  it('uses the filename when the picker gave a real one', () => {
    expect(nameDocument('Eccesso-di-capitale.docx', source)).toBe('Eccesso-di-capitale')
  })

  it('falls back to the opening line when Android hands back a content id', () => {
    // The log from a real phone showed a document called `document%3A1000060316`.
    expect(nameDocument('document%3A1000060316', source)).toBe('Eccesso di capitale e sovrappopolazione')
  })

  it('names an empty document rather than leaving it blank', () => {
    expect(nameDocument('content://whatever', [])).toBe('Untitled document')
  })

  it('keeps a long opening line to a readable length', () => {
    const long = buildProject({ blocks: [{ text: 'x'.repeat(300) }] }).source
    expect(nameDocument('content://whatever', long).length).toBeLessThan(100)
  })
})
