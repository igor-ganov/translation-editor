import { Option } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { EditorRow } from './types.js'

/**
 * The next sentence still waiting for approval, searched from just after where
 * the user is and wrapping round, so repeated presses walk the whole document
 * instead of returning to the same row.
 */
export const nextUnapproved =
  (rows: readonly EditorRow[]) =>
  (after: Option.Option<number>): Option.Option<SegmentId> => {
    const start = Option.getOrElse(after, () => -1) + 1
    const ordered = [...rows.slice(start), ...rows.slice(0, start)]
    return Option.map(
      Option.fromIterable(ordered.filter((row) => row.tag === 'sentence' && !row.approved)),
      (row) => row.id,
    )
  }
