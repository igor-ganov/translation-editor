import { Either, Schema } from 'effect'
import { languageSchema } from '../../../adapters/storage/indexeddb/schemas/language-schema.js'
import { setLanguages } from '../../../core/project/set-languages.js'
import { updateProject } from '../update-project.js'
import type { Deps } from '../deps.js'

const Pair = Schema.Struct({ from: languageSchema, to: languageSchema })

/**
 * Changes the language pair of the open document.
 *
 * The pair arrives from a select, so it is decoded rather than trusted; a value
 * the application does not ship with is ignored instead of being written into a
 * project that then fails to load.
 */
export const handleSetLanguages =
  (deps: Deps) =>
  (detail: { readonly from: string; readonly to: string }): void => {
    Either.map(Schema.decodeUnknownEither(Pair)(detail), (pair) => {
      updateProject(deps)(setLanguages(pair))
    })
  }
