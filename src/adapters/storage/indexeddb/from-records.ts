import { Option, pipe } from 'effect'
import type { Project } from '../../../core/project/types.js'
import type { blocksRecordSchema } from './schemas/blocks-record-schema.js'
import type { entryRecordSchema } from './schemas/entry-record-schema.js'
import type { projectRecordSchema } from './schemas/project-record-schema.js'
import { repairName } from '../../../core/project/repair-name.js'

type ProjectRecord = typeof projectRecordSchema.Type
type BlocksRecord = typeof blocksRecordSchema.Type
type EntryRecord = typeof entryRecordSchema.Type

/**
 * Reassembles a project from its three stores. Missing blocks or entries yield an
 * empty document rather than a failure, so a partially written project can still
 * be opened and deleted instead of wedging the app.
 */
export const fromRecords =
  (blocks: Option.Option<BlocksRecord>, entries: readonly EntryRecord[]) =>
  (record: Option.Option<ProjectRecord>): Option.Option<Project> =>
    pipe(
      record,
      Option.map((found): Project => repairName({
          id: found.id,
          name: found.name,
          documentHash: found.documentHash,
          source: pipe(blocks, Option.map((row) => row.blocks), Option.getOrElse((): Project['source'] => [])),
          languages: found.languages,
          entries: new Map(entries.map((row) => [row.segmentId, row.entry])),
          nextSentenceOrdinal: new Map(found.nextSentenceOrdinal),
          cursor: found.cursor,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
      })),
    )
