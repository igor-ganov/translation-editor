import type { Effect } from 'effect'

export type HttpRequest = {
  readonly url: string
  readonly method: 'GET' | 'POST'
  readonly headers: Readonly<Record<string, string>>
  readonly body: string | undefined
}

export type HttpResponse = {
  readonly status: number
  readonly body: string
}

export type HttpFailure = { readonly tag: 'network'; readonly message: string }

/**
 * A minimal request/response port. Tauri routes this through Rust so third-party
 * APIs are reachable without CORS; the browser build uses `fetch` and is subject
 * to whatever the provider allows.
 *
 * There is deliberately no cancellation token here: each adapter wires its own
 * abort controller to Effect interruption, so cancelling the fibre cancels the
 * in-flight request without every caller threading a signal through.
 */
export type HttpPort = {
  readonly send: (request: HttpRequest) => Effect.Effect<HttpResponse, HttpFailure>
}
