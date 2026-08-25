import { Either } from 'effect'
import type { SegmentId } from '../document/types.js'

export type ReconcileFailure = {
  readonly tag: 'idMismatch'
  readonly missing: readonly string[]
  readonly unexpected: readonly string[]
}

export type ReturnedSegment = { readonly id: string; readonly text: string }

const difference = (from: readonly string[], against: ReadonlySet<string>): readonly string[] =>
  from.filter((id) => !against.has(id))

/**
 * Checks a provider's reply segment by segment before any of it is stored.
 *
 * Schema-constrained output guarantees the shape of the reply but not its
 * contents: a model can still drop a sentence, merge two, or invent an id. Set
 * equality on the ids is the only thing that catches that, and it matters most
 * with small local models. A batch that fails here is rejected whole.
 */
export const reconcileBatch =
  (requested: readonly SegmentId[]) =>
  (returned: readonly ReturnedSegment[]): Either.Either<ReadonlyMap<SegmentId, string>, ReconcileFailure> => {
    const wanted = new Set<string>(requested)
    const got = new Set(returned.map((segment) => segment.id))
    const missing = difference([...wanted], got)
    const unexpected = difference([...got], wanted)
    switch (missing.length + unexpected.length) {
      case 0:
        return Either.right(
          new Map(requested.map((id) => [id, returned.find((segment) => segment.id === id)?.text ?? ''])),
        )
      default:
        return Either.left({ tag: 'idMismatch', missing, unexpected })
    }
  }
