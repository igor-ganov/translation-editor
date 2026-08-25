import { HeadingLevel, Paragraph, TextRun } from 'docx'
import { Option, pipe } from 'effect'
import type { IParagraphOptions } from 'docx'
import type { BlockKind } from '../../core/document/types.js'
import type { RenderedBlock } from '../../core/export/types.js'
import { numberingReference } from './numbering-reference.js'

const HEADINGS = [
  HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6,
] as const

const optionsFor = (kind: BlockKind): IParagraphOptions => {
  switch (kind.tag) {
    case 'heading':
      return { heading: HEADINGS[kind.level - 1] ?? HeadingLevel.HEADING_1 }
    case 'listItem':
      return { numbering: { reference: numberingReference, level: Math.min(kind.depth, 8) } }
    case 'paragraph':
    case 'tableCell':
      return {}
  }
}

/** Untranslated text is highlighted rather than dropped, so gaps stay visible. */
const highlightFor = (fallback: boolean): { readonly highlight?: 'yellow' } =>
  pipe(
    Option.liftPredicate((flag: boolean) => flag)(fallback),
    Option.map(() => ({ highlight: 'yellow' as const })),
    Option.getOrElse((): { readonly highlight?: 'yellow' } => ({})),
  )

/** One paragraph of the exported document. */
export const toParagraph = (kind: BlockKind) => (rendered: RenderedBlock): Paragraph =>
  new Paragraph({
    ...optionsFor(kind),
    children: [new TextRun({ text: rendered.text, ...highlightFor(rendered.fallback) })],
  })
