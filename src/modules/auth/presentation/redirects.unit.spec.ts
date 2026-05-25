import { describe, expect, it } from 'vitest';

import {
  internalRedirectFromLocation,
  isPostAuthDestinationUrl,
  normalizeInternalRedirect,
  resolvePostAuthDestination,
} from './redirects';

describe('auth redirect helpers', () => {
  it('accepts only app-relative redirect targets', () => {
    expect(normalizeInternalRedirect('/app')).toBe('/app');
    expect(normalizeInternalRedirect('/manager/books?sort=title#top')).toBe(
      '/manager/books?sort=title#top'
    );

    expect(normalizeInternalRedirect('//evil.example')).toBeUndefined();
    expect(
      normalizeInternalRedirect('https://evil.example/app')
    ).toBeUndefined();
    expect(normalizeInternalRedirect('manager')).toBeUndefined();
    expect(normalizeInternalRedirect('')).toBeUndefined();
  });

  it('builds an internal redirect from router location parts', () => {
    expect(
      internalRedirectFromLocation({
        pathname: '/manager/books',
        searchStr: '?page=2',
        hash: 'details',
      })
    ).toBe('/manager/books?page=2#details');
  });

  it('routes authenticated users to their highest-permission app', () => {
    expect(resolvePostAuthDestination({ role: 'admin' })).toBe('/manager');
    expect(resolvePostAuthDestination({ role: 'user' })).toBe('/app');
    expect(resolvePostAuthDestination({ role: null })).toBe('/');
  });

  it('matches post-auth destinations and nested routes for E2E waits', () => {
    expect(
      isPostAuthDestinationUrl('http://localhost:3000/manager', '/manager')
    ).toBe(true);
    expect(
      isPostAuthDestinationUrl(
        'http://localhost:3000/manager/dashboard',
        '/manager'
      )
    ).toBe(true);
    expect(
      isPostAuthDestinationUrl('http://localhost:3000/managerish', '/manager')
    ).toBe(false);
    expect(
      isPostAuthDestinationUrl(
        'http://localhost:3000/app/books?filter=mine',
        '/app'
      )
    ).toBe(true);
    expect(
      isPostAuthDestinationUrl('http://localhost:3000/login/verify', '/manager')
    ).toBe(false);
  });
});
