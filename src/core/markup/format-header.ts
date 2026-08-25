import { markupSyntax } from './markup-syntax.js'
import type { MarkupHeader } from './types.js'

/**
 * The header identifies which project and direction the file belongs to, so an
 * import can refuse to land translations on the wrong document.
 */
export const formatHeader = (header: MarkupHeader): string =>
  [
    `${markupSyntax.headerPrefix}${markupSyntax.magic} v${markupSyntax.version}`,
    `${markupSyntax.headerPrefix}doc ${header.documentHash}`,
    `${markupSyntax.headerPrefix}lang ${header.from}>${header.to}`,
    `${markupSyntax.headerPrefix}kind ${header.kind}`,
  ].join('\n')
