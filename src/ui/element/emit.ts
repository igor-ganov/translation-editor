/**
 * Components report intent upward as composed events rather than calling into the
 * store directly, which keeps every state change flowing through one place.
 * Payload shapes are declared once in the global event map, so listeners get them
 * typed without asserting.
 */
export const emit = (host: HTMLElement, type: string, detail: unknown): void => {
  host.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
}
