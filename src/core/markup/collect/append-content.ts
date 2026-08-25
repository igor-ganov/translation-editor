import { Either, Option, pipe } from 'effect'
import type { BodyLine } from '../scan-body.js'
import type { MarkupError } from '../types.js'
import type { Accumulator } from './accumulator.js'

/** Blank lines between the header and the first marker are layout, not content. */
const ignorableBlank = (
  accumulated: Accumulator,
  entry: BodyLine & { readonly tag: 'content' },
): Either.Either<Accumulator, MarkupError> =>
  Either.map(
    Either.fromOption(
      Option.liftPredicate((text: string) => text.trim().length === 0)(entry.text),
      (): MarkupError => ({ tag: 'contentBeforeFirstMarker', line: entry.line }),
    ),
    () => accumulated,
  )

/** Adds a continuation line to the segment currently open. */
export const appendContent = (
  accumulated: Accumulator,
  entry: BodyLine & { readonly tag: 'content' },
): Either.Either<Accumulator, MarkupError> =>
  pipe(
    accumulated.current,
    Option.map(
      (open): Either.Either<Accumulator, MarkupError> =>
        Either.right({ ...accumulated, current: Option.some({ ...open, parts: [...open.parts, entry.text] }) }),
    ),
    Option.getOrElse(() => ignorableBlank(accumulated, entry)),
  )
