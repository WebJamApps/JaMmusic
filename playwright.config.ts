import { defineConfig, devices } from '@playwright/test';

// Runs against a deployed/served URL. Override with BASE_URL for staging or a
// local `npm run preview`. Defaults to production so the dark-mode + mobile
// regression guard is runnable out of the box.
const baseURL = process.env.BASE_URL || 'http://localhost:7878';

function getE2EUserRoles(): string {
  try {
    const parsed = JSON.parse(process.env.userRoles || '{}');
    const existing = Array.isArray(parsed.roles) ? parsed.roles : [];
    const merged = Array.from(new Set([...existing, 'Developer', 'JaM-admin']));
    return JSON.stringify({ roles: merged });
  } catch {
    return JSON.stringify({ roles: ['Developer', 'JaM-admin'] });
  }
}

export default defineConfig({
  testDir: './test/e2e',
  outputDir: './test/test-results',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: !process.env.CI,
  workers: process.env.CI ? 1 : undefined,
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
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      BackendUrl: process.env.BackendUrl || 'http://localhost:7000',
      ALLOW_LOCALHOST_BACKEND: 'true',
      userRoles: getE2EUserRoles(),
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'e2e-dummy-google-maps-api-key',
    },
  },
  projects: [
    { name: 'mobile-dark', use: { ...devices['Pixel 5'] } },
  ],
});
