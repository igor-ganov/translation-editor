/**
 * Head-room over the estimated reply size, before the provider's own ceiling.
 *
 * Asking for more than needed costs nothing — providers bill what they generate,
 * not what was permitted. Asking for too little costs the whole batch.
 */
export const outputMargin = 1.5
