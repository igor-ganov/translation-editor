import { describe, expect, it } from 'vitest'
import { Brand, Either } from 'effect'
import type { SegmentId } from '../document/types.js'
import { serialiseMarkup } from './serialise-markup.js'
import { parseMarkup } from './parse-markup.js'
import { buildProject, entry, machine } from '../../../tests/support/build-project.js'

const twoSentences = 'One thing happened. Then another.'

const project = buildProject({
  blocks: [{ text: twoSentences }, { text: 'Alone here.' }],
  entries: {
    b0: entry(machine('Слитный перевод абзаца.')),
    'b0.s0': entry(machine('Одно случилось.')),
    'b0.s1': entry(machine('Потом другое.')),
    'b1.s0': entry(machine('Здесь один.')),
  },
})

const id = Brand.nominal<SegmentId>()
const parsed = (raw: string) => Either.getOrThrow(parseMarkup(raw))
const failure = (raw: string) => Either.flip(parseMarkup(raw)).pipe(Either.getOrThrow)

describe('serialiseMarkup', () => {
  it('writes a header identifying document, direction and side', () => {
    expect(serialiseMarkup(project)('source').split('\n').slice(0, 4)).toStrictEqual([
      '#!translation-editor v1',
      '#!doc hash-fixture',
      '#!lang en>ru',
      '#!kind source',
    ])
  })

  it('emits every block line followed by its sentence lines, in document order', () => {
    const ids = serialiseMarkup(project)('source')
      .split('\n')
      .flatMap((line) => Array.from(line.matchAll(/^⟦([^⟧]+)⟧/g), (m) => m[1]))
    expect(ids).toStrictEqual(['b0', 'b0.s0', 'b0.s1', 'b1', 'b1.s0'])
  })

  it('always emits the block line, even with no override, as the slot to type into', () => {
    const bare = buildProject({ blocks: [{ text: 'Alone here.' }] })
    expect(serialiseMarkup(bare)('translation')).toContain('⟦b0⟧\n')
  })

  it('carries source text in the source file and translations in the translation file', () => {
    expect(serialiseMarkup(project)('source')).toContain('⟦b0.s0⟧One thing happened.')
    expect(serialiseMarkup(project)('translation')).toContain('⟦b0.s0⟧Одно случилось.')
  })
})

describe('parseMarkup', () => {
  it('reads segment texts back', () => {
    const result = parsed(serialiseMarkup(project)('translation'))
    expect(result.segments.get(id('b0.s0'))).toBe('Одно случилось.')
    expect(result.header).toStrictEqual({
      version: 1, documentHash: 'hash-fixture', from: 'en', to: 'ru', kind: 'translation',
    })
  })

  it('keeps a multi-line segment together', () => {
    const raw = `#!translation-editor v1\n#!doc h\n#!lang en>ru\n#!kind translation\n\n⟦b0⟧first\nsecond\nthird\n⟦b0.s0⟧x\n`
    expect(parsed(raw).segments.get(id('b0'))).toBe('first\nsecond\nthird')
  })

  it('survives text that looks like a marker', () => {
    const tricky = buildProject({
      blocks: [{ text: 'Alone here.' }],
      entries: { 'b0.s0': entry(machine('⟦b9⟧ literal bracket text')) },
    })
    const round = parsed(serialiseMarkup(tricky)('translation'))
    expect(round.segments.get(id('b0.s0'))).toBe('⟦b9⟧ literal bracket text')
  })

  it.each(['source', 'translation'] as const)('round-trips a %s file', (kind) => {
    const round = parsed(serialiseMarkup(project)(kind))
    const original = parsed(serialiseMarkup(project)(kind))
    expect([...round.segments]).toStrictEqual([...original.segments])
    expect(round.segments.size).toBe(5)
  })

  describe('reports the first problem with its line number', () => {
    it('missing header', () => {
      expect(failure('⟦b0⟧hello\n')).toStrictEqual({ tag: 'missingHeader', line: 1 })
    })

    it('unsupported version', () => {
      expect(failure('#!translation-editor v9\n#!doc h\n#!lang en>ru\n#!kind source\n')).toStrictEqual({
        tag: 'unsupportedVersion', line: 1, found: 'v9',
      })
    })

    it('malformed language field', () => {
      expect(failure('#!translation-editor v1\n#!doc h\n#!lang en>zz\n#!kind source\n')).toStrictEqual({
        tag: 'malformedHeaderField', line: 1, field: 'lang',
      })
    })

    it('missing document field', () => {
      expect(failure('#!translation-editor v1\n#!lang en>ru\n#!kind source\n')).toStrictEqual({
        tag: 'malformedHeaderField', line: 1, field: 'doc',
      })
    })

    it('invalid segment id', () => {
      const raw = '#!translation-editor v1\n#!doc h\n#!lang en>ru\n#!kind source\n\n⟦nonsense⟧x\n'
      expect(failure(raw)).toStrictEqual({ tag: 'invalidSegmentId', line: 6, found: 'nonsense' })
    })

    it('duplicate segment id', () => {
      const raw = '#!translation-editor v1\n#!doc h\n#!lang en>ru\n#!kind source\n\n⟦b0⟧x\n⟦b0⟧y\n'
      expect(failure(raw)).toStrictEqual({ tag: 'duplicateSegmentId', line: 7, found: 'b0' })
    })

    it('content before the first marker', () => {
      const raw = '#!translation-editor v1\n#!doc h\n#!lang en>ru\n#!kind source\nstray text\n⟦b0⟧x\n'
      expect(failure(raw)).toStrictEqual({ tag: 'contentBeforeFirstMarker', line: 5 })
    })
  })
})
