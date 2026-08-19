import { defineConfig, devices } from '@playwright/test';

// Runs against a deployed/served URL. Override with BASE_URL for staging or a
// local `npm run preview`. Defaults to production so the dark-mode + mobile
// regression guard is runnable out of the box.
const baseURL = process.env.BASE_URL || 'http://localhost:7878';

export default defineConfig({
  testDir: './test/e2e',
  outputDir: './test/test-results',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 7878',
    url: 'http://localhost:7878',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    { name: 'mobile-dark', use: { ...devices['Pixel 5'] } },
  ],
});
