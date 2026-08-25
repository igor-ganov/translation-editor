import tseslint from 'typescript-eslint'
import functional from 'eslint-plugin-functional'
import { maxLinesNoImports } from './eslint-rules/max-lines-no-imports.js'
import { oneExportPerFile } from './eslint-rules/one-export-per-file.js'

const local = { rules: { 'max-lines-no-imports': maxLinesNoImports, 'one-export-per-file': oneExportPerFile } }

/** Branch-free code: choice is expressed with switch, Match, strategy maps or Option/Either. */
const restrictedSyntax = [
  'error',
  { selector: 'IfStatement', message: 'No `if`. Use switch, effect/Match, a strategy lookup map, or Option/Either match.' },
  { selector: 'ConditionalExpression', message: 'No ternary. Use switch, effect/Match, a strategy lookup map, or Option/Either match.' },
  { selector: 'LogicalExpression[operator="&&"] > :function', message: 'No `&&` for control flow. Use a strategy map or Match.' },
  { selector: 'TSNullKeyword', message: 'Absence is `undefined` or Option, never the null type.' },
  { selector: 'Literal[raw="null"]', message: 'Absence is `undefined` or Option, never a null literal.' },
]

export default tseslint.config(
  {
    ignores: [
      'dist/**', 'node_modules/**', 'src-tauri/**', '.astro/**',
      'eslint-rules/**', 'playwright-report/**', 'test-results/**', '**/*.mjs', '**/*.js',
    ],
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    plugins: { local, functional },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: false }],
      '@typescript-eslint/prefer-readonly': 'error',
      'functional/no-let': ['error', { allowInForLoopInit: false }],
      'functional/immutable-data': ['error', { ignoreClasses: true, ignoreImmediateMutation: true }],
      'functional/prefer-property-signatures': 'error',
      'no-restricted-syntax': restrictedSyntax,
      'local/max-lines-no-imports': ['error', { max: 50 }],
      'local/one-export-per-file': 'error',
    },
  },
  {
    // The framework boundary keeps this/loops/effects but stays branch-free and ≤50 lines.
    files: ['src/ui/**/*.ts', 'src/app/**/*.ts', 'src/adapters/**/*.ts'],
    rules: { 'functional/immutable-data': 'off', 'functional/no-let': 'off' },
  },
  {
    // Test doubles need to record calls; the rules that shape production code
    // would only push that bookkeeping somewhere less obvious.
    files: ['tests/**/*.ts', '**/*.spec.ts'],
    rules: {
      'local/max-lines-no-imports': 'off',
      'local/one-export-per-file': 'off',
      'no-restricted-syntax': 'off',
      'functional/immutable-data': 'off',
      'functional/no-let': 'off',
    },
  },
)
