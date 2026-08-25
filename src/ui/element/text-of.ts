import { Option } from 'effect'
import { translationText } from '../../core/translation/translation-text.js'
import type { TranslationState } from '../../core/project/types.js'

/** What to put in the editing field: the translation, or an empty field. */
export const textOf = (state: TranslationState): string =>
  Option.getOrElse(translationText(state), () => '')
