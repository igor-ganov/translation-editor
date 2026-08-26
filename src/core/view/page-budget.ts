/**
 * How much a page holds.
 *
 * A paragraph costs one, each of its sentences costs one more, so a page fills at
 * roughly nine sentences — or at ten paragraphs when they are collapsed and no
 * sentences are showing. Measuring the page in paragraphs rather than in pixels
 * is what makes page 3 mean the same paragraphs on a phone as on a desktop, and
 * the same after a font-size change.
 */
export const pageBudget = 10
