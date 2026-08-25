import { Either, Option } from 'effect'
import { markupSyntax } from './markup-syntax.js'
import { headerFields } from './header-fields.js'
import type { LanguageTag } from '../document/types.js'
import type { MarkupError, MarkupHeader, MarkupKind } from './types.js'

export type ParsedHeader = { readonly header: MarkupHeader; readonly bodyStart: number }

const LANGS: ReadonlySet<string> = new Set(['en', 'ru', 'it'])
const KINDS: ReadonlySet<string> = new Set(['source', 'translation'])

const field = (fields: ReadonlyMap<string, string>) => (name: string): Either.Either<string, MarkupError> =>
  Either.fromOption(Option.fromIterable([...fields].filter(([key]) => key === name).map(([, value]) => value)), () => ({
    tag: 'malformedHeaderField' as const, line: 1, field: name,
  }))

const language = (raw: string, name: string): Either.Either<LanguageTag, MarkupError> =>
  Either.fromOption(
    Option.liftPredicate((value: string): value is LanguageTag => LANGS.has(value))(raw),
    () => ({ tag: 'malformedHeaderField' as const, line: 1, field: name }),
  )

const kind = (raw: string): Either.Either<MarkupKind, MarkupError> =>
  Either.fromOption(
    Option.liftPredicate((value: string): value is MarkupKind => KINDS.has(value))(raw),
    () => ({ tag: 'malformedHeaderField' as const, line: 1, field: 'kind' }),
  )

const version = (raw: string): Either.Either<1, MarkupError> =>
  Either.fromOption(
    Option.liftPredicate((value: string) => value === `v${markupSyntax.version}`)(raw),
    () => ({ tag: 'unsupportedVersion' as const, line: 1, found: raw }),
  ).pipe(Either.map(() => 1 as const))

/** Reads and validates the four header lines that identify the file. */
export const parseHeader = (lines: readonly string[]): Either.Either<ParsedHeader, MarkupError> =>
  Either.gen(function* () {
    const { fields, bodyStart } = headerFields(lines)
    yield* Either.fromOption(
      Option.liftPredicate((count: number) => count > 0)(bodyStart),
      (): MarkupError => ({ tag: 'missingHeader', line: 1 }),
    )
    const get = field(fields)
    yield* version(yield* get(markupSyntax.magic))
    const [from, to] = (yield* get('lang')).split('>')
    return {
      header: {
        version: 1,
        documentHash: yield* get('doc'),
        from: yield* language(from ?? '', 'lang'),
        to: yield* language(to ?? '', 'lang'),
        kind: yield* kind(yield* get('kind')),
      },
      bodyStart,
    }
  })
