import { ooxml } from './ooxml.js'

/**
 * Descendants with the given WordprocessingML name, in document order.
 *
 * Selection is by `localName` plus `namespaceURI` rather than
 * `getElementsByTagNameNS`, which is not implemented consistently across DOM
 * engines — notably it returns nothing under happy-dom even when the namespace
 * on the element is correct.
 */
export const elementsNamed = (root: Document | Element, name: string): readonly Element[] =>
  Array.from(root.getElementsByTagName('*')).filter(
    (element) => element.localName === name && element.namespaceURI === ooxml.namespace,
  )
