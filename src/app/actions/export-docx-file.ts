import { Effect, pipe } from 'effect'
import type { Project } from '../../core/project/types.js'
import type { ExportMode } from '../../core/export/types.js'
import { buildDocx } from '../../adapters/docx/build-docx.js'
import type { Platform } from '../platform.js'

const MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const suggestedName = (project: Project): string =>
  `${project.name.replace(/\.docx$/i, '')}.${project.languages.to}.docx`

/** Builds the translated document and hands it to the platform's save dialog. */
export const exportDocxFile =
  (platform: Platform) =>
  (project: Project) =>
  (mode: ExportMode) =>
    pipe(
      buildDocx(project)(mode),
      Effect.flatMap((blob) => Effect.promise(async () => new Uint8Array(await blob.arrayBuffer()))),
      Effect.flatMap((bytes) =>
        platform.file.save({ suggestedName: suggestedName(project), bytes, mimeType: MIME }),
      ),
    )
