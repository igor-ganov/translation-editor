import type { LanguageTag } from '../../core/document/types.js'

/** Language names in English; the stored value stays the tag. */
export const languageLabel: Readonly<Record<LanguageTag, string>> = {
  en: 'English',
  ru: 'Russian',
  it: 'Italian',
}
