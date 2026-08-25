import { Option, pipe } from 'effect'
import type { Entry, Project } from '../project/types.js'
import type { SegmentId } from '../document/types.js'
import { withBlock } from '../project/with-block.js'
import { locateSentence } from './locate-sentence.js'
import type { LocatedSentence } from './locate-sentence.js'
import { combineTranslations } from './combine-translations.js'

type Pair = LocatedSentence & { readonly follower: LocatedSentence['sentence'] }

const withFollower = (located: LocatedSentence): Option.Option<Pair> =>
  pipe(
    Option.fromIterable(located.block.sentences.slice(located.index + 1, located.index + 2)),
    Option.map((follower) => ({ ...located, follower })),
  )

const apply = (project: Project) => (pair: Pair): Project => {
  const { block, index, sentence, follower } = pair
  const merged = { id: sentence.id, start: sentence.start, end: follower.end }
  const entry: Entry = {
    translation: combineTranslations(project)([sentence.id, follower.id]),
    approved: false,
  }
  return {
    ...withBlock(project)({
      ...block,
      sentences: [...block.sentences.slice(0, index), merged, ...block.sentences.slice(index + 2)],
    }),
    entries: new Map(
      [...project.entries].filter(([key]) => key !== follower.id),
    ).set(sentence.id, entry),
  }
}

/**
 * Joins a sentence with the one after it — the fix for a split the segmenter got
 * wrong. The surviving sentence keeps its id so the cursor and any open editor stay
 * anchored; the absorbed id is retired and never reissued. Merging the last sentence
 * of a block is a no-op rather than an error.
 */
export const mergeWithNext =
  (project: Project) =>
  (id: SegmentId): Project =>
    pipe(
      locateSentence(project)(id),
      Option.flatMap(withFollower),
      Option.map(apply(project)),
      Option.getOrElse(() => project),
    )
