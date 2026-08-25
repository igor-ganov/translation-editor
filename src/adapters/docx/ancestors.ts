/** The element's ancestor chain, nearest first. */
export const ancestors = (element: Element): readonly Element[] => {
  const chain: Element[] = []
  let current = element.parentElement
  while (current) {
    chain.push(current)
    current = current.parentElement
  }
  return chain
}
