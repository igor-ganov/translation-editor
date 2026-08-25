import { Schema } from 'effect'
import { entrySchema } from './entry-schema.js'
import { projectIdSchema } from './project-id-schema.js'
import { segmentIdSchema } from './segment-id-schema.js'

export const entryRecordSchema = Schema.Struct({
  projectId: projectIdSchema,
  segmentId: segmentIdSchema,
  entry: entrySchema,
})
