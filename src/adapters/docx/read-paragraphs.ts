import { Option, pipe } from 'effect'
import { ooxml } from './ooxml.js'
import { ancestors } from './ancestors.js'
import { elementsNamed } from './elements-named.js'
import { readRuns } from './read-runs.js'
import { readBlockKind } from './read-block-kind.js'
import type { BlockKind, Run } from '../../core/document/types.js'

export type RawBlock = {
  readonly kind: BlockKind
  readonly text: string
  readonly runs: readonly Run[]
}

const nearest = (element: Element, name: string): Option.Option<Element> =>
  Option.fromIterable(ancestors(element).filter((candidate) => candidate.localName === name))

const positionAmongSiblings = (element: Element, name: string): number =>
  Array.from(element.parentElement?.children ?? [])
    .filter((sibling) => sibling.localName === name)
    .indexOf(element)

/** A paragraph inside a table cell is reported with its grid position. */
const kindOf = (paragraph: Element): BlockKind =>
  pipe(
    nearest(paragraph, ooxml.tableCell),
    Option.map((cell): BlockKind => ({
      tag: 'tableCell',
      row: pipe(
        nearest(cell, ooxml.tableRow),
        Option.map((row) => positionAmongSiblings(row, ooxml.tableRow)),
        Option.getOrElse(() => 0),
      ),
      column: positionAmongSiblings(cell, ooxml.tableCell),
    })),
    Option.getOrElse(() => readBlockKind(paragraph)),
  )

/**
 * Every paragraph of the document in reading order, including those nested in
 * tables. `getElementsByTagNameNS` returns document order, which is exactly the
 * order the translated file must be rebuilt in.
 */
export const readParagraphs = (document: Document): readonly RawBlock[] =>
  elementsNamed(document, ooxml.paragraph).map((paragraph) => ({
    kind: kindOf(paragraph),
    ...readRuns(paragraph),
  }))
