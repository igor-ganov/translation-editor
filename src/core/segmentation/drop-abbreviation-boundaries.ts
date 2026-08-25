/**
 * Removes boundaries that fall right after a known abbreviation — the one
 * systematic error class of UAX #29 sentence breaking. The first and last
 * boundaries anchor the text and are always kept.
 */
export const dropAbbreviationBoundaries =
  (pattern: RegExp) =>
  (text: string) =>
  (boundaries: readonly number[]): readonly number[] =>
    boundaries.filter(
      (offset, index) =>
        index === 0 ||
        index === boundaries.length - 1 ||
        !pattern.test(text.slice(0, offset)),
    )
