import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { translationText } from './translation-text.js'

type Part = {
  readonly translated: Option.Option<string>
  readonly source: string
}

const partsOf = (project: Project) => (block: Block): readonly Part[] =>
  block.sentences.map((sentence) => ({
    translated: pipe(
      lookupEntry(project.entries)(sentence.id),
      Option.flatMap((entry) => translationText(entry.translation)),
    ),
    source: block.text.slice(sentence.start, sentence.end).trim(),
  }))

const anyTranslated = (parts: readonly Part[]): boolean =>
  parts.some((part) => Option.isSome(part.translated))

const render = (parts: readonly Part[]): string =>
  parts.map((part) => Option.getOrElse(part.translated, () => part.source)).join(' ')

/**
 * A block's translation composed from its sentences (R5.3). Sentences that are not
 * yet translated contribute their source text, so a partially translated paragraph
 * still exports as a complete paragraph rather than losing content. A block with
 * nothing translated at all yields none, which is what triggers the source fallback.
 */
export const sentenceComposite =
  (project: Project) =>
  (block: Block): Option.Option<string> =>
    pipe(partsOf(project)(block), Option.liftPredicate(anyTranslated), Option.map(render))
