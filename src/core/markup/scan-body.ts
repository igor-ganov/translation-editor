import { Either, Option, pipe } from 'effect'
import { markupSyntax } from './markup-syntax.js'
import { parseSegmentId } from '../document/parse-segment-id.js'
import type { MarkupError } from './types.js'

export type BodyLine =
  | { readonly tag: 'marker'; readonly id: string; readonly rest: string; readonly line: number }
  | { readonly tag: 'content'; readonly text: string; readonly line: number }

const asMarker = (raw: string, line: number): Option.Option<BodyLine> =>
  Option.map(Option.fromIterable(raw.matchAll(markupSyntax.markerLine)), (match) => ({
    tag: 'marker' as const,
    id: match[1] ?? '',
    rest: match[2] ?? '',
    line,
  }))

const classify = (raw: string, line: number): BodyLine =>
  pipe(
    asMarker(raw, line),
    Option.getOrElse((): BodyLine => ({ tag: 'content', text: raw, line })),
  )

const validateId = (entry: BodyLine): Either.Either<BodyLine, MarkupError> => {
  switch (entry.tag) {
    case 'content':
      return Either.right(entry)
    case 'marker':
      return Either.fromOption(
        Option.map(parseSegmentId(entry.id), () => entry),
        (): MarkupError => ({ tag: 'invalidSegmentId', line: entry.line, found: entry.id }),
      )
  }
}

/** Classifies every body line as a marker or as continuation content. */
export const scanBody = (
  lines: readonly string[],
  bodyStart: number,
): Either.Either<readonly BodyLine[], MarkupError> =>
  Either.all(lines.slice(bodyStart).map((raw, index) => validateId(classify(raw, bodyStart + index + 1))))
