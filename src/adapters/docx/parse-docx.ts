import { Effect } from 'effect'
import type { Block, LanguageTag } from '../../core/document/types.js'
import { makeBlockId } from '../../core/document/make-block-id.js'
import { segmentSentences } from '../../core/segmentation/segment-sentences.js'
import { loadDocumentXml } from './load-document-xml.js'
import { readParagraphs } from './read-paragraphs.js'
import type { RawBlock } from './read-paragraphs.js'
import type { DocxError } from './ooxml.js'

const toBlock = (language: LanguageTag) => (raw: RawBlock, index: number): Block => {
  const id = makeBlockId(index)
  return {
    id,
    kind: raw.kind,
    text: raw.text,
    runs: raw.runs,
    sentences: segmentSentences(language)(id)(raw.text).sentences,
    // An empty or image-only paragraph keeps its place in document order but is
    // never offered for translation and never counts towards progress.
    translatable: raw.text.trim().length > 0,
  }
}

/**
 * Reads a .docx into the document model: paragraphs in order, each with its plain
 * text, its inline formatting ranges and its sentence boundaries.
 */
export const parseDocx =
  (language: LanguageTag) =>
  (bytes: Uint8Array): Effect.Effect<readonly Block[], DocxError> =>
    Effect.map(loadDocumentXml(bytes), (document) =>
      readParagraphs(document).map(toBlock(language)),
    )
