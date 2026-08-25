/**
 * How many entries the log keeps.
 *
 * Enough to cover a whole translation run with its per-batch entries, small
 * enough that it never becomes the reason the app runs out of memory.
 */
export const logLimit = 500
