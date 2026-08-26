import type { SegmentId } from '../document/types.js'
import type { Project } from './types.js'

/** Moves the bookmark. It is a segment, never an offset into a rendered list. */
export const setCursor =
  (cursor: SegmentId) =>
  (project: Project): Project => ({ ...project, cursor })
