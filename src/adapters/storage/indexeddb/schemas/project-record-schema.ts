import { Schema } from 'effect'
import { blockIdSchema } from './block-id-schema.js'
import { languageSchema } from './language-schema.js'
import { projectIdSchema } from './project-id-schema.js'
import { segmentIdSchema } from './segment-id-schema.js'

/** Project metadata only; blocks and entries live in their own stores. */
export const projectRecordSchema = Schema.Struct({
  id: projectIdSchema,
  name: Schema.String,
  documentHash: Schema.String,
  languages: Schema.Struct({ from: languageSchema, to: languageSchema }),
  nextSentenceOrdinal: Schema.Array(Schema.Tuple(blockIdSchema, Schema.Number)),
  cursor: Schema.UndefinedOr(segmentIdSchema),
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
})
