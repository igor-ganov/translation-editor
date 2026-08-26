const tally = (reasons: readonly string[]): ReadonlyMap<string, number> =>
  reasons.reduce(
    (counts, reason) => new Map(counts).set(reason, (counts.get(reason) ?? 0) + 1),
    new Map<string, number>(),
  )

/**
 * The reason most of the failures gave.
 *
 * A run that rejects forty-four sentences usually rejects them all for one
 * reason, and that reason belongs in the message rather than only beside each
 * sentence — the first thing anyone wants to know is what went wrong, not how
 * many times it went wrong.
 */
export const commonReason = (reasons: readonly string[]): string | undefined =>
  [...tally(reasons)].sort(([, a], [, b]) => b - a)[0]?.[0]
