import { Option } from 'effect'
import type { Entry } from '../../../core/project/types.js'
import type { ProjectId, SegmentId } from '../../../core/document/types.js'
import type { ProjectSummary, StoragePort } from '../../../ports/storage-port.js'
import { stores } from './stores.js'
import { transact } from './transact.js'
import { requestResult } from './request-result.js'
import { decodeRecord } from './decode-record.js'
import { decodeMany } from './decode-many.js'
import { originalRecordSchema } from './schemas/original-record-schema.js'
import { projectRecordSchema } from './schemas/project-record-schema.js'
import { loadProject } from './load-project.js'
import { saveProject } from './save-project.js'
import { deleteProject } from './delete-project.js'

const summarise = (row: typeof projectRecordSchema.Type): ProjectSummary => ({
  id: row.id,
  name: row.name,
  updatedAt: row.updatedAt,
})

/** IndexedDB-backed persistence, available in both the Android WebView and the browser. */
export const createStorage = (): StoragePort => ({
  loadProject,
  saveProject,
  deleteProject,

  listProjects: () =>
    transact([stores.projects], 'readonly')(async (tx) =>
      decodeMany(projectRecordSchema)(await requestResult(tx.objectStore(stores.projects).getAll()))
        .map(summarise)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    ),

  saveEntry: (id: ProjectId) => (segmentId: SegmentId, entry: Entry) =>
    transact([stores.entries], 'readwrite')(async (tx) => {
      tx.objectStore(stores.entries).put({ projectId: id, segmentId, entry })
      await Promise.resolve()
    }),

  saveCursor: (id: ProjectId) => (cursor: SegmentId) =>
    transact([stores.projects], 'readwrite')(async (tx) => {
      const store = tx.objectStore(stores.projects)
      const record = decodeRecord(projectRecordSchema)(await requestResult(store.get(id)))
      for (const found of Option.toArray(record)) store.put({ ...found, cursor })
    }),

  saveOriginal: (id: ProjectId) => (bytes: Uint8Array) =>
    transact([stores.originals], 'readwrite')(async (tx) => {
      tx.objectStore(stores.originals).put({ projectId: id, bytes })
      await Promise.resolve()
    }),

  loadOriginal: (id: ProjectId) =>
    transact([stores.originals], 'readonly')(async (tx) =>
      Option.map(
        decodeRecord(originalRecordSchema)(await requestResult(tx.objectStore(stores.originals).get(id))),
        (row) => row.bytes,
      ),
    ),
})
