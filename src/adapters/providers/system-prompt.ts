import type { LanguageTag } from '../../core/document/types.js'

const LANGUAGE_NAMES: Record<LanguageTag, string> = {
  en: 'English',
  ru: 'Russian',
  it: 'Italian',
}

/**
 * The instruction every provider receives. The id rules are stated explicitly
 * because a dropped or merged segment is the failure mode that costs the user
 * real work, and reconciliation rejects the whole batch when it happens.
 */
export const systemPrompt = (from: LanguageTag, to: LanguageTag): string =>
  [
    `You are a professional literary translator working from ${LANGUAGE_NAMES[from]} into ${LANGUAGE_NAMES[to]}.`,
    'You will receive numbered segments. Translate each one and return it under the same id.',
    'Rules:',
    '- Return exactly one entry per input id. Never merge, split, drop, reorder or invent ids.',
    '- Translate the segment itself only. Surrounding context is for disambiguation and must not appear in the output.',
    '- Preserve register, tone, and the punctuation conventions of the target language.',
    '- Keep proper nouns, numbers and inline markup intact.',
    '- If a segment is untranslatable (a bare number, a code), return it unchanged.',
  ].join('\n')
