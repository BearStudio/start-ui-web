import { describe, expect, it } from 'vitest';

import { getSafeRedirect, isSafeRedirectPath } from '@/features/auth/utils';

describe('isSafeRedirectPath', () => {
  it('accepts same-origin paths', () => {
    expect(isSafeRedirectPath('/')).toBe(true);
    expect(isSafeRedirectPath('/app')).toBe(true);
    expect(isSafeRedirectPath('/app?tab=1')).toBe(true);
  });

  it('rejects absolute, protocol-relative and backslash URLs', () => {
    expect(isSafeRedirectPath('https://evil.example/')).toBe(false);
    expect(isSafeRedirectPath('//evil.example/app')).toBe(false);
    expect(isSafeRedirectPath('/\\evil.example')).toBe(false);
    expect(isSafeRedirectPath('javascript:alert(1)')).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });
});

describe('getSafeRedirect', () => {
  it('returns safe paths and never throws on relative values', () => {
    expect(getSafeRedirect('/')).toBe('/');
    expect(getSafeRedirect('/app')).toBe('/app');
    expect(getSafeRedirect(undefined)).toBe('/');
  });

  it('falls back to / for external or malformed redirects', () => {
    expect(getSafeRedirect('https://evil.example/')).toBe('/');
    expect(getSafeRedirect('//evil.example/app')).toBe('/');
    expect(getSafeRedirect('/\\evil.example')).toBe('/');
  });
});
