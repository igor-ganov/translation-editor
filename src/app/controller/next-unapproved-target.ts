import { Option } from 'effect'
import type { SegmentId } from '../../core/document/types.js'
import type { AppState } from '../../ui/store/app-state.js'
import type { EditorRow } from '../../core/view/types.js'
import { nextUnapproved } from '../../core/view/next-unapproved.js'
import { rowIndexOf } from '../../core/view/row-index-of.js'
import { fromUndefined } from '../../core/option/from-undefined.js'

/**
 * The next segment still waiting to be approved, searched over the rows the
 * current filter actually shows, so the jump always lands somewhere visible.
 */
export const nextUnapprovedTarget = (state: AppState, rows: readonly EditorRow[]): Option.Option<SegmentId> =>
  nextUnapproved(rows)(
    Option.flatMap(
      Option.flatMap(state.project, (project) => fromUndefined(project.cursor)),
      rowIndexOf(rows),
    ),
  )
