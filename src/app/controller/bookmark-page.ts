import { Option } from 'effect'
import type { Page } from '../../core/view/paginate.js'
import { fromUndefined } from '../../core/option/from-undefined.js'
import { setCursor } from '../../core/project/set-cursor.js'
import { updateProject } from './update-project.js'
import type { Deps } from './deps.js'

/**
 * Records the page the reader turned to, by storing its first segment.
 *
 * Turning the page is the act that says where they are, so it is what moves the
 * bookmark. Storing the segment rather than the page number means the mark
 * survives a filter, a font-size change, and a boundary edit that renumbers the
 * pages under it.
 */
export const bookmarkPage =
  (deps: Deps) =>
  (page: Page | undefined): void => {
    for (const id of Option.toArray(fromUndefined(page?.[0]?.id))) {
      updateProject(deps)(setCursor(id))
    }
  }
