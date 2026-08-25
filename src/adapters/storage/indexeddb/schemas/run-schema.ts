import { Schema } from 'effect'

/** Inline formatting as a range over the block's text. */
export const runSchema = Schema.Struct({
  start: Schema.Number,
  end: Schema.Number,
  bold: Schema.Boolean,
  italic: Schema.Boolean,
  underline: Schema.Boolean,
})
