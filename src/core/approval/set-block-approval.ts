import { Option, pipe } from 'effect'
import type { Block, BlockId } from '../document/types.js'
import type { Project } from '../project/types.js'
import { blockOverride } from '../translation/block-override.js'
import { setSegmentApproval } from './set-segment-approval.js'

const blockOf = (project: Project) => (id: BlockId): Option.Option<Block> =>
  Option.fromIterable(project.source.filter((block) => block.id === id))

const cascade = (project: Project) => (block: Block) => (approved: boolean): Project =>
  block.sentences.reduce(
    (accumulated, sentence) => setSegmentApproval(accumulated)(sentence.id)(approved),
    project,
  )

/**
 * Approving or un-approving a paragraph. The cascade is symmetric — the paragraph
 * control is a plain all-or-nothing switch over its sentences. A paragraph that
 * overrides its sentences answers only for itself, so nothing cascades.
 */
export const setBlockApproval =
  (project: Project) =>
  (id: BlockId) =>
  (approved: boolean): Project =>
    pipe(
      blockOf(project)(id),
      Option.map((block) =>
        pipe(
          blockOverride(project)(id),
          Option.map(() => setSegmentApproval(project)(id)(approved)),
          Option.getOrElse(() => cascade(project)(block)(approved)),
        ),
      ),
      Option.getOrElse(() => project),
    )
