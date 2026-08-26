import { html } from 'lit'
import type { SegmentId } from '../../core/document/types.js'
import type { TranslationState } from '../../core/project/types.js'
import { textOf } from '../element/text-of.js'
import { onInput } from '../element/on-input.js'
import { onCommit } from '../element/on-commit.js'
import { onFieldKey } from '../element/on-field-key.js'

export type Writing = {
  readonly id: SegmentId
  readonly translation: TranslationState
  readonly label: string
  readonly status: string
  /** Called when the field loses focus, which is also when the edit is committed. */
  readonly done: () => void
}

/**
 * The editor, opened deliberately and spanning the whole width of the page.
 *
 * It grows to its text rather than scrolling inside a fixed box, so a long
 * sentence is edited whole. Leaving it commits: on blur, on `Escape`, and on
 * `Ctrl+Enter`, which also settles the segment.
 */
export const renderTargetWriting = (host: HTMLElement, writing: Writing) => html`
  <textarea
    class="leaf__target leaf__target--write"
    rows="1"
    placeholder="nothing yet"
    .value=${textOf(writing.translation)}
    aria-label=${writing.label}
    aria-describedby=${writing.status}
    @input=${onInput}
    @change=${onCommit(host, writing.id)}
    @blur=${writing.done}
    @keydown=${onFieldKey(host, writing.id)}
  ></textarea>
`
