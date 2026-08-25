import type { Effect } from 'effect'
import type { Project } from '../../../core/project/types.js'
import type { StorageFailure } from '../../../ports/storage-port.js'
import { stores } from './stores.js'
import { transact } from './transact.js'
import { toProjectRecord } from './to-project-record.js'

/**
 * Writes the whole project. Used at import and after a boundary edit; ordinary
 * translation edits go through `saveEntry`, which touches one small record.
 */
export const saveProject = (project: Project): Effect.Effect<void, StorageFailure> =>
  transact([stores.projects, stores.blocks, stores.entries], 'readwrite')(async (tx) => {
    tx.objectStore(stores.projects).put(toProjectRecord(project))
    tx.objectStore(stores.blocks).put({ projectId: project.id, blocks: project.source })
    for (const [segmentId, entry] of project.entries) {
      tx.objectStore(stores.entries).put({ projectId: project.id, segmentId, entry })
    }
    await Promise.resolve()
  })
