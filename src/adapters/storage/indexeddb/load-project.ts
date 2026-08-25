import type { Effect, Option } from 'effect'
import type { ProjectId } from '../../../core/document/types.js'
import type { Project } from '../../../core/project/types.js'
import type { StorageFailure } from '../../../ports/storage-port.js'
import { stores } from './stores.js'
import { transact } from './transact.js'
import { requestResult } from './request-result.js'
import { decodeRecord } from './decode-record.js'
import { decodeMany } from './decode-many.js'
import { blocksRecordSchema } from './schemas/blocks-record-schema.js'
import { entryRecordSchema } from './schemas/entry-record-schema.js'
import { projectRecordSchema } from './schemas/project-record-schema.js'
import { entriesRange } from './entries-range.js'
import { fromRecords } from './from-records.js'

/** Reads a project back from its three stores in one consistent snapshot. */
export const loadProject = (id: ProjectId): Effect.Effect<Option.Option<Project>, StorageFailure> =>
  transact([stores.projects, stores.blocks, stores.entries], 'readonly')(async (tx) => {
    const project = decodeRecord(projectRecordSchema)(
      await requestResult(tx.objectStore(stores.projects).get(id)),
    )
    const blocks = decodeRecord(blocksRecordSchema)(
      await requestResult(tx.objectStore(stores.blocks).get(id)),
    )
    const entries = decodeMany(entryRecordSchema)(
      await requestResult(tx.objectStore(stores.entries).getAll(entriesRange(id))),
    )
    return fromRecords(blocks, entries)(project)
  })
