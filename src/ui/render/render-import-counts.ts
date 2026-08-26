import { html } from 'lit'
import type { ImportDiff } from '../../core/markup/diff-import.js'

const line = (label: string, count: number) =>
  html`<dt>${label}</dt>
    <dd>${String(count)}</dd>`

/**
 * What the import will do, before it does any of it.
 *
 * Approvals that would be cleared are last and stated in their own words,
 * because everything above them is the machine's work and that line is yours.
 */
export const renderImportCounts = (diff: ImportDiff) => html`
  <dl>
    ${line('Translations added', diff.added.length)} ${line('Translations changed', diff.changed.length)}
    ${line('Left untouched', diff.unchanged.length)}
    ${line('Sentences the file does not mention', diff.missingIds.length)}
    ${line('Ids in the file this document has never had', diff.unknownIds.length)}
    ${line('Settled sentences that will stop being settled', diff.approvalsToClear.length)}
  </dl>
`
