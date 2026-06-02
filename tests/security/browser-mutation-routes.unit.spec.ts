import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { shouldProtectBrowserMutation } from '@/platform/http/browser-mutation-protection';

const root = process.cwd();

const listRouteFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listRouteFiles(filePath);
    if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
    ) {
      return [filePath];
    }

    return [];
  });

const listRouterPostPaths = () => {
  const routesDir = path.join(root, 'src/routes');
  const routePaths: string[] = [];

  for (const file of listRouteFiles(routesDir)) {
    const source = fs.readFileSync(file, 'utf8');
    if (!/\bPOST\s*:/.test(source)) continue;

    const routeMatch = source.match(/createFileRoute\('([^']+)'\)/);
    if (routeMatch?.[1]) {
      routePaths.push(routeMatch[1]);
    }
  }

  return routePaths.sort();
};

describe('browser mutation route coverage', () => {
  it('classifies every router POST route as app-guarded, auth-owned, or signed webhook', () => {
    const postRoutes = listRouterPostPaths();
    const appGuardedRoutes = postRoutes.filter((pathname) =>
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname,
      })
    );
    const externallyProtectedRoutes = postRoutes.filter(
      (pathname) => !appGuardedRoutes.includes(pathname)
    );

    expect(postRoutes).toEqual([
      '/api/auth/$',
      '/api/telemetry/logs',
      '/api/telemetry/otel/v1/metrics',
      '/api/telemetry/otel/v1/traces',
      '/api/telemetry/sentry-tunnel',
      '/api/upload',
      '/api/webhooks/resend',
      '/logout',
    ]);
    expect(appGuardedRoutes).toEqual([
      '/api/telemetry/logs',
      '/api/telemetry/otel/v1/metrics',
      '/api/telemetry/otel/v1/traces',
      '/api/telemetry/sentry-tunnel',
      '/api/upload',
      '/logout',
    ]);
    expect(externallyProtectedRoutes).toEqual([
      '/api/auth/$',
      '/api/webhooks/resend',
    ]);
  });
});
