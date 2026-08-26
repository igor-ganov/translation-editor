import { describe, expect, it } from 'vitest'
import { failureReason } from './failure-reason.js'

describe('failureReason', () => {
  it('keeps the service’s own words, which are the part worth reading', () => {
    const reason = failureReason({
      tag: 'badRequest',
      message: '{"error":{"message":"max_tokens: 26400 > 16000"}}',
    })
    expect(reason).toContain('max_tokens: 26400 > 16000')
  })

  it('names the status of a transient failure', () => {
    expect(failureReason({ tag: 'transient', status: 503, message: 'upstream busy' })).toContain('(503)')
  })

  it('omits the brackets when there was no status at all', () => {
    expect(failureReason({ tag: 'transient', status: undefined, message: 'network down' })).not.toContain('(')
  })

  it('passes an authentication failure through unadorned', () => {
    expect(failureReason({ tag: 'auth', message: 'Provider rejected the credentials (401).' }))
      .toBe('Provider rejected the credentials (401).')
  })

  it('says a malformed reply was unreadable rather than rejected', () => {
    expect(failureReason({ tag: 'malformedResponse', message: 'unexpected end of JSON' }))
      .toContain('could not be read')
  })

  it('counts what a mismatched reply left out, which is the shape truncation takes', () => {
    const reason = failureReason({ tag: 'idMismatch', missing: ['b3.s1', 'b3.s2'], unexpected: [] })
    expect(reason).toContain('2 sentence(s) missing')
    expect(reason).toContain('b3.s1')
  })
})
