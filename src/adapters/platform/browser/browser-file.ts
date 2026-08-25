import { Effect, Option } from 'effect'
import { fromUndefined } from '../../../core/option/from-undefined.js'
import { toArrayBuffer } from '../to-array-buffer.js'
import type { FileFailure, FilePort, PickedFile, SaveRequest } from '../../../ports/file-port.js'

const pick = (extensions: readonly string[]): Promise<Option.Option<PickedFile>> =>
  new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = extensions.map((extension) => `.${extension}`).join(',')
    // A dismissed picker fires `cancel` and never `change`, which is the only
    // way to tell "user backed out" from "still choosing".
    input.addEventListener('cancel', () => {
      resolve(Option.none())
    })
    input.addEventListener('change', () => {
      void (async () => {
        for (const file of Option.toArray(fromUndefined(input.files?.[0]))) {
          resolve(Option.some({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }))
        }
      })()
    })
    input.click()
  })

const download = (request: SaveRequest): boolean => {
  const url = URL.createObjectURL(new Blob([toArrayBuffer(request.bytes)], { type: request.mimeType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = request.suggestedName
  anchor.click()
  URL.revokeObjectURL(url)
  return true
}

/** Browser fallback: a hidden file input to read, an object URL to write. */
export const browserFile = (): FilePort => ({
  open: (extensions) =>
    Effect.tryPromise({
      try: () => pick(extensions),
      catch: (cause): FileFailure => ({ tag: 'readFailed', message: String(cause) }),
    }),
  save: (request: SaveRequest) =>
    Effect.try({
      try: () => download(request),
      catch: (cause): FileFailure => ({ tag: 'writeFailed', message: String(cause) }),
    }),
})
