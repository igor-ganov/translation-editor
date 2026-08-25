import { Effect, Option, pipe } from 'effect'
import { importMarkupFile } from '../../actions/import-markup-file.js'
import type { ImportOutcome } from '../../actions/import-markup-file.js'
import { setNotice } from '../set-notice.js'
import type { Deps } from '../deps.js'

const present = (deps: Deps) => (outcome: ImportOutcome): void => {
  switch (outcome.tag) {
    case 'cancelled': {
      break
    }
    case 'unreadable': {
      setNotice(deps)({ tag: 'error', text: `That file could not be read: ${outcome.message}` })
      break
    }
    case 'ready': {
      deps.store.update((state) => ({
        ...state,
        pendingImport: Option.some({ diff: outcome.diff, apply: outcome.apply }),
      }))
      break
    }
  }
}

/**
 * Reads an externally translated file and shows what applying it would do.
 * Nothing is written until the user confirms the summary.
 */
export const handleImportMarkup = (deps: Deps) => (): void => {
  for (const project of Option.toArray(deps.store.get().project)) {
    void Effect.runPromise(
      pipe(
        importMarkupFile(deps.platform)(project),
        Effect.map((outcome) => {
          present(deps)(outcome)
        }),
      ),
    )
  }
}
