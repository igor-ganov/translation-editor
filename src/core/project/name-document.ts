import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'

const TITLE_LIMIT = 70

const opening = (source: readonly Block[]): Option.Option<string> =>
  pipe(
    Option.fromIterable(source.filter((block) => block.translatable && block.text.trim().length > 0)),
    Option.map((block) => block.text.trim().slice(0, TITLE_LIMIT)),
  )

/**
 * What to call a document.
 *
 * Android's file picker hands back a content URI rather than a filename, so a
 * document imported on a phone was called `document%3A1000060316` on every
 * screen it appeared on. When the picker gives nothing a person would recognise,
 * the document's own opening line is a better name than its identifier — and it
 * is what a book is called anyway.
 */
export const nameDocument = (picked: string, source: readonly Block[]): string =>
  pipe(
    Option.liftPredicate((name: string) => /\.docx$/i.test(name))(picked),
    Option.map((name) => name.replace(/\.docx$/i, '')),
    Option.orElse(() => opening(source)),
    Option.getOrElse(() => 'Untitled document'),
  )
