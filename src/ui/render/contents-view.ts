import type { Project } from '../../core/project/types.js'
import type { SegmentFilter } from '../../core/view/types.js'

/** What the contents draws from. */
export type ContentsView = {
  readonly project: Project | undefined
  readonly filter: SegmentFilter
  readonly collapsed: ReadonlySet<string>
  readonly page: number
}
