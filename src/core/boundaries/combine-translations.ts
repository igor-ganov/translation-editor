import { Option, pipe } from 'effect'
import type { SegmentId } from '../document/types.js'
import type { Project, TranslationState } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { translationText } from '../translation/translation-text.js'

const textOf = (project: Project) => (id: SegmentId): readonly string[] =>
  Option.toArray(
    pipe(
      lookupEntry(project.entries)(id),
      Option.flatMap((entry) => translationText(entry.translation)),
    ),
  )

const ABSENT: TranslationState = { tag: 'absent' }

/**
 * The translation of a merged sentence. It is marked edited rather than machine,
 * because a boundary the user chose makes the text theirs, not the provider's.
 */
export const combineTranslations =
  (project: Project) =>
  (ids: readonly SegmentId[]): TranslationState =>
    pipe(
      ids.flatMap(textOf(project)),
      Option.liftPredicate((parts: readonly string[]) => parts.length > 0),
      Option.map((parts): TranslationState => ({ tag: 'edited', text: parts.join(' ') })),
      Option.getOrElse((): TranslationState => ABSENT),
    )
