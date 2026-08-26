import { describe, expect, it } from 'vitest'
import { benignFailure } from './benign-failure.js'

describe('benignFailure', () => {
  it('recognises the ResizeObserver notice that floods the log', () => {
    expect(benignFailure('ResizeObserver loop completed with undelivered notifications.')).toBe(true)
  })

  it('recognises the older wording of the same notice', () => {
    expect(benignFailure('ResizeObserver loop limit exceeded')).toBe(true)
  })

  it('keeps a real failure', () => {
    expect(benignFailure('Cannot read properties of undefined (reading Sentences)')).toBe(false)
  })

  it('keeps a failure that merely mentions resizing', () => {
    expect(benignFailure('ResizeObserver is not defined')).toBe(false)
  })
})
