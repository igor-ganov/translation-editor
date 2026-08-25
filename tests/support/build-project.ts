import { Brand } from 'effect'
import { makeBlockId } from '../../src/core/document/make-block-id.js'
import { segmentSentences } from '../../src/core/segmentation/segment-sentences.js'
import type { Block, BlockKind, LanguageTag, ProjectId, SegmentId } from '../../src/core/document/types.js'
import type { Entry, Project, TranslationState } from '../../src/core/project/types.js'

const projectId = Brand.nominal<ProjectId>()

export type BlockSpec = {
  readonly text: string
  readonly kind?: BlockKind
  readonly translatable?: boolean
}

export const buildBlock = (language: LanguageTag) => (spec: BlockSpec, index: number): Block => {
  const id = makeBlockId(index)
  const { sentences } = segmentSentences(language)(id)(spec.text)
  return {
    id,
    kind: spec.kind ?? { tag: 'paragraph' },
    text: spec.text,
    runs: [{ start: 0, end: spec.text.length, bold: false, italic: false, underline: false }],
    sentences,
    translatable: spec.translatable ?? spec.text.trim().length > 0,
  }
}

export const machine = (text: string): TranslationState => ({ tag: 'machine', text })
export const edited = (text: string): TranslationState => ({ tag: 'edited', text })
export const absent: TranslationState = { tag: 'absent' }
export const failed = (reason: string): TranslationState => ({ tag: 'failed', reason })

export const entry = (translation: TranslationState, approved = false): Entry => ({ translation, approved })

export const buildProject = (options: {
  readonly blocks: readonly BlockSpec[]
  readonly entries?: Readonly<Record<string, Entry>>
  readonly language?: LanguageTag
}): Project => {
  const language = options.language ?? 'en'
  const source = options.blocks.map((spec, index) => buildBlock(language)(spec, index))
  return {
    id: projectId('p1'),
    name: 'fixture',
    documentHash: 'hash-fixture',
    source,
    languages: { from: language, to: 'ru' },
    entries: new Map<SegmentId, Entry>(
      Object.entries(options.entries ?? {}).map(([key, value]) => [Brand.nominal<SegmentId>()(key), value]),
    ),
    nextSentenceOrdinal: new Map(source.map((block) => [block.id, block.sentences.length])),
    cursor: undefined,
    createdAt: 0,
    updatedAt: 0,
  }
}
