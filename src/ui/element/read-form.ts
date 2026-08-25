type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const isValueElement = (element: Element): element is ValueElement =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLTextAreaElement

/** Reads a form's named controls into a plain record of strings. */
export const readForm = (root: ParentNode): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Array.from(root.querySelectorAll('input, select, textarea'))
      .filter(isValueElement)
      .map((element) => [element.name, element.value]),
  )
