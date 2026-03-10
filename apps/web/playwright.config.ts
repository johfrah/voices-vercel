import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const isLocalAuditTarget = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(baseURL.replace(/\/$/, ''));

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: isLocalAuditTarget
    ? {
        command: 'bash -lc "rm -rf .next && npm run dev"',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
