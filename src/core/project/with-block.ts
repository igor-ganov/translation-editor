import { Option, pipe } from 'effect'
import type { Block } from '../document/types.js'
import type { Project } from './types.js'

const replaceMatching = (replacement: Block) => (existing: Block): Block =>
  pipe(
    Option.liftPredicate((candidate: Block) => candidate.id === replacement.id)(existing),
    Option.map(() => replacement),
    Option.getOrElse(() => existing),
  )

/** Replaces one block in document order, leaving every other block identical. */
export const withBlock =
  (project: Project) =>
  (block: Block): Project => ({
    ...project,
    source: project.source.map(replaceMatching(block)),
  })
