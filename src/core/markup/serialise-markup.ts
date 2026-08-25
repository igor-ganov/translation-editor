import { markupSyntax } from './markup-syntax.js'
import { formatHeader } from './format-header.js'
import { escapeContent } from './escape-content.js'
import { markupPairs } from './markup-pairs.js'
import type { MarkupKind } from './types.js'
import type { MarkupPair } from './markup-pairs.js'
import type { Project } from '../project/types.js'

const renderPair = (pair: MarkupPair): string =>
  `${markupSyntax.open}${pair.id}${markupSyntax.close}${escapeContent(pair.text)}`

/**
 * Writes the document out as line-oriented markup a person can edit by hand and a
 * machine can read back without ambiguity. Everything from one marker to the next
 * belongs to that segment, so multi-line text needs no escaping of its own.
 */
export const serialiseMarkup =
  (project: Project) =>
  (kind: MarkupKind): string =>
    [
      formatHeader({
        version: 1,
        documentHash: project.documentHash,
        from: project.languages.from,
        to: project.languages.to,
        kind,
      }),
      '',
      ...markupPairs(project)(kind).map(renderPair),
      '',
    ].join('\n')
