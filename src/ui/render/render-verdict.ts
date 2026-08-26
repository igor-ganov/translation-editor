import { Option, pipe } from 'effect'
import { html } from 'lit'
import { fromUndefined } from '../../core/option/from-undefined.js'

export type SettingsVerdict = { readonly tone: 'good' | 'bad'; readonly text: string }

const TONE: Readonly<Record<SettingsVerdict['tone'], string>> = {
  good: 'verdict verdict--good',
  bad: 'verdict verdict--bad',
}

const toneOf = (verdict: SettingsVerdict | undefined): string =>
  pipe(
    fromUndefined(verdict),
    Option.map((present) => TONE[present.tone]),
    Option.getOrElse(() => 'verdict'),
  )

const textOf = (verdict: SettingsVerdict | undefined): string =>
  pipe(
    fromUndefined(verdict),
    Option.map((present) => present.text),
    Option.getOrElse(() => ''),
  )

/**
 * The answer to "Check it works", kept under the button that asked for it.
 *
 * The paragraph is in the tree from the first render even while empty, because a
 * live region announces nothing if it is inserted together with its own text.
 */
export const renderVerdict = (verdict: SettingsVerdict | undefined) =>
  html`<p class=${toneOf(verdict)} role="status">${textOf(verdict)}</p>`
