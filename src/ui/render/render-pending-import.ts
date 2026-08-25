import { Option, pipe } from 'effect'
import { html, nothing } from 'lit'
import type { PendingImport } from '../store/app-state.js'
import { emit } from '../element/emit.js'

const line = (label: string, count: number) =>
  html`<li>${label}: <strong>${String(count)}</strong></li>`

const panel = (host: HTMLElement, pending: PendingImport) => html`
  <section class="confirm" role="dialog" aria-label="Confirm import">
    <h2>Apply this translation file?</h2>
    <ul>
      ${line('Translations to add', pending.diff.added.length)}
      ${line('Translations to change', pending.diff.changed.length)}
      ${line('Left untouched', pending.diff.unchanged.length)}
      ${line('Unknown ids, will be ignored', pending.diff.unknownIds.length)}
      ${line('Segments the file does not mention', pending.diff.missingIds.length)}
      ${line('Approvals that will be cleared', pending.diff.approvalsToClear.length)}
    </ul>
    <p class="warning" ?hidden=${pending.diff.documentMatches}>
      This file was made from a different document. Applying it will almost certainly put
      translations on the wrong segments.
    </p>
    <div class="actions">
      <button type="button" @click=${() => { emit(host, 'te-confirm-import', {}) }}>Apply</button>
      <button type="button" @click=${() => { emit(host, 'te-cancel-import', {}) }}>Cancel</button>
    </div>
  </section>
`

/** The import summary, shown until the user confirms or cancels. */
export const renderPendingImport = (host: HTMLElement, pending: Option.Option<PendingImport>) =>
  pipe(
    pending,
    Option.map((present) => panel(host, present)),
    Option.getOrElse(() => nothing),
  )
