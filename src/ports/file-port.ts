import type { Effect, Option } from 'effect'

export type PickedFile = {
  readonly name: string
  readonly bytes: Uint8Array
}

export type SaveRequest = {
  readonly suggestedName: string
  readonly bytes: Uint8Array
  readonly mimeType: string
}

export type FileFailure =
  | { readonly tag: 'readFailed'; readonly message: string }
  | { readonly tag: 'writeFailed'; readonly message: string }

/**
 * Choosing and saving files. Both operations can be cancelled by the user, which
 * is an absent result rather than a failure. On Android the picker hands back a
 * content URI, which the Tauri adapter reads directly.
 */
export type FilePort = {
  readonly open: (extensions: readonly string[]) => Effect.Effect<Option.Option<PickedFile>, FileFailure>
  readonly save: (request: SaveRequest) => Effect.Effect<boolean, FileFailure>
}
