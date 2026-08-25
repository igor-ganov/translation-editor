import { Effect, Option, pipe } from 'effect'
import { refreshProjects } from '../refresh-projects.js'
import { setBusy } from '../set-busy.js'
import { setNotice } from '../set-notice.js'
import { openPickedDocument } from './open-picked-document.js'
import type { PickedFile } from '../../../ports/file-port.js'
import type { Deps } from '../deps.js'

/** A failed picker reads the same as a dismissed one: nothing to import. */
const open = (deps: Deps): Effect.Effect<Option.Option<PickedFile>> =>
  Effect.catchAll(deps.platform.file.open(['docx']), (failure) =>
    Effect.sync(() => {
      deps.logger.record('error', 'import', 'the file picker failed', failure)
      return Option.none<PickedFile>()
    }),
  )

const picked = (deps: Deps) => (file: PickedFile) => {
  deps.logger.record('info', 'import', `picked ${file.name}`, { bytes: file.bytes.byteLength })
  return openPickedDocument(deps)(file)
}

/** Picks a .docx, parses and segments it, then opens the editor on the result. */
export const handleImportDocx = (deps: Deps) => (): void => {
  setBusy(deps)({ tag: 'working', label: 'Reading document' })
  void Effect.runPromise(
    pipe(
      open(deps),
      Effect.flatMap(Option.match({ onNone: () => Effect.void, onSome: picked(deps) })),
      Effect.catchAll((failure) =>
        Effect.sync(() => {
          deps.logger.record('error', 'import', 'could not read the document', failure)
          setNotice(deps)({ tag: 'error', text: `Could not read that file: ${JSON.stringify(failure)}` })
        }),
      ),
      Effect.tap(() => Effect.sync(() => { setBusy(deps)({ tag: 'idle' }) })),
      Effect.tap(() => refreshProjects(deps)),
    ),
  )
}
