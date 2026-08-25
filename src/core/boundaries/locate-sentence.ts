import { Option } from 'effect'
import type { Block, SegmentId, Sentence } from '../document/types.js'
import type { Project } from '../project/types.js'

export type LocatedSentence = {
  readonly block: Block
  readonly index: number
  readonly sentence: Sentence
}

/** Finds a sentence together with the block and position it lives at. */
export const locateSentence =
  (project: Project) =>
  (id: SegmentId): Option.Option<LocatedSentence> =>
    Option.fromIterable(
      project.source.flatMap((block) =>
        block.sentences
          .map((sentence, index) => ({ block, index, sentence }))
          .filter((candidate) => candidate.sentence.id === id),
      ),
    )
