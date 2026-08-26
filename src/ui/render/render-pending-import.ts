import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { PendingImport } from '../store/app-state.js'
import { renderImportCounts } from './render-import-counts.js'
import { renderImportActs } from './render-import-acts.js'
import { whenPresent } from './when-present.js'

/**
 * The one screen that stops and asks.
 *
 * Importing is the only thing here that can overwrite work without naming it
 * first, so it names it: what will be added, what will be changed, and — set
 * apart, because it is the part that costs real hours — what approvals go.
 */
const slip = (host: HTMLElement, pending: PendingImport) => html`
  <section class="slip" role="dialog" aria-label="Confirm import">
    <h2>Bring this translation in?</h2>
    ${renderImportCounts(pending.diff)}
    ${whenPresent(
      !pending.diff.documentMatches,
      () => html`
        <p class="warning">
          This file was made from a different document. Applying it will almost certainly put
          translations on the wrong sentences.
        </p>
      `,
    )}
    ${renderImportActs(host)}
  </section>
`

/** The import summary, shown until the user confirms or cancels. */
export const renderPendingImport = (host: HTMLElement, pending: Option.Option<PendingImport>) =>
  pipe(
    pending,
    Option.map((present) => slip(host, present)),
    Option.getOrElse(() => nothing),
  )
