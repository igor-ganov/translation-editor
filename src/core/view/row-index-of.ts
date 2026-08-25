import { Option } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { EditorRow } from './types.js'

/** Where a segment sits in the rendered list, if it is currently shown at all. */
export const rowIndexOf =
  (rows: readonly EditorRow[]) =>
  (id: SegmentId): Option.Option<number> =>
    Option.liftPredicate((index: number) => index >= 0)(rows.findIndex((row) => row.id === id))
