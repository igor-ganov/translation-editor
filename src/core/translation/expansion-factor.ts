/**
 * How much longer the translation is expected to be than its source, in tokens.
 *
 * Not a style claim — a tokeniser one. Cyrillic costs markedly more tokens per
 * character than Latin in every tokeniser these providers use, and a faithful
 * rendering of dense prose expands besides. Under-estimating this is what
 * truncates a reply mid-JSON and fails a whole batch, so the number errs high.
 */
export const expansionFactor = 2.2
