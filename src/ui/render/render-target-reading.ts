import { html } from 'lit'
import type { TranslationState } from '../../core/project/types.js'
import { textOf } from '../element/text-of.js'

/** Indexed by `Number(there is text)`, so neither the class nor the words need a branch. */
const CLASSES: readonly string[] = ['leaf__target leaf__target--empty', 'leaf__target']
const WORDS: readonly ((text: string) => string)[] = [() => 'nothing yet', (text) => text]

/**
 * The translation as text, set exactly like the source above it.
 *
 * It used to be a one-line `<textarea>` that only grew as you typed, so a
 * translation loaded from storage was shown clipped to its first line while the
 * Italian beside it flowed over six. Reading is the common case and it should
 * not happen inside a form control.
 */
export const renderTargetReading = (translation: TranslationState) => {
  const text = textOf(translation)
  const filled = Number(text.length > 0)
  return html`<p class=${CLASSES[filled] ?? ''}>${WORDS[filled]?.(text)}</p>`
}
