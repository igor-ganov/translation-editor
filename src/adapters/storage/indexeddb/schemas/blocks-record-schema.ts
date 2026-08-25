import { Schema } from 'effect'
import { blockSchema } from './block-schema.js'
import { projectIdSchema } from './project-id-schema.js'

/** Written once at import and again only when sentence boundaries change. */
export const blocksRecordSchema = Schema.Struct({
  projectId: projectIdSchema,
  blocks: Schema.Array(blockSchema),
})
