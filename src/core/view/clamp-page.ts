/**
 * Keeps a page number inside the document.
 *
 * Turning past the last page stays on the last page: there is no wrap, because a
 * book does not wrap, and a reader who has reached the end should be told so
 * rather than sent back to the beginning.
 */
export const clampPage =
  (count: number) =>
  (page: number): number =>
    Math.min(Math.max(0, page), Math.max(0, count - 1))
