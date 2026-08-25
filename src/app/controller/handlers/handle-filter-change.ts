import type { SegmentFilter } from '../../../core/view/types.js'
import type { Deps } from '../deps.js'

const FILTERS: Readonly<Record<string, SegmentFilter>> = {
  all: 'all',
  untranslated: 'untranslated',
  unapproved: 'unapproved',
  failed: 'failed',
}

/** An unrecognised value from the control falls back to showing everything. */
export const handleFilterChange =
  (deps: Deps) =>
  (detail: { readonly filter: string }): void => {
    deps.store.update((state) => ({ ...state, filter: FILTERS[detail.filter] ?? 'all' }))
  }
