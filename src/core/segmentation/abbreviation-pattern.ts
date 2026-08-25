import type { LanguageTag } from '../document/types.js'
import { escapeRegexp } from './escape-regexp.js'
import { en } from './abbreviations/en.js'
import { ru } from './abbreviations/ru.js'
import { it } from './abbreviations/it.js'

const LISTS: Record<LanguageTag, readonly string[]> = { en, ru, it }

/** Openers an abbreviation may follow: start of text, whitespace, brackets, quotes. */
const OPENER = '(?:^|[\\s(\\[{«"\'‘“—–-])'

/**
 * Matches text that ends in a known abbreviation plus its period, which is where
 * UAX #29 wrongly reports a sentence boundary when the next word is capitalised.
 * Cached per language: building this regex is the expensive part of segmentation.
 */
export const abbreviationPattern = (language: LanguageTag): RegExp =>
  new RegExp(`${OPENER}(?:${LISTS[language].map(escapeRegexp).join('|')})\\.[\\s ]*$`, 'u')
