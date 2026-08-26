import { describe, expect, it } from 'vitest'
import { finishNotice } from './finish-notice.js'

describe('finishNotice', () => {
  it('reports a clean run as information', () => {
    expect(finishNotice({ failed: 0, translated: 12 })).toStrictEqual({
      tag: 'info',
      text: 'Translated 12 sentences.',
    })
  })

  it('reports a run where nothing worked as an error, not as "finished"', () => {
    const notice = finishNotice({ failed: 8, translated: 0 })
    expect(notice.tag).toBe('error')
    expect(notice.tag === 'error' && notice.text).toContain('Nothing was translated')
  })

  it('reports a partial run as an error and says where the failures are', () => {
    const notice = finishNotice({ failed: 3, translated: 9 })
    expect(notice.tag).toBe('error')
    expect(notice.tag === 'error' && notice.text).toContain('9')
    expect(notice.tag === 'error' && notice.text).toContain('3')
    expect(notice.tag === 'error' && notice.text).toContain('Went wrong')
  })

  it('points at the reason, which is the thing that was missing entirely before', () => {
    const notice = finishNotice({ failed: 44, translated: 73 })
    expect(notice.tag === 'error' && notice.text).toContain('says why')
  })

  it('treats an empty run as a clean one rather than an error', () => {
    expect(finishNotice({ failed: 0, translated: 0 }).tag).toBe('info')
  })
})
