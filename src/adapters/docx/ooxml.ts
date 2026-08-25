/** WordprocessingML names used by the parser and the builder. */
export const ooxml = {
  namespace: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  documentPath: 'word/document.xml',
  numberingPath: 'word/numbering.xml',
  paragraph: 'p',
  run: 'r',
  runProperties: 'rPr',
  paragraphProperties: 'pPr',
  text: 't',
  style: 'pStyle',
  numberingProperties: 'numPr',
  indentLevel: 'ilvl',
  numberingId: 'numId',
  table: 'tbl',
  tableRow: 'tr',
  tableCell: 'tc',
  bold: 'b',
  italic: 'i',
  underline: 'u',
  tab: 'tab',
  break: 'br',
  value: 'val',
} as const

export type DocxError =
  | { readonly tag: 'notAZip'; readonly message: string }
  | { readonly tag: 'missingDocument'; readonly message: string }
  | { readonly tag: 'malformedXml'; readonly message: string }
