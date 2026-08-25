import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

/** Messages stay until dismissed; this is how they go. */
export const handleDismissNotice = (deps: Deps) => (): void => {
  setNotice(deps)({ tag: 'none' })
}
