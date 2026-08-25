/**
 * How many operations can be reversed.
 *
 * An entry holds a whole project snapshot, so the bound is deliberately small:
 * only coarse operations push here — applying an import, merging and splitting
 * sentences — and on a large document each snapshot is not cheap. Ordinary
 * translation edits are not undoable and do not push, which is what keeps this
 * affordable on a phone.
 */
export const undoLimit = 10
