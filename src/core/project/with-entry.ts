import type { SegmentId } from '../document/types.js'
import type { Entry, Project } from './types.js'

/** Replaces one entry, leaving the rest of the project untouched. */
export const withEntry =
  (project: Project) =>
  (id: SegmentId) =>
  (entry: Entry): Project => ({
    ...project,
    entries: new Map(project.entries).set(id, entry),
  })
