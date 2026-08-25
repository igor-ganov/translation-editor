import { Option } from 'effect'
import { nextUnapproved } from '../../../core/view/next-unapproved.js'
import { rowIndexOf } from '../../../core/view/row-index-of.js'
import { fromUndefined } from '../../../core/option/from-undefined.js'
import { setNotice } from '../set-notice.js'
import { editorIn } from '../editor-in.js'
import type { Deps } from '../deps.js'

/**
 * Jumps to the next segment still waiting for approval, searching the rows the
 * current filter actually shows so the jump always lands somewhere visible.
 */
export const handleNextUnapproved =
  (deps: Deps) =>
  (host: HTMLElement) =>
  (): void => {
    for (const editor of Option.toArray(editorIn(host))) {
      const rows = editor.rows
      const from = Option.flatMap(
        Option.flatMap(deps.store.get().project, (project) => fromUndefined(project.cursor)),
        rowIndexOf(rows),
      )
      Option.match(nextUnapproved(rows)(from), {
        onNone: () => {
          setNotice(deps)({ tag: 'info', text: 'Nothing left to approve in this view.' })
        },
        onSome: (id) => {
          editor.reveal(id)
        },
      })
    }
  }
