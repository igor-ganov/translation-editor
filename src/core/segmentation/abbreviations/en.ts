/**
 * Abbreviations that end in a period and are commonly followed by a capitalised
 * word, which is exactly where UAX #29 sentence breaking splits incorrectly.
 * Seeded from CLDR's segment suppression data for `en`.
 *
 * Deliberately absent: `etc.` and anything else that normally *closes* a sentence.
 * Suppressing the break after one of those merges two real sentences, which is a
 * worse and far more frequent error than splitting `Dr. Smith`.
 */
export const en: readonly string[] = [
  'Mr', 'Mrs', 'Ms', 'Mx', 'Dr', 'Prof', 'Rev', 'Hon', 'St', 'Sr', 'Jr',
  'Gen', 'Col', 'Maj', 'Capt', 'Lt', 'Sgt', 'Cpl', 'Adm', 'Gov', 'Sen', 'Rep',
  'Inc', 'Ltd', 'Co', 'Corp', 'Bros', 'Univ', 'Dept', 'Est',
  'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sept', 'Sep', 'Oct', 'Nov', 'Dec',
  'Mon', 'Tue', 'Tues', 'Wed', 'Thu', 'Thurs', 'Fri', 'Sat', 'Sun',
  'vs', 'al', 'approx', 'Fig', 'fig', 'No', 'no', 'Vol', 'vol', 'pp', 'p',
  'Ave', 'Blvd', 'Rd', 'Mt', 'Ft', 'ed', 'eds', 'trans', 'cf', 'ca', 'esp',
]
