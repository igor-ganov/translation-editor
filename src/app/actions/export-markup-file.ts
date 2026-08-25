import type { Project } from '../../core/project/types.js'
import type { MarkupKind } from '../../core/markup/types.js'
import { serialiseMarkup } from '../../core/markup/serialise-markup.js'
import type { Platform } from '../platform.js'

/** Writes one side of the segmented document as hand-editable markup. */
export const exportMarkupFile =
  (platform: Platform) =>
  (project: Project) =>
  (kind: MarkupKind) =>
    platform.file.save({
      suggestedName: `${project.name.replace(/\.docx$/i, '')}.${kind}.tmarkup.txt`,
      bytes: new TextEncoder().encode(serialiseMarkup(project)(kind)),
      mimeType: 'text/plain;charset=utf-8',
    })
