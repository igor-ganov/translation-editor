import { describe, expect, it } from 'vitest'
import { Effect, Exit } from 'effect'
import { createProvider } from './create-provider.js'
import type { ProviderId, TranslateRequest } from '../../ports/provider-port.js'
import { failingHttp, jsonResponse, stubHttp } from '../../../tests/support/stub-http.js'

const request: TranslateRequest = {
  segments: [{ id: 'b0.s0', text: 'One thing happened.' }],
  from: 'en',
  to: 'ru',
  context: 'Surrounding text.',
}

const payload = JSON.stringify({ segments: [{ id: 'b0.s0', text: 'Одно случилось.' }] })

/** Each provider wraps the same JSON payload in its own envelope. */
const ENVELOPES: Record<ProviderId, unknown> = {
  anthropic: { content: [{ type: 'tool_use', input: { segments: [{ id: 'b0.s0', text: 'Одно случилось.' }] } }] },
  openai: { choices: [{ message: { content: payload } }] },
  llamacpp: { choices: [{ message: { content: payload } }] },
  gemini: { candidates: [{ content: { parts: [{ text: payload }] } }] },
  ollama: { message: { content: payload } },
}

const IDS: readonly ProviderId[] = ['anthropic', 'openai', 'gemini', 'ollama', 'llamacpp']

const config = { apiKey: 'test-key', baseUrl: undefined, model: 'test-model' }

const errorOf = async (id: ProviderId, status: number) => {
  const provider = createProvider(id)(config)(failingHttp(status))
  const exit = await Effect.runPromiseExit(provider.translate(request))
  return JSON.stringify(Exit.causeOption(exit))
}

describe.each(IDS)('provider %s', (id) => {
  it('returns the translated segments from its own envelope', async () => {
    const http = stubHttp(() => jsonResponse(ENVELOPES[id]))
    const segments = await Effect.runPromise(createProvider(id)(config)(http).translate(request))
    expect(segments).toStrictEqual([{ id: 'b0.s0', text: 'Одно случилось.' }])
  })

  it('sends a POST carrying the segment id and its text', async () => {
    const http = stubHttp(() => jsonResponse(ENVELOPES[id]))
    await Effect.runPromise(createProvider(id)(config)(http).translate(request))
    const sent = http.requests[0]
    expect(sent?.method).toBe('POST')
    expect(sent?.body).toContain('b0.s0')
    expect(sent?.body).toContain('One thing happened.')
  })

  it('classifies 401 as an auth failure that must not be retried', async () => {
    expect(await errorOf(id, 401)).toContain('auth')
  })

  it('classifies 429 as transient', async () => {
    expect(await errorOf(id, 429)).toContain('transient')
  })

  it('classifies 500 as transient', async () => {
    expect(await errorOf(id, 500)).toContain('transient')
  })

  it('classifies 400 as a bad request', async () => {
    expect(await errorOf(id, 400)).toContain('badRequest')
  })

  it('reports a reply in the wrong shape as malformed rather than crashing', async () => {
    const http = stubHttp(() => jsonResponse({ unexpected: true }))
    const exit = await Effect.runPromiseExit(createProvider(id)(config)(http).translate(request))
    expect(JSON.stringify(Exit.causeOption(exit))).toContain('malformedResponse')
  })

  it('reports a non-JSON body as malformed', async () => {
    const http = stubHttp(() => ({ status: 200, body: '<html>gateway</html>' }))
    const exit = await Effect.runPromiseExit(createProvider(id)(config)(http).translate(request))
    expect(JSON.stringify(Exit.causeOption(exit))).toContain('malformedResponse')
  })
})

describe('provider transport details', () => {
  it('sends the Anthropic version header the API requires', async () => {
    const http = stubHttp(() => jsonResponse(ENVELOPES.anthropic))
    await Effect.runPromise(createProvider('anthropic')(config)(http).translate(request))
    expect(http.requests[0]?.headers['anthropic-version']).toBe('2023-06-01')
  })

  it('sends a bearer token to OpenAI and an api-key header to Gemini', async () => {
    const openaiHttp = stubHttp(() => jsonResponse(ENVELOPES.openai))
    const geminiHttp = stubHttp(() => jsonResponse(ENVELOPES.gemini))
    await Effect.runPromise(createProvider('openai')(config)(openaiHttp).translate(request))
    await Effect.runPromise(createProvider('gemini')(config)(geminiHttp).translate(request))
    expect(openaiHttp.requests[0]?.headers['authorization']).toBe('Bearer test-key')
    expect(geminiHttp.requests[0]?.headers['x-goog-api-key']).toBe('test-key')
  })

  it('honours a user-supplied base url for the local providers', async () => {
    const http = stubHttp(() => jsonResponse(ENVELOPES.ollama))
    const local = { apiKey: undefined, baseUrl: 'http://192.168.1.5:11434/', model: 'llama3' }
    await Effect.runPromise(createProvider('ollama')(local)(http).translate(request))
    expect(http.requests[0]?.url).toBe('http://192.168.1.5:11434/api/chat')
  })

  it('lists models for each provider', async () => {
    const http = stubHttp(() => jsonResponse({ data: [{ id: 'model-a' }], models: [{ name: 'model-a' }] }))
    for (const id of IDS) {
      expect(await Effect.runPromise(createProvider(id)(config)(http).listModels())).toStrictEqual(['model-a'])
    }
  })
})
