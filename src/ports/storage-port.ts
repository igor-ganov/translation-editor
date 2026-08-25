import type { Effect, Option } from 'effect'
import type { ProjectId, SegmentId } from '../core/document/types.js'
import type { Entry, Project } from '../core/project/types.js'

export type ProjectSummary = {
  readonly id: ProjectId
  readonly name: string
  readonly updatedAt: number
}

export type StorageFailure = { readonly tag: 'storageFailed'; readonly message: string }

/**
 * Entries are written one at a time rather than as part of the whole project: an
 * edit must cost a single small transaction, so an abrupt kill can lose at most
 * the last change instead of corrupting the document.
 */
export type StoragePort = {
  readonly listProjects: () => Effect.Effect<readonly ProjectSummary[], StorageFailure>
  readonly loadProject: (id: ProjectId) => Effect.Effect<Option.Option<Project>, StorageFailure>
  readonly saveProject: (project: Project) => Effect.Effect<void, StorageFailure>
  readonly saveEntry: (
    id: ProjectId,
  ) => (segment: SegmentId, entry: Entry) => Effect.Effect<void, StorageFailure>
  readonly saveCursor: (id: ProjectId) => (cursor: SegmentId) => Effect.Effect<void, StorageFailure>
  readonly deleteProject: (id: ProjectId) => Effect.Effect<void, StorageFailure>
  readonly saveOriginal: (id: ProjectId) => (bytes: Uint8Array) => Effect.Effect<void, StorageFailure>
  readonly loadOriginal: (id: ProjectId) => Effect.Effect<Option.Option<Uint8Array>, StorageFailure>
}
