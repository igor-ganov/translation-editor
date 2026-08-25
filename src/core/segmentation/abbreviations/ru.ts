/**
 * Russian abbreviations ending in a period. Language data, not prose: these strings
 * must be Cyrillic for the segmenter to recognise them. Seeded from CLDR's `ru`
 * suppression data plus the address and citation forms common in real documents.
 *
 * Deliberately absent: the forms that normally *close* a sentence — those meaning
 * "and so on", "and the like", "and others", "and the rest". Suppressing the break
 * after one of those merges two real sentences, which is a worse and far more
 * frequent error than splitting a city or title abbreviation from the name it
 * precedes.
 */
export const ru: readonly string[] = [
  'г', 'гг', 'в', 'вв', 'н', 'э', 'т', 'тт', 'см', 'ср', 'стр', 'с', 'п', 'пп',
  'ул', 'пер', 'просп', 'пр', 'наб', 'пл', 'д', 'кв', 'корп', 'обл', 'р',
  'им', 'акад', 'проф', 'доц', 'канд', 'д-р', 'тов', 'гр', 'гос',
  'руб', 'коп', 'тыс', 'млн', 'млрд', 'шт', 'экз', 'чел',
  'янв', 'февр', 'фев', 'мар', 'апр', 'июн', 'июл', 'авг', 'сент', 'сен', 'окт', 'нояб', 'дек',
  'напр', 'соотв', 'т.е', 'т.к', 'т.н', 'и.о', 'н.э',
  'рис', 'табл', 'гл', 'разд', 'ч', 'ст', 'изд', 'ред', 'сост', 'перев',
]
