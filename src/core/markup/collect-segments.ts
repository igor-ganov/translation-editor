import { Either } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { BodyLine } from './scan-body.js'
import type { MarkupError } from './types.js'
import type { Accumulator } from './collect/accumulator.js'
import { emptyAccumulator } from './collect/empty-accumulator.js'
import { flush } from './collect/flush.js'
import { openMarker } from './collect/open-marker.js'
import { appendContent } from './collect/append-content.js'

const step = (accumulated: Accumulator, entry: BodyLine): Either.Either<Accumulator, MarkupError> => {
  switch (entry.tag) {
    case 'marker':
      return openMarker(accumulated, entry)
    case 'content':
      return appendContent(accumulated, entry)
  }
}

/**
 * Folds classified lines into one text per segment. A segment owns every line from
 * its marker up to the next one, which is why multi-line translations need no
 * escaping and stay readable in the file.
 */
export const collectSegments = (
  body: readonly BodyLine[],
): Either.Either<ReadonlyMap<SegmentId, string>, MarkupError> =>
  Either.map(
    body.reduce<Either.Either<Accumulator, MarkupError>>(
      (accumulated, entry) => Either.flatMap(accumulated, (state) => step(state, entry)),
      Either.right(emptyAccumulator),
    ),
    flush,
  )
