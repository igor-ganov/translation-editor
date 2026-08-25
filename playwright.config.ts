import { defineConfig, devices } from '@playwright/test'

const PORT = 4323

/**
 * Event-driven waits only: no fixed timeouts anywhere in the suite. The web
 * server is the built static output, which is what Tauri actually loads.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  workers: 4,
  forbidOnly: Boolean(process.env['CI']),
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `bunx astro build && bun scripts/serve-dist.ts`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: !process.env['CI'],
    stdout: 'ignore',
  },
})
