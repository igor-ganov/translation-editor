import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import { entryOf } from './entry-of.js'
import { matchesFilter } from './matches-filter.js'
import type { SegmentFilter, SentenceRow } from './types.js'

/** The sentence pairs of one block that survive the filter, in reading order. */
export const sentenceRows =
  (project: Project) =>
  (filter: SegmentFilter, overriding: boolean) =>
  (block: Block): readonly SentenceRow[] =>
    block.sentences
      .map((sentence): SentenceRow => {
        const entry = entryOf(project)(sentence.id)
        return {
          tag: 'sentence',
          id: sentence.id,
          blockId: block.id,
          sentence,
          source: block.text.slice(sentence.start, sentence.end).trim(),
          translation: entry.translation,
          approved: entry.approved,
          superseded: overriding,
        }
      })
      .filter((row) => matchesFilter(filter)({ translation: row.translation, approved: row.approved }))
