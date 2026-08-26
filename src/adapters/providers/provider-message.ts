import { Either, Option, Schema, pipe } from 'effect'

const NESTED = Schema.Struct({ error: Schema.Struct({ message: Schema.String }) })
const PLAIN = Schema.Struct({ error: Schema.String })
const BARE = Schema.Struct({ message: Schema.String })

/** The shapes the five supported services put an explanation in. First match wins. */
const SHAPES: readonly ((value: unknown) => readonly string[])[] = [
  (value) =>
    Either.match(Schema.decodeUnknownEither(NESTED)(value), {
      onLeft: () => [],
      onRight: (body) => [body.error.message],
    }),
  (value) =>
    Either.match(Schema.decodeUnknownEither(PLAIN)(value), { onLeft: () => [], onRight: (body) => [body.error] }),
  (value) =>
    Either.match(Schema.decodeUnknownEither(BARE)(value), { onLeft: () => [], onRight: (body) => [body.message] }),
]

/**
 * The sentence a service wrote, lifted out of the envelope it wrote it in.
 *
 * A refusal arrives in JSON, and printing the whole object left the one readable
 * part — "Your credit balance is too low" — behind two levels of quoting on a
 * phone screen. A body that is not JSON, or is JSON of an unfamiliar shape, is
 * passed through untouched rather than swallowed.
 */
export const providerMessage = (body: string): string =>
  pipe(
    Either.try((): unknown => JSON.parse(body)),
    Either.match({
      onLeft: (): readonly string[] => [],
      onRight: (value) => SHAPES.flatMap((read) => read(value)),
    }),
    Option.fromIterable,
    Option.getOrElse(() => body),
  )
