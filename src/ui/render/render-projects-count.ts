/* One document is not "1 documents". A lookup carries the exception rather than
   a branch, and every other count takes the plural. */
const SUFFIX: Readonly<Record<number, string>> = { 1: '' }

/** How much is on the shelf, for the spine. */
export const renderProjectsCount = (total: number): string =>
  `${String(total)} document${SUFFIX[total] ?? 's'}`
