import { Option, pipe } from 'effect'
import type { SegmentId } from '../../document/types.js'
import { unescapeContent } from '../unescape-content.js'
import type { Accumulator } from './accumulator.js'

/** Closes the open segment, joining the lines it collected into its final text. */
export const flush = (accumulated: Accumulator): ReadonlyMap<SegmentId, string> =>
  pipe(
    accumulated.current,
    Option.map((open) =>
      new Map([...accumulated.segments, [open.id, unescapeContent(open.parts.join('\n').trim())] as const]),
    ),
    Option.getOrElse((): ReadonlyMap<SegmentId, string> => accumulated.segments),
  )
