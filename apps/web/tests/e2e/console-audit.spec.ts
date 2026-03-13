import { test, expect, type BrowserContextOptions } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type RouteInventory = {
  critical_routes: string[];
  extended_routes: string[];
};

type AuditProfile = {
  name: string;
  context: BrowserContextOptions;
  color_scheme: 'light' | 'dark';
};

const routeInventoryPath = path.resolve(__dirname, 'route-inventory.json');
const routeInventory = JSON.parse(readFileSync(routeInventoryPath, 'utf8')) as RouteInventory;
const requestedScope = (process.env.CONSOLE_AUDIT_SCOPE || 'critical').toLowerCase();
const resolvedScope = requestedScope === 'extended' ? 'extended' : 'critical';
const auditRoutes = resolvedScope === 'extended' ? routeInventory.extended_routes : routeInventory.critical_routes;

const auditProfiles: AuditProfile[] = [
  {
    name: 'desktop-light',
    context: {
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    color_scheme: 'light',
  },
  {
    name: 'desktop-dark',
    context: {
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    color_scheme: 'dark',
  },
  {
    name: 'mobile-light',
    context: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    },
    color_scheme: 'light',
  },
  {
    name: 'mobile-dark',
    context: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    },
    color_scheme: 'dark',
  },
];

const allowedConsoleErrorPatterns: RegExp[] = [
  /NO_COLOR.*ignored due to the FORCE_COLOR/i,
];

function isAllowedConsoleError(message: string): boolean {
  return allowedConsoleErrorPatterns.some((pattern) => pattern.test(message));
}

test('route inventory is available', () => {
  expect(Array.isArray(auditRoutes)).toBeTruthy();
  expect(auditRoutes.length).toBeGreaterThan(0);
});

for (const profile of auditProfiles) {
  test.describe(`console audit (${profile.name}, ${resolvedScope})`, () => {
    for (const route of auditRoutes) {
      test(`clean console on ${route}`, async ({ browser }, testInfo) => {
        const context = await browser.newContext(profile.context);
        const page = await context.newPage();
        await page.emulateMedia({ colorScheme: profile.color_scheme });

        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];
        const serverErrors: string[] = [];

        page.on('console', (message) => {
          if (message.type() !== 'error') return;
          const text = message.text();
          if (!isAllowedConsoleError(text)) {
            consoleErrors.push(text);
          }
        });

        page.on('pageerror', (error) => {
          pageErrors.push(error.message);
        });

        page.on('response', (response) => {
          if (response.status() >= 500) {
            serverErrors.push(`${response.status()} ${response.url()}`);
          }
        });

        const url = route.startsWith('http') ? route : `${testInfo.project.use.baseURL || ''}${route}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
        await page.waitForTimeout(1000);

        const auditFailed = consoleErrors.length > 0 || pageErrors.length > 0 || serverErrors.length > 0;
        if (auditFailed) {
          await page.screenshot({
            path: testInfo.outputPath(`console-audit-failure-${profile.name}-${route.replace(/\W+/g, '-')}.png`),
            fullPage: true,
          });
        }

        await context.close();

        const details = [
          consoleErrors.length > 0 ? `consoleErrors=${JSON.stringify(consoleErrors)}` : '',
          pageErrors.length > 0 ? `pageErrors=${JSON.stringify(pageErrors)}` : '',
          serverErrors.length > 0 ? `serverErrors=${JSON.stringify(serverErrors)}` : '',
        ]
          .filter(Boolean)
          .join(' | ');

        expect(
          { consoleErrors, pageErrors, serverErrors },
          details || `No console errors expected on ${route} (${profile.name})`
        ).toEqual({ consoleErrors: [], pageErrors: [], serverErrors: [] });
      });
    }
  });
}
