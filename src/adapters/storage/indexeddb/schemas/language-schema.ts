import { Schema } from 'effect'

/** The shipped language options; adding one starts here. */
export const languageSchema = Schema.Literal('en', 'ru', 'it')
