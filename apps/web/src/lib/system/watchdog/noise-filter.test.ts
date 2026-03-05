import { describe, it, expect } from 'vitest';
import { isExpectedBrowserNetworkNoise } from './noise-filter';

describe('watchdog network noise filter', () => {
  it('detects browser network errors with fetch breadcrumbs', () => {
    const result = isExpectedBrowserNetworkNoise({
      error: 'TypeError: network error',
      stack: 'TypeError: network error',
      component: 'browser',
      details: {
        location: 'https://voices.be/studio/',
        pathname: '/studio/',
        userAgent: 'Mozilla/5.0',
        args: [{ name: 'TypeError', message: 'network error', stack: 'TypeError: network error' }],
        breadcrumbs: [
          { type: 'fetch', message: 'GET https://voices.be/agency/voorwaarden/?_rsc=abc123' },
          { type: 'fetch', message: 'GET /api/admin/config/?type=general&t=1772691130327' }
        ]
      }
    });

    expect(result).toBe(true);
  });

  it('does not classify functional runtime bugs as network noise', () => {
    const result = isExpectedBrowserNetworkNoise({
      error: "TypeError: Cannot read properties of undefined (reading 'id')",
      stack: "TypeError: Cannot read properties of undefined (reading 'id')",
      component: 'ClientRuntime',
      details: {
        location: 'https://voices.be/studio/',
        pathname: '/studio/',
        userAgent: 'Mozilla/5.0',
        breadcrumbs: [{ type: 'click', message: 'User clicked: Bestel nu' }]
      }
    });

    expect(result).toBe(false);
  });
});
