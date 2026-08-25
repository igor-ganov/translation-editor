import type { Project } from '../project/types.js'
import { renderBlock } from './render-block.js'
import type { ExportMode, ExportReport } from './types.js'

/**
 * What the user is told before the file is written: how many paragraphs will carry
 * the source language because no approved translation existed for them.
 */
export const exportReport =
  (project: Project) =>
  (mode: ExportMode): ExportReport => {
    const translatable = project.source.filter((block) => block.translatable)
    const fallback = translatable.filter((block) => renderBlock(project)(mode)(block).fallback).length
    return { total: translatable.length, translated: translatable.length - fallback, fallback }
  }
