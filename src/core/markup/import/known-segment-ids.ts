import type { SegmentId } from '../../document/types.js'
import type { Project } from '../../project/types.js'

/**
 * Every id an import may legitimately address: each translatable block plus its
 * sentences. Non-translatable blocks are excluded so an empty paragraph is never
 * reported as a missing translation.
 */
export const knownSegmentIds = (project: Project): ReadonlySet<SegmentId> =>
  new Set(
    project.source
      .filter((block) => block.translatable)
      .flatMap((block): readonly SegmentId[] => [block.id, ...block.sentences.map((s) => s.id)]),
  )
