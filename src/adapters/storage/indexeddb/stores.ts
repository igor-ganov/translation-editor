/**
 * The object stores.
 *
 * Entries live in their own store keyed per segment so an edit costs one small
 * transaction. Keeping them inside the project record would mean rewriting the
 * whole document on every keystroke, and losing all of it to a mistimed kill.
 */
export const stores = {
  projects: 'projects',
  blocks: 'blocks',
  entries: 'entries',
  originals: 'originals',
} as const

export type StoreName = (typeof stores)[keyof typeof stores]
