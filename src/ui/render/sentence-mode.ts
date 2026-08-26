import type { LeafEditing } from './leaf-editing.js'

/**
 * A sentence has one more state than a paragraph: the panel that explains and
 * repairs a sentence break.
 *
 * Repairing a break is needed on a handful of sentences in a document, and it
 * sat on every one of them, beside the commands used constantly. Folded away
 * behind one named control, it stops competing with the ordinary work and gets
 * room to say what it is for.
 */
export type SentenceMode = LeafEditing & {
  readonly mending: boolean
  readonly mend: () => void
}
