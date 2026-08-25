/**
 * Italian abbreviations ending in a period. Language data, not prose: these strings
 * must be Italian for the segmenter to recognise them. Seeded from CLDR `it`.
 *
 * Deliberately absent: `ecc.` and anything else that normally *closes* a sentence.
 * Suppressing the break after one of those merges two real sentences, which is a
 * worse and far more frequent error than splitting `Sig. Rossi`.
 */
export const it: readonly string[] = [
  'Sig', 'Sig.ra', 'Sigg', 'Dott', 'Dr', 'Dott.ssa', 'Prof', 'Prof.ssa', 'Ing',
  'Avv', 'Arch', 'Rag', 'Geom', 'On', 'Rev', 'Mons', 'S', 'SS', 'Ss',
  'art', 'artt', 'pag', 'pagg', 'cap', 'capp', 'fig', 'figg', 'tab',
  'vol', 'voll', 'n', 'nn', 'cfr', 'ca', 'p', 'pp', 'sec', 'seg', 'segg',
  'gen', 'feb', 'mar', 'apr', 'giu', 'lug', 'ago', 'set', 'sett', 'ott', 'nov', 'dic',
  'lun', 'mer', 'gio', 'ven', 'sab', 'dom', 'a.C', 'd.C',
]
