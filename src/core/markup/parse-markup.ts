import { Either } from 'effect'
import { parseHeader } from './parse-header.js'
import { scanBody } from './scan-body.js'
import { collectSegments } from './collect-segments.js'
import type { MarkupError, ParsedMarkup } from './types.js'

const LINE_BREAK = /\r\n|\r|\n/

/**
 * Reads a markup file back into segment texts. Every failure carries the 1-based
 * line it happened on, because the file is something a person edited by hand and
 * "line 42" is the only useful thing to tell them.
 */
export const parseMarkup = (raw: string): Either.Either<ParsedMarkup, MarkupError> =>
  Either.gen(function* () {
    const lines = raw.split(LINE_BREAK)
    const { header, bodyStart } = yield* parseHeader(lines)
    const segments = yield* collectSegments(yield* scanBody(lines, bodyStart))
    return { header, segments }
  })
