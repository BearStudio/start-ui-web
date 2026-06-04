/* oxlint-disable vitest/no-conditional-in-test -- Request capture branches are the browser behavior under test. */

import { expect, test } from '@tests/e2e/utils';

const vendorHostPattern =
  /(?:sentry\.io|honeycomb\.io|opentelemetry|otel|collector)/i;

test.describe('browser telemetry transport', () => {
  test('keeps browser telemetry on same-origin proxy routes', async ({
    page,
    baseURL,
  }) => {
    const appOrigin = new URL(baseURL ?? page.url()).origin;
    const directVendorRequests: string[] = [];
    const telemetryRequests: string[] = [];

    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/api/telemetry/')) {
        telemetryRequests.push(url.href);
        return;
      }

      if (url.origin !== appOrigin && vendorHostPattern.test(url.host)) {
        directVendorRequests.push(url.href);
      }
    });

    await page.goto('/login', { waitUntil: 'commit' });
    await page.evaluate(() =>
      fetch('/api/telemetry/logs', {
        body: JSON.stringify({
          records: [
            {
              event: 'e2e.network_smoke',
              level: 'info',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    );

    expect(directVendorRequests).toEqual([]);
    expect(telemetryRequests.length).toBeGreaterThan(0);
    expect(
      telemetryRequests.every(
        (requestUrl) => new URL(requestUrl).origin === appOrigin
      )
    ).toBe(true);
  });
});
