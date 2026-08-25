import { Effect, Option, pipe } from 'effect'
import { importDocx } from '../../actions/import-docx.js'
import { refreshProjects } from '../refresh-projects.js'
import { rememberProject } from '../remember-project.js'
import { setBusy } from '../set-busy.js'
import { setNotice } from '../set-notice.js'
import type { PickedFile } from '../../../ports/file-port.js'
import type { Deps } from '../deps.js'

/** A failed picker reads the same as a dismissed one: nothing to import. */
const open = (deps: Deps): Effect.Effect<Option.Option<PickedFile>> =>
  Effect.catchAll(deps.platform.file.open(['docx']), () => Effect.succeed(Option.none<PickedFile>()))

/** Picks a .docx, parses and segments it, then opens the editor on the result. */
export const handleImportDocx = (deps: Deps) => (): void => {
  setBusy(deps)({ tag: 'working', label: 'Reading document' })
  void Effect.runPromise(
    pipe(
      open(deps),
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.void,
          onSome: (file) =>
            pipe(
              importDocx(deps.platform)(deps.store.get().settings.defaultLanguages)(file.name, file.bytes),
              Effect.tap((project) =>
                Effect.sync(() => {
                  rememberProject(deps)(project.id)
                  deps.store.update((state) => ({
                    ...state,
                    project: Option.some(project),
                    route: 'editor',
                    collapsed: new Set(),
                  }))
                }),
              ),
              Effect.asVoid,
            ),
        }),
      ),
      Effect.catchAll((failure) =>
        Effect.sync(() => {
          setNotice(deps)({ tag: 'error', text: `Could not read that file: ${JSON.stringify(failure)}` })
        }),
      ),
      Effect.tap(() => Effect.sync(() => { setBusy(deps)({ tag: 'idle' }) })),
      Effect.tap(() => refreshProjects(deps)),
    ),
  )
}
