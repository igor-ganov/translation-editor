import { Effect } from 'effect'
import JSZip from 'jszip'
import { ooxml } from './ooxml.js'
import type { DocxError } from './ooxml.js'

const openZip = (bytes: Uint8Array): Effect.Effect<JSZip, DocxError> =>
  Effect.tryPromise({
    try: () => JSZip.loadAsync(bytes),
    catch: (cause): DocxError => ({ tag: 'notAZip', message: String(cause) }),
  })

const readEntry = (zip: JSZip): Effect.Effect<string, DocxError> =>
  Effect.tryPromise({
    try: async () => {
      // Indexing `files` rather than calling `file()` keeps the absent case `undefined`.
      const entry = zip.files[ooxml.documentPath]
      switch (entry) {
        case undefined:
          throw new Error(`${ooxml.documentPath} is not in the package`)
        default:
          return await entry.async('string')
      }
    },
    catch: (cause): DocxError => ({ tag: 'missingDocument', message: String(cause) }),
  })

const parseXml = (xml: string): Effect.Effect<Document, DocxError> =>
  Effect.try({
    try: () => {
      const parsed = new DOMParser().parseFromString(xml, 'application/xml')
      switch (parsed.getElementsByTagName('parsererror').length) {
        case 0:
          return parsed
        default:
          throw new Error('word/document.xml is not well-formed XML')
      }
    },
    catch: (cause): DocxError => ({ tag: 'malformedXml', message: String(cause) }),
  })

/** Unpacks a .docx and hands back its main document part as a parsed XML tree. */
export const loadDocumentXml = (bytes: Uint8Array): Effect.Effect<Document, DocxError> =>
  Effect.flatMap(Effect.flatMap(openZip(bytes), readEntry), parseXml)
