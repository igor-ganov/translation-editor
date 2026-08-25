import type { TranslatableSegment } from '../../ports/provider-port.js'
import { expansionFactor } from './expansion-factor.js'
import { outputMargin } from './output-margin.js'

/** Four characters to a token is rough, and rough in the safe direction here. */
const sourceTokens = (segments: readonly TranslatableSegment[]): number =>
  segments.reduce((total, segment) => total + Math.ceil(segment.text.length / 4), 0)

/** The JSON wrapper costs a few tokens per segment on top of the prose. */
const envelopeTokens = (segments: readonly TranslatableSegment[]): number => segments.length * 12

/**
 * How large a reply to allow for.
 *
 * Asking for too little is not a soft failure: the reply stops mid-JSON, parsing
 * fails, and reconciliation throws away every segment in the batch. That is what
 * turned a 117-sentence document into 73 translated and 44 marked failed.
 */
export const estimateOutputTokens = (segments: readonly TranslatableSegment[]): number =>
  Math.ceil((sourceTokens(segments) * expansionFactor + envelopeTokens(segments)) * outputMargin)
