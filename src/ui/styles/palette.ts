export type InkName = 'ink' | 'inkSoft' | 'rule' | 'trouble'

/**
 * The few colours a drawn outline needs, as literal values.
 *
 * An outline is an SVG data URI and a data URI cannot read a custom property, so
 * these are necessarily repeated from `global.css`. `palette.spec.ts` reads that
 * file and fails if the two ever disagree, which is the only thing standing
 * between this and a silent drift.
 */
export const palette: Readonly<Record<InkName, string>> = {
  ink: '#211d17',
  inkSoft: '#5a5347',
  rule: '#cfc6b2',
  trouble: '#a33a2a',
}
