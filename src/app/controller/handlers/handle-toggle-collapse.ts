import type { BlockToggleDetail } from '../../../ui/element/segment-events.js'
import type { Deps } from '../deps.js'

const toggled = (collapsed: ReadonlySet<string>, id: string): ReadonlySet<string> => {
  const next = new Set(collapsed)
  const removed = next.delete(id)
  switch (removed) {
    case true:
      return next
    case false:
      return next.add(id)
  }
}

/** Collapsing is view state, not document state, so it is not persisted. */
export const handleToggleCollapse =
  (deps: Deps) =>
  (detail: BlockToggleDetail): void => {
    deps.store.update((state) => ({ ...state, collapsed: toggled(state.collapsed, detail.id) }))
  }
