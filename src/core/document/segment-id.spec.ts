import { describe, expect, it } from 'vitest'
import { Option } from 'effect'
import { makeBlockId } from './make-block-id.js'
import { makeSentenceId } from './make-sentence-id.js'
import { parseSegmentId } from './parse-segment-id.js'
import { isBlockId } from './is-block-id.js'
import { blockIdOf } from './block-id-of.js'

describe('makeBlockId', () => {
  it('formats a block id from its import index', () => {
    expect(makeBlockId(0)).toBe('b0')
    expect(makeBlockId(12)).toBe('b12')
  })
})

describe('makeSentenceId', () => {
  it('formats a sentence id from its block and ordinal', () => {
    expect(makeSentenceId(makeBlockId(12))(3)).toBe('b12.s3')
  })

  it('uses the ordinal, not the position, so retired ids are never reissued', () => {
    expect(makeSentenceId(makeBlockId(4))(6)).toBe('b4.s6')
  })
})

describe('parseSegmentId', () => {
  it('round-trips a block id', () => {
    expect(parseSegmentId('b12')).toStrictEqual(Option.some({ kind: 'block', blockIndex: 12 }))
  })

  it('round-trips a sentence id', () => {
    expect(parseSegmentId('b12.s3')).toStrictEqual(
      Option.some({ kind: 'sentence', blockIndex: 12, ordinal: 3 }),
    )
  })

  it('round-trips every id the makers produce', () => {
    const ids = [makeBlockId(0), makeSentenceId(makeBlockId(0))(0), makeSentenceId(makeBlockId(99))(41)]
    for (const id of ids) expect(Option.isSome(parseSegmentId(id))).toBe(true)
  })

  it.each(['', 'b', 'bx', 'b1.', 'b1.s', 'b1.sx', 's1', 'b-1', 'b1.s3.s4', ' b1', 'b1 '])(
    'rejects %o',
    (input) => {
      expect(parseSegmentId(input)).toStrictEqual(Option.none())
    },
  )
})

describe('isBlockId', () => {
  it('separates block ids from sentence ids', () => {
    expect(isBlockId(makeBlockId(7))).toBe(true)
    expect(isBlockId(makeSentenceId(makeBlockId(7))(0))).toBe(false)
  })
})

describe('blockIdOf', () => {
  it('returns the owning block for a sentence id', () => {
    expect(blockIdOf(makeSentenceId(makeBlockId(7))(2))).toBe('b7')
  })

  it('returns a block id unchanged', () => {
    expect(blockIdOf(makeBlockId(7))).toBe('b7')
  })
})
