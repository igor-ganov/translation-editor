import { Schema } from 'effect'
import { blockIdSchema } from './block-id-schema.js'
import { blockKindSchema } from './block-kind-schema.js'
import { runSchema } from './run-schema.js'
import { sentenceSchema } from './sentence-schema.js'

export const blockSchema = Schema.Struct({
  id: blockIdSchema,
  kind: blockKindSchema,
  text: Schema.String,
  runs: Schema.Array(runSchema),
  sentences: Schema.Array(sentenceSchema),
  translatable: Schema.Boolean,
})
