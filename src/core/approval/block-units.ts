import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { translationText } from '../translation/translation-text.js'
import { blockOverride } from '../translation/block-override.js'
import { canApprove } from './can-approve.js'

export type Units = {
  readonly total: number
  readonly translated: number
  readonly approved: number
}

const ZERO: Units = { total: 0, translated: 0, approved: 0 }

const countWhere = (block: Block, predicate: (id: Block['sentences'][number]['id']) => boolean): number =>
  block.sentences.filter((sentence) => predicate(sentence.id)).length

const overriddenUnits = (project: Project) => (block: Block): Units => ({
  total: 1,
  translated: 1,
  approved: Number(
    pipe(lookupEntry(project.entries)(block.id), Option.map((e) => e.approved), Option.getOrElse(() => false)),
  ),
})

const sentenceUnits = (project: Project) => (block: Block): Units => ({
  total: block.sentences.length,
  translated: countWhere(block, (id) =>
    pipe(lookupEntry(project.entries)(id), Option.flatMap((e) => translationText(e.translation)), Option.isSome),
  ),
  approved: countWhere(block, (id) =>
    pipe(lookupEntry(project.entries)(id), Option.map((e) => e.approved), Option.getOrElse(() => false)) &&
    canApprove(project)(id),
  ),
})

/**
 * How much work one paragraph represents. An overridden paragraph is one unit,
 * because its sentences no longer describe the delivered text; a plain paragraph
 * is counted by its sentences. This is the arithmetic behind the progress bar.
 */
export const blockUnits =
  (project: Project) =>
  (block: Block): Units =>
    pipe(
      Option.liftPredicate((b: Block) => b.translatable)(block),
      Option.map((b) =>
        pipe(
          blockOverride(project)(b.id),
          Option.map(() => overriddenUnits(project)(b)),
          Option.getOrElse(() => sentenceUnits(project)(b)),
        ),
      ),
      Option.getOrElse(() => ZERO),
    )
