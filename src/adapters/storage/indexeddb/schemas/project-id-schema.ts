import { Schema } from 'effect'

export const projectIdSchema = Schema.String.pipe(Schema.brand('ProjectId'))
