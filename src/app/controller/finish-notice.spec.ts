import { describe, expect, it } from 'vitest'
import { finishNotice } from './finish-notice.js'

const textOf = (notice: { readonly tag: string; readonly text?: string }): string => notice.text ?? ''

describe('finishNotice', () => {
  it('reports a clean run as information', () => {
    expect(finishNotice({ failed: 0, translated: 12, reason: undefined })).toStrictEqual({
      tag: 'info',
      text: 'Translated 12 sentences.',
    })
  })

  it('reports a run where nothing worked as an error, not as "finished"', () => {
    const notice = finishNotice({ failed: 8, translated: 0, reason: undefined })
    expect(notice.tag).toBe('error')
    expect(textOf(notice)).toContain('Nothing was translated')
  })

  it('reports a partial run as an error and says where the failures are', () => {
    const notice = finishNotice({ failed: 3, translated: 9, reason: undefined })
    expect(notice.tag).toBe('error')
    expect(textOf(notice)).toContain('9')
    expect(textOf(notice)).toContain('3')
    expect(textOf(notice)).toContain('Went wrong')
  })

  it('names the reason, which is the thing the message was missing entirely', () => {
    // 73 translated and 44 failed, and the old message said only that.
    const notice = finishNotice({
      failed: 44,
      translated: 73,
      reason: 'The service rejected the request. {"error":{"message":"credit balance is too low"}}',
    })
    expect(textOf(notice)).toContain('credit balance is too low')
  })

  it('names the reason even when nothing at all came back', () => {
    const notice = finishNotice({ failed: 8, translated: 0, reason: 'Provider rejected the credentials (401).' })
    expect(textOf(notice)).toContain('401')
  })

  it('treats an empty run as a clean one rather than an error', () => {
    expect(finishNotice({ failed: 0, translated: 0, reason: undefined }).tag).toBe('info')
  })
})
