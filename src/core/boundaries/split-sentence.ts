import { Option, pipe } from 'effect'
import type { Entry, Project, TranslationState } from '../project/types.js'
import type { SegmentId } from '../document/types.js'
import { makeSentenceId } from '../document/make-sentence-id.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { withBlock } from '../project/with-block.js'
import { locateSentence } from './locate-sentence.js'
import type { LocatedSentence } from './locate-sentence.js'

const ABSENT: Entry = { translation: { tag: 'absent' }, approved: false }

const existingTranslation = (project: Project) => (id: SegmentId): TranslationState =>
  pipe(
    lookupEntry(project.entries)(id),
    Option.map((entry) => entry.translation),
    Option.getOrElse((): TranslationState => ABSENT.translation),
  )

const apply = (project: Project) => (offset: number) => (located: LocatedSentence): Project => {
  const { block, index, sentence } = located
  const ordinal = project.nextSentenceOrdinal.get(block.id) ?? block.sentences.length
  const tailId = makeSentenceId(block.id)(ordinal)
  const head = { id: sentence.id, start: sentence.start, end: offset }
  const tail = { id: tailId, start: offset, end: sentence.end }
  const updates: readonly (readonly [SegmentId, Entry])[] = [
    [sentence.id, { translation: existingTranslation(project)(sentence.id), approved: false }],
    [tailId, ABSENT],
  ]
  return {
    ...withBlock(project)({
      ...block,
      sentences: [...block.sentences.slice(0, index), head, tail, ...block.sentences.slice(index + 1)],
    }),
    entries: new Map([...project.entries, ...updates]),
    nextSentenceOrdinal: new Map([...project.nextSentenceOrdinal, [block.id, ordinal + 1] as const]),
  }
}

/**
 * Splits a sentence at an offset into the block's text. The first half keeps the id
 * and the existing translation, the second starts empty, and both lose approval.
 * The new id comes from the block's monotonic counter, so an id retired by an
 * earlier merge is never handed out again.
 */
export const splitSentence =
  (project: Project) =>
  (id: SegmentId) =>
  (offset: number): Project =>
    pipe(
      locateSentence(project)(id),
      Option.filter((located) => offset > located.sentence.start && offset < located.sentence.end),
      Option.map(apply(project)(offset)),
      Option.getOrElse(() => project),
    )
