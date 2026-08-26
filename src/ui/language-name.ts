import type { LanguageTag } from '../core/document/types.js'

const NAMES: Readonly<Record<LanguageTag, string>> = {
  en: 'English',
  ru: 'Russian',
  it: 'Italian',
}

/**
 * The language in words.
 *
 * A document imported before the pair was changed kept the pair it was made
 * with, and a two-letter code in a header was not enough for anyone to notice
 * that an Italian book had an English source language set on it.
 */
export const languageName = (tag: LanguageTag): string => NAMES[tag]
