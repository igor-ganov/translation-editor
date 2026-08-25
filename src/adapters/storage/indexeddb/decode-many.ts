import { Option, Schema } from 'effect'
import { decodeRecord } from './decode-record.js'

/** Decodes a `getAll` result, silently skipping rows that no longer match. */
export const decodeMany =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (payload: unknown): readonly A[] =>
    Option.toArray(decodeRecord(Schema.Array(Schema.Unknown))(payload)).flatMap((rows) =>
      rows.flatMap((row) => Option.toArray(decodeRecord(schema)(row))),
    )
