import { clampPage } from '../../../core/view/clamp-page.js'
import { pagesIn } from '../pages-in.js'
import { bookmarkPage } from '../bookmark-page.js'
import type { Deps } from '../deps.js'

/** Turns to a page chosen from the contents, and opens the document on it. */
export const handleGoToPage =
  (deps: Deps) =>
  (detail: { readonly page: number }): void => {
    const pages = pagesIn(deps.store.get())
    const page = clampPage(pages.length)(detail.page)
    deps.store.update((state) => ({ ...state, route: 'editor', page }))
    bookmarkPage(deps)(pages[page])
  }
