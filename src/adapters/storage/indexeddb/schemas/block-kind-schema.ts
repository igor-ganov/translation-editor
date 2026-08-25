import { Schema } from 'effect'

export const blockKindSchema = Schema.Union(
  Schema.Struct({ tag: Schema.Literal('paragraph') }),
  Schema.Struct({ tag: Schema.Literal('heading'), level: Schema.Literal(1, 2, 3, 4, 5, 6) }),
  Schema.Struct({ tag: Schema.Literal('listItem'), ordered: Schema.Boolean, depth: Schema.Number }),
  Schema.Struct({ tag: Schema.Literal('tableCell'), row: Schema.Number, column: Schema.Number }),
)
