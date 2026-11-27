import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:7878';
const outputDir = process.env.E2E_STACK_OUTPUT_DIR || 'test/test-results-stack';
const reportDir = process.env.E2E_STACK_REPORT_DIR || 'playwright-report-stack';

export default defineConfig({
  testDir: './test/e2e-stack',
  outputDir,
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: reportDir, open: 'never' }],
  ],
  globalSetup: './test/e2e-stack/global-setup.ts',
  globalTeardown: './test/e2e-stack/global-teardown.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-dark', use: { ...devices['Pixel 5'], colorScheme: 'dark' } },
  ],
});
