import { Either, Option, Schema } from 'effect'
import { decodeOrMalformed } from '../decode-or-malformed.js'
import type { ProviderError } from '../../../ports/provider-port.js'

const Reply = Schema.Struct({
  choices: Schema.Array(Schema.Struct({ message: Schema.Struct({ content: Schema.String }) })),
})

/** Shared by every OpenAI-compatible endpoint: OpenAI itself, llama.cpp, Ollama's compat route. */
export const chatCompletionsText = (payload: unknown): Either.Either<string, ProviderError> =>
  Either.flatMap(decodeOrMalformed(Reply)(payload), (reply) =>
    Either.fromOption(
      Option.map(Option.fromIterable(reply.choices), (choice) => choice.message.content),
      (): ProviderError => ({ tag: 'malformedResponse', message: 'Reply contained no choices.' }),
    ),
  )
