import { describe, expect, it } from 'vitest'
import { opaqueName } from './opaque-name.js'
import { repairName } from './repair-name.js'
import { buildProject } from '../../../tests/support/build-project.js'

const stored = (name: string) => ({
  ...buildProject({ blocks: [{ text: 'Eccesso di capitale e sovrappopolazione' }] }),
  name,
})

describe('opaqueName', () => {
  it('recognises the content id Android hands back', () => {
    expect(opaqueName('document%3A1000060316')).toBe(true)
  })

  it('recognises a bare content URI', () => {
    expect(opaqueName('content://com.android.providers.media.documents/document/12')).toBe(true)
  })

  it('recognises a name that is only digits', () => {
    expect(opaqueName('1000060316')).toBe(true)
  })

  it('leaves an ordinary title alone', () => {
    expect(opaqueName('Eccesso di capitale')).toBe(false)
  })

  it('leaves a title containing a per-cent sign alone', () => {
    expect(opaqueName('Growth of 5% a year')).toBe(false)
  })
})

describe('repairName', () => {
  it('renames a document stored under a content id, using its opening line', () => {
    // A document already on the device carried this name on every screen.
    expect(repairName(stored('document%3A1000060316')).name).toBe('Eccesso di capitale e sovrappopolazione')
  })

  it('leaves a document that already has a readable name untouched', () => {
    expect(repairName(stored('Eccesso di capitale')).name).toBe('Eccesso di capitale')
  })

  it('changes nothing else about the project', () => {
    const before = stored('document%3A1000060316')
    const after = repairName(before)
    expect(after.source).toStrictEqual(before.source)
    expect(after.entries).toStrictEqual(before.entries)
  })
})
