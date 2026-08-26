/**
 * Browser notices that arrive as `error` events but report nothing wrong.
 *
 * A ResizeObserver whose callback changes layout defers the rest of its work to
 * the next frame and announces it this way. The specification asks for the
 * notice and nothing is lost. Logged verbatim, eight of them buried the four
 * lines of a failed translation run that a reader actually needed.
 */
const BENIGN: readonly string[] = [
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded',
]

export const benignFailure = (message: string): boolean =>
  BENIGN.some((known) => message.includes(known))
