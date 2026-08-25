import { Effect, Either, Option, pipe } from 'effect'
import type { Project } from '../../core/project/types.js'
import { parseMarkup } from '../../core/markup/parse-markup.js'
import { diffImport } from '../../core/markup/diff-import.js'
import { applyImport } from '../../core/markup/apply-import.js'
import type { ImportDiff } from '../../core/markup/diff-import.js'
import type { Platform } from '../platform.js'

export type ImportOutcome =
  | { readonly tag: 'cancelled' }
  | { readonly tag: 'unreadable'; readonly message: string }
  | { readonly tag: 'ready'; readonly diff: ImportDiff; readonly apply: () => Project }

const describe = (project: Project) => (raw: string): ImportOutcome =>
  pipe(
    parseMarkup(raw),
    Either.match({
      onLeft: (error): ImportOutcome => ({ tag: 'unreadable', message: JSON.stringify(error) }),
      onRight: (parsed): ImportOutcome => ({
        tag: 'ready',
        diff: diffImport(project)(parsed),
        apply: () => applyImport(project)(parsed),
      }),
    }),
  )

/**
 * Reads a translated markup file and reports what applying it would do. Nothing
 * is written here: the caller shows the summary and only then runs `apply`.
 */
export const importMarkupFile =
  (platform: Platform) =>
  (project: Project): Effect.Effect<ImportOutcome> =>
    pipe(
      platform.file.open(['txt', 'tmarkup']),
      Effect.map(
        Option.match({
          onNone: (): ImportOutcome => ({ tag: 'cancelled' }),
          onSome: (file) => describe(project)(new TextDecoder().decode(file.bytes)),
        }),
      ),
      Effect.catchAll((failure) => Effect.succeed<ImportOutcome>({ tag: 'unreadable', message: failure.message })),
    )
