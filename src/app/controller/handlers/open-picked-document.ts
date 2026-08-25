import { Effect, Option, pipe } from 'effect'
import type { PickedFile } from '../../../ports/file-port.js'
import { importDocx } from '../../actions/import-docx.js'
import { rememberProject } from '../remember-project.js'
import type { Deps } from '../deps.js'

/** Parses a picked file into a project and opens the editor on it. */
export const openPickedDocument =
  (deps: Deps) =>
  (file: PickedFile): Effect.Effect<void, unknown> =>
    pipe(
      importDocx(deps.platform)(deps.store.get().settings.defaultLanguages)(file.name, file.bytes),
      Effect.tap((project) =>
        Effect.sync(() => {
          deps.logger.record('info', 'import', 'document parsed', {
            blocks: project.source.length,
            sentences: project.source.flatMap((block) => block.sentences).length,
            translatable: project.source.filter((block) => block.translatable).length,
          })
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
    )
