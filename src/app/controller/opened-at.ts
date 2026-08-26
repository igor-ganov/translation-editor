import { Option, pipe } from 'effect'
import type { AppState } from '../../ui/store/app-state.js'
import { pageOfSegment } from '../../core/view/page-of-segment.js'
import { pagesIn } from './pages-in.js'

/**
 * The page a document should open on: the one holding the bookmark.
 *
 * The bookmark is a segment, so it survives a font-size change, a different
 * device, and an edit that moves a sentence boundary. The pixel offset it
 * replaces is what used to throw the reader to the end of the document.
 */
export const openedAt = (state: AppState): number =>
  pipe(
    state.project,
    Option.map((project) => pageOfSegment(pagesIn(state))(project.cursor)),
    Option.getOrElse(() => 0),
  )
