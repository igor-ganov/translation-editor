import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

const resolvePath = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolvePath('./src/core'),
      '@ports': resolvePath('./src/ports'),
      '@adapters': resolvePath('./src/adapters'),
      '@ui': resolvePath('./src/ui'),
      '@app': resolvePath('./src/app'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'tests/unit/**/*.spec.ts'],
    coverage: { provider: 'v8', include: ['src/core/**'], thresholds: { lines: 90, functions: 90 } },
  },
})
