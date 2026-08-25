import { Option, pipe } from 'effect'
import type { Block, SegmentId, Sentence } from '../document/types.js'
import type { Entry, Project } from '../project/types.js'
import { lookupEntry } from '../project/lookup-entry.js'

export type PendingSentence = {
  readonly id: SegmentId
  readonly text: string
  readonly blockId: Block['id']
}

/**
 * A segment is left alone once a person has touched it: an edited translation and
 * an approved one are both the user's work, and automatic translation must never
 * overwrite either. A failed attempt, by contrast, is eligible for a retry.
 */
const isPending = (entry: Entry): boolean => {
  switch (entry.translation.tag) {
    case 'absent':
    case 'failed':
      return !entry.approved
    case 'machine':
      return entry.translation.text.trim().length === 0 && !entry.approved
    case 'edited':
      return false
  }
}

const pendingIn = (project: Project) => (block: Block) => (sentence: Sentence): readonly PendingSentence[] =>
  pipe(
    lookupEntry(project.entries)(sentence.id),
    Option.filter((entry) => !isPending(entry)),
    Option.match({
      onNone: (): readonly PendingSentence[] => [
        { id: sentence.id, text: block.text.slice(sentence.start, sentence.end).trim(), blockId: block.id },
      ],
      onSome: (): readonly PendingSentence[] => [],
    }),
  )

/** Every sentence still waiting for a machine translation, in document order. */
export const selectUntranslated = (project: Project): readonly PendingSentence[] =>
  project.source
    .filter((block) => block.translatable)
    .flatMap((block) => block.sentences.flatMap(pendingIn(project)(block)))
