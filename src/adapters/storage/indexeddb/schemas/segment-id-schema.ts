import { Schema } from 'effect'
import { blockIdSchema } from './block-id-schema.js'
import { sentenceIdSchema } from './sentence-id-schema.js'

export const segmentIdSchema = Schema.Union(blockIdSchema, sentenceIdSchema)
