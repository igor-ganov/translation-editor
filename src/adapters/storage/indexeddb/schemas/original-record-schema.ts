import { Schema } from 'effect'
import { projectIdSchema } from './project-id-schema.js'

/** The imported file, kept so the document can be re-exported without it. */
export const originalRecordSchema = Schema.Struct({
  projectId: projectIdSchema,
  bytes: Schema.Uint8ArrayFromSelf,
})
