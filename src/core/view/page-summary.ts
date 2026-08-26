import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import type { Units } from '../approval/block-units.js'
import type { Page } from './paginate.js'
import { blockUnits } from '../approval/block-units.js'
import { addUnits } from '../approval/add-units.js'

const TITLE_LIMIT = 60
const ZERO: Units = { total: 0, translated: 0, approved: 0 }

export type PageSummary = Units & { readonly title: string }

const blockOf = (row: Page[number]): readonly Block[] => {
  switch (row.tag) {
    case 'block':
      return [row.block]
    case 'sentence':
      return []
  }
}

const blocksOn = (page: Page): readonly Block[] => page.flatMap(blockOf)

const titleOf = (blocks: readonly Block[]): string =>
  (blocks[0]?.text ?? 'Empty page').trim().slice(0, TITLE_LIMIT)

/**
 * One line of the contents: what a page opens with, and how much of it is done.
 *
 * The counting is `blockUnits`, the same arithmetic the overall progress uses, so
 * the contents can never disagree with the thread at the top of the desk.
 */
export const pageSummary =
  (project: Project) =>
  (page: Page): PageSummary => {
    const blocks = blocksOn(page)
    return { title: titleOf(blocks), ...blocks.map(blockUnits(project)).reduce(addUnits, ZERO) }
  }
