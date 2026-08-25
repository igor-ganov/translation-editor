import type { SegmentId } from '../document/types.js'
import type { Entry, Project } from '../project/types.js'
import { diffImport } from './diff-import.js'
import type { ParsedMarkup } from './types.js'

const asEdited = (text: string): Entry => ({ translation: { tag: 'edited', text }, approved: false })

const textOf = (parsed: ParsedMarkup) => (id: SegmentId): string => parsed.segments.get(id)?.trim() ?? ''

/**
 * Lands an externally authored translation on the project. Only segments the diff
 * marked added or changed are touched — unknown ids are dropped and ids the file
 * never mentioned keep whatever they had. Every text this writes is marked edited,
 * both because a person wrote it and so automatic translation will not overwrite it.
 */
export const applyImport =
  (project: Project) =>
  (parsed: ParsedMarkup): Project => {
    const diff = diffImport(project)(parsed)
    const incoming = textOf(parsed)
    return {
      ...project,
      entries: [...diff.added, ...diff.changed].reduce(
        (entries, id) => new Map(entries).set(id, asEdited(incoming(id))),
        project.entries,
      ),
    }
  }
