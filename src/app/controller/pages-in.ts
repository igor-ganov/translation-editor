import { Option, pipe } from 'effect'
import type { AppState } from '../../ui/store/app-state.js'
import type { Page } from '../../core/view/paginate.js'
import { editorRows } from '../../core/view/editor-rows.js'
import { paginate } from '../../core/view/paginate.js'

/**
 * The document as it is currently cut into pages.
 *
 * Derived rather than stored, because a filter, a collapsed paragraph or a split
 * sentence all change where the cuts fall, and a stored count would go stale at
 * each of them without anything saying so.
 */
export const pagesIn = (state: AppState): readonly Page[] =>
  pipe(
    state.project,
    Option.map((project) => paginate(editorRows(project)(state.filter, state.collapsed))),
    Option.getOrElse((): readonly Page[] => []),
  )
