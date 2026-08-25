import { Option } from 'effect'
import type { TranslationState } from '../project/types.js'

const hasContent = (text: string): boolean => text.trim().length > 0

/**
 * The usable text of a translation, if there is one. A failed attempt and a
 * whitespace-only result both count as no translation, so a single predicate
 * governs export, progress and the approval guard.
 */
export const translationText = (state: TranslationState): Option.Option<string> => {
  switch (state.tag) {
    case 'machine':
    case 'edited':
      return Option.liftPredicate(hasContent)(state.text)
    case 'absent':
    case 'failed':
      return Option.none()
  }
}
