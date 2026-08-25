export type ExportMode = 'all' | 'approvedOnly'

export type RenderedBlock = {
  readonly text: string
  /**
   * True when the source text was emitted because no usable translation was
   * available. These blocks are highlighted in the file and counted in the report.
   */
  readonly fallback: boolean
}

export type ExportReport = {
  readonly total: number
  readonly translated: number
  readonly fallback: number
}
