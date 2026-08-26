import type { EditorRow } from './types.js'

type Groups = readonly (readonly EditorRow[])[]

const appendToLast = (groups: Groups, row: EditorRow): Groups => {
  const last = groups.at(-1)
  switch (last === undefined) {
    case true:
      return [...groups, [row]]
    case false:
      return [...groups.slice(0, -1), [...(last ?? []), row]]
  }
}

/**
 * The flat row list cut back into paragraphs: each group is a paragraph header
 * followed by whichever of its sentences are showing.
 *
 * A page is built from whole groups, which is what keeps a paragraph and its
 * sentences from ever landing on opposite sides of a page turn — the paragraph
 * translation overrides its sentences, so a reader who cannot see both together
 * cannot judge either.
 */
export const blockGroups = (rows: readonly EditorRow[]): Groups =>
  rows.reduce<Groups>((groups, row) => {
    switch (row.tag) {
      case 'block':
        return [...groups, [row]]
      case 'sentence':
        return appendToLast(groups, row)
    }
  }, [])
