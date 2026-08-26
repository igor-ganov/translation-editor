import { describe, expect, it } from 'vitest'
import { providerMessage } from './provider-message.js'

describe('providerMessage', () => {
  it('lifts the explanation out of an Anthropic refusal', () => {
    // The body that ended a real run, printed in full on a phone screen.
    const body = '{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."},"request_id":"req_011"}'
    expect(providerMessage(body)).toBe(
      'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.',
    )
  })

  it('reads the shape OpenAI and Gemini use', () => {
    expect(providerMessage('{"error":{"message":"model not found","type":"invalid_request_error"}}')).toBe(
      'model not found',
    )
  })

  it('reads the shape a local server uses, where the error is the string itself', () => {
    expect(providerMessage('{"error":"model \'llama9\' not found"}')).toBe("model 'llama9' not found")
  })

  it('reads a bare message', () => {
    expect(providerMessage('{"message":"rate limited"}')).toBe('rate limited')
  })

  it('passes a body that is not JSON through untouched', () => {
    expect(providerMessage('<html>502 Bad Gateway</html>')).toBe('<html>502 Bad Gateway</html>')
  })

  it('passes JSON of an unfamiliar shape through rather than swallowing it', () => {
    expect(providerMessage('{"detail":"something else"}')).toBe('{"detail":"something else"}')
  })

  it('passes an empty body through', () => {
    expect(providerMessage('')).toBe('')
  })
})
