import { Schema } from 'effect'

export const sentenceIdSchema = Schema.String.pipe(Schema.brand('SentenceId'))
