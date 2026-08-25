import { Option } from 'effect'

export type ParsedSegmentId =
  | { readonly kind: 'block'; readonly blockIndex: number }
  | { readonly kind: 'sentence'; readonly blockIndex: number; readonly ordinal: number }

const PATTERN = /^b(\d+)(?:\.s(\d+))?$/g

const toParsed = (blockIndex: string, ordinal: string | undefined): ParsedSegmentId => {
  switch (ordinal) {
    case undefined:
      return { kind: 'block', blockIndex: Number(blockIndex) }
    default:
      return { kind: 'sentence', blockIndex: Number(blockIndex), ordinal: Number(ordinal) }
  }
}

/**
 * Parses an id arriving from outside the app (markup files, stored state).
 * `matchAll` is used over `exec` so a miss yields an empty iterable, which maps
 * straight onto Option without an absent-value sentinel.
 */
export const parseSegmentId = (raw: string): Option.Option<ParsedSegmentId> =>
  Option.map(Option.fromIterable(raw.matchAll(PATTERN)), (match) =>
    toParsed(match[1] ?? '', match[2]),
  )
