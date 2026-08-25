import type { Effect } from 'effect'
import type { ProjectId } from '../../../core/document/types.js'
import type { StorageFailure } from '../../../ports/storage-port.js'
import { stores } from './stores.js'
import { transact } from './transact.js'
import { entriesRange } from './entries-range.js'

const ALL = [stores.projects, stores.blocks, stores.entries, stores.originals] as const

/** Removes a project from every store in one transaction, leaving nothing orphaned. */
export const deleteProject = (id: ProjectId): Effect.Effect<void, StorageFailure> =>
  transact(ALL, 'readwrite')(async (tx) => {
    tx.objectStore(stores.projects).delete(id)
    tx.objectStore(stores.blocks).delete(id)
    tx.objectStore(stores.originals).delete(id)
    tx.objectStore(stores.entries).delete(entriesRange(id))
    await Promise.resolve()
  })
