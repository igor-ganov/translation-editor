import { Option } from 'effect'
import type { HeadingLevel } from '../../core/document/types.js'

const PATTERN = /^heading\s*([1-6])$/gi

/**
 * Word writes heading styles as `Heading1`, `heading 2`, or a localised alias that
 * still ends in the level digit. Anything else is not a heading.
 */
export const headingLevel = (styleId: string): Option.Option<HeadingLevel> =>
  Option.map(Option.fromIterable(styleId.matchAll(PATTERN)), (match) => {
    const digit = Number(match[1])
    switch (digit) {
      case 1: case 2: case 3: case 4: case 5: case 6:
        return digit
      default:
        return 1
    }
  })
