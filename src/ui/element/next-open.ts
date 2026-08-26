export type LeafOpen = 'read' | 'write' | 'mend'

/**
 * What pressing "sentence break" opens next.
 *
 * One field rather than a flag per panel: two booleans allow a fourth state
 * that has no meaning — writing and mending at once — and the row would have to
 * be trusted never to reach it.
 */
const AFTER_MEND: Readonly<Record<LeafOpen, LeafOpen>> = {
  read: 'mend',
  write: 'mend',
  mend: 'read',
}

export const nextOpen = (current: LeafOpen): LeafOpen => AFTER_MEND[current]
