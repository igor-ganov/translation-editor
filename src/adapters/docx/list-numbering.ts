import { AlignmentType, LevelFormat } from 'docx'
import { numberingReference } from './numbering-reference.js'

const level = (index: number) => ({
  level: index,
  format: LevelFormat.BULLET,
  text: '•',
  alignment: AlignmentType.LEFT,
  style: { paragraph: { indent: { left: 720 * (index + 1), hanging: 360 } } },
})

/** Nine bullet levels, matching the deepest nesting Word supports. */
export const listNumbering = {
  config: [{ reference: numberingReference, levels: Array.from({ length: 9 }, (_unused, index) => level(index)) }],
}
