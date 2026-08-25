import { Schema } from 'effect'

/** Carries the same brand the domain uses, so decoding restores a real `BlockId`. */
export const blockIdSchema = Schema.String.pipe(Schema.brand('BlockId'))
