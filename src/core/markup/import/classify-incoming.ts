import { Match, Option, pipe } from 'effect'
import type { SegmentId } from '../../document/types.js'
import type { Project } from '../../project/types.js'
import { lookupEntry } from '../../project/lookup-entry.js'
import { translationText } from '../../translation/translation-text.js'

export type Verdict = 'unknown' | 'added' | 'changed' | 'unchanged'

type Shape = 'notSupplied' | 'fresh' | 'same' | 'different'

const currentText = (project: Project) => (id: SegmentId): string =>
  pipe(
    lookupEntry(project.entries)(id),
    Option.flatMap((entry) => translationText(entry.translation)),
    Option.getOrElse(() => ''),
  )

/** An empty incoming value means "not supplied" and never erases existing work. */
const shapeOf = (current: string, incoming: string): Shape =>
  Match.value({ current, incoming }).pipe(
    Match.when({ incoming: '' }, (): Shape => 'notSupplied'),
    Match.when({ current: '' }, (): Shape => 'fresh'),
    Match.when((pair) => pair.current === pair.incoming, (): Shape => 'same'),
    Match.orElse((): Shape => 'different'),
  )

const VERDICT_OF: Record<Shape, Verdict> = {
  notSupplied: 'unchanged',
  fresh: 'added',
  same: 'unchanged',
  different: 'changed',
}

/** Decides what an incoming translation does to the segment it addresses. */
export const classifyIncoming =
  (project: Project) =>
  (known: ReadonlySet<SegmentId>) =>
  (id: SegmentId, incoming: string): Verdict =>
    pipe(
      Option.liftPredicate((candidate: SegmentId) => known.has(candidate))(id),
      Option.map((candidate) => VERDICT_OF[shapeOf(currentText(project)(candidate), incoming.trim())]),
      Option.getOrElse((): Verdict => 'unknown'),
    )
