import { Option, Schema } from 'effect'

/**
 * Decodes one stored record, treating anything that no longer matches as absent.
 *
 * A record written by an older version is dropped rather than crashing the app:
 * losing one paragraph's translation is recoverable, a database that refuses to
 * open is not.
 */
export const decodeRecord =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (payload: unknown): Option.Option<A> =>
    Option.getRight(Schema.decodeUnknownEither(schema)(payload))
