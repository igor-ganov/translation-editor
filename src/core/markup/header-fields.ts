import { Option, pipe } from 'effect'
import { markupSyntax } from './markup-syntax.js'

export type HeaderFields = {
  readonly fields: ReadonlyMap<string, string>
  /** Index of the first line after the header block. */
  readonly bodyStart: number
}

const isHeaderLine = (line: string): boolean => line.startsWith(markupSyntax.headerPrefix)

const toEntry = (line: string): readonly (readonly [string, string])[] =>
  Array.from(line.matchAll(markupSyntax.headerLine), (match) => [match[1] ?? '', (match[2] ?? '').trim()])

/** Length of the leading run of header lines; the whole file when it is all header. */
const headerLength = (lines: readonly string[]): number =>
  pipe(
    Option.liftPredicate((index: number) => index >= 0)(lines.findIndex((line) => !isHeaderLine(line))),
    Option.getOrElse(() => lines.length),
  )

/**
 * Collects the leading `#!key value` lines. The header ends at the first line that
 * is not one, which is what lets the body start with a blank line for readability.
 */
export const headerFields = (lines: readonly string[]): HeaderFields => {
  const leading = lines.slice(0, headerLength(lines))
  return { fields: new Map(leading.flatMap(toEntry)), bodyStart: leading.length }
}
