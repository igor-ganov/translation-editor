import { describe, expect, it } from 'vitest'
import { renderProjectsWhen } from './render-projects-when.js'

const at = (iso: string): number => new Date(iso).getTime()

describe('renderProjectsWhen', () => {
  const now = at('2026-03-14T09:00:00')

  it('says today for anything touched since midnight', () => {
    expect(renderProjectsWhen(at('2026-03-14T00:10:00'), now)).toBe('today')
  })

  it('counts calendar days, not elapsed hours', () => {
    expect(renderProjectsWhen(at('2026-03-13T23:50:00'), now)).toBe('yesterday')
  })

  it('names the day once it is older than that', () => {
    expect(renderProjectsWhen(at('2026-03-12T09:00:00'), now)).toBe('12 March')
  })

  it('names the day for anything dated ahead of now', () => {
    expect(renderProjectsWhen(at('2026-03-20T09:00:00'), now)).toBe('20 March')
  })
})
