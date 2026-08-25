import type { Project } from '../project/types.js'

export type UndoEntry = {
  /** Shown on the undo control, so the user knows what will be reversed. */
  readonly label: string
  readonly project: Project
}
