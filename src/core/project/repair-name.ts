import { Option, pipe } from 'effect'
import type { Project } from './types.js'
import { opaqueName } from './opaque-name.js'
import { nameDocument } from './name-document.js'

/**
 * Gives a stored document a name a person would recognise, if it has not got one.
 *
 * Applied on load rather than only at import, so a document that was already
 * stored under a content URI is fixed instead of carrying it for the rest of its
 * life. A name that is already readable is left exactly as it is, including one
 * the user may have chosen themselves.
 */
export const repairName = (project: Project): Project => ({
  ...project,
  name: pipe(
    Option.liftPredicate(opaqueName)(project.name),
    Option.map(() => nameDocument(project.name, project.source)),
    Option.getOrElse(() => project.name),
  ),
})
