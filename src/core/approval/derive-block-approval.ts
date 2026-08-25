import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'
import { blockOverride } from '../translation/block-override.js'
import { canApprove } from './can-approve.js'

const ownApproval = (project: Project) => (block: Block): boolean =>
  pipe(
    lookupEntry(project.entries)(block.id),
    Option.map((entry) => entry.approved),
    Option.getOrElse(() => false),
  )

const everySentenceApproved = (project: Project) => (block: Block): boolean =>
  block.sentences.length > 0 &&
  block.sentences.every((sentence) =>
    pipe(
      lookupEntry(project.entries)(sentence.id),
      Option.map((entry) => entry.approved && canApprove(project)(sentence.id)),
      Option.getOrElse(() => false),
    ),
  )

/**
 * Whether a block reads as approved. An overridden block answers for itself and
 * its sentences are irrelevant; otherwise every sentence must be approved.
 */
export const deriveBlockApproval =
  (project: Project) =>
  (block: Block): boolean =>
    pipe(
      blockOverride(project)(block.id),
      Option.map(() => ownApproval(project)(block)),
      Option.getOrElse(() => everySentenceApproved(project)(block)),
    )
