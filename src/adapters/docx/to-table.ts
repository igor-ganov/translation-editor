import { Table, TableCell, TableRow, WidthType } from 'docx'
import { toParagraph } from './to-paragraph.js'
import { chunkConsecutive } from './chunk-consecutive.js'
import type { BlockKind } from '../../core/document/types.js'
import type { RenderedBlock } from '../../core/export/types.js'

export type CellItem = {
  readonly kind: Extract<BlockKind, { tag: 'tableCell' }>
  readonly rendered: RenderedBlock
}

const rowIndex = (item: CellItem): number => item.kind.row

const toRow = (items: readonly CellItem[]): TableRow =>
  new TableRow({
    children: items.map(
      (item) => new TableCell({ children: [toParagraph(item.kind)(item.rendered)] }),
    ),
  })

/** Rebuilds a run of cell blocks into a table, grouping them back into rows. */
export const toTable = (items: readonly CellItem[]): Table =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: chunkConsecutive(rowIndex)(items).map((chunk) => toRow(chunk.items)),
  })
