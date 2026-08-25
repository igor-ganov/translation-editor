import { Option, pipe } from 'effect'
import { fromUndefined } from '../../core/option/from-undefined.js'
import type { HttpRequest } from '../../ports/http-port.js'

/**
 * `exactOptionalPropertyTypes` makes `body: undefined` a type error against
 * `RequestInit`, so an absent body is omitted from the object rather than set.
 */
const bodyOf = (request: HttpRequest): { readonly body?: string } =>
  pipe(
    fromUndefined(request.body),
    Option.map((body) => ({ body })),
    Option.getOrElse((): { readonly body?: string } => ({})),
  )

/** Shared request shaping for both the browser and the Tauri transport. */
export const fetchInit = (request: HttpRequest, signal: AbortSignal): RequestInit => ({
  method: request.method,
  headers: request.headers,
  signal,
  ...bodyOf(request),
})
