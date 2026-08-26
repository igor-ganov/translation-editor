import { Match } from 'effect'
import { html, nothing } from 'lit'
import type { TranslationState } from '../../core/project/types.js'

/**
 * Why a segment has no translation.
 *
 * The reason was recorded and then shown nowhere, so a sentence the service had
 * rejected looked exactly like one nobody had reached yet — and a run could fail
 * forty-four of them without a single word on screen saying what went wrong.
 */
export const renderFailureNote = Match.type<TranslationState>().pipe(
  Match.when({ tag: 'failed' }, (state) => html`<span class="failure">${state.reason}</span>`),
  Match.orElse(() => nothing),
)
