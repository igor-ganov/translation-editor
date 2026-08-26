import { html } from 'lit'
import type { Units } from '../../core/approval/block-units.js'
import type { ProjectSummary } from '../../ports/storage-port.js'
import { renderProjectsRow } from './render-projects-row.js'
import { whenPresent } from './when-present.js'

/**
 * A document as the shelf reads it. Progress is optional because the stored
 * summary carries no counts: an entry that arrives with them gets a thread, and
 * one that does not says nothing about progress rather than inventing a zero.
 */
export type ShelfEntry = ProjectSummary & { readonly progress?: Units }

/**
 * The list is a shelf, not a grid of cards: a document is a spine you read along,
 * and the eye scans a column of titles far faster than a field of boxes.
 */
export const renderProjectsShelf = (host: HTMLElement, entries: readonly ShelfEntry[]) => html`
  ${whenPresent(
    entries.length === 0,
    () => html`<p class="empty">Nothing here yet. Open a document to start.</p>`,
  )}
  ${whenPresent(
    entries.length > 0,
    () => html`
      <ul class="shelf">
        ${entries.map((entry) => renderProjectsRow(host, entry))}
      </ul>
    `,
  )}
`
