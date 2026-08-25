import type { BlockKind } from '../core/document/types.js'

/** A short description of what kind of paragraph this is, for the header row. */
export const blockKindLabel = (kind: BlockKind): string => {
  switch (kind.tag) {
    case 'paragraph':
      return 'Paragraph'
    case 'heading':
      return `Heading ${String(kind.level)}`
    case 'listItem':
      return `List item, level ${String(kind.depth + 1)}`
    case 'tableCell':
      return `Table cell ${String(kind.row + 1)}×${String(kind.column + 1)}`
  }
}
