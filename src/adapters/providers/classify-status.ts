import { Option, pipe } from 'effect'
import type { ProviderError } from '../../ports/provider-port.js'
import { providerMessage } from './provider-message.js'

type Rule = readonly [(status: number) => boolean, (status: number, body: string) => ProviderError]

/** Applied after the message is lifted out, so a long envelope cannot hide a short reason. */
const excerpt = (body: string) => body.slice(0, 400)

const RULES: readonly Rule[] = [
  [
    (status) => status === 401 || status === 403,
    (status) => ({ tag: 'auth', message: `Provider rejected the credentials (${String(status)}).` }),
  ],
  [
    (status) => status === 429 || status >= 500,
    (status, body) => ({ tag: 'transient', status, message: excerpt(providerMessage(body)) }),
  ],
  [(status) => status >= 400, (_status, body) => ({ tag: 'badRequest', message: excerpt(providerMessage(body)) })],
]

/**
 * Maps an HTTP status onto the retry policy. Only `transient` is retried, because
 * an auth or request error fails identically however many times it is sent.
 */
export const classifyStatus = (status: number, body: string): ProviderError =>
  pipe(
    Option.fromIterable(RULES.filter(([matches]) => matches(status))),
    Option.map(([, build]) => build(status, body)),
    Option.getOrElse((): ProviderError => ({ tag: 'transient', status, message: excerpt(body) })),
  )
