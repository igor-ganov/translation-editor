const DAY = 86_400_000

const RECENT: Readonly<Record<number, string>> = { 0: 'today', 1: 'yesterday' }

const ON_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' })

/* Whole days apart, not milliseconds apart: a document touched at 23:50 was
   touched yesterday when read at 00:10, and a person would say so. */
const startOfDay = (at: number): number => new Date(at).setHours(0, 0, 0, 0)

const daysBetween = (at: number, now: number): number =>
  Math.round((startOfDay(now) - startOfDay(at)) / DAY)

/** When a document was last touched, said the way a reader would say it. */
export const renderProjectsWhen = (at: number, now: number): string =>
  RECENT[daysBetween(at, now)] ?? ON_DATE.format(at)
