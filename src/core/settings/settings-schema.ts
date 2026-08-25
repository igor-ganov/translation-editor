import { Schema } from 'effect'

const Language = Schema.Literal('en', 'ru', 'it')
const Provider = Schema.Literal('anthropic', 'openai', 'gemini', 'ollama', 'llamacpp')

/** Validated at the storage boundary, so a stale or hand-edited record cannot crash startup. */
export const settingsSchema = Schema.Struct({
  providerId: Provider,
  model: Schema.String,
  baseUrl: Schema.UndefinedOr(Schema.String),
  apiKeys: Schema.partial(Schema.Record({ key: Provider, value: Schema.String })),
  defaultLanguages: Schema.Struct({ from: Language, to: Language }),
  batchTokens: Schema.Number,
  /** The document to reopen on launch, so the app comes back where it was left. */
  lastProjectId: Schema.UndefinedOr(Schema.String.pipe(Schema.brand('ProjectId'))),
})
