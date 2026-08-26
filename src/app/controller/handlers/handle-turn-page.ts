import { clampPage } from '../../../core/view/clamp-page.js'
import { pagesIn } from '../pages-in.js'
import { bookmarkPage } from '../bookmark-page.js'
import type { Deps } from '../deps.js'

/** Turns forward or back by one, stopping at either end of the document. */
export const handleTurnPage =
  (deps: Deps) =>
  (detail: { readonly by: number }): void => {
    const pages = pagesIn(deps.store.get())
    const page = clampPage(pages.length)(deps.store.get().page + detail.by)
    deps.store.update((state) => ({ ...state, page }))
    bookmarkPage(deps)(pages[page])
  }
