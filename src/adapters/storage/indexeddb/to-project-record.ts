import type { Project } from '../../../core/project/types.js'
import type { projectRecordSchema } from './schemas/project-record-schema.js'

/** Flattens the project's maps for storage; blocks and entries live in their own stores. */
export const toProjectRecord = (project: Project): typeof projectRecordSchema.Type => ({
  id: project.id,
  name: project.name,
  documentHash: project.documentHash,
  languages: project.languages,
  nextSentenceOrdinal: [...project.nextSentenceOrdinal],
  cursor: project.cursor,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
})
