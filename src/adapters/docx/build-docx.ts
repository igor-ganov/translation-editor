import { Document, Packer } from 'docx'
import type { Paragraph, Table } from 'docx'
import { Effect } from 'effect'
import type { Project } from '../../core/project/types.js'
import type { BlockKind } from '../../core/document/types.js'
import type { ExportMode, RenderedBlock } from '../../core/export/types.js'
import { renderBlock } from '../../core/export/render-block.js'
import { toParagraph } from './to-paragraph.js'
import { toTable } from './to-table.js'
import type { CellItem } from './to-table.js'
import { chunkConsecutive } from './chunk-consecutive.js'
import { documentStyles } from './document-styles.js'
import { listNumbering } from './list-numbering.js'

type Item = { readonly kind: BlockKind; readonly rendered: RenderedBlock }

const FLOW_OF: Record<BlockKind['tag'], 'table' | 'flow'> = {
  paragraph: 'flow',
  heading: 'flow',
  listItem: 'flow',
  tableCell: 'table',
}

const isCellItem = (item: Item): item is CellItem => item.kind.tag === 'tableCell'

const RENDER_CHUNK: Record<'table' | 'flow', (items: readonly Item[]) => readonly (Paragraph | Table)[]> = {
  table: (items) => [toTable(items.filter(isCellItem))],
  flow: (items) => items.map((item) => toParagraph(item.kind)(item.rendered)),
}

/**
 * Writes the translated document as a .docx.
 *
 * `Packer.toBlob` is used deliberately: `toBuffer` relies on a Node Buffer and
 * throws inside a WebView, which is where this runs on Android.
 */
export const buildDocx =
  (project: Project) =>
  (mode: ExportMode): Effect.Effect<Blob> =>
    Effect.promise(() => {
      const items: readonly Item[] = project.source.map((block) => ({
        kind: block.kind,
        rendered: renderBlock(project)(mode)(block),
      }))
      const children = chunkConsecutive((item: Item) => FLOW_OF[item.kind.tag])(items).flatMap((chunk) =>
        RENDER_CHUNK[chunk.key](chunk.items),
      )
      return Packer.toBlob(
        new Document({ styles: documentStyles, numbering: listNumbering, sections: [{ children }] }),
      )
    })
