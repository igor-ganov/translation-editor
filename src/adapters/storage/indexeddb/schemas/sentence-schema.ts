import { Schema } from 'effect'
import { sentenceIdSchema } from './sentence-id-schema.js'

export const sentenceSchema = Schema.Struct({
  id: sentenceIdSchema,
  start: Schema.Number,
  end: Schema.Number,
})
