import type { Units } from './block-units.js'

/** Sums two counts of work. The identity is `{ total: 0, translated: 0, approved: 0 }`. */
export const addUnits = (a: Units, b: Units): Units => ({
  total: a.total + b.total,
  translated: a.translated + b.translated,
  approved: a.approved + b.approved,
})
