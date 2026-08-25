import { Effect } from 'effect'
import type { HttpPort, HttpRequest, HttpResponse } from '../../src/ports/http-port.js'

export type Recorded = { readonly requests: HttpRequest[] }

/** An HttpPort that replays a scripted response and records what it was sent. */
export const stubHttp = (
  respond: (request: HttpRequest) => HttpResponse,
): HttpPort & Recorded => {
  const requests: HttpRequest[] = []
  return {
    requests,
    send: (request) =>
      Effect.sync(() => {
        requests.push(request)
        return respond(request)
      }),
  }
}

export const jsonResponse = (payload: unknown, status = 200): HttpResponse => ({
  status,
  body: JSON.stringify(payload),
})

export const failingHttp = (status: number, body = '{"error":"nope"}'): HttpPort & Recorded =>
  stubHttp(() => ({ status, body }))
