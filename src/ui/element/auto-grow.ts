/** Keeps a textarea exactly as tall as its content, so nothing is hidden by a scrollbar. */
export const autoGrow = (field: HTMLTextAreaElement): void => {
  field.style.height = 'auto'
  field.style.height = `${String(field.scrollHeight)}px`
}
