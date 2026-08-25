import { Either, Option, Schema, pipe } from 'effect'
import { decodeOrMalformed } from '../decode-or-malformed.js'
import type { ProviderError } from '../../../ports/provider-port.js'

const ToolBlock = Schema.Struct({ type: Schema.Literal('tool_use'), input: Schema.Unknown })
const TextBlock = Schema.Struct({ type: Schema.Literal('text'), text: Schema.String })
const OtherBlock = Schema.Struct({ type: Schema.String })

const Reply = Schema.Struct({
  content: Schema.Array(Schema.Union(ToolBlock, TextBlock, OtherBlock)),
})

type Block = typeof Reply.Type['content'][number]

const isTool = (block: Block): block is typeof ToolBlock.Type => block.type === 'tool_use'
const isText = (block: Block): block is typeof TextBlock.Type => block.type === 'text'

const fromTool = (blocks: readonly Block[]): Option.Option<string> =>
  Option.map(Option.fromIterable(blocks.filter(isTool)), (block) => JSON.stringify(block.input))

const fromText = (blocks: readonly Block[]): Option.Option<string> =>
  Option.map(Option.fromIterable(blocks.filter(isText)), (block) => block.text)

/**
 * The translation payload from an Anthropic reply. A forced tool call puts it in
 * `input`, already parsed; a plain completion puts it in `text`. Both are supported
 * so a model that ignores the tool still produces a usable answer.
 */
export const anthropicText = (payload: unknown): Either.Either<string, ProviderError> =>
  Either.flatMap(decodeOrMalformed(Reply)(payload), (reply) =>
    Either.fromOption(
      pipe(fromTool(reply.content), Option.orElse(() => fromText(reply.content))),
      (): ProviderError => ({ tag: 'malformedResponse', message: 'Anthropic reply carried no usable content block.' }),
    ),
  )
