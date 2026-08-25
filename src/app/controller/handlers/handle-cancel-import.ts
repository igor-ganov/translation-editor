import { Option } from 'effect'
import type { Deps } from '../deps.js'

/** Discards a pending import without touching the document. */
export const handleCancelImport = (deps: Deps) => (): void => {
  deps.store.update((state) => ({ ...state, pendingImport: Option.none() }))
}
