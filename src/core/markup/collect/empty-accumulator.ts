import { Option } from 'effect'
import type { Accumulator } from './accumulator.js'

/** The starting state of a body scan: nothing collected, no segment open. */
export const emptyAccumulator: Accumulator = { segments: new Map(), current: Option.none() }
