import { Schema } from 'effect'

/** The reply shape every provider is constrained to produce and validated against. */
export const translationSchema = Schema.Struct({
  segments: Schema.Array(Schema.Struct({ id: Schema.String, text: Schema.String })),
})
