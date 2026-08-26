import type { Project } from '../../core/project/types.js'
import type { SegmentFilter } from '../../core/view/types.js'

/** What the desk draws from. */
export type DeskView = {
  readonly project: Project | undefined
  readonly filter: SegmentFilter
  readonly model: string
  readonly translating: boolean
  /** Empty when there is nothing to undo, which leaves the control off the screen. */
  readonly undoLabel: string
}
