import { html, svg } from 'lit'

export type CommandName = 'edit' | 'approve' | 'unapprove' | 'merge' | 'split' | 'fold' | 'unfold'

/**
 * Drawn rather than typed. A Unicode pencil or pair of scissors renders as a
 * colour emoji on some Android builds and as an empty box on others; a path
 * inked in `currentColor` looks the same everywhere and matches the text it sits
 * beside. Each is a hint, never the label: the word is always there too.
 */
const PATHS: Readonly<Record<CommandName, readonly string[]>> = {
  edit: ['M11.2 2.4 L13.6 4.8 L5.6 12.8 L2.4 13.6 L3.2 10.4 Z'],
  approve: ['M3 8.4 L6.4 11.8 L13 4.6'],
  unapprove: ['M3 8.4 L6.4 11.8 L13 4.6', 'M2.6 13.4 L13.4 2.6'],
  // Both are drawn as lines of text, which is what they act on. Earlier attempts
  // borrowed from arrows and chevrons and read as "download", as a plus sign and,
  // worst, as a close cross next to a sentence.
  merge: ['M4.6 4.4 h8.8', 'M4.6 11.6 h8.8', 'M4.6 4.4 v7.2'],
  split: ['M2.8 10.6 h10.4', 'M6 5 L8 7.4 L10 5'],
  fold: ['M4 6 L8 10 L12 6'],
  unfold: ['M4 10 L8 6 L12 10'],
}

export const commandIcon = (name: CommandName) => html`
  <svg class="command__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    ${PATHS[name].map((path) => svg`<path d=${path} />`)}
  </svg>
`
