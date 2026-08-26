import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { runTally } from './run-tally.js'

const noted = () => {
  const seen: string[] = []
  return { seen, note: (reason: string) => void seen.push(reason) }
}

describe('runTally', () => {
  it('reports a run in which everything worked', () => {
    expect(runTally(() => {}).outcome(12)).toStrictEqual({ failed: 0, translated: 12, reason: undefined })
  })

  it('counts only what this run attempted, not what the document already had', () => {
    // The message that prompted this said "Translated 73, but 44 failed" on a run
    // that translated nothing: the 73 were already there from an earlier attempt.
    const tally = runTally(() => {})
    Effect.runSync(tally.record('rejected', 44))
    expect(tally.outcome(44)).toStrictEqual({ failed: 44, translated: 0, reason: 'rejected' })
  })

  it('splits a partly successful run correctly', () => {
    const tally = runTally(() => {})
    Effect.runSync(tally.record('rejected', 3))
    expect(tally.outcome(10)).toStrictEqual({ failed: 3, translated: 7, reason: 'rejected' })
  })

  it('reports the reason most of the failures gave', () => {
    const tally = runTally(() => {})
    Effect.runSync(tally.record('one off', 1))
    Effect.runSync(tally.record('the usual', 9))
    expect(tally.outcome(10).reason).toBe('the usual')
  })

  it('hands every failure to the caller as it happens, for the log', () => {
    const { seen, note } = noted()
    const tally = runTally(note)
    Effect.runSync(tally.record('rejected', 2))
    expect(seen).toStrictEqual(['rejected'])
  })
})
