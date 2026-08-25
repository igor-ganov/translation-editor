import { Brand, Either, Option } from 'effect'
import type { SegmentId } from '../../document/types.js'
import type { BodyLine } from '../scan-body.js'
import type { MarkupError } from '../types.js'
import type { Accumulator } from './accumulator.js'
import { flush } from './flush.js'

const segmentId = Brand.nominal<SegmentId>()

/**
 * Starts a new segment, refusing an id the file has already used. The check runs
 * against the accumulator *after* closing the open segment, so a marker that
 * repeats the one immediately above it is caught too.
 */
export const openMarker = (
  accumulated: Accumulator,
  entry: BodyLine & { readonly tag: 'marker' },
): Either.Either<Accumulator, MarkupError> => {
  const closed = flush(accumulated)
  return Either.map(
    Either.fromOption(
      Option.liftPredicate((id: SegmentId) => !closed.has(id))(segmentId(entry.id)),
      (): MarkupError => ({ tag: 'duplicateSegmentId', line: entry.line, found: entry.id }),
    ),
    (id): Accumulator => ({ segments: closed, current: Option.some({ id, parts: [entry.rest] }) }),
  )
}
