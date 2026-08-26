import { Option } from 'effect'
import type { SegmentId } from '../../../core/document/types.js'
import { pageOfSegment } from '../../../core/view/page-of-segment.js'
import { pagesIn } from '../pages-in.js'
import { nextUnapprovedTarget } from '../next-unapproved-target.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

const turnTo = (deps: Deps) => (id: SegmentId): void => {
  deps.store.update((state) => ({
    ...state,
    route: 'editor',
    page: pageOfSegment(pagesIn(state))(id),
    project: Option.map(state.project, (project) => ({ ...project, cursor: id })),
  }))
}

/**
 * Turns to the page holding the next segment still waiting to be approved.
 *
 * It moves the bookmark as well as the page, so pressing it again goes on to the
 * one after rather than landing on the same segment for ever.
 */
export const handleNextUnapproved =
  (deps: Deps) =>
  (): void => {
    const state = deps.store.get()
    Option.match(nextUnapprovedTarget(state, pagesIn(state).flat()), {
      onNone: () => {
        setNotice(deps)({ tag: 'info', text: 'Nothing left to approve in this view.' })
      },
      onSome: turnTo(deps),
    })
  }
