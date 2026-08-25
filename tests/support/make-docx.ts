import JSZip from 'jszip'

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const run = (text: string, marks: { b?: boolean; i?: boolean; u?: boolean } = {}) => {
  const properties = [marks.b ? '<w:b/>' : '', marks.i ? '<w:i/>' : '', marks.u ? '<w:u w:val="single"/>' : ''].join('')
  const wrapped = properties.length > 0 ? `<w:rPr>${properties}</w:rPr>` : ''
  return `<w:r>${wrapped}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`
}

export const paragraph = (runs: string, properties = '') =>
  `<w:p>${properties.length > 0 ? `<w:pPr>${properties}</w:pPr>` : ''}${runs}</w:p>`

export const heading = (level: number) => `<w:pStyle w:val="Heading${String(level)}"/>`
export const listItem = (depth: number) =>
  `<w:numPr><w:ilvl w:val="${String(depth)}"/><w:numId w:val="1"/></w:numPr>`
export const table = (rows: readonly (readonly string[])[]) =>
  `<w:tbl>${rows
    .map((cells) => `<w:tr>${cells.map((cell) => `<w:tc>${paragraph(run(cell))}</w:tc>`).join('')}</w:tr>`)
    .join('')}</w:tbl>`

/** Builds a minimal but genuinely valid .docx package around the given body XML. */
export const makeDocx = async (bodyXml: string): Promise<Uint8Array> => {
  const zip = new JSZip()
  zip.file('[Content_Types].xml', CONTENT_TYPES)
  zip.file('_rels/.rels', ROOT_RELS)
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}</w:body></w:document>`,
  )
  return await zip.generateAsync({ type: 'uint8array' })
}
