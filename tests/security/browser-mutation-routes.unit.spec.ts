import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { shouldProtectBrowserMutation } from '@/platform/http/browser-mutation-protection';

const root = process.cwd();

const listApiRoutePostPaths = () => {
  const routesDir = path.join(root, 'src/routes/api');
  const routePaths: string[] = [];

  for (const file of fs.readdirSync(routesDir)) {
    if (!file.endsWith('.ts')) continue;

    const source = fs.readFileSync(path.join(routesDir, file), 'utf8');
    if (!/\bPOST\s*:/.test(source)) continue;

    const routeMatch = source.match(/createFileRoute\('([^']+)'\)/);
    if (routeMatch?.[1]) {
      routePaths.push(routeMatch[1]);
    }
  }

  return routePaths.sort();
};

describe('browser mutation route coverage', () => {
  it('classifies every API POST route as app-guarded, auth-owned, or signed webhook', () => {
    const postRoutes = listApiRoutePostPaths();
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
      '/api/upload',
      '/api/webhooks/resend',
    ]);
    expect(appGuardedRoutes).toEqual(['/api/upload']);
    expect(externallyProtectedRoutes).toEqual([
      '/api/auth/$',
      '/api/webhooks/resend',
    ]);
  });
});
