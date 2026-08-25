import { Schema } from 'effect'

/** One segment's translation and approval — the store written on every edit. */
export const entrySchema = Schema.Struct({
  translation: Schema.Union(
    Schema.Struct({ tag: Schema.Literal('absent') }),
    Schema.Struct({ tag: Schema.Literal('machine'), text: Schema.String }),
    Schema.Struct({ tag: Schema.Literal('edited'), text: Schema.String }),
    Schema.Struct({ tag: Schema.Literal('failed'), reason: Schema.String }),
  ),
  approved: Schema.Boolean,
})
