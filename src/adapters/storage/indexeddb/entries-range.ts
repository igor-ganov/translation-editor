import type { ProjectId } from '../../../core/document/types.js'

/**
 * Every entry belonging to one project. The entries store is keyed
 * `[projectId, segmentId]`, and IndexedDB sorts arrays after every string, so an
 * empty array is the exclusive upper bound for a given project.
 */
export const entriesRange = (id: ProjectId): IDBKeyRange => IDBKeyRange.bound([id], [id, []])
