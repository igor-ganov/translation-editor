import { Effect } from 'effect'
import { fetchInit } from '../fetch-init.js'
import type { HttpFailure, HttpPort, HttpRequest, HttpResponse } from '../../../ports/http-port.js'

const read = async (request: HttpRequest, signal: AbortSignal): Promise<HttpResponse> => {
  const response = await fetch(request.url, fetchInit(request, signal))
  return { status: response.status, body: await response.text() }
}

/**
 * Plain `fetch`. Subject to CORS, so of the five providers only Anthropic (via its
 * browser opt-in header) and a permissively configured local server are reachable
 * this way. The Tauri build routes through Rust and has no such limit.
 *
 * The abort controller is returned as the finaliser, so interrupting the fibre
 * cancels the request in flight.
 */
export const browserHttp = (): HttpPort => ({
  send: (request) =>
    Effect.async<HttpResponse, HttpFailure>((resume) => {
      const controller = new AbortController()
      read(request, controller.signal).then(
        (response) => {
          resume(Effect.succeed(response))
        },
        (cause: unknown) => {
          resume(Effect.fail({ tag: 'network', message: String(cause) }))
        },
      )
      return Effect.sync(() => {
        controller.abort()
      })
    }),
})
