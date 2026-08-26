import { Brand, Effect, Option, pipe } from 'effect'
import type { ProjectId } from '../../core/document/types.js'
import type { Project } from '../../core/project/types.js'
import type { LanguagePair } from '../../core/project/types.js'
import { parseDocx } from '../../adapters/docx/parse-docx.js'
import { nameDocument } from '../../core/project/name-document.js'
import { hashBytes } from './hash-bytes.js'
import type { Platform } from '../platform.js'

const projectId = Brand.nominal<ProjectId>()

const newId = (): ProjectId => projectId(`p-${String(Date.now())}-${String(Math.floor(Math.random() * 1e6))}`)

/**
 * Reads a .docx into a fresh project and persists it before the editor opens, so
 * the document survives a restart without the user having to import it again.
 */
export const importDocx =
  (platform: Platform) =>
  (languages: LanguagePair) =>
  (name: string, bytes: Uint8Array) =>
    pipe(
      parseDocx(languages.from)(bytes),
      Effect.flatMap((source) =>
        Effect.map(hashBytes(bytes), (documentHash): Project => ({
          id: newId(),
          name: nameDocument(name, source),
          documentHash,
          source,
          languages,
          entries: new Map(),
          nextSentenceOrdinal: new Map(source.map((block) => [block.id, block.sentences.length])),
          cursor: Option.getOrUndefined(Option.fromIterable(source.map((block) => block.id))),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })),
      ),
      Effect.tap((project) => Effect.orDie(platform.storage.saveProject(project))),
      Effect.tap((project) => Effect.orDie(platform.storage.saveOriginal(project.id)(bytes))),
    )
