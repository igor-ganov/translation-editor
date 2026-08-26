import type { Page } from './paginate.js'

/**
 * Which page a segment is on, or the first page when it is not showing.
 *
 * The bookmark is a segment, never a pixel offset. Restoring it this way is what
 * stops an unrelated redraw from throwing the reader to the end of the document,
 * and it survives a font-size change, a filter, and a boundary edit.
 */
export const pageOfSegment =
  (pages: readonly Page[]) =>
  (segment: string | undefined): number =>
    Math.max(0, pages.findIndex((page) => page.some((row) => row.id === segment)))
