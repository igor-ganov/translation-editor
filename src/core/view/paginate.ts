import type { EditorRow } from './types.js'
import { blockGroups } from './block-groups.js'
import { pageBudget } from './page-budget.js'

export type Page = readonly EditorRow[]

const costOf = (rows: Page): number => rows.length

const fill = (pages: readonly Page[], group: Page): readonly Page[] => {
  const last = pages.at(-1)
  switch (last !== undefined && costOf([...last, ...group]) <= pageBudget) {
    case true:
      return [...pages.slice(0, -1), [...(last ?? []), ...group]]
    case false:
      return [...pages, group]
  }
}

/**
 * Cuts the document into pages.
 *
 * One endless list meant scrolling for a minute to reach the middle, losing your
 * place whenever anything redrew, and no way to say where you were. A paragraph
 * longer than a whole page becomes a page of its own rather than being split.
 */
export const paginate = (rows: readonly EditorRow[]): readonly Page[] =>
  blockGroups(rows).reduce<readonly Page[]>(fill, [])
