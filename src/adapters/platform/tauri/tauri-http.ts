import { Effect } from 'effect'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { fetchInit } from '../fetch-init.js'
import type { HttpFailure, HttpPort, HttpRequest, HttpResponse } from '../../../ports/http-port.js'

const read = async (request: HttpRequest, signal: AbortSignal): Promise<HttpResponse> => {
  const response = await tauriFetch(request.url, fetchInit(request, signal))
  return { status: response.status, body: await response.text() }
}

/**
 * Requests issued from Rust rather than the webview, so CORS does not apply.
 * This is what makes OpenAI and Gemini usable at all: neither serves permissive
 * CORS to a `tauri://localhost` origin. Hosts are scoped in the app capabilities.
 */
export const tauriHttp = (): HttpPort => ({
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
