import type { Writing } from './render-target-writing.js'
import { renderTargetReading } from './render-target-reading.js'
import { renderTargetWriting } from './render-target-writing.js'

/** Indexed by `Number(editing)`, so choosing the mode needs no branch. */
const MODES: readonly ((host: HTMLElement, writing: Writing) => unknown)[] = [
  (_host, writing) => renderTargetReading(writing.translation),
  renderTargetWriting,
]

/** The translation: text to read, or a field to write in, never both. */
export const renderTarget = (host: HTMLElement, writing: Writing, editing: boolean) =>
  MODES[Number(editing)]?.(host, writing)
