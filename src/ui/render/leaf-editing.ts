/**
 * Whether a segment is being read or written, and how to change that.
 *
 * Held by the row element rather than by the application, because which line
 * someone happens to be editing is not part of the document and should not
 * survive a reload or travel to the desk.
 */
export type LeafEditing = {
  readonly editing: boolean
  readonly start: () => void
  readonly done: () => void
}
