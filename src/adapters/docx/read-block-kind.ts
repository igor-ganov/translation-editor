import { Option, pipe } from 'effect'
import { ooxml } from './ooxml.js'
import { elementsNamed } from './elements-named.js'
import { headingLevel } from './heading-level.js'
import type { BlockKind } from '../../core/document/types.js'

const PARAGRAPH: BlockKind = { tag: 'paragraph' }

const first = (parent: Element, name: string): Option.Option<Element> =>
  Option.fromIterable(elementsNamed(parent, name))

/** `w:val` is read both ways because engines differ on namespaced attributes. */
const attribute = (element: Element): string =>
  element.getAttributeNS(ooxml.namespace, ooxml.value) ?? element.getAttribute(`w:${ooxml.value}`) ?? ''

const asHeading = (properties: Element): Option.Option<BlockKind> =>
  pipe(
    first(properties, ooxml.style),
    Option.flatMap((style) => headingLevel(attribute(style))),
    Option.map((level): BlockKind => ({ tag: 'heading', level })),
  )

const asListItem = (properties: Element): Option.Option<BlockKind> =>
  pipe(
    first(properties, ooxml.numberingProperties),
    Option.map((numbering): BlockKind => ({
      tag: 'listItem',
      ordered: pipe(first(numbering, ooxml.numberingId), Option.map(attribute), Option.isSome),
      depth: pipe(
        first(numbering, ooxml.indentLevel),
        Option.map((level) => Number(attribute(level))),
        Option.getOrElse(() => 0),
      ),
    })),
  )

/**
 * Classifies a paragraph. Heading wins over list because Word allows both and the
 * heading is what governs the exported document's outline.
 */
export const readBlockKind = (paragraph: Element): BlockKind =>
  pipe(
    first(paragraph, ooxml.paragraphProperties),
    Option.flatMap((properties) => Option.orElse(asHeading(properties), () => asListItem(properties))),
    Option.getOrElse(() => PARAGRAPH),
  )
