import { html } from 'lit'

/** Options carrying the stored id as their value and a readable name as their text. */
export const renderOptions = <K extends string>(
  values: readonly K[],
  labels: Readonly<Record<K, string>>,
  selected: K,
) => values.map((value) => html`<option value=${value} ?selected=${value === selected}>${labels[value]}</option>`)
