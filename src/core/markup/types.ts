import type { LanguageTag, SegmentId } from '../document/types.js'

export type MarkupKind = 'source' | 'translation'

export type MarkupHeader = {
  readonly version: 1
  readonly documentHash: string
  readonly from: LanguageTag
  readonly to: LanguageTag
  readonly kind: MarkupKind
}

export type ParsedMarkup = {
  readonly header: MarkupHeader
  readonly segments: ReadonlyMap<SegmentId, string>
}

export type MarkupError =
  | { readonly tag: 'missingHeader'; readonly line: number }
  | { readonly tag: 'unsupportedVersion'; readonly line: number; readonly found: string }
  | { readonly tag: 'malformedHeaderField'; readonly line: number; readonly field: string }
  | { readonly tag: 'contentBeforeFirstMarker'; readonly line: number }
  | { readonly tag: 'invalidSegmentId'; readonly line: number; readonly found: string }
  | { readonly tag: 'duplicateSegmentId'; readonly line: number; readonly found: string }
