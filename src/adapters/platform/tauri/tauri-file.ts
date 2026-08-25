import { Effect, Option } from 'effect'
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog'
import { readFile, writeFile } from '@tauri-apps/plugin-fs'
import type { FileFailure, FilePort, PickedFile, SaveRequest } from '../../../ports/file-port.js'

const basename = (path: string): string => path.split(/[\\/]/).at(-1) ?? path

/** A dialog the user dismissed yields no path; only a string counts as a choice. */
const asPath = (chosen: unknown): Option.Option<string> =>
  Option.liftPredicate((value: unknown): value is string => typeof value === 'string')(chosen)

/**
 * On Android the picker hands back a `content://` URI rather than a path. The fs
 * plugin accepts it directly, which is the supported way to read a user-chosen
 * file there, so no special-casing per platform is needed here.
 */
const pick = async (extensions: readonly string[]): Promise<Option.Option<PickedFile>> => {
  const chosen = await openDialog({
    multiple: false,
    filters: [{ name: 'Documents', extensions: [...extensions] }],
  })
  const files = await Promise.all(
    Option.toArray(asPath(chosen)).map(
      async (path): Promise<PickedFile> => ({ name: basename(path), bytes: await readFile(path) }),
    ),
  )
  return Option.fromIterable(files)
}

const store = async (request: SaveRequest): Promise<boolean> => {
  const target = asPath(await saveDialog({ defaultPath: request.suggestedName }))
  for (const path of Option.toArray(target)) await writeFile(path, request.bytes)
  return Option.isSome(target)
}

export const tauriFile = (): FilePort => ({
  open: (extensions) =>
    Effect.tryPromise({
      try: () => pick(extensions),
      catch: (cause): FileFailure => ({ tag: 'readFailed', message: String(cause) }),
    }),
  save: (request) =>
    Effect.tryPromise({
      try: () => store(request),
      catch: (cause): FileFailure => ({ tag: 'writeFailed', message: String(cause) }),
    }),
})
